const Config = require("../../models/admin/config");

// Base Configuration Controllers
const getConfiguration = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBasicConfig = async (req, res) => {
  try {
    const { skipMealDays, planStartDelay } = req.body;

    let config = await Config.findOneAndUpdate(
      {},
      {
        $set: {
          skipMealDays,
          planStartDelay,
        },
      },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Location Settings Controllers
const updateLocationSettings = async (req, res) => {
  try {
    const { country, currency, coordinates } = req.body;

    let config = await Config.findOneAndUpdate(
      {},
      {
        $set: {
          country,
          currency,
          coordinates,
        },
      },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Weekly Holidays Controllers
const updateWeeklyHolidays = async (req, res) => {
  try {
    const holidays = req.body; // Expecting array of strings ["Friday", "Sunday"]

    // Validate that all days are valid
    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const isValid = holidays.every((day) => validDays.includes(day));
    if (!isValid) {
      return res.status(400).json({ message: "Invalid day provided" });
    }

    let config = await Config.findOneAndUpdate(
      {},
      { $set: { weeklyHolidays: holidays } },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// National Holidays Controllers
const getNationalHolidays = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.nationalHolidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNationalHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;

    const config = await Config.findOneAndUpdate(
      {},
      {
        $push: {
          nationalHolidays: { date, name },
        },
      },
      { new: true, upsert: true }
    );

    res.json(config.nationalHolidays);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNationalHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const { date, name } = req.body;

    const config = await Config.findOneAndUpdate(
      { "nationalHolidays._id": holidayId },
      {
        $set: {
          "nationalHolidays.$.date": date,
          "nationalHolidays.$.name": name,
        },
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json(config.nationalHolidays);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteNationalHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    const config = await Config.findOneAndUpdate(
      {},
      {
        $pull: {
          nationalHolidays: { _id: holidayId },
        },
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    res.json(config.nationalHolidays);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Emergency Closures Controllers
const getEmergencyClosures = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.emergencyClosures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmergencyClosure = async (req, res) => {
  try {
    const { date, description, compensationDays } = req.body;

    const config = await Config.findOneAndUpdate(
      {},
      {
        $push: {
          emergencyClosures: {
            date,
            description,
            compensationDays: compensationDays || 1,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.json(config.emergencyClosures);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmergencyClosure = async (req, res) => {
  try {
    const { closureId } = req.params;
    const { date, description, compensationDays } = req.body;

    const config = await Config.findOneAndUpdate(
      { "emergencyClosures._id": closureId },
      {
        $set: {
          "emergencyClosures.$.date": date,
          "emergencyClosures.$.description": description,
          "emergencyClosures.$.compensationDays": compensationDays,
        },
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ message: "Closure not found" });
    }

    res.json(config.emergencyClosures);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmergencyClosure = async (req, res) => {
  try {
    const { closureId } = req.params;

    const config = await Config.findOneAndUpdate(
      {},
      {
        $pull: {
          emergencyClosures: { _id: closureId },
        },
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    res.json(config.emergencyClosures);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delivery Time Slots Controllers
const updateDeliveryTimeSlots = async (req, res) => {
  try {
    const { timeSlots } = req.body; // Array of { fromTime, toTime, isActive }

    // Basic validation of time format
    const isValidTimeFormat = timeSlots.every((slot) => {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
      return timeRegex.test(slot.fromTime) && timeRegex.test(slot.toTime);
    });

    if (!isValidTimeFormat) {
      return res.status(400).json({
        message: "Invalid time format. Use 'HH:mm AM/PM' format",
      });
    }

    const config = await Config.findOneAndUpdate(
      {},
      { $set: { deliveryTimeSlots: timeSlots } },
      { new: true, upsert: true }
    );

    res.json(config.deliveryTimeSlots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDeliveryTimeSlots = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.deliveryTimeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Duration days mapping
const DURATION_DAYS = {
  "1_week": 7,
  "2_week": 14,
  "3_week": 21,
  "1_month": 30,
  "2_month": 60,
  "3_month": 90,
};

// Get plan durations
const getPlanDurations = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.planDurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add plan duration
// Modify addPlanDuration
const addPlanDuration = async (req, res) => {
  try {
    const { durationType, minDays, skipDays } = req.body; // Add skipDays to destructuring

    // Check max days for the duration type
    const maxDays = DURATION_DAYS[durationType];
    if (minDays > maxDays) {
      return res.status(400).json({
        message: `Minimum days cannot exceed ${maxDays} days for ${durationType}`,
      });
    }

    // Validate skipDays
    if (skipDays > maxDays) {
      return res.status(400).json({
        message: `Skip days cannot exceed ${maxDays} days for ${durationType}`,
      });
    }

    // Check if already exists
    const existing = await Config.findOne({
      "planDurations.durationType": durationType,
    });

    if (existing) {
      return res.status(400).json({
        message: "This duration type already exists",
      });
    }

    const config = await Config.findOneAndUpdate(
      {},
      {
        $push: {
          planDurations: { durationType, minDays, skipDays, isActive: true },
        },
      },
      { new: true, upsert: true }
    );

    res.json(config.planDurations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modify updatePlanDuration
const updatePlanDuration = async (req, res) => {
  try {
    const { planId } = req.params;
    const { minDays, skipDays, isActive } = req.body; // Add skipDays to destructuring

    // Get the plan to check duration type
    const config = await Config.findOne({ "planDurations._id": planId });
    if (!config) {
      return res.status(404).json({ message: "Plan duration not found" });
    }

    const plan = config.planDurations.find((p) => p._id.toString() === planId);
    const maxDays = DURATION_DAYS[plan.durationType];

    if (minDays > maxDays) {
      return res.status(400).json({
        message: `Minimum days cannot exceed ${maxDays} days for ${plan.durationType}`,
      });
    }

    if (skipDays > maxDays) {
      return res.status(400).json({
        message: `Skip days cannot exceed ${maxDays} days for ${plan.durationType}`,
      });
    }

    const updatedConfig = await Config.findOneAndUpdate(
      { "planDurations._id": planId },
      {
        $set: {
          "planDurations.$.minDays": minDays,
          "planDurations.$.skipDays": skipDays,
          "planDurations.$.isActive": isActive,
        },
      },
      { new: true }
    );

    res.json(updatedConfig.planDurations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delete plan duration
const deletePlanDuration = async (req, res) => {
  try {
    const { planId } = req.params;
    const config = await Config.findOneAndUpdate(
      {},
      { $pull: { planDurations: { _id: planId } } },
      { new: true }
    );

    res.json(config.planDurations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  // Base Configuration
  getConfiguration,
  updateBasicConfig,

  // Location Settings
  updateLocationSettings,

  // Weekly Holidays
  updateWeeklyHolidays,

  // National Holidays
  getNationalHolidays,
  addNationalHoliday,
  updateNationalHoliday,
  deleteNationalHoliday,

  // Emergency Closures
  getEmergencyClosures,
  addEmergencyClosure,
  updateEmergencyClosure,
  deleteEmergencyClosure,

  // Delivery Time Slots
  getDeliveryTimeSlots,
  updateDeliveryTimeSlots,
  //plan duaration
  getPlanDurations,
  addPlanDuration,
  updatePlanDuration,
  deletePlanDuration,
};
