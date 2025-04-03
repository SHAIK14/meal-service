// routes/mobile/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/mobile/cartController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// All routes are protected
router.get("/", protect, cartController.getCart);
router.post("/add", protect, cartController.addToCart);
router.put("/update", protect, cartController.updateCartItem);
router.delete("/remove/:itemId", protect, cartController.removeFromCart);
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;
