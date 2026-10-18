const express = require("express");
const router = express.Router();
const {
  getBatteries, createBattery, updateBattery, deleteBattery,
} = require("../controllers/batteryController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.route("/")
  .get(getBatteries)
  .post(authorize("admin", "technician"), createBattery);
router.route("/:id")
  .put(authorize("admin", "technician", "operator"), updateBattery)
  .delete(authorize("admin"), deleteBattery);

module.exports = router;
