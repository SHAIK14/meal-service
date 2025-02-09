const express = require("express");
const router = express.Router();
const adminSubscriptionController = require("../../controllers/admin/adminSubscriptionController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Get all subscriptions with filters and pagination
router.get("/", adminAuth, adminSubscriptionController.getAllSubscriptions);

// Get subscription analytics
router.get(
  "/analytics",
  adminAuth,
  adminSubscriptionController.getSubscriptionAnalytics
);

// Get specific subscription details
router.get("/:id", adminAuth, adminSubscriptionController.getSubscriptionById);

// Update subscription status
router.patch(
  "/:id/status",
  adminAuth,
  adminSubscriptionController.updateSubscriptionStatusByAdmin
);

module.exports = router;
