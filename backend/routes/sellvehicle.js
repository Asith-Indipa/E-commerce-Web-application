const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

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
  brand: String,
  title: String,
  description: String,
  price: Number,
  photos: [String], // You can use [String] for file names or base64 strings
  negotiable: Boolean, // <-- Add this field
  location: String,      // Add this field
  category: String,      // Add this field
  createdAt: { type: Date, default: Date.now }
});

// Create model
const SellVehicleDetails = mongoose.model("SellVehicleDetails", sellVehicleSchema);

// POST endpoint to add a vehicle with image upload
router.post("/add", upload.array("photos", 5), async (req, res) => {
  try {
    const { brand, title, description, price, negotiable, location, category } = req.body;
    const photoFiles = req.files || [];
    const photoPaths = photoFiles.map(file => file.filename);
    const vehicle = new SellVehicleDetails({
      brand,
      title,
      description,
      price,
      photos: photoPaths,
      negotiable,
      location,
      category
    });
    await vehicle.save();
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    console.error("SellVehicle POST error:", err); // Add this line
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET endpoint to fetch all vehicles
router.get("/all", async (req, res) => {
  try {
    const vehicles = await SellVehicleDetails.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
