const SubscriptionOrder = require("../models/subscription");
const User = require("../models/User");
const Voucher = require("../models/admin/voucher");
const WeeklyMenu = require("../models/admin/WeeklyMenu");

const createSubscriptionOrder = async (req, res) => {
  try {
    const {
      planDetails,
      selectedPackages,
      duration,
      pricing,
      voucherDetails,
      deliveryAddress,
      paymentDetails,
    } = req.body;

    // Generate orderId
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const lastOrder = await SubscriptionOrder.findOne(
      {},
      {},
      { sort: { orderId: -1 } }
    );

    let sequence = "001";
    if (lastOrder && lastOrder.orderId) {
      const lastSequence = parseInt(lastOrder.orderId.slice(-3));
      sequence = (lastSequence + 1).toString().padStart(3, "0");
    }

    const orderId = `SUB${year}${month}${day}${sequence}`;

    // Create subscription order
    const subscriptionOrder = new SubscriptionOrder({
      orderId,
      user: req.user._id,
      plan: {
        planId: planDetails.planId,
        name: planDetails.name,
        duration: planDetails.duration,
        selectedDuration: duration,
        selectedPackages: selectedPackages,
        mealPlanType:
          selectedPackages.length === 1
            ? "One Meal"
            : selectedPackages.length === 2
            ? "Combo Meal"
            : "Full Day Meal",
      },
      pricing: {
        originalPrice: pricing.original,
        packageDiscounts: pricing.savings,
        voucherDiscount: pricing.original - pricing.final,
        finalAmount: pricing.final,
      },
      voucher: voucherDetails
        ? {
            code: voucherDetails.promoCode,
            discountType: voucherDetails.discountType,
            discountValue: voucherDetails.discountValue,
          }
        : undefined,
      deliveryAddress,
      payment: {
        transactionId: `TXN${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 5)}`.toUpperCase(),
        method: paymentDetails.method,
        status: "completed",
        details: {
          stcPhoneNumber: paymentDetails.stcPhoneNumber,
        },
      },
      startDate: new Date(),
      endDate: calculateEndDate(new Date(), duration),
    });

    await subscriptionOrder.save();

    // Update user subscription status
    await User.findByIdAndUpdate(req.user._id, {
      $push: { "subscriptions.active": subscriptionOrder._id },
      isSubscribed: true,
      lastSubscriptionDate: new Date(),
    });

    // Update voucher if used
    if (voucherDetails) {
      await Voucher.findOneAndUpdate(
        { promoCode: voucherDetails.promoCode },
        {
          $inc: { usedCount: 1 },
          $push: {
            appliedUsers: req.user._id,
            usedInOrders: {
              orderId: subscriptionOrder._id,
              discountApplied: pricing.original - pricing.final,
            },
          },
        }
      );
    }

    // Create initial weekly menu
    const weeklyMenu = new WeeklyMenu({
      plan: planDetails.planId,
      subscriptionOrder: subscriptionOrder._id,
      status: "active",
      weekNumber: 1,
      cycleNumber: 1,
      weekMenu: new Map(),
    });

    await weeklyMenu.save();

    // Update subscription with menu reference
    subscriptionOrder.menuSchedule = weeklyMenu._id;
    await subscriptionOrder.save();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscriptionOrder,
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

const getUserSubscriptions = async (req, res) => {
  try {
    const activeSubscriptions = await SubscriptionOrder.find({
      user: req.user._id,
      status: "active",
    })
      .populate("plan.planId")
      .populate("menuSchedule");

    res.status(200).json({
      success: true,
      data: activeSubscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

const getSubscriptionHistory = async (req, res) => {
  try {
    const history = await SubscriptionOrder.find({
      user: req.user._id,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription history",
      error: error.message,
    });
  }
};

const getSubscriptionDetails = async (req, res) => {
  try {
    const subscription = await SubscriptionOrder.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    })
      .populate("plan.planId")
      .populate("menuSchedule")
      .populate("voucher.voucherId");

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
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
      error: error.message,
    });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = status;
    await subscription.save();

    // Update user's active subscriptions if cancelled
    if (status === "cancelled") {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { "subscriptions.active": subscription._id },
        $push: { "subscriptions.history": subscription._id },
      });
    }

    res.status(200).json({
      success: true,
      message: `Subscription ${status} successfully`,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update subscription status",
      error: error.message,
    });
  }
};

// Helper function for calculating end date
const calculateEndDate = (startDate, duration) => {
  const durationDays =
    {
      "1 Week": 7,
      "2 Weeks": 14,
      "1 Month": 30,
    }[duration] || 7;

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

module.exports = {
  createSubscriptionOrder,
  getUserSubscriptions,
  getSubscriptionHistory,
  getSubscriptionDetails,
  updateSubscriptionStatus,
};
