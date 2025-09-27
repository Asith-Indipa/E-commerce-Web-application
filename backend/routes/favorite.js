const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { authMiddleware } = require('./auth');
const mongoose = require('mongoose');

// Check if a vehicle is favourited by current user
router.get('/is/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.json({ success: false, error: 'Invalid vehicle id' });
    }
    const exists = await Favorite.exists({ user: req.userId, vehicle: vehicleId });
    return res.json({ success: true, isFav: !!exists });
  } catch (e) {
    return res.json({ success: false, error: 'Failed to check favourite' });
  }
});

// Add a vehicle to favourites
router.post('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.json({ success: false, error: 'Invalid vehicle id' });
    }
    const fav = await Favorite.findOneAndUpdate(
      { user: req.userId, vehicle: vehicleId },
      { $setOnInsert: { user: req.userId, vehicle: vehicleId } },
      { upsert: true, new: true }
    );
    return res.json({ success: true, favorite: fav });
  } catch (e) {
    // handle duplicate key or others similarly as success
    if (e && e.code === 11000) {
      return res.json({ success: true });
    }
    return res.json({ success: false, error: 'Failed to add favourite' });
  }
});

// Remove a vehicle from favourites
router.delete('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    if (!mongoose.isValidObjectId(vehicleId)) {
      return res.json({ success: false, error: 'Invalid vehicle id' });
    }
    await Favorite.deleteOne({ user: req.userId, vehicle: vehicleId });
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, error: 'Failed to remove favourite' });
  }
});

// List current user's favourites (vehicle ids)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, favorites: favs });
  } catch (e) {
    return res.json({ success: false, error: 'Failed to fetch favourites' });
  }
});

module.exports = router;
