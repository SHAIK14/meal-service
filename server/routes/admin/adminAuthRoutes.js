// server/routes/admin/adminAuthRoutes.js
const express = require("express");
const router = express.Router();
const adminAuthController = require("../../controllers/admin/adminAuthController");

router.post("/login", adminAuthController.login);
router.post("/logout", adminAuthController.logout);

module.exports = router;
