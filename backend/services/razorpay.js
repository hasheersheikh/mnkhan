const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance lazily or with a check
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn(
      "[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will be disabled.",
    );
  }
} catch (error) {
  console.error("[Razorpay] Failed to initialize Razorpay:", error.message);
}

const getRazorpay = () => {
  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env",
    );
  }
  return razorpay;
};

/**
 * Create a Razorpay order for appointment payment
 * @param {number} amount - Amount in paisa
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Additional notes for the order
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (amount, currency = "INR", notes = {}) => {
  try {
    const options = {
      amount: amount, // Amount in paisa
      currency: currency,
      receipt: `appointment_${Date.now()}`,
      notes: notes,
    };

    const order = await getRazorpay().orders.create(options);
    return order;
  } catch (error) {
    console.error("[Razorpay] Error creating order:", error);
    throw new Error("Failed to create payment order");
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("[Razorpay] Error verifying signature:", error);
    return false;
  }
};

/**
 * Verify webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} Whether webhook signature is valid
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("[Razorpay] Error verifying webhook signature:", error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await getRazorpay().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("[Razorpay] Error fetching payment:", error);
    throw new Error("Failed to fetch payment details");
  }
};

/**
 * Initiate refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paisa (optional, defaults to full refund)
 * @returns {Promise<object>} Refund object
 */
const initiateRefund = async (paymentId, amount = null) => {
  try {
    const options = amount ? { amount } : {};
    const refund = await getRazorpay().payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    console.error("[Razorpay] Error initiating refund:", error);
    throw new Error("Failed to initiate refund");
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  initiateRefund,
};
