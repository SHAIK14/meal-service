const express = require("express");
const router = express.Router();
const {
  getUserActiveSubscriptions,
  getCurrentDayMenu,
  getUpcomingMenus,
  getSkipDaysAvailability,
  skipSubscriptionDay,
} = require("../controllers/activeSubscriptions");
const { protect } = require("../middleware/authMiddleware");

// Get user's active subscriptions
router.get("/active", protect, getUserActiveSubscriptions);

// Get current day menu for subscription
router.get("/:orderId/today-menu", protect, getCurrentDayMenu);

// Get upcoming menus for subscription
router.get("/:orderId/upcoming", protect, getUpcomingMenus);
router.get("/:orderId/skip-availability", protect, getSkipDaysAvailability);
router.post("/:orderId/skip", protect, skipSubscriptionDay);

module.exports = router;
