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
    const {
      skipMealDays,
      planStartDelay,
      skipAllowances, // Changed to match new schema
    } = req.body;

    let config = await Config.findOneAndUpdate(
      {},
      {
        $set: {
          skipMealDays,
          planStartDelay,
          "skipAllowances.week": skipAllowances.week,
          "skipAllowances.twoWeek": skipAllowances.twoWeek,
          "skipAllowances.month": skipAllowances.month,
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
};
