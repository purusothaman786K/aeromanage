const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Drone = require("../models/Drone");
const Mission = require("../models/Mission");
const Maintenance = require("../models/Maintenance");
const Battery = require("../models/Battery");

// @route  GET /api/dashboard/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const [totalDrones, availableDrones, inMission, inMaintenance] = await Promise.all([
      Drone.countDocuments(),
      Drone.countDocuments({ status: "available" }),
      Drone.countDocuments({ status: "in-mission" }),
      Drone.countDocuments({ status: "maintenance" }),
    ]);

    const [plannedMissions, activeMissions, completedMissions] = await Promise.all([
      Mission.countDocuments({ status: "planned" }),
      Mission.countDocuments({ status: "active" }),
      Mission.countDocuments({ status: "completed" }),
    ]);

    const lowBatteries = await Battery.countDocuments({ currentChargePercent: { $lt: 20 } });

    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const dueMaintenance = await Maintenance.countDocuments({
      status: { $in: ["due", "overdue"] },
      scheduledDate: { $lte: weekFromNow },
    });

    res.json({
      drones: { total: totalDrones, available: availableDrones, inMission, inMaintenance },
      missions: { planned: plannedMissions, active: activeMissions, completed: completedMissions },
      alerts: { lowBatteries, dueMaintenance },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: err.message });
  }
});

module.exports = router;
