const Config = require("../models/admin/config");

const getConfig = async (req, res) => {
  try {
    const config = await Config.findOne().sort({ createdAt: -1 });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    // Filter active plan durations
    const activePlanDurations = config.planDurations.filter(
      (duration) => duration.isActive
    );

    // Modified response to include all needed fields
    const configResponse = {
      planDurations: activePlanDurations,
      skipMealDays: config.skipMealDays,
      planStartDelay: config.planStartDelay,
      currency: config.currency,
      weeklyHolidays: config.weeklyHolidays,
      // Added new fields
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
