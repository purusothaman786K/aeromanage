const express = require("express");
const router = express.Router();
const {
  getMaintenanceRecords, getDueSoon, createMaintenance, updateMaintenance, deleteMaintenance,
} = require("../controllers/maintenanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/due", getDueSoon);
router.route("/")
  .get(getMaintenanceRecords)
  .post(authorize("admin", "technician"), createMaintenance);
router.route("/:id")
  .put(authorize("admin", "technician"), updateMaintenance)
  .delete(authorize("admin"), deleteMaintenance);

module.exports = router;
