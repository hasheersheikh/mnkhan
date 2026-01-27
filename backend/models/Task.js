const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "on-hold"],
    default: "pending",
  },
  progress: { type: Number, default: 0 }, // 0 to 100
  steps: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      date: { type: Date },
    },
  ],
  timeline: [
    {
      event: { type: String, required: true },
      date: { type: Date, default: Date.now },
      note: { type: String },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminUser",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TaskSchema.pre("save", function () {
  console.log(`[Model] Saving Task: ${this.title}`);
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Task", TaskSchema);
