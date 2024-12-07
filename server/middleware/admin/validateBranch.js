const Branch = require("../../models/admin/Branch");

const validateBranch = async (req, res, next) => {
  try {
    const branchId = req.params.branchId || req.body.branchId;
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    req.branch = branch;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid branch ID" });
  }
};

module.exports = validateBranch;
