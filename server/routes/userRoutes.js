const express = require("express");
const router = express.Router();
const {
  updateUserInfo,
  getUserStatus,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/update-info", protect, updateUserInfo);
router.get("/status", protect, getUserStatus);

module.exports = router;
