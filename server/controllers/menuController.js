const SubscriptionOrder = require("../models/subscription");
const WeeklyMenu = require("../models/admin/WeeklyMenu");
const Plan = require("../models/admin/Plan");
const Item = require("../models/admin/Item");

// Helper function to determine current day number
const getCurrentDayNumber = (startDate) => {
  const today = new Date();
  const start = new Date(startDate);

  // Get days since subscription started
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));

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

    console.log(
      "Active Subscriptions:",
      activeSubscriptions.map((sub) => ({
        orderId: sub.orderId,
        planId: sub.plan.planId._id,
        packages: sub.plan.selectedPackages,
      }))
    );

    // 2. Get weekly menus for all active subscriptions
    const weeklyMenus = await WeeklyMenu.find({
      plan: {
        $in: activeSubscriptions.map((sub) => sub.plan.planId._id),
      },
    });

    const todayMenus = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const currentDayNumber = getCurrentDayNumber(subscription.startDate);
        const weeklyMenu = weeklyMenus.find(
          (menu) =>
            menu.plan.toString() === subscription.plan.planId._id.toString()
        );

        console.log(`\nProcessing ${subscription.orderId}:`);
        console.log(`Day: ${currentDayNumber}`);
        console.log("Weekly Menu:", {
          planId: weeklyMenu?.plan,
          hasMenu: weeklyMenu?.weekMenu instanceof Map,
          availableDays: weeklyMenu?.weekMenu
            ? Array.from(weeklyMenu.weekMenu.keys())
            : [],
        });

        const menuItems = {};

        if (weeklyMenu?.weekMenu && weeklyMenu.weekMenu instanceof Map) {
          // Get the day menu using Map.get()
          const dayMenu = weeklyMenu.weekMenu.get(currentDayNumber.toString());
          console.log(`Day ${currentDayNumber} menu:`, dayMenu);

          if (dayMenu && dayMenu instanceof Map) {
            // Process each selected package
            for (const packageType of subscription.plan.selectedPackages) {
              const packageItems = dayMenu.get(packageType);
              console.log(`${packageType} items:`, packageItems);

              if (packageItems && Array.isArray(packageItems)) {
                // Get the items data
                const items = await Item.find({
                  _id: { $in: packageItems },
                });

                console.log(`Found ${items.length} items for ${packageType}`);
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
        };
      })
    );

    console.log(
      "Final response:",
      todayMenus.map((menu) => ({
        subscriptionId: menu.subscriptionId,
        dayNumber: menu.dayNumber,
        itemCounts: Object.entries(menu.menuItems).map(
          ([pkg, items]) => `${pkg}: ${items.length} items`
        ),
      }))
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
// Get current week's menu for a specific subscription
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
      const dayMenu = weeklyMenu.weekMenu.get(`day${day}`);
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

// Update weekly menu for next cycle
const updateWeeklyMenuCycle = async (req, res) => {
  try {
    const { orderId } = req.params;

    const subscription = await SubscriptionOrder.findOne({
      orderId,
      user: req.user._id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not active",
      });
    }

    const currentMenu = await WeeklyMenu.findById(subscription.menuSchedule);

    // Create new weekly menu for next cycle
    const newWeeklyMenu = new WeeklyMenu({
      plan: subscription.plan.planId,
      subscriptionOrder: subscription._id,
      status: "active",
      weekNumber: currentMenu.weekNumber + 1,
      cycleNumber: currentMenu.cycleNumber + 1,
      weekMenu: currentMenu.weekMenu, // Copy previous week's menu structure
    });

    await newWeeklyMenu.save();

    // Update subscription with new menu
    subscription.menuSchedule = newWeeklyMenu._id;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Weekly menu cycle updated successfully",
      data: newWeeklyMenu,
    });
  } catch (error) {
    console.error("Error updating menu cycle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update menu cycle",
      error: error.message,
    });
  }
};

module.exports = {
  getTodaySubscriptionMenus,
  getWeeklySubscriptionMenu,
  updateWeeklyMenuCycle,
};
