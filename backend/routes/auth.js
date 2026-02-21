const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "mnkhan_secret_key_2026";

// Signup Route (Public - Clients Only)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Security: Block administrative roles from public signup
    if (role && ["admin", "super-admin"].includes(role)) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized role assignment" });
    }

    console.log(`[API] Signup attempt for: ${email}`);

    // Check if user exists in either collection to prevent collisions
    const existingUser = await User.findOne({ email });
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingUser || existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, phone, password, role: "client", status: "pending" });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully. Your account is currently pending administrative approval. You will receive an email once it is activated.",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    let user;
    let type = "client";

    if (isAdmin) {
      user = await AdminUser.findOne({ email });
      type = "admin";
    } else {
      user = await User.findOne({ email });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check status for clients
    if (!isAdmin && user.status !== "active") {
      const statusMsg = user.status === "pending" 
        ? "Your account is pending approval. You will be notified via email once activated." 
        : "Your account has been deactivated. Please contact support.";
      
      return res.status(403).json({
        success: false,
        message: statusMsg,
        status: user.status
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        type,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Password Reset Request
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // In a real application, you would generate a one-time token
    // (e.g. crypto.randomBytes(20).toString('hex')) and store its hash + expiry in the User model.
    // For this simulation/demo version, we'll generate a JWT reset token.
    const resetToken = jwt.sign({ id: user._id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    console.log(`[AUTH] Password Reset URL: ${resetLink}`);

    res.json({
      success: true,
      message: `Password reset instructions sent to ${email}`,
      link: resetLink // Providing link directly for development ease
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Password (Actually change it using token)
router.post("/reset-password-confirmed", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User no longer exists" });
    }

    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    res.json({ success: true, message: "Password updated successfully. You can now login with your new credentials." });
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? "Reset token has expired" : err.message;
    res.status(400).json({ success: false, message: msg });
  }
});

// Update Password (Authenticated change - already exists)
router.post("/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
