const TakeAwayConfig = require("../../models/admin/TakeAway");
const Branch = require("../../models/admin/Branch");
const QRCode = require("qrcode");

// Get takeaway config for a branch
const getTakeAwayConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Getting takeaway config for branchId:", branchId);

    const config = await TakeAwayConfig.findOne({ branchId });
    console.log("Found config:", config);

    if (!config) {
      console.log("No config found for branch");
      return res.status(404).json({
        success: false,
        message: "Takeaway configuration not found for this branch",
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error in getTakeAwayConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching takeaway configuration",
      error: error.message,
    });
  }
};

// Create or update takeaway config
const createUpdateTakeAwayConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { baseUrl } = req.body;

    console.log("Creating/Updating takeaway config:", {
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

    const config = await TakeAwayConfig.findOneAndUpdate(
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
      message: "Takeaway configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error in createUpdateTakeAwayConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error updating takeaway configuration",
      error: error.message,
    });
  }
};

// Toggle takeaway status
const toggleTakeAwayStatus = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { isEnabled } = req.body;

    const config = await TakeAwayConfig.findOneAndUpdate(
      { branchId },
      { isEnabled },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Takeaway configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Takeaway status updated successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating takeaway status",
      error: error.message,
    });
  }
};

// Update takeaway URL
const updateTakeAwayUrl = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { baseUrl } = req.body;

    console.log("Updating takeaway URL for branchId:", branchId);

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

    const config = await TakeAwayConfig.findOneAndUpdate(
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
        message: "Takeaway configuration not found",
      });
    }

    console.log("Updated config URL:", config);

    res.status(200).json({
      success: true,
      message: "Takeaway URL updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error in updateTakeAwayUrl:", error);
    res.status(500).json({
      success: false,
      message: "Error updating takeaway URL",
      error: error.message,
    });
  }
};

// Delete takeaway config
const deleteTakeAwayConfig = async (req, res) => {
  try {
    const { branchId } = req.params;

    const result = await TakeAwayConfig.findOneAndDelete({ branchId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Takeaway configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Takeaway configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTakeAwayConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting takeaway configuration",
      error: error.message,
    });
  }
};

module.exports = {
  getTakeAwayConfig,
  createUpdateTakeAwayConfig,
  toggleTakeAwayStatus,
  updateTakeAwayUrl,
  deleteTakeAwayConfig,
};
