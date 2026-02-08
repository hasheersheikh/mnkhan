const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Admin: Get all vouchers
router.get("/", authenticateToken, authorizeRole(["admin", "super-admin"]), async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create voucher
router.post("/", authenticateToken, authorizeRole(["admin", "super-admin"]), async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update voucher
router.patch("/:id", authenticateToken, authorizeRole(["admin", "super-admin"]), async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete voucher
router.delete("/:id", authenticateToken, authorizeRole(["admin", "super-admin"]), async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Voucher deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public/Client: Validate voucher
router.post("/validate", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher not found" });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: "This voucher is currently inactive" });
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "This voucher has expired" });
    }

    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: "This voucher has reached its usage limit" });
    }

    res.json({ 
      success: true, 
      voucher: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
