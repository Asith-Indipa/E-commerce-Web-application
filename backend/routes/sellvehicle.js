const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Favorite = require("../models/Favorite");
const { authMiddleware } = require("./auth");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../sellvehicle"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Define schema
const sellVehicleSchema = new mongoose.Schema({
  bikeType: String,    // Add this field
  brand: String,
  model: String,
  trim: String,
  condition: String,
  year: String,
  mileage: String,
  engine: String,
  fuel: String,
  transmission: String,
  bodyType: String,
  vehicleType: String, // Add this field
  title: String,       // Add this field
  description: String,
  price: Number,
  photos: [String], // You can use [String] for file names or base64 strings
  negotiable: Boolean,
  category: String,
  district: String,
  subLocation: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add user field
  createdAt: { type: Date, default: Date.now }
});

// Create model
const SellVehicleDetails = mongoose.model("SellVehicleDetails", sellVehicleSchema);

// POST endpoint to add a vehicle with image upload and user id
router.post("/add", authMiddleware, upload.array("photos", 5), async (req, res) => {
  try {
    console.log("Received body:", req.body); // Debug: log incoming fields
    console.log("Received files:", req.files); // Debug: log incoming files
    const {
      bikeType,      // Add this field
      brand,
      model,
      trim,
      condition,
      year,
      mileage,
      engine,
      fuel,
      transmission,
      bodyType,
      vehicleType, // Add this field
      title,       // Add this field
      description,
      price,
      negotiable,
      category,
      district,
      subLocation
    } = req.body;
    const photoFiles = req.files || [];
    const photoPaths = photoFiles.map(file => file.filename);
    // Convert price to number (remove commas if present)
    const numericPrice = typeof price === "string" ? Number(price.replace(/,/g, "")) : price;
    const userId = req.userId; // Get user id from JWT
    const vehicle = new SellVehicleDetails({
      bikeType,      // Add this field
      brand,
      model,
      trim,
      condition,
      year,
      mileage,
      engine,
      fuel,
      transmission,
      bodyType,
      vehicleType, // Add this field
      title,       // Add this field
      description,
      price: numericPrice,
      photos: photoPaths,
      negotiable,
      category,
      district,
      subLocation,
      user: userId // Add user field
    });
    await vehicle.save();
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    console.error("SellVehicle POST error:", err); // Add this line
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET endpoint to fetch all vehicles with user info
router.get("/all", async (req, res) => {
  try {
    const vehicles = await SellVehicleDetails.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET current user's ads
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const vehicles = await SellVehicleDetails.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET endpoint to fetch vehicle details by id
router.get('/details/:id', async (req, res) => {
  try {
    const vehicle = await SellVehicleDetails.findById(req.params.id).populate("user", "name email phone");
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE endpoint to edit an existing vehicle (owner only)
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await SellVehicleDetails.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    if (String(vehicle.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this ad' });
    }
    const {
      bikeType,
      condition,
      brand,
      model,
      trim,
      year,
      mileage,
      engine,
      fuel,
      transmission,
      bodyType,
      vehicleType,
      category,
      title,
      price,
      negotiable,
      description,
      district,
      subLocation,
    } = req.body || {};

    // Simple field updates
    if (typeof title === 'string' && title.trim()) vehicle.title = title.trim();
    if (typeof brand === 'string') vehicle.brand = brand;
    if (typeof model === 'string') vehicle.model = model;
    if (typeof trim === 'string') vehicle.trim = trim;
    if (typeof condition === 'string') vehicle.condition = condition;
    if (typeof bikeType === 'string') vehicle.bikeType = bikeType;
    if (typeof description === 'string') vehicle.description = description;
    if (typeof fuel === 'string') vehicle.fuel = fuel;
    if (typeof transmission === 'string') vehicle.transmission = transmission;
    if (typeof bodyType === 'string') vehicle.bodyType = bodyType;
    if (typeof vehicleType === 'string') vehicle.vehicleType = vehicleType;
    if (typeof category === 'string') vehicle.category = category;
    if (typeof district === 'string') vehicle.district = district;
    if (typeof subLocation === 'string') vehicle.subLocation = subLocation;

    // Year (kept as string in schema)
    if (typeof year !== 'undefined') vehicle.year = String(year);

    // Price numeric
    if (typeof price !== 'undefined') {
      const numericPrice = typeof price === 'string' ? Number(price.replace(/,/g, '')) : Number(price);
      if (!Number.isNaN(numericPrice)) vehicle.price = numericPrice;
    }

    // Negotiable boolean
    if (typeof negotiable !== 'undefined') vehicle.negotiable = !!negotiable;

    // Mileage and engine formatted as in create flow
    if (typeof mileage !== 'undefined') {
      // Accept either a plain number/string or already formatted string
      const raw = String(mileage).replace(/,/g, '').replace(/km/i, '').trim();
      if (raw) vehicle.mileage = `${raw}km`;
    }
    if (typeof engine !== 'undefined') {
      const raw = String(engine).replace(/,/g, '').replace(/cc/i, '').trim();
      if (raw) vehicle.engine = `${raw}cc`;
    }

    await vehicle.save();
    const populated = await SellVehicleDetails.findById(vehicle._id).populate('user', 'name email');
    return res.json({ success: true, vehicle: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update ad' });
  }
});

// UPDATE photos for an existing vehicle (owner only)
router.put('/photos/:id', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    const vehicle = await SellVehicleDetails.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    if (String(vehicle.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this ad' });
    }

    // Parse remove list
    let removeList = [];
    try {
      if (req.body && req.body.remove) {
        removeList = JSON.parse(req.body.remove);
        if (!Array.isArray(removeList)) removeList = [];
      }
    } catch (_) { removeList = []; }

    // Remove marked files from disk and from vehicle.photos
    const current = Array.isArray(vehicle.photos) ? vehicle.photos.slice() : [];
    const keep = current.filter((fname) => !removeList.includes(fname));
    const toDelete = current.filter((fname) => removeList.includes(fname));
    for (const filename of toDelete) {
      try {
        const filePath = path.join(__dirname, "../sellvehicle", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {}
    }

    // Add new uploaded files
    const uploaded = (req.files || []).map(f => f.filename);
    let next = [...keep, ...uploaded];
    if (next.length > 5) {
      // If exceeding 5, remove extra uploaded files from disk to avoid orphan files
      const overflow = next.length - 5;
      const extras = uploaded.slice(-overflow);
      for (const filename of extras) {
        try {
          const filePath = path.join(__dirname, "../sellvehicle", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (_) {}
      }
      next = next.slice(0, 5);
    }

    vehicle.photos = next;
    await vehicle.save();
    return res.json({ success: true, photos: vehicle.photos });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update photos' });
  }
});

// DELETE endpoint to remove a vehicle and its images
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await SellVehicleDetails.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });

    // Only the owner can delete their ad
    if (String(vehicle.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this ad" });
    }

    // Delete images from local folder
    if (vehicle.photos && vehicle.photos.length > 0) {
      vehicle.photos.forEach(filename => {
        const filePath = path.join(__dirname, "../sellvehicle", filename);
        fs.unlink(filePath, err => {
          // Ignore errors if file doesn't exist
        });
      });
    }

    // Remove any favourites referencing this vehicle (for all users)
    try {
      await Favorite.deleteMany({ vehicle: vehicle._id });
    } catch (_) {}

    await vehicle.deleteOne();
    res.json({ success: true, message: "Vehicle and images deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
