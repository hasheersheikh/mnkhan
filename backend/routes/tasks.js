const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Service = require("../models/Service");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// GET all tasks (Admin see all, Client see their own)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "client") {
      query = { userId: req.user._id };
    } else if (req.query.userId) {
      query = { userId: req.query.userId };
    }

    const tasks = await Task.find(query)
      .populate("userId", "name email")
      .populate("adminId", "name")
      .sort({ updatedAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single task with timeline
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("userId", "name email")
      .populate("adminId", "name");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Client can only see their own tasks
    if (
      req.user.role === "client" &&
      task.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: Create task
router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      console.log(
        `[API] Task creation by: ${req.user.email} for: ${req.body.userId}`,
      );
      const { title, description, userId, progress, serviceId } = req.body;

      let initialSteps = req.body.steps || [];

      // Auto-populate steps if serviceId is provided
      if (serviceId) {
        const service = await Service.findById(serviceId);
        if (
          service &&
          service.defaultSteps &&
          service.defaultSteps.length > 0
        ) {
          initialSteps = service.defaultSteps.map((s) => ({
            title: s,
            completed: false,
          }));
        }
      }

      const task = new Task({
        title,
        description,
        userId,
        adminId: req.user._id,
        progress: progress || 0,
        steps: initialSteps,
        timeline: [{ event: "Task Created", note: "Initial assignment" }],
      });

      // Auto-calculate initial status
      if (task.progress === 100) task.status = "completed";
      else if (task.progress > 0) task.status = "in-progress";
      else task.status = "pending";

      await task.save();
      console.log(`[API] Task created successfully: ${task._id}`);
      res.status(201).json({ success: true, task });
    } catch (err) {
      console.error(`[API] Task creation error: ${err.message}`);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Update task and timeline
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const { status, progress, newEvent, eventNote, steps } = req.body;
      console.log(
        `[API] PATCH /tasks/${req.params.id} - Steps received: ${!!steps}`,
      );

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      }

      if (status) task.status = status;

      if (steps) {
        task.steps = steps;
        task.markModified("steps");
        // Auto-calculate progress if steps exist
        const totalSteps = steps.length;
        const completedSteps = steps.filter((s) => s.completed).length;
        task.progress =
          totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      } else if (progress !== undefined) {
        task.progress = progress;
      }

      if (status) {
        task.status = status;
      } else {
        // Auto-calculate status based on progress
        if (task.progress === 100) task.status = "completed";
        else if (task.progress > 0) task.status = "in-progress";
        else task.status = "pending";
      }

      if (newEvent) {
        task.timeline.push({
          event: newEvent,
          note: eventNote || "",
        });
      }

      await task.save();
      console.log(
        `[API] Task updated: ${task._id}, Progress: ${task.progress}%`,
      );
      res.json({ success: true, task });
    } catch (err) {
      console.error(`[API] Task update error: ${err.message}`);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Delete task
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      }

      console.log(`[API] Task deleted: ${task._id}`);
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
      console.error(`[API] Task deletion error: ${err.message}`);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// Add comment to task
router.post("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Authorization: only the assigned client or an admin can comment
    if (req.user.role === "client" && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const comment = {
      senderId: req.user._id,
      senderRole: req.user.role === "client" ? "client" : "admin",
      text,
      date: new Date()
    };

    task.comments.push(comment);
    await task.save();

    // Return populated task for frontend UI update
    const updatedTask = await Task.findById(req.params.id)
      .populate("userId", "name email")
      .populate("adminId", "name");

    res.json({ success: true, task: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
