const express = require("express");
const router = express.Router();
const authController = require("../../controllers/mobile/authController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// Public routes
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);

// Protected routes (require authentication)
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);

module.exports = router;
