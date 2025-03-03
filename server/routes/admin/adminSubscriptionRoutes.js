const express = require("express");
const router = express.Router();
const adminSubscriptionController = require("../../controllers/admin/adminSubscriptionController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Get all subscriptions with filters and pagination
router.get(
  "/",
  adminAuth,
  staffServiceAuth,
  adminSubscriptionController.getAllSubscriptions
);

// Get subscription analytics
router.get(
  "/analytics",
  adminAuth,
  staffServiceAuth,
  adminSubscriptionController.getSubscriptionAnalytics
);

// Get specific subscription details
router.get(
  "/:id",
  adminAuth,
  staffServiceAuth,
  adminSubscriptionController.getSubscriptionById
);

// Update subscription status
router.patch(
  "/:id/status",
  adminAuth,
  staffServiceAuth,
  adminSubscriptionController.updateSubscriptionStatusByAdmin
);

module.exports = router;
