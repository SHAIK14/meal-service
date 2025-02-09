const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTodaySubscriptionMenus,
  getWeeklySubscriptionMenu,
  getMenuForDate,
  getSubscriptionDates,
} = require("../controllers/menuController");

router.get("/date", protect, getMenuForDate);
router.get("/dates/:orderId", protect, getSubscriptionDates);
router.get("/today", protect, getTodaySubscriptionMenus);
router.get("/weekly/:orderId", protect, getWeeklySubscriptionMenu);

module.exports = router;
