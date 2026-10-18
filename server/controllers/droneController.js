const Drone = require("../models/Drone");

// @route  GET /api/drones
exports.getDrones = async (req, res) => {
  try {
    const drones = await Drone.find().populate("battery").sort({ createdAt: -1 });
    res.json(drones);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drones", error: err.message });
  }
};

// @route  GET /api/drones/:id
exports.getDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id).populate("battery");
    if (!drone) return res.status(404).json({ message: "Drone not found" });
    res.json(drone);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drone", error: err.message });
  }
};

// @route  POST /api/drones
exports.createDrone = async (req, res) => {
  try {
    const drone = await Drone.create(req.body);
    res.status(201).json(drone);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A drone with this droneId already exists" });
    }
    res.status(400).json({ message: "Failed to create drone", error: err.message });
  }
};

// @route  PUT /api/drones/:id
exports.updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!drone) return res.status(404).json({ message: "Drone not found" });
    res.json(drone);
  } catch (err) {
    res.status(400).json({ message: "Failed to update drone", error: err.message });
  }
};

// @route  DELETE /api/drones/:id
exports.deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });
    res.json({ message: "Drone deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete drone", error: err.message });
  }
};
