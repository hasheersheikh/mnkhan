const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "client-documents";

let supabase = null;

const initSupabase = () => {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
};

// Allowed file types and max size
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Validate file before upload
 * @param {Object} file - Multer file object
 * @returns {Object} - { valid: boolean, error?: string }
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size exceeds 5 MB limit",
    };
  }

  return { valid: true };
};

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Unique file name
 * @param {string} mimeType - File MIME type
 * @param {string} userId - User ID for folder organization
 * @returns {Object} - { success: boolean, path?: string, publicUrl?: string, error?: string }
 */
const uploadFile = async (fileBuffer, fileName, mimeType, userId) => {
  const client = initSupabase();

  if (!client) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Organize files by user ID
    const storagePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      success: true,
      path: storagePath,
      publicUrl: urlData.publicUrl,
    };
  } catch (err) {
    console.error("Upload error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} storagePath - Path of file in storage
 * @returns {Object} - { success: boolean, error?: string }
 */
const deleteFile = async (storagePath) => {
  const client = initSupabase();

  if (!client) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await client.storage
      .from(bucketName)
      .remove([storagePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get signed URL for private file access (if bucket is private)
 * @param {string} storagePath - Path of file in storage
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Object} - { success: boolean, signedUrl?: string, error?: string }
 */
const getSignedUrl = async (storagePath, expiresIn = 3600) => {
  const client = initSupabase();

  if (!client) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await client.storage
      .from(bucketName)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  validateFile,
  uploadFile,
  deleteFile,
  getSignedUrl,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
};
