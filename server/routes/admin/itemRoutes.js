const express = require("express");
const router = express.Router();
const itemController = require("../../controllers/admin/itemController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, itemController.createItem);
router.get("/", adminAuth, itemController.getAllItems);
router.get("/:id", adminAuth, itemController.getItemById);
router.get(
  "/category/:categoryName",
  adminAuth,
  itemController.getItemsByCategory
);
router.put("/:id", adminAuth, itemController.updateItem);
router.delete("/:id", adminAuth, itemController.deleteItem);
router.patch(
  "/:id/toggle-availability",
  adminAuth,
  itemController.toggleItemAvailability
);

module.exports = router;
