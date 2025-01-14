const Config = require("../models/admin/config");

const getConfig = async (req, res) => {
  try {
    // Log user details
    console.log("User making request:", {
      userId: req.user._id,
      branchId: req.user.branchId,
    });

    const branchId = req.user.branchId;

    if (!branchId) {
      console.log("No branch ID found for user");
      return res.status(400).json({
        success: false,
        message: "User's branch not found",
      });
    }

    // Log the query we're about to make
    console.log("Searching for config with branch:", branchId);

    const config = await Config.findOne({ branch: branchId });

    // Log what we found
    console.log("Found config:", {
      configId: config?._id,
      configBranch: config?.branch,
      foundDurations: config?.planDurations?.length || 0,
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found for this branch",
      });
    }

    // Log filtered data
    const activePlanDurations = config.planDurations.filter(
      (duration) => duration.isActive
    );
    console.log("Active durations:", activePlanDurations);

    const configResponse = {
      planDurations: activePlanDurations,
      skipMealDays: config.skipMealDays,
      planStartDelay: config.planStartDelay,
      currency: config.currency,
      weeklyHolidays: config.weeklyHolidays,
      deliveryTimeSlots: config.deliveryTimeSlots.filter(
        (slot) => slot.isActive
      ),
      nationalHolidays: config.nationalHolidays,
      emergencyClosures: config.emergencyClosures,
    };

    res.json({
      success: true,
      data: configResponse,
    });
  } catch (error) {
    console.error("Config fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching configuration",
      error: error.message,
    });
  }
};

module.exports = {
  getConfig,
};
