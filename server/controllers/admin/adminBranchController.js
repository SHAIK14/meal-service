const Branch = require("../../models/admin/Branch");

// Create new branch (existing)
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
      password,
    } = req.body;

    const branch = new Branch({
      name,
      crNumber,
      municipalityNumber,
      vatNumber,
      address: {
        country: address.country,
        currency: address.currency,
        mainAddress: address.mainAddress,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      serviceRadius,
      password,
      dynamicAttributes: dynamicAttributes || [],
    });

    await branch.save();

    // Remove password from response
    const branchResponse = branch.toObject();
    delete branchResponse.password;

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branchResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating branch",
      error: error.message,
    });
  }
};

// Get all branches (without credentials - for other services)
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find().select("-password");
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

// Get single branch (existing)
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

// Update branch (existing)
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

// Change branch password (new)
const changeBranchPassword = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { newPassword } = req.body;

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    branch.password = newPassword;
    await branch.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Delete branch (existing)
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
  changeBranchPassword,
};
