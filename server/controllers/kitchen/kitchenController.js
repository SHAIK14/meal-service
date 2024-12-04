// controllers/kitchen/kitchenController.js
const Plan = require("../../models/admin/Plan");
const WeeklyMenu = require("../../models/admin/WeeklyMenu");
const SubscriptionOrder = require("../../models/subscription");
const Item = require("../../models/admin/Item");

exports.getMealCountsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    console.log(`[Kitchen Controller] Processing request for date: ${date}`);

    // Initialize date range
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = days[queryDate.getDay()];

    console.log(`[Kitchen Controller] Date range:`, {
      startOfDay,
      endOfDay,
      dayOfWeek,
    });

    // Get active subscriptions with plan details
    const activeSubscriptions = await SubscriptionOrder.find({
      status: "active",
      "plan.subscriptionDays": {
        $elemMatch: {
          date: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
          isAvailable: true,
          isSkipped: false,
        },
      },
    }).populate({
      path: "plan.planId",
      select: "nameEnglish",
    });

    console.log(
      `[Kitchen Controller] Found ${activeSubscriptions.length} active subscriptions`
    );

    if (activeSubscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active orders found for this date",
      });
    }

    // Step 1: Count package selections by plan
    const planPackageCounts = {};
    const finalCounts = {
      packages: {
        breakfast: {
          totalCount: 0,
          items: {},
        },
        lunch: {
          totalCount: 0,
          items: {},
        },
        dinner: {
          totalCount: 0,
          items: {},
        },
        snacks: {
          totalCount: 0,
          items: {},
        },
      },
    };

    // Count package selections for each subscription
    activeSubscriptions.forEach((subscription) => {
      const planName = subscription.plan.planId.nameEnglish;
      const selectedPackages = subscription.plan.selectedPackages;

      if (!planPackageCounts[planName]) {
        planPackageCounts[planName] = {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snacks: 0,
        };
      }

      // Increment counts for each selected package
      selectedPackages.forEach((pkg) => {
        planPackageCounts[planName][pkg]++;
        finalCounts.packages[pkg].totalCount++;
      });
    });

    console.log(
      "[Kitchen Controller] Package counts by plan:",
      planPackageCounts
    );
    console.log(
      "[Kitchen Controller] Total package counts:",
      Object.entries(finalCounts.packages).map(
        ([pkg, data]) => `${pkg}: ${data.totalCount}`
      )
    );

    // Get active weekly menus
    const weeklyMenus = await WeeklyMenu.find({
      status: "active",
    }).populate("plan", "nameEnglish");

    console.log(
      `[Kitchen Controller] Found ${weeklyMenus.length} active menus`
    );

    // Process each weekly menu
    for (const menu of weeklyMenus) {
      try {
        const planName = menu.plan.nameEnglish;
        console.log(`[Kitchen Controller] Processing menu for ${planName}`);

        // Skip if no active subscriptions for this plan
        if (!planPackageCounts[planName]) {
          console.log(
            `[Kitchen Controller] No active subscriptions for ${planName}, skipping`
          );
          continue;
        }

        const weekMenuArray = Array.from(menu.weekMenu || new Map());
        const dayMenuEntry = weekMenuArray.find(([day]) => day === dayOfWeek);

        if (!dayMenuEntry) {
          console.log(
            `[Kitchen Controller] No menu found for ${dayOfWeek} in ${planName}`
          );
          continue;
        }

        const [_, dayMenuMap] = dayMenuEntry;
        console.log(
          `[Kitchen Controller] Found menu items for ${planName} on ${dayOfWeek}`
        );

        // Process each package type
        for (const [packageType, itemIds] of Array.from(dayMenuMap)) {
          const packageCount = planPackageCounts[planName][packageType];

          if (packageCount === 0) {
            console.log(
              `[Kitchen Controller] No subscribers for ${packageType} in ${planName}`
            );
            continue;
          }

          console.log(
            `[Kitchen Controller] Processing ${packageType} for ${planName} - Count: ${packageCount}`
          );

          if (!Array.isArray(itemIds) || itemIds.length === 0) {
            console.log(
              `[Kitchen Controller] No items found for ${packageType} in ${planName}`
            );
            continue;
          }

          // Fetch items for this package
          const items = await Item.find({
            _id: { $in: itemIds },
          }).select("nameEnglish");

          if (!items.length) {
            console.log(
              `[Kitchen Controller] No valid items found for ${packageType} in ${planName}`
            );
            continue;
          }

          // Add items to counts
          items.forEach((item) => {
            if (!item.nameEnglish) {
              console.log(`[Kitchen Controller] Invalid item found:`, item);
              return;
            }

            const itemName = item.nameEnglish.trim();
            if (!finalCounts.packages[packageType].items[itemName]) {
              finalCounts.packages[packageType].items[itemName] = 0;
            }

            finalCounts.packages[packageType].items[itemName] += packageCount;
            console.log(
              `[Kitchen Controller] Updated count for ${itemName} in ${packageType}: ${finalCounts.packages[packageType].items[itemName]}`
            );
          });
        }
      } catch (error) {
        console.error(`[Kitchen Controller] Error processing menu:`, error);
      }
    }

    // Sort items by count in each package
    Object.keys(finalCounts.packages).forEach((packageType) => {
      const sortedItems = {};
      let totalQuantity = 0;

      // Sort items and calculate total quantity
      Object.entries(finalCounts.packages[packageType].items)
        .sort(([, a], [, b]) => b - a)
        .forEach(([item, count]) => {
          sortedItems[item] = count;
          totalQuantity += count;
        });

      finalCounts.packages[packageType].items = sortedItems;
      finalCounts.packages[packageType].totalQuantity = totalQuantity; // Add this new field
    });

    console.log(
      "[Kitchen Controller] Final counts:",
      JSON.stringify(finalCounts, null, 2)
    );

    return res.json({
      success: true,
      data: finalCounts,
    });
  } catch (error) {
    console.error("[Kitchen Controller] Error:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Error processing meal counts",
      error: error.message,
    });
  }
};
// Add these new functions to your existing kitchenController.js
exports.getOrdersForKOT = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = days[queryDate.getDay()];

    // Get active subscriptions and weekly menus
    const [activeSubscriptions, weeklyMenus] = await Promise.all([
      SubscriptionOrder.find({
        status: "active",
        "plan.subscriptionDays": {
          $elemMatch: {
            date: { $gte: startOfDay, $lt: endOfDay },
            isAvailable: true,
            isSkipped: false,
          },
        },
      }).populate([
        {
          path: "user",
          select: "firstName lastName phoneNumber address",
        },
        {
          path: "plan.planId",
          select: "nameEnglish",
        },
      ]),
      WeeklyMenu.find({
        status: "active",
      }).populate("plan", "nameEnglish"),
    ]);

    // Get all unique item IDs from menus
    const itemIds = new Set();
    weeklyMenus.forEach((menu) => {
      const weekMenuArray = Array.from(menu.weekMenu || new Map());
      const dayMenu = weekMenuArray.find(([day]) => day === dayOfWeek);
      if (dayMenu) {
        const [_, mealMap] = dayMenu;
        Array.from(mealMap).forEach(([_, items]) => {
          items.forEach((itemId) => itemIds.add(itemId.toString()));
        });
      }
    });

    // Fetch all items at once
    const items = await Item.find({
      _id: { $in: Array.from(itemIds) },
    }).select("nameEnglish");
    const itemsMap = new Map(items.map((item) => [item._id.toString(), item]));

    // Group orders by delivery time with menu items
    const groupedOrders = {};
    for (const order of activeSubscriptions) {
      const timeSlot = `${order.plan.deliveryTime.fromTime}-${order.plan.deliveryTime.toTime}`;
      if (!groupedOrders[timeSlot]) {
        groupedOrders[timeSlot] = [];
      }

      // Get menu items for this order
      const menu = weeklyMenus.find(
        (m) => m.plan.nameEnglish === order.plan.planId.nameEnglish
      );
      const orderItems = {};

      if (menu) {
        const weekMenuArray = Array.from(menu.weekMenu || new Map());
        const dayMenu = weekMenuArray.find(([day]) => day === dayOfWeek);
        if (dayMenu) {
          const [_, mealMap] = dayMenu;
          order.plan.selectedPackages.forEach((packageType) => {
            const packageItems = Array.from(mealMap).find(
              ([type]) => type === packageType
            );
            if (packageItems) {
              const [_, itemIds] = packageItems;
              orderItems[packageType] = itemIds
                .map((id) => itemsMap.get(id.toString()))
                .filter(Boolean)
                .map((item) => item.nameEnglish);
            }
          });
        }
      }

      groupedOrders[timeSlot].push({
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        phoneNumber: order.user.phoneNumber,
        address: order.deliveryAddress,
        area: order.deliveryAddress.area,
        packages: order.plan.selectedPackages,
        planName: order.plan.planId.nameEnglish,
        items: orderItems, // Now includes items for each package type
      });
    }

    return res.json({
      success: true,
      data: groupedOrders,
    });
  } catch (error) {
    console.error("[Kitchen Controller] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders for KOT",
      error: error.message,
    });
  }
};
exports.generateKOT = async (req, res) => {
  try {
    const { orders, timeSlot } = req.body;
    if (!orders || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Orders and time slot are required",
      });
    }

    // Format KOT data for printing
    const kotData = orders.map((order) => ({
      customerName: order.customerName,
      address: order.address,
      area: order.area,
      phoneNumber: order.phoneNumber,
      timeSlot: timeSlot,
      packages: order.packages,
      items: order.items, // This will come from weekly menu
    }));

    // Here you would integrate with your printer
    // For now, we'll just return the formatted data
    return res.json({
      success: true,
      message: "KOT generated successfully",
      data: kotData,
    });
  } catch (error) {
    console.error("[Kitchen Controller] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating KOT",
      error: error.message,
    });
  }
};
