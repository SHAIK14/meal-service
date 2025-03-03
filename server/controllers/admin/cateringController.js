const CateringConfig = require("../../models/admin/CateringConfig");
const Branch = require("../../models/admin/Branch");
const QRCode = require("qrcode");

// Get catering config for a branch
const getCateringConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Getting catering config for branchId:", branchId);

    const config = await CateringConfig.findOne({ branchId });
    console.log("Found config:", config);

    if (!config) {
      console.log("No config found for branch");
      return res.status(404).json({
        success: false,
        message: "Catering configuration not found for this branch",
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error in getCateringConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching catering configuration",
      error: error.message,
    });
  }
};

// Create or update catering config
const createUpdateCateringConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { baseUrl } = req.body;

    console.log("Creating/Updating catering config:", {
      branchId,
      baseUrl,
      body: req.body,
    });

    // Get branch details to get pincode
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const pincode = branch.address.pincode;
    // Modify URL to include pincode
    const customUrl = `${baseUrl}/${pincode}`;
    console.log("Generated custom URL:", customUrl);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(customUrl);

    const config = await CateringConfig.findOneAndUpdate(
      { branchId },
      {
        branchId,
        baseUrl,
        customUrl,
        qrCode,
        isEnabled: true,
      },
      { new: true, upsert: true }
    );

    console.log("Created/Updated config:", config);

    res.status(200).json({
      success: true,
      message: "Catering configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error in createUpdateCateringConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error updating catering configuration",
      error: error.message,
    });
  }
};

// Toggle catering status
const toggleCateringStatus = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { isEnabled } = req.body;

    const config = await CateringConfig.findOneAndUpdate(
      { branchId },
      { isEnabled },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Catering configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Catering status updated successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating catering status",
      error: error.message,
    });
  }
};

// Update catering URL
const updateCateringUrl = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { baseUrl } = req.body;

    console.log("Updating catering URL for branchId:", branchId);

    // Get branch details to get pincode
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const pincode = branch.address.pincode;
    // Modify URL to include pincode
    const customUrl = `${baseUrl}/${pincode}`;
    console.log("Generated new custom URL:", customUrl);

    // Generate new QR code
    const qrCode = await QRCode.toDataURL(customUrl);

    const config = await CateringConfig.findOneAndUpdate(
      { branchId },
      {
        baseUrl,
        customUrl,
        qrCode,
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Catering configuration not found",
      });
    }

    console.log("Updated config URL:", config);

    res.status(200).json({
      success: true,
      message: "Catering URL updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error in updateCateringUrl:", error);
    res.status(500).json({
      success: false,
      message: "Error updating catering URL",
      error: error.message,
    });
  }
};

// Delete catering config
const deleteCateringConfig = async (req, res) => {
  try {
    const { branchId } = req.params;

    const result = await CateringConfig.findOneAndDelete({ branchId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Catering configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Catering configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCateringConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting catering configuration",
      error: error.message,
    });
  }
};

module.exports = {
  getCateringConfig,
  createUpdateCateringConfig,
  toggleCateringStatus,
  updateCateringUrl,
  deleteCateringConfig,
};
