const mongoose = require("mongoose");

const HourlyRateSchema = new mongoose.Schema({
  // Rate amount in paisa (1 INR = 100 paisa)
  rate: { type: Number, required: true },
  currency: { type: String, default: "INR" },

  // Rate validity
  effectiveFrom: { type: Date, required: true, default: Date.now },
  effectiveUntil: { type: Date }, // null means currently active

  // Status
  isActive: { type: Boolean, default: true },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for querying active rates
HourlyRateSchema.index({ isActive: 1, effectiveFrom: -1 });

// Update timestamp on save
HourlyRateSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Static method to get current active rate
HourlyRateSchema.statics.getCurrentRate = async function () {
  const now = new Date();
  const rate = await this.findOne({
    isActive: true,
    effectiveFrom: { $lte: now },
    $or: [{ effectiveUntil: null }, { effectiveUntil: { $gt: now } }],
  }).sort({ effectiveFrom: -1 });

  return rate;
};

// Virtual for formatted rate (in rupees)
HourlyRateSchema.virtual("rateInRupees").get(function () {
  return this.rate / 100;
});

// Ensure virtuals are included in JSON output
HourlyRateSchema.set("toJSON", { virtuals: true });
HourlyRateSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("HourlyRate", HourlyRateSchema);
