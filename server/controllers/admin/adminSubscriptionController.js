const SubscriptionOrder = require("../../models/subscription");
const User = require("../../models/User");

const getAllSubscriptions = async (req, res) => {
  try {
    // Log incoming request parameters

    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search,
      planType,
      package: selectedPackage,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (planType) {
      filter["plan.mealPlanType"] = planType;
    }

    if (selectedPackage) {
      filter["plan.selectedPackages"] = selectedPackage;
    }

    // Search in user details (will be populated)
    let userFilter = {};
    if (search) {
      userFilter = {
        $or: [
          { "user.name": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
          { orderId: { $regex: search, $options: "i" } },
        ],
      };
    }

    const subscriptions = await SubscriptionOrder.find(filter)
      .populate("user", "name email phone")
      .populate("plan.planId", "nameEnglish nameArabic")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await SubscriptionOrder.countDocuments(filter);

    // Get quick statistics

    const stats = await SubscriptionOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.finalAmount" },
        },
      },
    ]);

    const formattedStats = stats.reduce((acc, curr) => {
      acc[curr._id] = {
        count: curr.count,
        revenue: curr.totalRevenue,
      };
      return acc;
    }, {});

    const response = {
      success: true,
      data: {
        subscriptions,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
        stats: formattedStats,
      },
    };

    console.log("\nSending response with structure:", {
      success: true,
      data: {
        subscriptions: `Array(${subscriptions.length})`,
        pagination: response.data.pagination,
        stats: formattedStats,
      },
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("\n=== Error in getAllSubscriptions ===");
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await SubscriptionOrder.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("plan.planId")
      .populate("menuSchedule")
      .populate("voucher.voucherId");

    console.log("Subscription found:", subscription ? "Yes" : "No");
    if (subscription) {
      console.log(
        "Subscription details:",
        JSON.stringify(subscription, null, 2)
      );
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("\n=== Error in getSubscriptionById ===");
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
      error: error.message,
    });
  }
};

const updateSubscriptionStatusByAdmin = async (req, res) => {
  try {
    console.log("\n=== updateSubscriptionStatusByAdmin Request ===");
    console.log("Subscription ID:", req.params.id);
    console.log("Update data:", req.body);

    const { status, reason } = req.body;
    const subscription = await SubscriptionOrder.findById(req.params.id);

    console.log("Current subscription status:", subscription?.status);
    console.log("Requested status change:", status);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Add validation for status transitions
    const validTransitions = {
      active: ["paused", "cancelled"],
      paused: ["active", "cancelled"],
      cancelled: [], // No transitions allowed from cancelled
    };

    console.log("Checking status transition validity...");
    console.log(
      "Valid transitions from current status:",
      validTransitions[subscription.status]
    );

    if (!validTransitions[subscription.status].includes(status)) {
      console.log("Invalid status transition attempted");
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${subscription.status} to ${status}`,
      });
    }

    subscription.status = status;

    // Handle user's subscription arrays update
    if (status === "cancelled") {
      console.log("Updating user subscription arrays for cancelled status");
      await User.findByIdAndUpdate(subscription.user, {
        $pull: { "subscriptions.active": subscription._id },
        $push: { "subscriptions.history": subscription._id },
      });
    }

    await subscription.save();
    console.log("Subscription updated successfully");

    res.status(200).json({
      success: true,
      message: `Subscription ${status} successfully`,
      data: subscription,
    });
  } catch (error) {
    console.error("\n=== Error in updateSubscriptionStatusByAdmin ===");
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subscription status",
      error: error.message,
    });
  }
};

const getSubscriptionAnalytics = async (req, res) => {
  try {
    console.log("\n=== getSubscriptionAnalytics Request ===");
    console.log("Query Parameters:", req.query);

    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log("Date filter:", dateFilter);

    const analytics = await SubscriptionOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            status: "$status",
            mealPlanType: "$plan.mealPlanType",
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.finalAmount" },
          avgOrderValue: { $avg: "$pricing.finalAmount" },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          planTypes: {
            $push: {
              type: "$_id.mealPlanType",
              count: "$count",
              revenue: "$totalRevenue",
              avgOrderValue: "$avgOrderValue",
            },
          },
          totalCount: { $sum: "$count" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
    ]);

    console.log("\nAnalytics results:", JSON.stringify(analytics, null, 2));

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("\n=== Error in getSubscriptionAnalytics ===");
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatusByAdmin,
  getSubscriptionAnalytics,
};
