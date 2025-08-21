const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const vehicleCategorySchema = new mongoose.Schema({
  category: { type: String, required: true }
});

const VehicleCategory = mongoose.model("vehiclecategories", vehicleCategorySchema);

// Add a new category
router.post("/add", async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    // Check for duplicate
    const exists = await VehicleCategory.findOne({ category });
    if (exists) {
      return res.status(409).json({ error: "Category already exists" });
    }
    const newEntry = new VehicleCategory({ category });
    await newEntry.save();
    res.status(201).json({ message: "Category added", entry: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all categories (distinct)
router.get("/all", async (req, res) => {
  try {
    const categories = await VehicleCategory.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
