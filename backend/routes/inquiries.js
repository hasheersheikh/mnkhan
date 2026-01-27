const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const {
  authenticateToken,
  authorizeRole,
  optionalAuthenticateToken,
} = require("../middleware/auth");

// GET all inquiries (Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const inquiries = await Inquiry.find().sort({ createdAt: -1 });
      res.json({ success: true, inquiries });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET my inquiries (Client/Any logged-in user)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Post a new inquiry (Public/Client)
router.post("/", optionalAuthenticateToken, async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const inquiryData = { name, email, phone, service, message };
    if (req.user) {
      inquiryData.userId = req.user._id;
    }

    const inquiry = new Inquiry(inquiryData);
    await inquiry.save();

    res
      .status(201)
      .json({ success: true, message: "Inquiry submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: Update inquiry status (Admin only)
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const inquiry = await Inquiry.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );
      if (!inquiry)
        return res
          .status(404)
          .json({ success: false, message: "Inquiry not found" });
      res.json({ success: true, inquiry });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Delete inquiry (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
      if (!inquiry)
        return res
          .status(404)
          .json({ success: false, message: "Inquiry not found" });
      res.json({ success: true, message: "Inquiry deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
