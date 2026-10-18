const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["surveillance", "agriculture", "logistics", "inspection"],
      required: true,
    },
    assignedDrone: { type: mongoose.Schema.Types.ObjectId, ref: "Drone", required: true },
    assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    startLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planned", "active", "completed", "aborted"],
      default: "planned",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

missionSchema.index({ assignedDrone: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Mission", missionSchema);
