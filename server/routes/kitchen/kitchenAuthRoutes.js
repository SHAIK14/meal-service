const express = require("express");
const router = express.Router();
const kitchenAuthController = require("../../controllers/kitchen/kitchenAuthController");

router.post("/login", kitchenAuthController.login);

module.exports = router;
