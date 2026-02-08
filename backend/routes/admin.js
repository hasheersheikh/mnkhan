const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");
const Person = require("../models/Person");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Internal helper for initial setup
const PRIMARY_ADMIN_EMAIL = "admin@mnkhan.com";

router.post("/setup", async (req, res) => {
  try {
    const { secret, password } = req.body;

    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid setup secret" });
    }

    const existingAdmin = await AdminUser.findOne({
      email: PRIMARY_ADMIN_EMAIL,
    });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Initial Admin already exists",
      });
    }

    const superAdmin = new AdminUser({
      name: "Primary Administrator",
      email: PRIMARY_ADMIN_EMAIL,
      password: password || "Zaid@1234",
      role: "super-admin",
    });

    await superAdmin.save();
    res.json({
      success: true,
      message: "Primary Admin provisioned successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin-only: Create new admin user (Restricted to super-admin)
router.post(
  "/create-admin",
  authenticateToken,
  authorizeRole(["super-admin"]),
  async (req, res) => {
    try {
      const { name, email, password, isAdminUser } = req.body;

      // Ensure we are creating an AdminUser
      const existingAdmin = await AdminUser.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ success: false, message: "Admin already exists" });
      }

      const newAdmin = new AdminUser({
        name,
        email,
        password,
        role: "admin",
      });

      await newAdmin.save();
      res.json({ success: true, message: "New Administrator created" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// People Management
router.post(
  "/people",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const person = new Person(req.body);
      await person.save();
      res.json({ success: true, person });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.patch(
  "/people/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const person = await Person.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!person) {
        return res
          .status(404)
          .json({ success: false, message: "Professional not found" });
      }
      console.log(`[API] Professional updated: ${person.name}`);
      res.json({ success: true, person });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.delete(
  "/people/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      await Person.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Professional removed" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.post(
  "/people/reorder",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const { orders } = req.body; // Array of { id, order }
      if (!Array.isArray(orders)) {
        return res
          .status(400)
          .json({ success: false, message: "Orders must be an array" });
      }

      const bulkOps = orders.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { order: item.order },
        },
      }));

      await Person.bulkWrite(bulkOps);
      res.json({ success: true, message: "Display order updated" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// User Management
router.get(
  "/users",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const users = await User.find({ role: "client" }).select(
        "name email status _id phone createdAt",
      );
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// Admin: Update user status
router.patch(
  "/users/:id/status",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "active", "deactivated"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const oldStatus = user.status;
      user.status = status;
      await user.save();

      // Send email notifications
      try {
        const emailService = require("../services/emailService");
        if (oldStatus === "pending" && status === "active") {
          await emailService.sendAccountActivationEmail(user);
        } else if (status === "deactivated" && oldStatus !== "deactivated") {
          await emailService.sendAccountDeactivationEmail(user);
        }
      } catch (emailErr) {
        console.warn("[Admin] Status updated but email failed:", emailErr.message);
      }

      res.json({ success: true, message: `User status updated to ${status}`, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
