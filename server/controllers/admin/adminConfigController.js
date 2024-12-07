const Config = require("../../models/admin/config");
const mongoose = require("mongoose");
const SubscriptionOrder = require("../../models/subscription");
const { format, addDays } = require("date-fns");
const DURATION_DAYS = {
  "1_week": 7,
  "2_week": 14,
  "3_week": 21,
  "1_month": 30,
  "2_month": 60,
  "3_month": 90,
};

// Base Configuration Controllers
const getConfiguration = async (req, res) => {
  try {
    const config = await Config.findOne({ branch: req.branch._id });
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
      { branch: req.branch._id },
      {
        $set: {
          branch: req.branch._id, // Ensure branch is set
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
const updateLocationSettings = async (req, res) => {
  try {
    const { country, currency, coordinates } = req.body;

    let config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
      {
        $set: {
          branch: req.branch._id,
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
// Weekly Holidays Controllers
const updateWeeklyHolidays = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting weekly holidays update:", req.body);
    const holidays = req.body;
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

    // Get old config to compare changes
    const oldConfig = await Config.findOne({ branch: req.branch._id });
    const newHolidays = holidays.filter(
      (day) => !oldConfig?.weeklyHolidays?.includes(day)
    );

    // Update config
    const config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
      {
        $set: {
          branch: req.branch._id,
          weeklyHolidays: holidays,
        },
      },
      { new: true, upsert: true }
    );
    console.log("Config updated with new holidays");

    // 4. If there are new holidays added, handle active subscriptions
    if (newHolidays.length > 0) {
      console.log("Processing new holidays:", newHolidays);
      const activeSubscriptions = await SubscriptionOrder.find({
        status: "active",
        endDate: { $gte: new Date() },
      });
      console.log(`Found ${activeSubscriptions.length} active subscriptions`);

      // 5. Process each subscription
      for (const subscription of activeSubscriptions) {
        console.log(`Processing subscription: ${subscription.orderId}`);

        const affectedDays = subscription.plan.subscriptionDays.filter(
          (day) =>
            newHolidays.includes(format(new Date(day.date), "EEEE")) &&
            day.isAvailable &&
            !day.isSkipped
        );

        console.log(`Found ${affectedDays.length} affected days`);

        // 6. If subscription has affected days, add extension days
        if (affectedDays.length > 0) {
          let lastDate = new Date(subscription.endDate);

          // 7. Update each affected day and add extension
          for (const day of affectedDays) {
            console.log(`Processing day: ${format(day.date, "yyyy-MM-dd")}`);

            // Find next available date
            let extensionDate = addDays(lastDate, 1);
            while (holidays.includes(format(extensionDate, "EEEE"))) {
              extensionDate = addDays(extensionDate, 1);
            }
            console.log(
              `Found extension date: ${format(extensionDate, "yyyy-MM-dd")}`
            );

            try {
              // Step 1: Update the affected day
              await SubscriptionOrder.updateOne(
                {
                  _id: subscription._id,
                  "plan.subscriptionDays._id": day._id,
                },
                {
                  $set: {
                    "plan.subscriptionDays.$.isAvailable": false,
                    "plan.subscriptionDays.$.unavailableReason":
                      "Weekly Holiday",
                  },
                }
              );
              console.log("Updated affected day status");

              // Step 2: Add extension day and update end date
              const updatedSubscription =
                await SubscriptionOrder.findByIdAndUpdate(
                  subscription._id,
                  {
                    $set: { endDate: extensionDate },
                    $push: {
                      "plan.subscriptionDays": {
                        date: extensionDate,
                        isAvailable: true,
                        isExtensionDay: true,
                        originalSkippedDate: day.date,
                      },
                      skipHistory: {
                        originalDate: day.date,
                        extensionDate: extensionDate,
                        reason: "Weekly Holiday",
                        isSystemGenerated: true,
                      },
                    },
                  },
                  { new: true }
                );

              if (!updatedSubscription) {
                throw new Error(
                  `Failed to update subscription ${subscription.orderId}`
                );
              }

              console.log(
                `Successfully extended subscription to ${format(
                  extensionDate,
                  "yyyy-MM-dd"
                )}`
              );
              lastDate = extensionDate;
            } catch (updateError) {
              console.error("Error updating subscription:", updateError);
              throw updateError;
            }
          }
        }
      }
    }

    await session.commitTransaction();
    console.log("Weekly holidays update completed successfully");

    res.json({
      success: true,
      message: "Weekly holidays updated successfully",
      data: config,
      newHolidays,
    });
  } catch (error) {
    console.error("Error in updateWeeklyHolidays:", {
      error: error.message,
      stack: error.stack,
    });

    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: "Failed to update weekly holidays",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
// National Holidays Controllers
const getNationalHolidays = async (req, res) => {
  try {
    const config = await Config.findOne({ branch: req.branch._id });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.nationalHolidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNationalHoliday = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting addNationalHoliday process:", req.body);
    const { date, name } = req.body;

    // Add holiday to config
    const config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
      {
        $push: {
          nationalHolidays: { date, name },
        },
      },
      { new: true, upsert: true }
    );

    // 2. Find active subscriptions that might be affected
    const holidayDate = new Date(date);
    if (isNaN(holidayDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }
    // Prevent past dates
    if (holidayDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot add holidays for past dates",
      });
    }

    console.log("Validated holiday date:", format(holidayDate, "yyyy-MM-dd"));
    const activeSubscriptions = await SubscriptionOrder.find({
      status: "active",
      endDate: { $gte: holidayDate },
    });
    console.log(`Found ${activeSubscriptions.length} active subscriptions`);

    // 3. Process each subscription
    for (const subscription of activeSubscriptions) {
      console.log(`Processing subscription: ${subscription.orderId}`);

      // Find if this subscription has delivery on holiday
      const affectedDay = subscription.plan.subscriptionDays.find(
        (day) =>
          format(new Date(day.date), "yyyy-MM-dd") ===
            format(holidayDate, "yyyy-MM-dd") &&
          day.isAvailable &&
          !day.isSkipped
      );

      if (affectedDay) {
        console.log(
          `Subscription ${subscription.orderId} has delivery on holiday:`,
          affectedDay
        );

        let extensionDate = addDays(new Date(subscription.endDate), 1);

        // Skip weekends and other holidays
        while (
          config.weeklyHolidays.includes(format(extensionDate, "EEEE")) ||
          config.nationalHolidays.some(
            (h) =>
              format(new Date(h.date), "yyyy-MM-dd") ===
              format(extensionDate, "yyyy-MM-dd")
          )
        ) {
          console.log(
            `${format(
              extensionDate,
              "yyyy-MM-dd"
            )} is a holiday, checking next day`
          );
          extensionDate = addDays(extensionDate, 1);
        }

        console.log(
          `Found extension date: ${format(extensionDate, "yyyy-MM-dd")}`
        );

        // Step 1: Update the affected day first
        await SubscriptionOrder.updateOne(
          {
            _id: subscription._id,
            "plan.subscriptionDays._id": affectedDay._id,
          },
          {
            $set: {
              "plan.subscriptionDays.$.isAvailable": false,
              "plan.subscriptionDays.$.unavailableReason": `National Holiday - ${name}`,
            },
          }
        );

        // Step 2: Add extension day and update end date
        const updatedSubscription = await SubscriptionOrder.findByIdAndUpdate(
          subscription._id,
          {
            $set: {
              endDate: extensionDate,
            },
            $push: {
              "plan.subscriptionDays": {
                date: extensionDate,
                isAvailable: true,
                isExtensionDay: true,
                originalSkippedDate: affectedDay.date,
              },
              skipHistory: {
                originalDate: affectedDay.date,
                extensionDate: extensionDate,
                reason: `National Holiday - ${name}`,
                isSystemGenerated: true,
              },
            },
          },
          { new: true }
        );
        console.log(`Updated subscription ${subscription.orderId}:`, {
          originalDate: format(affectedDay.date, "yyyy-MM-dd"),
          extensionDate: format(extensionDate, "yyyy-MM-dd"),
        });

        if (!updatedSubscription) {
          throw new Error(
            `Failed to update subscription ${subscription.orderId}`
          );
        }

        console.log(
          `Successfully updated subscription ${subscription.orderId}`
        );
      } else {
        console.log(
          `No affected delivery found for subscription ${subscription.orderId}`
        );
      }
    }

    await session.commitTransaction();
    console.log("National holiday process completed successfully");

    res.json({
      success: true,
      message: "National holiday added and subscriptions updated",
      data: config.nationalHolidays,
      affectedSubscriptions: activeSubscriptions.length,
    });
  } catch (error) {
    console.error("Error in addNationalHoliday:", {
      error: error.message,
      stack: error.stack,
    });

    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: "Failed to add national holiday",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
const updateNationalHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const { date, name } = req.body;

    const config = await Config.findOneAndUpdate(
      {
        branch: req.branch._id,
        "nationalHolidays._id": holidayId,
      },
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
      { branch: req.branch._id },
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
    const config = await Config.findOne({ branch: req.branch._id });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.emergencyClosures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmergencyClosure = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting emergency closure addition:", req.body);
    const { date, description, compensationDays = 1 } = req.body;

    // Validate date
    const closureDate = new Date(date);
    if (isNaN(closureDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // 1. Add to config
    const config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
      {
        $push: {
          emergencyClosures: {
            date,
            description,
            compensationDays,
          },
        },
      },
      { new: true, upsert: true }
    );
    console.log("Emergency closure added to config");

    // 2. Find affected active subscriptions
    const activeSubscriptions = await SubscriptionOrder.find({
      status: "active",
      endDate: { $gte: closureDate },
    });
    console.log(`Found ${activeSubscriptions.length} active subscriptions`);

    // 3. Process each subscription
    for (const subscription of activeSubscriptions) {
      console.log(`Processing subscription: ${subscription.orderId}`);

      // Find affected delivery day
      const affectedDay = subscription.plan.subscriptionDays.find(
        (day) =>
          format(new Date(day.date), "yyyy-MM-dd") ===
            format(closureDate, "yyyy-MM-dd") &&
          day.isAvailable &&
          !day.isSkipped
      );

      if (affectedDay) {
        console.log(
          `Subscription ${subscription.orderId} affected by closure:`,
          {
            date: format(affectedDay.date, "yyyy-MM-dd"),
          }
        );

        let currentExtensionDate = new Date(subscription.endDate);

        // Calculate extension dates for compensation days
        const extensionDates = [];
        for (let i = 0; i < compensationDays; i++) {
          let extensionDate = addDays(currentExtensionDate, 1);

          // Skip holidays
          while (
            config.weeklyHolidays.includes(format(extensionDate, "EEEE")) ||
            config.nationalHolidays.some(
              (h) =>
                format(new Date(h.date), "yyyy-MM-dd") ===
                format(extensionDate, "yyyy-MM-dd")
            ) ||
            config.emergencyClosures.some(
              (c) =>
                format(new Date(c.date), "yyyy-MM-dd") ===
                format(extensionDate, "yyyy-MM-dd")
            )
          ) {
            console.log(
              `${format(
                extensionDate,
                "yyyy-MM-dd"
              )} is a holiday, checking next day`
            );
            extensionDate = addDays(extensionDate, 1);
          }

          extensionDates.push(extensionDate);
          currentExtensionDate = extensionDate;
        }

        console.log(
          "Extension dates calculated:",
          extensionDates.map((d) => format(d, "yyyy-MM-dd"))
        );

        try {
          // Step 1: Update the affected day
          await SubscriptionOrder.updateOne(
            {
              _id: subscription._id,
              "plan.subscriptionDays._id": affectedDay._id,
            },
            {
              $set: {
                "plan.subscriptionDays.$.isAvailable": false,
                "plan.subscriptionDays.$.unavailableReason": `Emergency Closure - ${description}`,
              },
            }
          );
          console.log("Updated affected day status");

          // Step 2: Add extension days and update end date
          const extensionDaysToAdd = extensionDates.map((extensionDate) => ({
            date: extensionDate,
            isAvailable: true,
            isExtensionDay: true,
            originalSkippedDate: affectedDay.date,
          }));

          const updatedSubscription = await SubscriptionOrder.findByIdAndUpdate(
            subscription._id,
            {
              $set: {
                endDate: currentExtensionDate, // Last extension date
              },
              $push: {
                "plan.subscriptionDays": {
                  $each: extensionDaysToAdd,
                },
                skipHistory: {
                  originalDate: affectedDay.date,
                  extensionDate: currentExtensionDate,
                  reason: `Emergency Closure - ${description}`,
                  isSystemGenerated: true,
                },
              },
            },
            { new: true }
          );

          if (!updatedSubscription) {
            throw new Error(
              `Failed to update subscription ${subscription.orderId}`
            );
          }

          console.log(
            `Successfully extended subscription ${
              subscription.orderId
            } to ${format(currentExtensionDate, "yyyy-MM-dd")}`
          );
        } catch (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }
      } else {
        console.log(
          `No delivery affected for subscription ${subscription.orderId}`
        );
      }
    }

    await session.commitTransaction();
    console.log("Emergency closure process completed successfully");

    res.json({
      success: true,
      message: "Emergency closure added and subscriptions updated",
      data: config.emergencyClosures,
      affectedSubscriptions: activeSubscriptions.length,
      compensationDays,
      closureDate: format(closureDate, "yyyy-MM-dd"),
    });
  } catch (error) {
    console.error("Error in addEmergencyClosure:", {
      error: error.message,
      stack: error.stack,
    });

    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: "Failed to add emergency closure",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const updateEmergencyClosure = async (req, res) => {
  try {
    const { closureId } = req.params;
    const { date, description, compensationDays } = req.body;

    const config = await Config.findOneAndUpdate(
      {
        branch: req.branch._id,
        "emergencyClosures._id": closureId,
      },
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
      { branch: req.branch._id },
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
    const { timeSlots } = req.body;

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
      { branch: req.branch._id },
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
    const config = await Config.findOne({ branch: req.branch._id });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.deliveryTimeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get plan durations
const getPlanDurations = async (req, res) => {
  try {
    const config = await Config.findOne({ branch: req.branch._id });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config.planDurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPlanDuration = async (req, res) => {
  try {
    const { durationType, minDays, skipDays } = req.body;
    console.log("Received plan duration data:", req.body);

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
      branch: req.branch._id,
      "planDurations.durationType": durationType,
    });

    if (existing) {
      return res.status(400).json({
        message: "This duration type already exists",
      });
    }

    const config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
      {
        $push: {
          planDurations: { durationType, minDays, skipDays, isActive: true },
        },
      },
      { new: true, upsert: true }
    );

    res.json(config.planDurations);
  } catch (error) {
    console.error("Error in addPlanDuration:", error);
    res.status(400).json({ message: error.message });
  }
};

const updatePlanDuration = async (req, res) => {
  try {
    const { planId } = req.params;
    const { minDays, skipDays, isActive } = req.body;

    // Get the plan to check duration type
    const config = await Config.findOne({
      branch: req.branch._id,
      "planDurations._id": planId,
    });
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
      {
        branch: req.branch._id,
        "planDurations._id": planId,
      },
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

const deletePlanDuration = async (req, res) => {
  try {
    const { planId } = req.params;
    const config = await Config.findOneAndUpdate(
      { branch: req.branch._id },
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
