const express = require("express");
const router = express.Router();
const {
  updateUserInfo,
  updateUserAddress,
  getUserStatus,
  getUserAddress,
} = require("../controllers/userController");
const { getBranchServiceInfo } = require("../controllers/userBranchController");
const { protect } = require("../middleware/authMiddleware");

router.post("/update-info", protect, updateUserInfo);
router.post("/update-address", protect, updateUserAddress);
router.get("/status", protect, getUserStatus);
router.get("/address", protect, getUserAddress);
router.get("/branch-service-info", protect, getBranchServiceInfo);
module.exports = router;
