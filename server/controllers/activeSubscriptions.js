const { format, isAfter } = require("date-fns");

const SubscriptionOrder = require("../models/subscription");
const WeeklyMenu = require("../models/admin/WeeklyMenu");
const Config = require("../models/admin/config");
const Plan = require("../models/admin/Plan");
const Item = require("../models/admin/Item");

const getUserActiveSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();

    // Get active subscriptions with populated plan details
    const subscriptions = await SubscriptionOrder.find({
      user: userId,
      status: "active",
      endDate: { $gte: currentDate },
    })
      .populate({
        path: "plan.planId",
        select: "nameEnglish nameArabic image package packagePricing",
      })
      .sort({ startDate: 1 });

    if (!subscriptions.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const processedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        // Check today's delivery status
        const today = subscription.plan.subscriptionDays.find(
          (day) =>
            format(new Date(day.date), "yyyy-MM-dd") ===
            format(currentDate, "yyyy-MM-dd")
        );

        // Get weekly menu for today
        const weeklyMenu = await WeeklyMenu.findOne({
          plan: subscription.plan.planId,
        });

        const dayName = format(currentDate, "EEEE").toLowerCase();
        const todayMenu = {};

        if (today?.isAvailable && weeklyMenu?.weekMenu) {
          subscription.plan.selectedPackages.forEach((packageType) => {
            const dayMenuItems = weeklyMenu.weekMenu[dayName];
            if (dayMenuItems && dayMenuItems[packageType]) {
              todayMenu[packageType] = dayMenuItems[packageType];
            }
          });
        }

        return {
          orderId: subscription.orderId,
          plan: {
            name: {
              english: subscription.plan.planId.nameEnglish,
              arabic: subscription.plan.planId.nameArabic,
            },
            image: subscription.plan.planId.image,
            selectedPackages: subscription.plan.selectedPackages,
            deliveryTime: subscription.plan.deliveryTime,
          },
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          todayDelivery: today
            ? {
                isAvailable: today.isAvailable,
                reason: today.unavailableReason,
                menu: Object.keys(todayMenu).length > 0 ? todayMenu : null,
              }
            : null,
          pricing: {
            dailyRate: subscription.pricing.dailyRate,
            totalPrice: subscription.pricing.finalAmount,
          },
        };
      })
    );

    res.status(200).json({ success: true, data: processedSubscriptions });
  } catch (error) {
    console.error("Error in getUserActiveSubscriptions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscriptions",
    });
  }
};

const getUpcomingMenus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: userId,
      status: "active",
    }).populate("plan.planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    // Get weekly menu first
    const weeklyMenu = await WeeklyMenu.findOne({
      plan: subscription.plan.planId,
    });

    // First, collect all item IDs that we need to populate
    const itemIds = new Set();
    if (weeklyMenu?.weekMenu) {
      weeklyMenu.weekMenu.forEach((packageMap, dayName) => {
        subscription.plan.selectedPackages.forEach((packageType) => {
          const items = packageMap.get(packageType);
          if (items?.length) {
            items.forEach((itemId) => itemIds.add(itemId.toString()));
          }
        });
      });
    }

    // Fetch all items at once
    const items = await Item.find({
      _id: { $in: Array.from(itemIds) },
    }).select(
      "nameEnglish nameArabic descriptionEnglish descriptionArabic image calories"
    );

    // Create a map of item IDs to populated items for quick lookup
    const itemsMap = {};
    items.forEach((item) => {
      itemsMap[item._id.toString()] = item;
    });

    const upcomingDays = subscription.plan.subscriptionDays.filter((day) =>
      isAfter(new Date(day.date), new Date())
    );

    const processedDays = upcomingDays.map((day) => {
      const dayName = format(new Date(day.date), "EEEE").toLowerCase();
      const dayMenu = {};

      if (day.isAvailable && weeklyMenu?.weekMenu) {
        const dayMenuMap = weeklyMenu.weekMenu.get(dayName);
        if (dayMenuMap) {
          subscription.plan.selectedPackages.forEach((packageType) => {
            const itemIds = dayMenuMap.get(packageType);
            if (itemIds?.length) {
              // Map the IDs to actual populated items
              const populatedItems = itemIds
                .map((id) => itemsMap[id.toString()])
                .filter(Boolean); // Remove any null/undefined items

              if (populatedItems.length > 0) {
                dayMenu[packageType] = populatedItems;
              }
            }
          });
        }
      }

      return {
        date: format(new Date(day.date), "yyyy-MM-dd"),
        dayName: format(new Date(day.date), "EEEE"),
        isAvailable: day.isAvailable,
        unavailableReason: day.unavailableReason,
        menu: Object.keys(dayMenu).length > 0 ? dayMenu : null,
      };
    });

    // Log some debug info
    console.log(`Processing upcoming menus:
      Total upcoming days: ${upcomingDays.length}
      Days with menus: ${processedDays.filter((d) => d.menu).length}
      Total items fetched: ${items.length}
      Total item IDs collected: ${itemIds.size}
    `);

    res.status(200).json({
      success: true,
      data: processedDays,
    });
  } catch (error) {
    console.error("Error in getUpcomingMenus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch upcoming menus",
    });
  }
};

const getCurrentDayMenu = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const currentDate = new Date();
    const dayName = format(currentDate, "EEEE").toLowerCase();

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: userId,
      status: "active",
    }).populate("plan.planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    const today = subscription.plan.subscriptionDays.find(
      (day) =>
        format(new Date(day.date), "yyyy-MM-dd") ===
        format(currentDate, "yyyy-MM-dd")
    );

    // Get weekly menu first
    const weeklyMenu = await WeeklyMenu.findOne({
      plan: subscription.plan.planId,
    });

    const todayMenu = {};

    if (weeklyMenu?.weekMenu) {
      const dayMenuMap = weeklyMenu.weekMenu.get(dayName);
      if (dayMenuMap) {
        for (const packageType of subscription.plan.selectedPackages) {
          const items = dayMenuMap.get(packageType);
          if (items && items.length > 0) {
            // Populate items for this package
            const populatedItems = await Item.find({
              _id: { $in: items },
            }).select(
              "nameEnglish nameArabic descriptionEnglish descriptionArabic image calories"
            );

            todayMenu[packageType] = populatedItems;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        isAvailable: today?.isAvailable ?? false,
        reason: !today?.isAvailable ? today?.unavailableReason : null,
        deliveryTime: subscription.plan.deliveryTime,
        menu: todayMenu,
      },
    });
  } catch (error) {
    console.error("Error in getCurrentDayMenu:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch today's menu",
    });
  }
};

module.exports = {
  getUserActiveSubscriptions,
  getCurrentDayMenu,
  getUpcomingMenus,
};
