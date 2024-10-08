const express = require("express");
const router = express.Router();
const itemController = require("../../controllers/admin/itemController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, itemController.createItem);
router.get("/", adminAuth, itemController.getAllItems);
router.get(
  "/category/:categoryName",
  adminAuth,
  itemController.getItemsByCategory
);

module.exports = router;
