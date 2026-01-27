const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Seeding logic (internal)
const seedServices = async () => {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      const SERVICES = [
        {
          name: "Amendment Deed",
          description:
            "Professional drafting and execution of amendment deeds for partnerships and companies.",
          price: "2,600",
          details:
            "Legal drafting of deeds to modify existing partnership agreements or company articles.",
          criteria:
            "Copy of original deed, details of proposed amendments, and identity proof of partners/directors.",
          defaultSteps: [
            "Initial consultation",
            "Drafting amendment",
            "Partner review",
            "Final execution",
          ],
        },
        {
          name: "Company Registration Services",
          description:
            "Comprehensive end-to-end support for premium company incorporation and setup.",
          price: "10,000",
          details:
            "Full incorporation support including DIN, DSC, MOA/AOA drafting, and PAN/TAN application.",
          criteria:
            "Identity and address proof of directors, proposed company names, and registered office proof.",
          defaultSteps: [
            "DSC & DIN application",
            "Name approval",
            "MOA & AOA drafting",
            "Certificate of Incorporation",
          ],
        },
        {
          name: "GST REGISTRATION",
          description:
            "Standard GST registration services for businesses and practitioners.",
          price: "22,500",
          details:
            "Application for Goods and Services Tax identification number and initial compliance setup.",
          criteria:
            "PAN of business, proof of business registration, and board resolution for authorized signatory.",
          defaultSteps: [
            "Document verification",
            "Application filing",
            "Officer review",
            "GSTIN generation",
          ],
        },
      ];
      await Service.insertMany(SERVICES);
      console.log("[Seeding] Successfully seeded initial services.");
    }
  } catch (err) {
    console.error("[Seeding] Error seeding services:", err.message);
  }
};

// GET all services (Public)
router.get("/", async (req, res) => {
  try {
    await seedServices(); // Run seeding if DB empty
    const services = await Service.find().sort({ name: 1 });
    // Transform to include 'id' for frontend compatibility if needed, or update frontend to use '_id'
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      res.json({ success: true, service });
    } else {
      res.status(404).json({ success: false, message: "Service not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: Create service
router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const service = new Service(req.body);
      await service.save();
      res.status(201).json({ success: true, service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Update service
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service not found" });
      res.json({ success: true, service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ADMIN: Delete service
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service)
        return res
          .status(404)
          .json({ success: false, message: "Service not found" });
      res.json({ success: true, message: "Service deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
