const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");


router.post("/", adminAuth,staffServiceAuth, categoryController.createCategory);
router.get(
  "/",
  adminAuth,
  staffServiceAuth,
  categoryController.getAllCategories
);
router.delete(
  "/:id",
  adminAuth,
  staffServiceAuth,
  categoryController.deleteCategory
);

module.exports = router;
