const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getPendingOrders,
  getOrdersByDate,
  getUpcomingOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderCountsByDate,
  getOrderById,
} = require("../../controllers/kitchen/cateringKitchenController");

// Get pending orders that need acceptance
router.get("/orders/pending", kitchenAuth, getPendingOrders);

// Get orders for a specific date
router.get("/orders/date/:date", kitchenAuth, getOrdersByDate);

// Get upcoming accepted orders
router.get("/orders/upcoming", kitchenAuth, getUpcomingOrders);

// Get order counts by date (for calendar)
router.get("/orders/counts/:year/:month", kitchenAuth, getOrderCountsByDate);

// Get specific order by ID
router.get("/orders/:orderId", kitchenAuth, getOrderById);

// Update order status
router.put("/orders/:orderId/status", kitchenAuth, updateOrderStatus);

// Get all orders (with optional filters)
router.get("/orders", kitchenAuth, getAllOrders);

module.exports = router;
