const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const vehicleModelBrandSchema = new mongoose.Schema({
  category: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true }
});

const VehicleModelBrand = mongoose.model("vehiclemodelbrand", vehicleModelBrandSchema);

// Add a new vehicle (brand & model under category)
router.post("/add", async (req, res) => {
  try {
    const { category, brand, model } = req.body;
    if (!category || !brand || !model) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newEntry = new VehicleModelBrand({ category, brand, model });
    await newEntry.save();
    res.status(201).json({ message: "Vehicle added", entry: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all vehicle entries
router.get("/all", async (req, res) => {
  try {
    const vehicles = await VehicleModelBrand.find({});
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Edit vehicle entry
router.put("/edit/:id", async (req, res) => {
  try {
    const { category, brand, model } = req.body;
    const updated = await VehicleModelBrand.findByIdAndUpdate(
      req.params.id,
      { category, brand, model },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Vehicle not found" });
    res.json({ message: "Vehicle updated", entry: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete vehicle entry
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await VehicleModelBrand.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
