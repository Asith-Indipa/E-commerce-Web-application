const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, location, subLocation, password } = req.body;
    if (!name || !email || !phone || !location || !subLocation || !password) {
      return res.json({ success: false, error: "All fields are required." });
    }
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, error: "Email already registered." });
    }
    const user = new User({ name, email, phone, location, subLocation, password });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, error: "Email and password required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, error: "Invalid credentials." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, error: "Invalid credentials." });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );
    // Return user's name in response
    res.json({ success: true, token, name: user.name });
  } catch (err) {
    res.json({ success: false, error: "Login failed." });
  }
});

// Middleware to verify JWT and get user
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

// Get current user details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.json({ success: false, error: "Failed to fetch user" });
  }
});

// Update current user details
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, location, subLocation, phone } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.json({ success: false, error: "User not found" });
    user.name = name || user.name;
    user.location = location || user.location;
    user.subLocation = subLocation || user.subLocation;
    user.phone = phone || user.phone;
    await user.save();
    res.json({ success: true, user });
  } catch {
    res.json({ success: false, error: "Failed to update user" });
  }
});

// Update user password
router.put("/me/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.json({ success: false, error: "All password fields required" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.json({ success: false, error: "User not found" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.json({ success: false, error: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true });
  } catch {
    res.json({ success: false, error: "Failed to change password" });
  }
});

// Delete current user account
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ success: true });
  } catch {
    res.json({ success: false, error: "Failed to delete account" });
  }
});

module.exports = router;
