// routes/kitchen/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/kitchen/orderController");
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");

router.get("/by-time", kitchenAuth, orderController.getKitchenOrders);
router.get("/kot-by-time", kitchenAuth, orderController.getKotByTime);

module.exports = router;
