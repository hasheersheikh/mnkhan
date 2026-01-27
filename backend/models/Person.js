const mongoose = require("mongoose");

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  expertise: { type: String, required: true },
  bio: { type: String, required: true },
  initials: { type: String, required: true },
  order: { type: Number, default: 0 }, // For sorting
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Person", PersonSchema);
