const Plan = require("../models/admin/Plan");
const WeeklyMenu = require("../models/admin/WeeklyMenu");
const Item = require("../models/admin/Item");

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().select("-__v");
    res.json({
      success: true,
      count: plans.length,
      data: plans,
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
    res.json({
      success: true,
      data: plan,
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
    const weeklyMenu = await WeeklyMenu.findOne({ plan: req.params.id }).select(
      "-__v"
    );
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: "Weekly menu not found",
      });
    }
    res.json({
      success: true,
      data: weeklyMenu,
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
