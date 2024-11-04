// routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTodaySubscriptionMenus,
  getWeeklySubscriptionMenu,
  updateWeeklyMenuCycle,
} = require("../controllers/menuController");

// Get today's menu for all active subscriptions
router.get("/today", protect, getTodaySubscriptionMenus);

// Get weekly menu for a specific subscription
router.get("/weekly/:orderId", protect, getWeeklySubscriptionMenu);

// Update menu cycle for a subscription
router.post("/cycle/:orderId", protect, updateWeeklyMenuCycle);

module.exports = router;
