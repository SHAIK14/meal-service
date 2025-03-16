const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/mobile/orderController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// All routes require authentication
router.use(protect);

// Existing routes for order preparation
router.post("/prepare-pickup", orderController.preparePickupOrder);
router.post("/prepare-delivery", orderController.prepareDeliveryOrder);

// New routes for order tracking
router.get("/history", orderController.getOrderHistory);
router.get("/details/:orderId", orderController.getOrderDetails);
router.get("/latest", orderController.getLatestOrder);
router.get("/status/:orderId", orderController.getOrderStatus);
router.put("/cancel/:orderId", orderController.cancelOrder);

module.exports = router;
