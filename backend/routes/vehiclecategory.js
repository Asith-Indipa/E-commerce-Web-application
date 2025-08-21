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

// Edit category
router.put("/edit", async (req, res) => {
  try {
    const { oldCategory, newCategory } = req.body;
    if (!oldCategory || !newCategory) {
      return res.status(400).json({ error: "Both old and new category are required" });
    }
    // Check for duplicate
    const exists = await VehicleCategory.findOne({ category: newCategory });
    if (exists) {
      return res.status(409).json({ error: "Category already exists" });
    }
    const updated = await VehicleCategory.findOneAndUpdate(
      { category: oldCategory },
      { category: newCategory },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category updated", entry: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete category
router.delete("/delete", async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    const deleted = await VehicleCategory.findOneAndDelete({ category });
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
