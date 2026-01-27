const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: "MNKHAN Team" },
  category: { type: String, default: "Legal Insights" },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BlogSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Blog", BlogSchema);
