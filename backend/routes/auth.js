const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "mnkhan_secret_key_2026";

// Signup Route (Public - Clients Only)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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

    const user = new User({ name, email, password, role: "client" });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: "client",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role },
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
      user: { name: user.name, email: user.email, role: user.role },
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
    // and send an actual email via SendGrid/Nodemailer.
    // For this simulation, we'll return a success message.
    res.json({
      success: true,
      message: `Password reset instructions sent to ${email} (Simulation)`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Password (Actually change it)
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
