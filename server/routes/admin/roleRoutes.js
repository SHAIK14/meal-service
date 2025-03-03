const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/admin/roleController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

router.post("/", adminAuth, staffServiceAuth, roleController.createRole);
router.get("/", adminAuth, staffServiceAuth, roleController.getRoles);
router.put("/:id", adminAuth, staffServiceAuth, roleController.updateRole);
router.delete("/:id", adminAuth, staffServiceAuth, roleController.deleteRole);

module.exports = router;
