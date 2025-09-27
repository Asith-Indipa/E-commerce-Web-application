const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, vehicle: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
