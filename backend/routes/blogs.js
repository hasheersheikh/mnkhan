const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Seeding logic
const seedBlogs = async () => {
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      const BLOGS = [
        {
          title: "New Regulations in AI Governance",
          excerpt:
            "How the latest legal frameworks are shaping the deployment of artificial intelligence in cross-border trade.",
          content: "Full content about AI governance...",
          category: "Briefing",
        },
        {
          title: "Healthcare Industry Outlook 2026",
          excerpt:
            "A comprehensive report on legal compliance trends in the global healthcare sector for the upcoming year.",
          content: "Full content about healthcare outlook...",
          category: "Report",
        },
        {
          title: "Strategic Planning for Legal Teams",
          excerpt:
            "Key takeaways from our latest seminar on organizational efficiency for legal practitioners.",
          content: "Full content about strategic planning...",
          category: "Event",
        },
      ];
      await Blog.insertMany(BLOGS);
      console.log("[Seeding] Successfully seeded initial blogs.");
    }
  } catch (err) {
    console.error("[Seeding] Error seeding blogs:", err.message);
  }
};

// GET all blogs
router.get("/", async (req, res) => {
  try {
    await seedBlogs();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single blog (Public)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: Create blog
router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const blog = new Blog(req.body);
      await blog.save();
      res.status(201).json({ success: true, blog });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Update blog
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!blog)
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      res.json({ success: true, blog });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Delete blog
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);
      if (!blog)
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      res.json({ success: true, message: "Blog deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
