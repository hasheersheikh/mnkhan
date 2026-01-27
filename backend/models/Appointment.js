const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  // Customer Information
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },

  // Appointment Details
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true }, // Format: "HH:mm"
  duration: { type: Number, required: true }, // Hours
  timezone: { type: String, default: "Asia/Kolkata" },
  notes: { type: String },

  // Pricing
  hourlyRate: { type: Number, required: true }, // Rate at time of booking (in paisa)
  totalAmount: { type: Number, required: true }, // Total in paisa
  currency: { type: String, default: "INR" },

  // Payment Information (Razorpay)
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },

  // Google Calendar Integration
  googleCalendarEventId: { type: String },
  googleMeetLink: { type: String },

  // Appointment Status
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
    default: "pending",
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
});

// Index for querying appointments by date
AppointmentSchema.index({ date: 1, startTime: 1 });
AppointmentSchema.index({ customerEmail: 1 });
AppointmentSchema.index({ razorpayOrderId: 1 });
AppointmentSchema.index({ status: 1 });

// Update timestamps on save
AppointmentSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Virtual for formatted date
AppointmentSchema.virtual("formattedDate").get(function () {
  return this.date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Method to calculate end time based on start time and duration
AppointmentSchema.methods.calculateEndTime = function () {
  const [hours, minutes] = this.startTime.split(":").map(Number);
  const endHours = hours + this.duration;
  return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

module.exports = mongoose.model("Appointment", AppointmentSchema);
