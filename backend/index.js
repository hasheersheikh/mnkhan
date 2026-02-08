require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
const inquiryRoutes = require("./routes/inquiries");
const adminRoutes = require("./routes/admin");
const taskRoutes = require("./routes/tasks");
const peopleRoutes = require("./routes/people");
const blogRoutes = require("./routes/blogs");
const appointmentRoutes = require("./routes/appointments");
const cartRoutes = require("./routes/cart");
const hourlyRateRoutes = require("./routes/hourlyRate");
const documentRoutes = require("./routes/documents");
const voucherRoutes = require("./routes/vouchers");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mnkhan";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/hourly-rate", hourlyRateRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/vouchers", voucherRoutes);

// Health Check
app.get("/", (req, res) => res.send("MNKHAN Backend API is running..."));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Global Error]:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
