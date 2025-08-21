const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  district: { type: String, required: true, unique: true },
  subLocations: { type: [String], default: [] }
});

const Location = mongoose.model("location", locationSchema);

// Add a new sub location to a district
router.post("/add", async (req, res) => {
  try {
    const { district, subLocation } = req.body;
    if (!district || !subLocation) {
      return res.status(400).json({ error: "Both district and sub location are required" });
    }
    // Find district and add sub location if not exists
    let location = await Location.findOne({ district });
    if (location) {
      if (location.subLocations.includes(subLocation)) {
        return res.status(409).json({ error: "Sub location already exists for this district" });
      }
      location.subLocations.push(subLocation);
      await location.save();
      return res.status(200).json({ message: "Sub location added", entry: location });
    } else {
      // Create new district with first sub location
      location = new Location({ district, subLocations: [subLocation] });
      await location.save();
      return res.status(201).json({ message: "Location added", entry: location });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a sub location for a district
router.put("/update", async (req, res) => {
  try {
    const { district, oldSubLocation, newSubLocation } = req.body;
    if (!district || !oldSubLocation || !newSubLocation) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const location = await Location.findOne({ district });
    if (!location) return res.status(404).json({ error: "District not found" });
    const idx = location.subLocations.indexOf(oldSubLocation);
    if (idx === -1) return res.status(404).json({ error: "Sub location not found" });
    if (location.subLocations.includes(newSubLocation)) {
      return res.status(409).json({ error: "Sub location already exists for this district" });
    }
    location.subLocations[idx] = newSubLocation;
    await location.save();
    res.json({ message: "Sub location updated", entry: location });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a sub location for a district
router.delete("/delete", async (req, res) => {
  try {
    const { district, subLocation } = req.body;
    if (!district || !subLocation) {
      return res.status(400).json({ error: "Both district and sub location are required" });
    }
    const location = await Location.findOne({ district });
    if (!location) return res.status(404).json({ error: "District not found" });
    location.subLocations = location.subLocations.filter(sub => sub !== subLocation);
    await location.save();
    res.json({ message: "Sub location deleted", entry: location });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all locations
router.get("/all", async (req, res) => {
  try {
    const locations = await Location.find({});
    // Format: { district: [subLocation, ...], ... }
    const grouped = {};
    locations.forEach(loc => {
      grouped[loc.district] = loc.subLocations;
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
