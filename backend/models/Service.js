const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  details: { type: String },
  criteria: { type: String },
  servicer: { type: String },
  acceptanceCreteria: { type: String },
  defaultSteps: [{ type: String }],
  requiredDocuments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ServiceSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Service", ServiceSchema);
