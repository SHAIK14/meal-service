// server/routes/admin/itemRoutes.js
const express = require("express");
const router = express.Router();
const itemController = require("../../controllers/admin/itemController");
const adminAuth = require("../../middleware/admin/adminAuth");

// Create a new item
router.post("/", adminAuth, itemController.createItem);

// Get all items
router.get("/", adminAuth, itemController.getAllItems);

// Get a single item by ID
router.get("/:id", adminAuth, itemController.getItem);

// Update an item
router.put("/:id", adminAuth, itemController.updateItem);

// Delete an item
router.delete("/:id", adminAuth, itemController.deleteItem);

// Toggle item availability
router.patch(
  "/:id/toggle-availability",
  adminAuth,
  itemController.toggleItemAvailability
);

module.exports = router;
