// routes/kitchen/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  kitchenLogin,
  getBranchDetails,
} = require("../../controllers/kitchen/authController");
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");

router.post("/login", kitchenLogin);
router.get("/branch-details", kitchenAuth, getBranchDetails);

module.exports = router; // Make sure to export the router
