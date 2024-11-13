const SubscriptionOrder = require("../models/subscription");
const User = require("../models/User");
const Voucher = require("../models/admin/voucher");

const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan, pricing, voucherDetails, deliveryAddress, paymentDetails } =
      req.body;

    // Generate Order ID
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

    // Create new subscription order
    const subscriptionOrder = new SubscriptionOrder({
      orderId,
      user: req.user._id,
      plan: {
        planId: plan.id,
        name: plan.name,
        durationType: plan.durationType,
        selectedPackages: plan.selectedPackages,
        totalDays: plan.totalDays,
        extraDaysAdded: plan.extraDaysAdded || 0,
        subscriptionDays: plan.subscriptionDays,
        deliveryTime: plan.deliveryTime,
      },
      pricing: {
        dailyRate: pricing.dailyRate,
        totalPrice: pricing.totalPrice,
        voucherDiscount: voucherDetails ? pricing.discount : 0,
        finalAmount: pricing.finalAmount,
      },
      voucher: voucherDetails
        ? {
            _id: voucherDetails._id,
            promoCode: voucherDetails.promoCode,
            discountType: voucherDetails.discountType,
            discountValue: voucherDetails.discountValue,
          }
        : undefined,
      deliveryAddress: {
        type: deliveryAddress.type,
        street: deliveryAddress.street,
        area: deliveryAddress.area,
        coordinates: deliveryAddress.coordinates,
      },
      payment: {
        method: paymentDetails.method,
        status: "completed",
        details:
          paymentDetails.method === "Visa/Mastercard"
            ? {
                cardHolderName: paymentDetails.cardHolderName,
                cardNumber: paymentDetails.cardNumber.slice(-4),
              }
            : {
                stcPhoneNumber: paymentDetails.stcPhoneNumber,
              },
      },
      startDate: new Date(plan.startDate),
      endDate: new Date(plan.endDate),
      status: "active",
    });

    await subscriptionOrder.save();

    // Update user subscription status
    await User.findByIdAndUpdate(req.user._id, {
      $push: { "subscriptions.active": subscriptionOrder._id },
      isSubscribed: true,
      lastSubscriptionDate: new Date(),
    });

    // Update voucher usage if applied
    if (voucherDetails) {
      await Voucher.findByIdAndUpdate(voucherDetails._id, {
        $inc: { usedCount: 1 },
        $push: {
          appliedUsers: req.user._id,
          usedInOrders: {
            orderId: subscriptionOrder._id,
            discountApplied: pricing.discount,
          },
        },
      });
    }

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
    }).populate("plan.planId");

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

const getSubscriptionDetails = async (req, res) => {
  try {
    const subscription = await SubscriptionOrder.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    }).populate("plan.planId");

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

module.exports = {
  createSubscriptionOrder,
  getUserSubscriptions,
  getSubscriptionDetails,
  updateSubscriptionStatus,
};
