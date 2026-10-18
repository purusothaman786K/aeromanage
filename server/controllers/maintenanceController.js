const Maintenance = require("../models/Maintenance");
const Drone = require("../models/Drone");

// @route  GET /api/maintenance
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("drone", "droneId model")
      .populate("technician", "name email")
      .sort({ scheduledDate: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch maintenance records", error: err.message });
  }
};

// @route  GET /api/maintenance/due
// Returns records due within the next 7 days or already overdue - powers alerts
exports.getDueSoon = async (req, res) => {
  try {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const due = await Maintenance.find({
      status: { $in: ["due", "overdue"] },
      scheduledDate: { $lte: weekFromNow },
    })
      .populate("drone", "droneId model")
      .sort({ scheduledDate: 1 });

    res.json(due);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch due maintenance", error: err.message });
  }
};

// @route  POST /api/maintenance
exports.createMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    // A drone flagged for maintenance shouldn't be flyable
    if (record.status !== "completed") {
      await Drone.findByIdAndUpdate(record.drone, { status: "maintenance" });
    }
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: "Failed to create maintenance record", error: err.message });
  }
};

// @route  PUT /api/maintenance/:id
exports.updateMaintenance = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === "completed" && !update.completedDate) {
      update.completedDate = Date.now();
    }

    const record = await Maintenance.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: "Maintenance record not found" });

    if (update.status === "completed") {
      await Drone.findByIdAndUpdate(record.drone, { status: "available" });
    }

    res.json(record);
  } catch (err) {
    res.status(400).json({ message: "Failed to update maintenance record", error: err.message });
  }
};

// @route  DELETE /api/maintenance/:id
exports.deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Maintenance record not found" });
    res.json({ message: "Maintenance record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete maintenance record", error: err.message });
  }
};
