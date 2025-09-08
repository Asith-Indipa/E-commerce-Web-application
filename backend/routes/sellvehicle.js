const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  model: String,         // Add this field
  trim: String,          // Add this field
  condition: String,
  year: String,          // Add this field
  mileage: String,       // Add this field
  engine: String,        // Add this field
  fuel: String,           // Add this field
  transmission: String,   // Add this field
  bodyType: String,       // Add this field
  description: String,
  price: Number,
  photos: [String], // You can use [String] for file names or base64 strings
  negotiable: Boolean,
  category: String,
  district: String,
  subLocation: String,
  createdAt: { type: Date, default: Date.now }
});

// Create model
const SellVehicleDetails = mongoose.model("SellVehicleDetails", sellVehicleSchema);

// POST endpoint to add a vehicle with image upload
router.post("/add", upload.array("photos", 5), async (req, res) => {
  try {
    console.log("Received body:", req.body); // Debug: log incoming fields
    console.log("Received files:", req.files); // Debug: log incoming files
    const {
      brand,
      model,
      trim,
      condition,
      year,
      mileage,
      engine,
      fuel,           // Add this field
      transmission,   // Add this field
      bodyType,       // Add this field
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
    const vehicle = new SellVehicleDetails({
      brand,
      model,
      trim,
      condition,
      year,
      mileage,
      engine,
      fuel,           // Add this field
      transmission,   // Add this field
      bodyType,       // Add this field
      description,
      price: numericPrice,
      photos: photoPaths,
      negotiable,
      category,
      district,
      subLocation
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

// DELETE endpoint to remove a vehicle and its images
router.delete("/delete/:id", async (req, res) => {
  try {
    const vehicle = await SellVehicleDetails.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });

    // Delete images from local folder
    if (vehicle.photos && vehicle.photos.length > 0) {
      vehicle.photos.forEach(filename => {
        const filePath = path.join(__dirname, "../sellvehicle", filename);
        fs.unlink(filePath, err => {
          // Ignore errors if file doesn't exist
        });
      });
    }

    await vehicle.deleteOne();
    res.json({ success: true, message: "Vehicle and images deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
