const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: null }, // null for unlimited
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Voucher", VoucherSchema);
