const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service"
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

CartSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Cart", CartSchema);
