const Dining = require("../../models/admin/DiningConfig");

const QRCode = require("qrcode");

// Get dining config for a branch
const getDiningConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Getting dining config for branchId:", branchId);

    const config = await Dining.findOne({ branchId });
    console.log("Found config:", config);

    if (!config) {
      console.log("No config found for branch");
      return res.status(404).json({
        success: false,
        message: "Dining configuration not found for this branch",
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error in getDiningConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dining configuration",
      error: error.message,
    });
  }
};

// Create or update dining config
const createUpdateDiningConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { diningRadius, baseUrl } = req.body;

    console.log("Creating/Updating dining config:", {
      branchId,
      diningRadius,
      baseUrl,
      body: req.body,
    });

    const config = await Dining.findOneAndUpdate(
      { branchId },
      {
        branchId,
        diningRadius,
        baseUrl,
      },
      { new: true, upsert: true }
    );

    console.log("Created/Updated config:", config);

    res.status(200).json({
      success: true,
      message: "Dining configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error in createUpdateDiningConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error updating dining configuration",
      error: error.message,
    });
  }
};

// Add a table
const addTable = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { name } = req.body;

    console.log("Adding table:", {
      branchId,
      tableName: name,
      body: req.body,
    });

    const config = await Dining.findOne({ branchId });
    console.log("Found config for adding table:", config);

    if (!config) {
      console.log("No config found for adding table");
      return res.status(404).json({
        success: false,
        message: "Dining configuration not found",
      });
    }

    const customUrl = `${config.baseUrl}/${name}`;
    console.log("Generated custom URL:", customUrl);

    const qrCode = await QRCode.toDataURL(customUrl);
    console.log("Generated QR code");

    const newTable = {
      name,
      customUrl,
      qrCode,
      isEnabled: true,
    };

    config.tables.push(newTable);
    const savedConfig = await config.save();
    console.log("Saved config with new table:", savedConfig);

    res.status(201).json({
      success: true,
      message: "Table added successfully",
      data: newTable,
    });
  } catch (error) {
    console.error("Error in addTable:", error);
    res.status(500).json({
      success: false,
      message: "Error adding table",
      error: error.message,
    });
  }
};

// Toggle table status
const toggleTableStatus = async (req, res) => {
  try {
    const { branchId, tableId } = req.params;

    const config = await Dining.findOneAndUpdate(
      {
        branchId,
        "tables._id": tableId,
      },
      {
        $set: {
          "tables.$.isEnabled": req.body.isEnabled,
        },
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Table status updated successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating table status",
      error: error.message,
    });
  }
};

// Delete table
const deleteTable = async (req, res) => {
  try {
    const { branchId, tableId } = req.params;

    const config = await Dining.findOneAndUpdate(
      { branchId },
      { $pull: { tables: { _id: tableId } } },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting table",
      error: error.message,
    });
  }
};
// const getAllDiningConfigs = async (req, res) => {
//   try {
//     const { branchId } = req.params;
//     const config = await Dining.findOne({ branchId }).populate(
//       "branchId",
//       "name"
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         diningRadius: config?.diningRadius || "",
//         baseUrl: config?.baseUrl || "",
//         tables: config?.tables || [],
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllDiningConfigs:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching dining configurations",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  getDiningConfig,
  createUpdateDiningConfig,
  addTable,
  toggleTableStatus,
  deleteTable,
  //   getAllDiningConfigs,
};
