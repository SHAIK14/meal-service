const express = require("express");
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../../controllers/admin/adminBranchController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.post("/", adminAuth, createBranch);
router.get("/", adminAuth, getAllBranches);
router.get("/:branchId", adminAuth, getBranchById);
router.put("/:branchId", adminAuth, updateBranch);
router.delete("/:branchId", adminAuth, deleteBranch);

module.exports = router;
