const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/mobile/orderController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// Routes that require authentication
router.post("/prepare-pickup", protect, orderController.preparePickupOrder);
router.post("/prepare-delivery", protect, orderController.prepareDeliveryOrder);

module.exports = router;
