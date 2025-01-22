const express = require("express");
const router = express.Router();
const {
  validateDiningAccess,
  getDiningMenuItems,
  getMenuItemDetails,
  createDiningOrder,
} = require("../../controllers/menu/diningMenuController");

// Route to validate QR code access
router.get("/validate/:pincode/:tableName", validateDiningAccess);

// Get all categories with their items for a branch
router.get("/menu/:branchId", getDiningMenuItems);

// Get detailed item information
router.get("/menu/:branchId/items/:itemId", getMenuItemDetails);

// Route to create a dining order
router.post("/dining-orders", createDiningOrder);

module.exports = router;
