const Mission = require("../models/Mission");
const Drone = require("../models/Drone");

const findConflicts = async ({ assignedDrone, assignedOperator, startTime, endTime, excludeId }) => {
  const overlapQuery = {
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $in: ["planned", "active"] },
  };
  if (excludeId) overlapQuery._id = { $ne: excludeId };

  const droneConflict = await Mission.findOne({ ...overlapQuery, assignedDrone });
  const operatorConflict = await Mission.findOne({ ...overlapQuery, assignedOperator });

  return { droneConflict, operatorConflict };
};

exports.getMissions = async (req, res) => {
  try {
    const missions = await Mission.find()
      .populate("assignedDrone", "droneId model type")
      .populate("assignedOperator", "name email")
      .sort({ startTime: 1 });
    res.json(missions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch missions", error: err.message });
  }
};

exports.createMission = async (req, res) => {
  try {
    const { assignedDrone, assignedOperator, startTime, endTime } = req.body;
    if (!assignedDrone || !assignedOperator || !startTime || !endTime) {
      return res.status(400).json({ message: "assignedDrone, assignedOperator, startTime, and endTime are required" });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    const { droneConflict, operatorConflict } = await findConflicts(req.body);
    if (droneConflict) {
      return res.status(409).json({ message: `Drone is already assigned to mission "${droneConflict.title}" during this time window` });
    }
    if (operatorConflict) {
      return res.status(409).json({ message: `Operator is already assigned to mission "${operatorConflict.title}" during this time window` });
    }

    const mission = await Mission.create(req.body);
    res.status(201).json(mission);
  } catch (err) {
    res.status(400).json({ message: "Failed to create mission", error: err.message });
  }
};

exports.updateMission = async (req, res) => {
  try {
    const existing = await Mission.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Mission not found" });

    const merged = { ...existing.toObject(), ...req.body };

    if (req.body.startTime || req.body.endTime || req.body.assignedDrone || req.body.assignedOperator) {
      const { droneConflict, operatorConflict } = await findConflicts({
        assignedDrone: merged.assignedDrone,
        assignedOperator: merged.assignedOperator,
        startTime: merged.startTime,
        endTime: merged.endTime,
        excludeId: existing._id,
      });
      if (droneConflict) {
        return res.status(409).json({ message: `Drone is already assigned to mission "${droneConflict.title}" during this time window` });
      }
      if (operatorConflict) {
        return res.status(409).json({ message: `Operator is already assigned to mission "${operatorConflict.title}" during this time window` });
      }
    }

    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.body.status === "active") {
      const drone = await Drone.findByIdAndUpdate(mission.assignedDrone, { status: "in-mission" });
      if (drone?.currentLocation?.lat && drone?.currentLocation?.lng) {
        mission.startLocation = { lat: drone.currentLocation.lat, lng: drone.currentLocation.lng };
      }
      mission.progress = 0;
      await mission.save();
    } else if (["completed", "aborted"].includes(req.body.status)) {
      await Drone.findByIdAndUpdate(mission.assignedDrone, { status: "available" });
      if (req.body.status === "completed") {
        mission.progress = 100;
        await mission.save();
      }
    }

    res.json(mission);
  } catch (err) {
    res.status(400).json({ message: "Failed to update mission", error: err.message });
  }
};

exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ message: "Mission not found" });
    res.json({ message: "Mission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete mission", error: err.message });
  }
};
