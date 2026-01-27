const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "mnkhan_secret_key_2026";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access token required" });
    }

    // verify token synchronously to get payload
    console.log("[Auth] Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[Auth] Token decoded:", JSON.stringify(decoded));

    let user;
    if (decoded.type === "admin") {
      console.log("[Auth] Searching for admin:", decoded.id);
      user = await AdminUser.findById(decoded.id);
    } else {
      console.log("[Auth] Searching for client:", decoded.id);
      user = await User.findById(decoded.id);
    }

    if (!user) {
      console.warn("[Auth] User not found in database:", decoded.id);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("[Auth] Success. User:", user.email, "Role:", user.role);
    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth Error]:", err.message);
    return res.status(403).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Token expired"
          : "Auth failed: " + err.message,
    });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of the following roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (decoded.type === "admin") {
      user = await AdminUser.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    // If token is invalid, we still proceed but without req.user
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuthenticateToken,
};
