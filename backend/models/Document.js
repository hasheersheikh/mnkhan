const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  // User who uploaded the document
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Optional: Link to specific appointment/service
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },

  // File metadata
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: {
    type: String,
    enum: ["pdf", "jpg", "jpeg", "png"],
    required: true,
  },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true }, // Size in bytes

  // Supabase storage info
  storagePath: { type: String, required: true }, // Path in Supabase bucket
  publicUrl: { type: String, required: true }, // Public URL to access the file

  // Document category
  category: {
    type: String,
    enum: ["id_proof", "address_proof", "service_document", "other"],
    default: "other",
  },

  // Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ appointmentId: 1 });
DocumentSchema.index({ status: 1 });

// Update timestamp on save
DocumentSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Document", DocumentSchema);
