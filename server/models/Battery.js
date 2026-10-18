const mongoose = require("mongoose");

const batterySchema = new mongoose.Schema(
  {
    batteryCode: { type: String, required: true, unique: true, trim: true },
    capacityMah: { type: Number, required: true },
    currentChargePercent: { type: Number, default: 100, min: 0, max: 100 },
    healthPercent: { type: Number, default: 100, min: 0, max: 100 },
    cycleCount: { type: Number, default: 0 },
    lastChargedAt: { type: Date, default: Date.now },
    drone: { type: mongoose.Schema.Types.ObjectId, ref: "Drone" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Battery", batterySchema);
