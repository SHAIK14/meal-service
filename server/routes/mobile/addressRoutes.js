// routes/mobile/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("../../controllers/mobile/addressController");
const { protect } = require("../../middleware/mobile/mobileAuth");

// All routes are protected
router.get("/", protect, addressController.getAddresses);
router.post("/", protect, addressController.addAddress);
router.put("/:addressId", protect, addressController.updateAddress);
router.delete("/:addressId", protect, addressController.deleteAddress);
router.put("/default/:addressId", protect, addressController.setDefaultAddress);
router.post("/geocode", protect, addressController.geocodeAddress);

module.exports = router;
