const express = require("express");
const router = express.Router();
const {
  getMissions, createMission, updateMission, deleteMission,
} = require("../controllers/missionController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.route("/")
  .get(getMissions)
  .post(authorize("admin", "operator"), createMission);
router.route("/:id")
  .put(authorize("admin", "operator"), updateMission)
  .delete(authorize("admin"), deleteMission);

module.exports = router;
