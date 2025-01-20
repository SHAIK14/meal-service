const Dining = require("../../models/admin/DiningConfig");

exports.getBranchTables = async (req, res) => {
  try {
    const branchId = req.branch._id;
    console.log("Getting tables for branch:", branchId);

    // Find dining config for this branch
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

    // Format response
    const formattedTables = enabledTables.map((table) => ({
      id: table._id,
      name: table.name,
      customUrl: table.customUrl,
      qrCode: table.qrCode,
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
