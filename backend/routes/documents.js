const express = require("express");
const multer = require("multer");
const router = express.Router();
const Document = require("../models/Document");
const {
  validateFile,
  uploadFile,
  deleteFile,
  MAX_FILE_SIZE,
} = require("../services/supabaseService");
const { authenticateToken } = require("../middleware/auth");

// Configure multer for memory storage (files go to buffer, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 5 MB limit
  },
});

// Helper to generate unique filename
const generateFileName = (originalName) => {
  const ext = originalName.split(".").pop().toLowerCase();
  const uniqueId =
    Date.now() + "-" + Math.random().toString(36).substring(2, 9);
  return `${uniqueId}.${ext}`;
};

// Helper to extract file type from original name
const getFileType = (originalName) => {
  const ext = originalName.split(".").pop().toLowerCase();
  return ext === "jpg" ? "jpeg" : ext; // Normalize jpg to jpeg
};

/**
 * GET /api/documents/admin/all
 * Get all documents (admin only)
 * NOTE: This route MUST be before /:id to avoid route conflicts
 */
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    // Only admin can access all documents
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId, category, status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "name email")
        .populate("appointmentId", "date startTime")
        .populate("serviceId", "name"),
      Document.countDocuments(query),
    ]);

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    res.status(500).json({ message: "Error fetching documents" });
  }
});

/**
 * POST /api/documents/upload
 * Upload a new document
 */
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const { appointmentId, serviceId, category } = req.body;
      const userId = req.user._id;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Generate unique filename
      const fileName = generateFileName(file.originalname);
      const fileType = getFileType(file.originalname);

      // Upload to Supabase
      const uploadResult = await uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        userId.toString(),
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: uploadResult.error });
      }

      // Save document metadata to MongoDB
      const document = new Document({
        userId,
        appointmentId: appointmentId || undefined,
        serviceId: serviceId || undefined,
        fileName,
        originalName: file.originalname,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: uploadResult.path,
        publicUrl: uploadResult.publicUrl,
        category: category || "other",
      });

      await document.save();

      res.status(201).json({
        message: "Document uploaded successfully",
        document: {
          id: document._id,
          fileName: document.originalName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          publicUrl: document.publicUrl,
          category: document.category,
          createdAt: document.createdAt,
        },
      });
    } catch (error) {
      console.error("Document upload error:", error);

      // Handle multer file size error
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size exceeds 5 MB limit" });
      }

      res.status(500).json({ message: "Error uploading document" });
    }
  },
);

/**
 * GET /api/documents
 * Get current user's documents
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { appointmentId, category, status } = req.query;

    // Build query
    const query = { userId };
    if (appointmentId) query.appointmentId = appointmentId;
    if (category) query.category = category;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .populate("appointmentId", "date startTime customerName")
      .populate("serviceId", "name");

    res.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Error fetching documents" });
  }
});

/**
 * GET /api/documents/:id
 * Get single document by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("appointmentId", "date startTime customerName")
      .populate("serviceId", "name");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check ownership (unless admin)
    if (
      document.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Error fetching document" });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check ownership (unless admin)
    if (
      document.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete from Supabase Storage
    const deleteResult = await deleteFile(document.storagePath);
    if (!deleteResult.success) {
      console.error("Supabase delete error:", deleteResult.error);
      // Continue with MongoDB deletion even if Supabase fails
    }

    // Delete from MongoDB
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Error deleting document" });
  }
});

/**
 * PATCH /api/documents/:id/status
 * Update document status (admin only)
 */
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    // Only admin can update status
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document status updated", document });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ message: "Error updating document status" });
  }
});

module.exports = router;
