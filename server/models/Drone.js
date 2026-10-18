const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema(
  {
    droneId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["surveillance", "agriculture", "logistics", "inspection"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "in-mission", "maintenance", "inactive"],
      default: "available",
    },
    battery: { type: mongoose.Schema.Types.ObjectId, ref: "Battery" },
    totalFlightHours: { type: Number, default: 0 },
    purchaseDate: { type: Date },
    notes: { type: String, trim: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drone", droneSchema);
