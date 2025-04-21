// routes/kitchen/mealOrderRoutes.js
const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getPendingMealOrders,
  getAcceptedMealOrders,
  getReadyMealOrders,
  getMealOrdersByDate,
  getStaffMealOrdersByDate,
  getAllMealOrders,
  updateMealOrderStatus,
  getMealOrderById,
  getMealOrderStats,
} = require("../../controllers/kitchen/mealOrderController");

// Admin routes
// Get pending orders that need acceptance
router.get("/orders/pending", kitchenAuth, getPendingMealOrders);

// Get orders ready for pickup/delivery
router.get("/orders/ready", kitchenAuth, getReadyMealOrders);

// Get all orders with optional filters
router.get("/orders", kitchenAuth, getAllMealOrders);

// Update order status
router.put("/orders/:orderId/status", kitchenAuth, updateMealOrderStatus);

// Get orders for a specific date (admin view)
router.get("/orders/date/:date", kitchenAuth, getMealOrdersByDate);

// Staff routes
// Get accepted orders for preparation
router.get("/orders/accepted", kitchenAuth, getAcceptedMealOrders);

// Staff: Get orders for a specific date (only accepted/preparing)
router.get("/staff/orders/date/:date", kitchenAuth, getStaffMealOrdersByDate);

// Common routes
// Get specific order by ID
router.get("/orders/:orderId", kitchenAuth, getMealOrderById);

// Get dashboard statistics
router.get("/stats", kitchenAuth, getMealOrderStats);

module.exports = router;
