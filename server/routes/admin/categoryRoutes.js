const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.get("/", adminAuth, categoryController.getAllCategories);
router.post("/", adminAuth, categoryController.createCategory);
router.delete("/:id", adminAuth, categoryController.deleteCategory);

module.exports = router;
