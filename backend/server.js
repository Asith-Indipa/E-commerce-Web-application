// backend/server.js
const express = require("express");
const app = express();
const PORT = 5000;

require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

const vehicleCategoryRoutes = require("./routes/vehiclecategory");
const vehicleModelBrandRoutes = require("./routes/vehiclemodelbrand");
const locationRoutes = require("./routes/location");
const { router: authRoutes } = require("./routes/auth");
const sellVehicleRoutes = require("./routes/sellvehicle");
const favoriteRoutes = require("./routes/favorite");
const cors = require("cors");

// Middleware
app.use(cors()); // <-- Add this line before your routes
app.use(express.json());

// Serve uploaded vehicle images
app.use("/sellvehicle", express.static("sellvehicle"));

// Serve profile images
app.use("/profile_image", express.static("profile_image"));

// Example route
app.get("/", (req, res) => {
  res.send("Hello from Express backend 🚀");
});

app.use("/api/vehiclecategory", vehicleCategoryRoutes);
app.use("/api/vehiclemodelbrand", vehicleModelBrandRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/sellvehicle", sellVehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorite", favoriteRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
