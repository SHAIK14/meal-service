const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getPendingOrders,
  getAcceptedOrders,
  getOrdersByDate,
  updateOrderStatus,
  generateKOT,
  getAllOrders,
  getOrderById,
} = require("../../controllers/kitchen/takeawayKitchenController");

// Get pending orders that need acceptance
router.get("/orders/pending", kitchenAuth, getPendingOrders);

// Get accepted orders ready for preparation/KOT generation
router.get("/orders/accepted", kitchenAuth, getAcceptedOrders);

// Get orders for a specific date
router.get("/orders/date/:date", kitchenAuth, getOrdersByDate);

// Get specific order by ID
router.get("/orders/:orderId", kitchenAuth, getOrderById);

// Update order status (accept, decline, etc.)
router.put("/orders/:orderId/status", kitchenAuth, updateOrderStatus);

// Generate KOT for an order
router.post("/orders/:orderId/kot", kitchenAuth, generateKOT);

// Get all orders (with optional filters)
router.get("/orders", kitchenAuth, getAllOrders);

module.exports = router;
