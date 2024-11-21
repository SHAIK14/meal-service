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
