const Battery = require("../models/Battery");
const Drone = require("../models/Drone");

// @route  GET /api/batteries
exports.getBatteries = async (req, res) => {
  try {
    const batteries = await Battery.find().populate("drone", "droneId model").sort({ createdAt: -1 });
    res.json(batteries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batteries", error: err.message });
  }
};

// @route  POST /api/batteries
exports.createBattery = async (req, res) => {
  try {
    const battery = await Battery.create(req.body);

    // Link battery back to its drone, if provided
    if (battery.drone) {
      await Drone.findByIdAndUpdate(battery.drone, { battery: battery._id });
    }

    res.status(201).json(battery);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A battery with this code already exists" });
    }
    res.status(400).json({ message: "Failed to create battery", error: err.message });
  }
};

// @route  PUT /api/batteries/:id
// Used for both general edits and quick "charge update" actions
exports.updateBattery = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.currentChargePercent !== undefined) {
      update.lastChargedAt = Date.now();
    }
    const battery = await Battery.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!battery) return res.status(404).json({ message: "Battery not found" });
    res.json(battery);
  } catch (err) {
    res.status(400).json({ message: "Failed to update battery", error: err.message });
  }
};

// @route  DELETE /api/batteries/:id
exports.deleteBattery = async (req, res) => {
  try {
    const battery = await Battery.findByIdAndDelete(req.params.id);
    if (!battery) return res.status(404).json({ message: "Battery not found" });
    res.json({ message: "Battery deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete battery", error: err.message });
  }
};
