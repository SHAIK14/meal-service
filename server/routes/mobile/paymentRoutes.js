const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/mobile/paymentController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// All routes require authentication
router.use(protect);

// Get available payment methods
router.get("/methods", paymentController.getPaymentMethods);

// Process payment
router.post("/process", paymentController.processPayment);

// Finalize order after payment
router.post("/finalize", paymentController.finalizeOrder);

module.exports = router;
