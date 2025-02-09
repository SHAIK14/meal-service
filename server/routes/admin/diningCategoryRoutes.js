// routes/admin/diningCategoryRoutes.js
const express = require("express");
const router = express.Router();
const diningCategoryController = require("../../controllers/admin/diningCategoryController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, diningCategoryController.createDiningCategory);
router.get("/", adminAuth, diningCategoryController.getAllDiningCategories);
// Add this new route
router.get("/:id", adminAuth, diningCategoryController.getDiningCategoryById);
router.post(
  "/:categoryId/items",
  adminAuth,
  diningCategoryController.addItemsToCategory
);
router.delete(
  "/:categoryId/items/:itemId",
  adminAuth,
  diningCategoryController.removeItemFromCategory
);
router.delete("/:id", adminAuth, diningCategoryController.deleteDiningCategory);

module.exports = router;
