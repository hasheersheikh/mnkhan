const express = require("express");
const router = express.Router();
const Person = require("../models/Person");

// Public: Get all professionals
router.get("/", async (req, res) => {
  try {
    const people = await Person.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, people });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
