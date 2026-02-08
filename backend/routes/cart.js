const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Service = require("../models/Service");
const Task = require("../models/Task");
const AdminUser = require("../models/AdminUser");
const Voucher = require("../models/Voucher");
const razorpayService = require("../services/razorpay");
const emailService = require("../services/emailService");
const { authenticateToken } = require("../middleware/auth");

// GET current user's cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("items");
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Add item to cart
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ success: false, message: "Service ID is required" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    if (cart.items.some(id => id.toString() === serviceId)) {
      return res.status(400).json({ success: false, message: "Service already in cart" });
    }

    cart.items.push(serviceId);
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate("items");
    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE remove item from cart
router.delete("/remove/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(id => id.toString() !== serviceId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items");
    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Checkout - Create Razorpay Order
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const { voucherCode } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let subtotal = cart.items.reduce((sum, item) => {
      // Strip currency symbols and commas
      const priceStr = (item.price || "0").toString().replace(/[^0-9.]/g, "");
      const price = parseFloat(priceStr) || 0;
      return sum + price;
    }, 0);

    let discountAmount = 0;
    let appliedVoucher = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (voucher) {
        // Basic validity checks
        const isExpired = voucher.expiryDate && new Date(voucher.expiryDate) < new Date();
        const limitReached = voucher.usageLimit && voucher.usageCount >= voucher.usageLimit;

        if (!isExpired && !limitReached) {
          if (voucher.discountType === "percentage") {
            discountAmount = (subtotal * voucher.discountValue) / 100;
          } else {
            discountAmount = voucher.discountValue;
          }
          appliedVoucher = voucher.code;
        }
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    if (finalAmount <= 0 && subtotal > 0) {
      // Logic for 100% discount if needed, but Razorpay requires at least 1 INR normally.
      // For simplicity, we'll just allow it for now or set a min of 1 INR.
    }

    const order = await razorpayService.createOrder(Math.round(finalAmount * 100), "INR", {
      userId: req.user._id.toString(),
      userName: req.user.name,
      cartId: cart._id.toString(),
      itemsCount: cart.items.length,
      voucherCode: appliedVoucher || "NONE",
      discount: discountAmount.toString(),
      originalAmount: subtotal.toString()
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      discountApplied: discountAmount > 0,
      discountAmount,
      finalAmount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Verify Payment and Create Tasks
router.post("/verify-payment", authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate("items");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart items not found" });
    }

    // Get an admin to assign tasks to (defaulting to the first available admin)
    const admin = await AdminUser.findOne({ role: { $in: ["admin", "super-admin"] } });
    if (!admin) {
      console.error("[Cart] No administrative user found to assign tasks");
      return res.status(500).json({ success: false, message: "Internal configuration error: No admin available" });
    }

    // Fetch order details for email and voucher tracking
    let orderDetails = null;
    try {
      orderDetails = await razorpayService.instance.orders.fetch(razorpay_order_id);
    } catch (oErr) {
      console.warn("[Cart] Failed to fetch order details:", oErr.message);
    }

    // Create tasks for each service
    const tasks = [];
    const purchasedServices = [...cart.items]; // Keep track for email

    for (const service of cart.items) {
      const task = new Task({
        title: service.name,
        description: `Service purchased: ${service.name}. ${service.description || ""}`,
        userId: req.user._id,
        adminId: admin._id,
        status: "pending",
        progress: 0,
        timeline: [{ event: "Service Purchased", note: `Purchased via consolidated cart. Payment ID: ${razorpay_payment_id}` }]
      });

      if (service.defaultSteps && service.defaultSteps.length > 0) {
        task.steps = service.defaultSteps.map(step => ({
          title: step,
          completed: false
        }));
      }

      await task.save();
      tasks.push(task);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    if (orderDetails) {
      emailService.sendServiceConfirmationEmail(
        req.user,
        purchasedServices,
        orderDetails.amount,
        orderDetails.id
      ).catch(e => console.error("[Cart] Email fail:", e));
    }

    // Increment voucher usage if applicable
    if (orderDetails && orderDetails.notes && orderDetails.notes.voucherCode && orderDetails.notes.voucherCode !== "NONE") {
      try {
        await Voucher.findOneAndUpdate(
          { code: orderDetails.notes.voucherCode },
          { $inc: { usageCount: 1 } }
        );
      } catch (vErr) {
        console.warn("[Cart] Failed to increment voucher usage:", vErr.message);
      }
    }

    res.json({
      success: true,
      message: "Payment verified and services added to your tasks.",
      tasksCount: tasks.length
    });
  } catch (err) {
    console.error("[Cart] Error during payment verification:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
