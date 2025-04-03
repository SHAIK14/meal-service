const express = require("express");
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getAllBranchesWithCredentials,
  getBranchById,
  updateBranch,
  deleteBranch,
  changeBranchPassword,
} = require("../../controllers/admin/adminBranchController");
const adminAuth = require("../../middleware/admin/adminAuth");
const staffServiceAuth = require("../../middleware/admin/staffServiceAuth");

// Existing routes
router.post("/", adminAuth, staffServiceAuth, createBranch);
router.get("/", adminAuth, staffServiceAuth, getAllBranches);
router.get("/:branchId", adminAuth, staffServiceAuth, getBranchById);
router.put("/:branchId", adminAuth, staffServiceAuth, updateBranch);
router.delete("/:branchId", adminAuth, staffServiceAuth, deleteBranch);

// New routes

router.put(
  "/:branchId/change-password",
  adminAuth,
  staffServiceAuth,
  changeBranchPassword
);

module.exports = router;
