const Dining = require("../../models/admin/DiningConfig");

exports.getBranchTables = async (req, res) => {
  try {
    const branchId = req.branch._id;
    console.log("Getting tables for branch:", branchId);

    const diningConfig = await Dining.findOne({ branchId });
    console.log("Found dining config:", diningConfig);

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "No dining configuration found for this branch",
      });
    }

    // Filter only enabled tables
    const enabledTables = diningConfig.tables.filter(
      (table) => table.isEnabled
    );
    console.log("Enabled tables:", enabledTables);

    // Format response - now including status
    const formattedTables = enabledTables.map((table) => ({
      id: table._id,
      name: table.name,
      customUrl: table.customUrl,
      qrCode: table.qrCode,
      status: table.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    console.error("Error fetching branch tables:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
      error: error.message,
    });
  }
};

// New function to update table status
exports.updateTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status } = req.body;
    const branchId = req.branch._id;

    // Validate status
    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'available' or 'occupied'",
      });
    }

    // Find and update table status
    const diningConfig = await Dining.findOne({
      branchId,
      "tables._id": tableId,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Update the specific table's status
    const result = await Dining.updateOne(
      {
        branchId,
        "tables._id": tableId,
      },
      {
        $set: { "tables.$.status": status },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update table status",
      });
    }

    res.json({
      success: true,
      message: `Table status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating table status",
      error: error.message,
    });
  }
};
