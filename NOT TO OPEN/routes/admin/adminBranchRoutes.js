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

// Existing routes
router.post("/", adminAuth, createBranch);
router.get("/", adminAuth, getAllBranches);
router.get("/:branchId", adminAuth, getBranchById);
router.put("/:branchId", adminAuth, updateBranch);
router.delete("/:branchId", adminAuth, deleteBranch);

// New routes

router.put("/:branchId/change-password", adminAuth, changeBranchPassword);

module.exports = router;
