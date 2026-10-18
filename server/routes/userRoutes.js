const express = require("express");
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", getUsers);
router.route("/:id")
  .put(authorize("admin"), updateUser)
  .delete(authorize("admin"), deleteUser);

module.exports = router;
