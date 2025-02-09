const Plan = require("../../models/admin/Plan");
const WeeklyMenu = require("../../models/admin/WeeklyMenu");
const mongoose = require("mongoose");

exports.createPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      packagePricing: new Map(),
      currency: "SAR", // Set default currency
    };

    const newPlan = new Plan(planData);
    const savedPlan = await newPlan.save();

    const weekMenu = {};
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    days.forEach((day) => {
      weekMenu[day] = {};
      savedPlan.package.forEach((pkg) => {
        weekMenu[day][pkg] = [];
      });
    });

    const newWeeklyMenu = new WeeklyMenu({
      plan: savedPlan._id,
      weekMenu: new Map(Object.entries(weekMenu)),
    });
    await newWeeklyMenu.save();

    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const weeklyMenu = await WeeklyMenu.findOne({ plan: plan._id }).populate(
      "weekMenu.$*.$*"
    );

    const weekMenuObject = Object.fromEntries(weeklyMenu.weekMenu);
    for (let day in weekMenuObject) {
      weekMenuObject[day] = Object.fromEntries(weekMenuObject[day]);
    }

    res.status(200).json({ plan, weekMenu: weekMenuObject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedPlan)
      return res.status(404).json({ message: "Plan not found" });
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const deletedPlan = await Plan.findByIdAndDelete(req.params.id).session(
        session
      );
      if (!deletedPlan) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Plan not found" });
      }

      // Delete associated weekly menu
      await WeeklyMenu.findOneAndDelete({ plan: req.params.id }).session(
        session
      );

      await session.commitTransaction();
      res
        .status(200)
        .json({ message: "Plan and associated data deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWeekMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekMenu, packagePricing } = req.body;

    if (!weekMenu || !packagePricing) {
      return res.status(400).json({
        message:
          "Missing required data: weekMenu and packagePricing are required",
      });
    }

    const validDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const hasInvalidDays = Object.keys(weekMenu).some(
      (day) => !validDays.includes(day.toLowerCase())
    );

    if (hasInvalidDays) {
      return res.status(400).json({
        message:
          "Invalid day in weekMenu. Days must be sunday through saturday",
      });
    }

    // Ensure packagePricing is a simple key-value structure
    const simplifiedPricing = {};
    Object.entries(packagePricing).forEach(([pkg, price]) => {
      // Store direct numeric values
      simplifiedPricing[pkg] = Number(price);
    });

    const updatedWeeklyMenu = await WeeklyMenu.findOneAndUpdate(
      { plan: id },
      { weekMenu: new Map(Object.entries(weekMenu)) },
      { new: true }
    ).populate("weekMenu.$*.$*");

    if (!updatedWeeklyMenu) {
      return res.status(404).json({ message: "Weekly menu not found" });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      {
        // Use simplified pricing structure
        packagePricing: new Map(Object.entries(simplifiedPricing)),
      },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const weekMenuObject = Object.fromEntries(updatedWeeklyMenu.weekMenu);
    for (let day in weekMenuObject) {
      weekMenuObject[day] = Object.fromEntries(weekMenuObject[day]);
    }

    const packagePricingObject = Object.fromEntries(updatedPlan.packagePricing);

    res.status(200).json({
      success: true,
      weekMenu: weekMenuObject,
      packagePricing: packagePricingObject,
      currency: updatedPlan.currency,
    });
  } catch (error) {
    console.error("Error in updateWeekMenu:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update week menu",
    });
  }
};

exports.getWeekMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const weeklyMenu = await WeeklyMenu.findOne({ plan: id }).populate(
      "weekMenu.$*.$*"
    );

    if (!weeklyMenu) {
      return res.status(404).json({ message: "Weekly menu not found" });
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const weekMenuObject = Object.fromEntries(weeklyMenu.weekMenu);
    for (let day in weekMenuObject) {
      weekMenuObject[day] = Object.fromEntries(weekMenuObject[day]);
    }

    const packagePricingObject = plan.packagePricing
      ? Object.fromEntries(plan.packagePricing)
      : {};

    res.status(200).json({
      weekMenu: weekMenuObject,
      packagePricing: packagePricingObject,
      currency: plan.currency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
