const SubscriptionOrder = require("../models/subscription");
const WeeklyMenu = require("../models/admin/WeeklyMenu");
const Plan = require("../models/admin/Plan");
const Item = require("../models/admin/Item");

// Helper function to determine day number for any date
const getDayNumberForDate = (startDate, targetDate) => {
  const start = new Date(startDate);
  const target = new Date(targetDate);

  // Get days since subscription started
  const daysSinceStart = Math.floor((target - start) / (1000 * 60 * 60 * 24));

  // Add 1 because days are 1-based in the database
  const dayNumber = (daysSinceStart % 7) + 1;

  // Ensure day number is between 1 and 7
  return dayNumber > 7 ? dayNumber % 7 : dayNumber;
};

// Helper function to check if it's a delivery day
const isDeliveryDay = (planDuration, currentDayNumber) => {
  switch (planDuration) {
    case 5: // 5 days/week - Friday(6) and Saturday(7) off
      return currentDayNumber < 6;
    case 6: // 6 days/week - Friday(6) off
      return currentDayNumber !== 6;
    case 7: // 7 days/week - no off days
      return true;
    default:
      return false;
  }
};

// Get today's menu for all active subscriptions
const getTodaySubscriptionMenus = async (req, res) => {
  try {
    // 1. Get active subscriptions
    const activeSubscriptions = await SubscriptionOrder.find({
      user: req.user._id,
      status: "active",
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).populate("plan.planId");

    // 2. Get weekly menus for all active subscriptions
    const weeklyMenus = await WeeklyMenu.find({
      plan: {
        $in: activeSubscriptions.map((sub) => sub.plan.planId._id),
      },
    });

    const todayMenus = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const currentDayNumber = getDayNumberForDate(
          subscription.startDate,
          new Date()
        );
        const weeklyMenu = weeklyMenus.find(
          (menu) =>
            menu.plan.toString() === subscription.plan.planId._id.toString()
        );

        const menuItems = {};

        if (weeklyMenu?.weekMenu && weeklyMenu.weekMenu instanceof Map) {
          const dayMenu = weeklyMenu.weekMenu.get(currentDayNumber.toString());

          if (dayMenu && dayMenu instanceof Map) {
            for (const packageType of subscription.plan.selectedPackages) {
              const packageItems = dayMenu.get(packageType);

              if (packageItems && Array.isArray(packageItems)) {
                const items = await Item.find({
                  _id: { $in: packageItems },
                });

                menuItems[packageType] = items.map((item) => ({
                  nameEnglish: item.nameEnglish,
                  nameArabic: item.nameArabic,
                  calories: item.calories,
                  protein: item.protein,
                  carbs: item.carbs,
                  fat: item.fat,
                }));
              }
            }
          }
        }

        return {
          subscriptionId: subscription.orderId,
          planName: subscription.plan.planId.nameEnglish,
          dayNumber: currentDayNumber,
          packages: subscription.plan.selectedPackages,
          menuItems,
          isDeliveryDay: isDeliveryDay(
            subscription.plan.duration,
            currentDayNumber
          ),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: todayMenus,
    });
  } catch (error) {
    console.error("Error in getTodaySubscriptionMenus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's menus",
      error: error.message,
    });
  }
};

// Get menu for a specific date
const getMenuForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // 1. Get active subscriptions
    const activeSubscriptions = await SubscriptionOrder.find({
      user: req.user._id,
      status: "active",
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    }).populate("plan.planId");

    // 2. Get weekly menus for all active subscriptions
    const weeklyMenus = await WeeklyMenu.find({
      plan: {
        $in: activeSubscriptions.map((sub) => sub.plan.planId._id),
      },
    });

    const menus = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const dayNumber = getDayNumberForDate(
          subscription.startDate,
          targetDate
        );
        const weeklyMenu = weeklyMenus.find(
          (menu) =>
            menu.plan.toString() === subscription.plan.planId._id.toString()
        );

        const menuItems = {};

        if (weeklyMenu?.weekMenu && weeklyMenu.weekMenu instanceof Map) {
          const dayMenu = weeklyMenu.weekMenu.get(dayNumber.toString());

          if (dayMenu && dayMenu instanceof Map) {
            for (const packageType of subscription.plan.selectedPackages) {
              const packageItems = dayMenu.get(packageType);

              if (packageItems && Array.isArray(packageItems)) {
                const items = await Item.find({
                  _id: { $in: packageItems },
                });

                menuItems[packageType] = items.map((item) => ({
                  nameEnglish: item.nameEnglish,
                  nameArabic: item.nameArabic,
                  calories: item.calories,
                  protein: item.protein,
                  carbs: item.carbs,
                  fat: item.fat,
                }));
              }
            }
          }
        }

        return {
          subscriptionId: subscription.orderId,
          planName: subscription.plan.planId.nameEnglish,
          dayNumber,
          packages: subscription.plan.selectedPackages,
          menuItems,
          isDeliveryDay: isDeliveryDay(subscription.plan.duration, dayNumber),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.error("Error in getMenuForDate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menus",
      error: error.message,
    });
  }
};

// Get subscription dates and delivery status
const getSubscriptionDates = async (req, res) => {
  try {
    const { orderId } = req.params;

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: req.user._id,
      status: "active",
    }).populate("plan.planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not active",
      });
    }

    // Calculate all available dates in subscription period
    const dates = [];
    let currentDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);

    while (currentDate <= endDate) {
      const dayNumber = getDayNumberForDate(
        subscription.startDate,
        currentDate
      );

      dates.push({
        date: new Date(currentDate),
        dayNumber,
        isDeliveryDay: isDeliveryDay(subscription.plan.duration, dayNumber),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.orderId,
        planName: subscription.plan.planId.nameEnglish,
        planDuration: subscription.plan.duration,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        selectedPackages: subscription.plan.selectedPackages,
        dates,
      },
    });
  } catch (error) {
    console.error("Error in getSubscriptionDates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription dates",
      error: error.message,
    });
  }
};

// Get weekly menu for a specific subscription
const getWeeklySubscriptionMenu = async (req, res) => {
  try {
    const { orderId } = req.params;

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: req.user._id,
      status: "active",
    })
      .populate("plan.planId")
      .populate({
        path: "menuSchedule",
        populate: {
          path: "weekMenu",
          populate: {
            path: "items",
          },
        },
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not active",
      });
    }

    const weeklyMenu = await WeeklyMenu.findById(
      subscription.menuSchedule
    ).populate({
      path: "weekMenu",
      populate: {
        path: "items",
      },
    });

    // Format menu by days and packages
    const formattedMenu = {};
    for (let day = 1; day <= subscription.plan.planId.duration; day++) {
      const dayMenu = weeklyMenu.weekMenu.get(day.toString());
      formattedMenu[`day${day}`] = {};

      subscription.plan.selectedPackages.forEach((package) => {
        formattedMenu[`day${day}`][package] = dayMenu.get(package);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.orderId,
        planName: subscription.plan.name,
        currentWeek: weeklyMenu.weekNumber,
        cycleNumber: weeklyMenu.cycleNumber,
        menu: formattedMenu,
      },
    });
  } catch (error) {
    console.error("Error fetching weekly menu:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly menu",
      error: error.message,
    });
  }
};

module.exports = {
  getTodaySubscriptionMenus,
  getMenuForDate,
  getSubscriptionDates,
  getWeeklySubscriptionMenu,
};
