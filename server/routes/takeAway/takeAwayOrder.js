// routes/takeaway/takeAwayOrder
const express = require("express");
const router = express.Router();
const {
  validateTakeAwayAccess,
  getTakeAwayMenuItems,
  getMenuItemDetails,
  createTakeAwayOrder,
  getOrderStatus,
} = require("../../controllers/takeAway/takeawayCustomerController");

// Public routes for customer takeaway app

// Validate takeaway access and get branch info
router.get("/access/:pincode", validateTakeAwayAccess);

// Get takeaway menu items for a branch
router.get("/menu/:branchId", getTakeAwayMenuItems);

// Get specific item details
router.get("/item/:branchId/:itemId", getMenuItemDetails);

// Create a new takeaway order
router.post("/order", createTakeAwayOrder);

// Get order status using token
router.get("/order/:token", getOrderStatus);

module.exports = router;
