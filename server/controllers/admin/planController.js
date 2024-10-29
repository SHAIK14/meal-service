const Plan = require("../../models/admin/Plan");
const WeeklyMenu = require("../../models/admin/WeeklyMenu");

exports.createPlan = async (req, res) => {
  try {
    const newPlan = new Plan(req.body);
    const savedPlan = await newPlan.save();

    const weekMenu = {};
    for (let i = 1; i <= savedPlan.duration; i++) {
      weekMenu[i] = {};
      savedPlan.package.forEach((pkg) => {
        weekMenu[i][pkg] = [];
      });
    }

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
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan)
      return res.status(404).json({ message: "Plan not found" });

    await WeeklyMenu.findOneAndDelete({ plan: req.params.id });

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWeekMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekMenu, packagePricing, totalPrice } = req.body;

    if (!weekMenu || !packagePricing) {
      return res.status(400).json({
        message:
          "Missing required data: weekMenu and packagePricing are required",
      });
    }

    const updatedWeeklyMenu = await WeeklyMenu.findOneAndUpdate(
      { plan: id },
      { weekMenu: new Map(Object.entries(weekMenu)) },
      { new: true }
    ).populate("weekMenu.$*.$*");

    if (!updatedWeeklyMenu) {
      return res.status(404).json({ message: "Weekly menu not found" });
    }

    const packagePricingMap = new Map();
    for (const [pkg, details] of Object.entries(packagePricing)) {
      packagePricingMap.set(pkg, {
        totalPrice: details.totalPrice,
        discountPercentage: details.discountPercentage,
        finalPrice: details.finalPrice,
        isCouponEligible: details.isCouponEligible,
      });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      {
        packagePricing: packagePricingMap,
        totalPrice,
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
      totalPrice: updatedPlan.totalPrice,
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
      totalPrice: plan.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
