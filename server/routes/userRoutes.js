const express = require("express");
const router = express.Router();
const {
  updateUserInfo,
  updateUserAddress,
  getUserStatus,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/update-info", protect, updateUserInfo);
router.post("/update-address", protect, updateUserAddress);
router.get("/status", protect, getUserStatus);

module.exports = router;
