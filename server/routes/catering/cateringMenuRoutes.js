const express = require("express");
const router = express.Router();
const {
  validateCateringAccess,
  getCateringMenuItems,
  getMenuItemDetails,
  createCateringOrder,
  getBranchCateringOrders,
  updateOrderStatus,
} = require("../../controllers/catering/cateringMenuController");

// Route to validate QR code access
router.get("/validate/:pincode", validateCateringAccess);

// Get all catering items categorized for a branch
router.get("/menu/:branchId", getCateringMenuItems);

// Get detailed item information
router.get("/menu/:branchId/items/:itemId", getMenuItemDetails);

// Route to create a catering order
router.post("/catering-orders", createCateringOrder);

// Routes for kitchen dashboard
router.get("/kitchen/orders/:branchId", getBranchCateringOrders);
router.put("/orders/:orderId/status", updateOrderStatus);

module.exports = router;
