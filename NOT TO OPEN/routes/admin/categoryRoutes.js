const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, categoryController.createCategory);
router.get("/", adminAuth, categoryController.getAllCategories);
router.delete("/:id", adminAuth, categoryController.deleteCategory);

module.exports = router;
