// routes/admin/diningCategoryRoutes.js
const express = require("express");
const router = express.Router();
const diningCategoryController = require("../../controllers/admin/diningCategoryController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post(
  "/",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.createDiningCategory
);
router.get(
  "/",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.getAllDiningCategories
);
// Add this new route
router.get(
  "/:id",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.getDiningCategoryById
);
router.post(
  "/:categoryId/items",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.addItemsToCategory
);
router.delete(
  "/:categoryId/items/:itemId",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.removeItemFromCategory
);
router.delete(
  "/:id",
  adminAuth,
  staffServiceAuth,
  diningCategoryController.deleteDiningCategory
);

module.exports = router;
