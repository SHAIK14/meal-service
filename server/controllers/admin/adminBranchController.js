const Branch = require("../../models/admin/Branch");

// Create new branch
const createBranch = async (req, res) => {
  try {
    const {
      name,
      crNumber,
      municipalityNumber,
      vatNumber,
      address,
      serviceRadius,
      dynamicAttributes,
    } = req.body;

    const branch = new Branch({
      name,
      crNumber,
      municipalityNumber,
      vatNumber,
      address: {
        country: address.country,
        mainAddress: address.mainAddress,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      serviceRadius,
      dynamicAttributes: dynamicAttributes || [],
    });

    await branch.save();
    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating branch",
      error: error.message,
    });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branches",
      error: error.message,
    });
  }
};

// Get single branch
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branch",
      error: error.message,
    });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.branchId,
      req.body,
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating branch",
      error: error.message,
    });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting branch",
      error: error.message,
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
