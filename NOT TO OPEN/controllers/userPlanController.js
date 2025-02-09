const Plan = require("../models/admin/Plan");
const WeeklyMenu = require("../models/admin/WeeklyMenu");
const Item = require("../models/admin/Item");

exports.getAllPlans = async (req, res) => {
  try {
    // Add query parameters for filtering
    const { service, isVeg, isNonVeg, isIndividual, isMultiple } = req.query;

    // Build filter object
    const filter = {};
    if (service) filter.service = service;
    if (isVeg === "true") filter.isVeg = true;
    if (isNonVeg === "true") filter.isNonVeg = true;
    if (isIndividual === "true") filter.isIndividual = true;
    if (isMultiple === "true") filter.isMultiple = true;

    const plans = await Plan.find(filter).select("-__v");

    // Convert Map to Object for package pricing
    const formattedPlans = plans.map((plan) => ({
      ...plan.toObject(),
      packagePricing: Object.fromEntries(plan.packagePricing || new Map()),
    }));

    res.json({
      success: true,
      count: plans.length,
      data: formattedPlans,
    });
  } catch (error) {
    console.error("Error in getAllPlans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plans",
      error: error.message,
    });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).select("-__v");
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Convert Map to Object for package pricing
    const formattedPlan = {
      ...plan.toObject(),
      packagePricing: Object.fromEntries(plan.packagePricing || new Map()),
    };

    res.json({
      success: true,
      data: formattedPlan,
    });
  } catch (error) {
    console.error("Error in getPlanById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plan",
      error: error.message,
    });
  }
};

exports.getPlanWeeklyMenu = async (req, res) => {
  try {
    // Fetch both plan and weekly menu
    const [plan, weeklyMenu] = await Promise.all([
      Plan.findById(req.params.id),
      WeeklyMenu.findOne({ plan: req.params.id }).populate("weekMenu.$*.$*"),
    ]);

    if (!weeklyMenu || !plan) {
      return res.status(404).json({
        success: false,
        message: "Weekly menu or plan not found",
      });
    }

    // Convert nested Maps to Objects
    const weekMenuObject = Object.fromEntries(weeklyMenu.weekMenu);
    for (let day in weekMenuObject) {
      weekMenuObject[day] = Object.fromEntries(weekMenuObject[day]);
    }

    const packagePricingObject = Object.fromEntries(
      plan.packagePricing || new Map()
    );

    res.json({
      success: true,
      data: {
        weekMenu: weekMenuObject,
        packagePricing: packagePricingObject,
        currency: plan.currency,
        status: weeklyMenu.status,
        weekNumber: weeklyMenu.weekNumber,
        cycleNumber: weeklyMenu.cycleNumber,
      },
    });
  } catch (error) {
    console.error("Error in getPlanWeeklyMenu:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly menu",
      error: error.message,
    });
  }
};

exports.getItemsBatch = async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item IDs provided",
      });
    }

    const items = await Item.find({ _id: { $in: itemIds } }).select("-__v");
    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error in getItemsBatch:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// New helper endpoint to get available plans by service type
exports.getPlansByService = async (req, res) => {
  try {
    const { service } = req.params;
    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service type is required",
      });
    }

    const plans = await Plan.find({
      service,
      // Add any additional filters you might want
      // Example: status: 'active'
    }).select("-__v");

    const formattedPlans = plans.map((plan) => ({
      ...plan.toObject(),
      packagePricing: Object.fromEntries(plan.packagePricing || new Map()),
    }));

    res.json({
      success: true,
      count: plans.length,
      data: formattedPlans,
    });
  } catch (error) {
    console.error("Error in getPlansByService:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plans by service",
      error: error.message,
    });
  }
};
