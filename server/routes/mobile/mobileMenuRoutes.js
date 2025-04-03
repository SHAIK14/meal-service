const express = require("express");
const router = express.Router();
const menuController = require("../../controllers/mobile/menuController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// Public routes - No authentication required
router.get("/dining-items", menuController.getDiningMenuItems);
router.get("/dining-categories", menuController.getDiningCategories);
router.get("/category/:categoryId", menuController.getItemsByCategory);
router.get("/item/:itemId", menuController.getItemDetails);

module.exports = router;
