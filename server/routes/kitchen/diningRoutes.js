const express = require("express");
const router = express.Router();
const kitchenAuth = require("../../middleware/kitchen/authMiddleware");
const {
  getBranchTables,
} = require("../../controllers/kitchen/diningController");

// Get tables for authenticated branch
router.get("/tables", kitchenAuth, getBranchTables);

module.exports = router;
