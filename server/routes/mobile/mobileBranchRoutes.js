const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/mobile/branchController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// Routes that require authentication
router.post("/nearby", protect, branchController.getNearbyBranches);
router.post(
  "/check-delivery",
  protect,
  branchController.checkDeliveryAvailability
);

module.exports = router;
