const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Favorite = require("../models/Favorite");

// Multer config for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../profile_image");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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
    if (!user.isActive) {
      return res.json({ success: false, error: "Account is deactivated. Please contact support." });
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

// Admin guard
async function isAdmin(req, res, next) {
  try {
    const u = await User.findById(req.userId);
    if (!u) return res.status(401).json({ success: false, error: "User not found" });
    if (u.role !== 'admin') {
      // Bootstrap: if there is no admin in the system, promote current user
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        u.role = 'admin';
        await u.save();
        return next();
      }
      return res.status(403).json({ success: false, error: "Admin access required" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, error: "Authorization check failed" });
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
    const user = await User.findById(req.userId);
    if (!user) return res.json({ success: false, error: "User not found" });

    // Disallow deleting admin accounts from the profile endpoint
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: "Admin accounts cannot be deleted from profile" });
    }

    // 1) Remove user's vehicle images and records
    try {
      const objectId = new mongoose.Types.ObjectId(req.userId);
      const vehicles = await mongoose.connection
        .collection('sellvehicledetails')
        .find({ user: objectId })
        .toArray();

      for (const v of vehicles) {
        const photos = Array.isArray(v.photos) ? v.photos : [];
        for (const filename of photos) {
          try {
            const filePath = path.join(__dirname, "../sellvehicle", filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch (_) {}
        }
      }

      await mongoose.connection
        .collection('sellvehicledetails')
        .deleteMany({ user: objectId });

      // Remove any favourites that referenced the deleted vehicles (for all users)
      try {
        const vehicleIds = vehicles.map(v => v._id).filter(Boolean);
        if (vehicleIds.length > 0) {
          await Favorite.deleteMany({ vehicle: { $in: vehicleIds } });
        }
      } catch (_) {}
    } catch (_) {
      // ignore cleanup failure
    }

    // 2) Remove user's own favourites
    try {
      await Favorite.deleteMany({ user: req.userId });
    } catch (_) {}

    // 3) Remove user's profile image file if present
    if (user.profileImage) {
      try {
        const imgPath = path.join(__dirname, "../profile_image", user.profileImage);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (_) {}
    }

    // 4) Soft delete account
    user.isActive = false;
    user.deletedAt = new Date();
    user.profileImage = null;
    await user.save();

    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, error: "Failed to delete account" });
  }
});

// Get all users (admin endpoint)
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, error: "Failed to fetch users" });
  }
});

// Admin: create a new user with role
router.post('/admin/create-user', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, location, subLocation, password, role } = req.body;
    if (!name || !email || !phone || !location || !subLocation || !password) {
      return res.json({ success: false, error: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, error: 'Email already registered.' });
    }
    const user = new User({
      name,
      email,
      phone,
      location,
      subLocation,
      password,
      role: role === 'admin' ? 'admin' : 'user'
    });
    await user.save();
    const created = user.toObject();
    delete created.password;
    res.json({ success: true, user: created });
  } catch (e) {
    res.json({ success: false, error: 'Failed to create user' });
  }
});

// Admin: delete a user (users collection only)
router.delete('/admin/user/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot delete an admin account' });
    }
    // Prevent deleting yourself
    if (String(req.userId) === String(id)) {
      return res.status(403).json({ success: false, error: 'You cannot delete your own account' });
    }

    // 1) Find related sellvehicledetails documents to remove images
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const vehicles = await mongoose.connection
        .collection('sellvehicledetails')
        .find({ user: objectId })
        .toArray();

      for (const v of vehicles) {
        const photos = Array.isArray(v.photos) ? v.photos : [];
        for (const filename of photos) {
          try {
            const filePath = path.join(__dirname, "../sellvehicle", filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch (_) {}
        }
      }

      // 2) Delete the vehicle documents
      await mongoose.connection
        .collection('sellvehicledetails')
        .deleteMany({ user: objectId });

      // Remove any favourites that referenced the deleted vehicles (for all users)
      try {
        const vehicleIds = vehicles.map(v => v._id).filter(Boolean);
        if (vehicleIds.length > 0) {
          await Favorite.deleteMany({ vehicle: { $in: vehicleIds } });
        }
      } catch (_) {}
    } catch (_) {
      // Ignore errors from vehicle cleanup to not block user deletion
    }

    // 3) Remove user's own favourites
    try {
      await Favorite.deleteMany({ user: id });
    } catch (_) {}

    // 4) Attempt to remove user's profile image file if present
    if (user.profileImage) {
      try {
        const imgPath = path.join(__dirname, "../profile_image", user.profileImage);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (_) {}
    }

    // 5) Soft delete the user (do not remove the document)
    user.isActive = false;
    user.deletedAt = new Date();
    // Optionally clear profileImage reference after file removal
    user.profileImage = null;
    await user.save();

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Upload profile image
router.post("/upload-profile-image", authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: "No image file provided" });
    }

    const userId = req.userId;
    const imagePath = req.file.filename;

    // Update user with new profile image
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.json({ success: false, error: "User not found" });
    }

    res.json({ 
      success: true, 
      message: "Profile image uploaded successfully",
      profileImage: imagePath,
      user: user
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.json({ success: false, error: "Failed to upload profile image" });
  }
});

module.exports = { router, authMiddleware };
