const express = require("express");
const router = express.Router();
const {
  validateDiningAccess,
  getDiningMenuItems,
  getMenuItemDetails,
  createDiningOrder,
  addItemsToOrder,
  getBranchOrders,
  updateOrderStatus,
  requestPayment,
  startSession,
  validateSessionAccess,
} = require("../../controllers/menu/diningMenuController");

// Route to validate QR code access
router.get("/validate/:pincode/:tableName", validateDiningAccess);
router.post("/session/validate", validateSessionAccess);
router.post("/session/start", startSession);

// Get all categories with their items for a branch
router.get("/menu/:branchId", getDiningMenuItems);

// Get detailed item information
router.get("/menu/:branchId/items/:itemId", getMenuItemDetails);

// Route to create a dining order
router.post("/dining-orders", createDiningOrder);

// Route to add items to an existing order
router.post("/dining-orders/:orderId/add-items", addItemsToOrder);

// Route to fetch orders for a branch
router.get("/kitchen/orders/:branchId", getBranchOrders);
router.put("/orders/:orderId/status", updateOrderStatus);
// Payment related routes
router.post("/sessions/:sessionId/request-payment", requestPayment);
module.exports = router;
