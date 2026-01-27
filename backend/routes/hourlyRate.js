const express = require("express");
const router = express.Router();
const HourlyRate = require("../models/HourlyRate");
const { authenticateToken } = require("../middleware/auth");

/**
 * GET /api/hourly-rate
 * Get the current active hourly rate (public)
 * Auto-initializes a default rate if none exists
 */
router.get("/", async (req, res) => {
  console.log("[HourlyRate] GET /api/hourly-rate hit");
  try {
    let rate = await HourlyRate.getCurrentRate();

    // Auto-initialize default rate if none exists
    if (!rate) {
      console.log(
        "[HourlyRate] No rate found, creating default rate of ₹5000/hour",
      );
      rate = new HourlyRate({
        rate: 500000, // ₹5000 in paisa
        currency: "INR",
        effectiveFrom: new Date(),
        isActive: true,
      });
      await rate.save();
    }

    res.json({
      success: true,
      rate: {
        id: rate._id,
        rate: rate.rate,
        rateInRupees: rate.rateInRupees,
        currency: rate.currency,
        effectiveFrom: rate.effectiveFrom,
      },
    });
  } catch (error) {
    console.error("[HourlyRate] Error fetching rate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hourly rate",
    });
  }
});

/**
 * PUT /api/hourly-rate
 * Update/Create new hourly rate (admin only)
 */
router.put("/", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!["admin", "super-admin"].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { rate, currency = "INR", effectiveFrom } = req.body;

    if (!rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid rate is required",
      });
    }

    // Deactivate all current rates
    await HourlyRate.updateMany(
      { isActive: true },
      { $set: { isActive: false, effectiveUntil: new Date() } },
    );

    // Create new rate
    const newRate = new HourlyRate({
      rate: Math.round(rate * 100), // Convert rupees to paisa
      currency,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      isActive: true,
      createdBy: req.user._id,
    });

    await newRate.save();

    res.json({
      success: true,
      message: "Hourly rate updated successfully",
      rate: {
        id: newRate._id,
        rate: newRate.rate,
        rateInRupees: newRate.rateInRupees,
        currency: newRate.currency,
        effectiveFrom: newRate.effectiveFrom,
      },
    });
  } catch (error) {
    console.error("[HourlyRate] Error updating rate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update hourly rate",
    });
  }
});

/**
 * GET /api/hourly-rate/history
 * Get rate history (admin only)
 */
router.get("/history", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!["admin", "super-admin"].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const rates = await HourlyRate.find()
      .sort({ effectiveFrom: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("createdBy", "name email");

    const total = await HourlyRate.countDocuments();

    res.json({
      success: true,
      rates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[HourlyRate] Error fetching rate history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch rate history",
    });
  }
});

module.exports = router;
