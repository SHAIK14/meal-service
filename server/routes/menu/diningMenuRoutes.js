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

// Route to get menu items for a branch (will use dummy data for now)
router.get("/branch/:branchId/items", getDiningMenuItems);

// Route to get specific item details (will use dummy data for now)
router.get("/branch/:branchId/items/:itemId", getMenuItemDetails);

// Route to create a dining order
router.post("/dining-orders", createDiningOrder);

module.exports = router;
