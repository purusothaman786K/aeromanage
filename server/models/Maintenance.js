const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    drone: { type: mongoose.Schema.Types.ObjectId, ref: "Drone", required: true },
    type: {
      type: String,
      enum: ["routine", "repair", "inspection"],
      default: "routine",
    },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["due", "in-progress", "completed", "overdue"],
      default: "due",
    },
    cost: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
