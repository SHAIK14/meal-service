const express = require("express");
const router = express.Router();
const itemController = require("../../controllers/admin/itemController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post("/", adminAuth, staffServiceAuth, itemController.createItem);
router.post(
  "/bulk-upload",
  adminAuth,
  staffServiceAuth,
  itemController.bulkUploadItems
);

router.get("/", adminAuth, staffServiceAuth, itemController.getAllItems);
router.get("/:id", adminAuth, staffServiceAuth, itemController.getItemById);
router.get(
  "/category/:categoryName",
  adminAuth,
  staffServiceAuth,
  itemController.getItemsByCategory
);
router.put("/:id", adminAuth, staffServiceAuth, itemController.updateItem);
router.delete("/:id", adminAuth, staffServiceAuth, itemController.deleteItem);
router.patch(
  "/:id/toggle-availability",
  adminAuth,
  staffServiceAuth,
  itemController.toggleItemAvailability
);

module.exports = router;
