const express = require("express");
const router = express.Router();
const {
  createSubscriptionOrder,
  getUserSubscriptions,
  getSubscriptionHistory,
  getSubscriptionDetails,
  updateSubscriptionStatus,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

// Create new subscription
router.post("/create", protect, createSubscriptionOrder);

// Get user's active subscriptions
router.get("/active", protect, getUserSubscriptions);

// Get user's subscription history
router.get("/history", protect, getSubscriptionHistory);

// Get specific subscription details
router.get("/:orderId", protect, getSubscriptionDetails);

// Update subscription status (cancel/pause)
router.put("/:orderId/status", protect, updateSubscriptionStatus);

module.exports = router;
