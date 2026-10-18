const express = require("express");
const router = express.Router();
const {
  getDrones, getDrone, createDrone, updateDrone, deleteDrone,
} = require("../controllers/droneController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.route("/")
  .get(getDrones)
  .post(authorize("admin"), createDrone);
router.route("/:id")
  .get(getDrone)
  .put(authorize("admin", "technician"), updateDrone)
  .delete(authorize("admin"), deleteDrone);

module.exports = router;
