const SubscriptionOrder = require("../../models/subscription");
const Config = require("../../models/admin/config");
const WeeklyMenu = require("../../models/admin/WeeklyMenu");
const Item = require("../../models/admin/Item");
const Branch = require("../../models/admin/Branch");
exports.getKitchenOrders = async (req, res) => {
  try {
    const { date } = req.query;
    const branchId = req.branch._id;

    // Get branch config
    const branchConfig = await Config.findOne({ branch: branchId });
    if (!branchConfig) {
      return res.status(404).json({
        success: false,
        message: "Branch configuration not found",
      });
    }

    // Date setup
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get day of week
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][queryDate.getDay()].toLowerCase();

    // Check if it's a holiday
    const isNationalHoliday = branchConfig.nationalHolidays?.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === queryDate.getDate() &&
        holidayDate.getMonth() === queryDate.getMonth() &&
        holidayDate.getFullYear() === queryDate.getFullYear()
      );
    });

    const isWeeklyHoliday = branchConfig.weeklyHolidays?.includes(
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    );

    const isEmergencyClosure = branchConfig.emergencyClosures?.some(
      (closure) => {
        const closureDate = new Date(closure.date);
        return (
          closureDate.getDate() === queryDate.getDate() &&
          closureDate.getMonth() === queryDate.getMonth() &&
          closureDate.getFullYear() === queryDate.getFullYear()
        );
      }
    );

    if (isNationalHoliday || isWeeklyHoliday || isEmergencyClosure) {
      return res.json({
        success: true,
        isHoliday: true,
        message: isNationalHoliday
          ? "National Holiday"
          : isWeeklyHoliday
          ? "Weekly Holiday"
          : "Emergency Closure",
        data: {},
      });
    }

    // Initialize kitchen orders structure
    const kitchenOrders = {};
    branchConfig.deliveryTimeSlots.forEach((slot) => {
      if (slot.isActive) {
        kitchenOrders[slot.kitchenTime] = {
          deliveryTime: `${slot.fromTime}-${slot.toTime}`,
          items: {}, // Will store item quantities directly
        };
      }
    });

    // Get active subscriptions
    const activeSubscriptions = await SubscriptionOrder.find({
      branchId,
      status: "active",
      "plan.subscriptionDays": {
        $elemMatch: {
          date: { $gte: startOfDay, $lte: endOfDay },
          isAvailable: true,
          isSkipped: false,
        },
      },
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }).populate("plan.planId");

    console.log(
      `[Debug] Found ${activeSubscriptions.length} active subscriptions`
    );

    // Get all relevant plan IDs and fetch menus
    const planIds = [
      ...new Set(activeSubscriptions.map((sub) => sub.plan.planId._id)),
    ];
    const weeklyMenus = await WeeklyMenu.find({
      plan: { $in: planIds },
      status: "active",
    }).lean();

    console.log(`[Debug] Found ${weeklyMenus.length} weekly menus`);

    // Create menu lookup map
    const menuMap = new Map(
      weeklyMenus.map((menu) => [menu.plan.toString(), menu])
    );

    // Get all item IDs from menus
    const allItemIds = new Set();
    weeklyMenus.forEach((menu) => {
      const dayMenu = menu.weekMenu[dayOfWeek];
      if (dayMenu) {
        Object.values(dayMenu).forEach((itemIds) => {
          itemIds.forEach((id) => allItemIds.add(id.toString()));
        });
      }
    });

    // Fetch all items at once
    const items = await Item.find({
      _id: { $in: Array.from(allItemIds) },
    }).lean();

    const itemMap = new Map(items.map((item) => [item._id.toString(), item]));

    console.log(`[Debug] Found ${items.length} unique items`);

    // Process subscriptions
    for (const subscription of activeSubscriptions) {
      const deliverySlot = subscription.plan.deliveryTime;
      const matchingSlot = branchConfig.deliveryTimeSlots.find(
        (slot) =>
          slot.fromTime === deliverySlot.fromTime &&
          slot.toTime === deliverySlot.toTime
      );

      if (!matchingSlot) {
        console.log(
          `[Debug] No matching slot for subscription ${subscription._id}`
        );
        continue;
      }

      const weeklyMenu = menuMap.get(subscription.plan.planId._id.toString());
      if (!weeklyMenu || !weeklyMenu.weekMenu[dayOfWeek]) {
        console.log(
          `[Debug] No menu found for subscription ${subscription._id}`
        );
        continue;
      }

      const dayMenu = weeklyMenu.weekMenu[dayOfWeek];

      // Process each package type (breakfast, lunch, dinner)
      subscription.plan.selectedPackages.forEach((packageType) => {
        const packageItems = dayMenu[packageType];
        if (!packageItems) return;

        packageItems.forEach((itemId) => {
          const item = itemMap.get(itemId.toString());
          if (!item) return;

          const itemKey = item.nameEnglish;
          const timeSlot = kitchenOrders[matchingSlot.kitchenTime];

          timeSlot.items[itemKey] = (timeSlot.items[itemKey] || 0) + 1;
        });
      });
    }

    // Convert items object to array format for easier frontend handling
    Object.keys(kitchenOrders).forEach((timeSlot) => {
      kitchenOrders[timeSlot].items = Object.entries(
        kitchenOrders[timeSlot].items
      )
        .map(([name, quantity]) => ({
          name,
          quantity,
        }))
        .sort((a, b) => b.quantity - a.quantity); // Sort by quantity descending
    });

    console.log("[Debug] Final kitchen orders:", kitchenOrders);

    return res.json({
      success: true,
      data: kitchenOrders,
    });
  } catch (error) {
    console.error("[Error] Kitchen Orders:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing kitchen orders",
      error: error.message,
    });
  }
};
exports.getKotByTime = async (req, res) => {
  try {
    const { date, fromTime, toTime } = req.query;
    const branchId = req.branch._id;

    console.log("[Debug KOT] Request params:", {
      date,
      fromTime,
      toTime,
      branchId: branchId.toString(),
    });

    // Get branch details
    const branch = await Branch.findById(branchId);
    if (!branch) {
      console.log("[Debug KOT] Branch not found");
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    console.log("[Debug KOT] Branch details:", {
      name: branch.name,
      address: branch.address.mainAddress,
    });

    // Date setup
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("[Debug KOT] Date range:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    // Get all active subscriptions for this time slot
    const activeSubscriptions = await SubscriptionOrder.find({
      branchId,
      status: "active",
      "plan.subscriptionDays": {
        $elemMatch: {
          date: { $gte: startOfDay, $lte: endOfDay },
          isAvailable: true,
          isSkipped: false,
        },
      },
      "plan.deliveryTime.fromTime": fromTime,
      "plan.deliveryTime.toTime": toTime,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }).populate([
      {
        path: "user",
        select: "firstName lastName phoneNumber",
      },
      {
        path: "plan.planId",
        select: "nameEnglish package",
      },
    ]);

    console.log("[Debug KOT] Found subscriptions:", {
      count: activeSubscriptions.length,
      subscriptions: activeSubscriptions.map((sub) => ({
        id: sub._id.toString(),
        customer: `${sub.user.firstName} ${sub.user.lastName}`,
      })),
    });

    // Get day of week for menu lookup
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][queryDate.getDay()].toLowerCase();

    // Get all relevant plan IDs
    const planIds = [
      ...new Set(activeSubscriptions.map((sub) => sub.plan.planId._id)),
    ];

    // Fetch weekly menus
    const weeklyMenus = await WeeklyMenu.find({
      plan: { $in: planIds },
      status: "active",
    }).lean();

    console.log("[Debug KOT] Found weekly menus:", {
      count: weeklyMenus.length,
      planIds: planIds.map((id) => id.toString()),
    });

    // Create menu lookup map
    const menuMap = new Map(
      weeklyMenus.map((menu) => [menu.plan.toString(), menu])
    );

    // Get all possible item IDs
    const allItemIds = new Set();
    weeklyMenus.forEach((menu) => {
      const dayMenu = menu.weekMenu[dayOfWeek];
      if (dayMenu) {
        Object.values(dayMenu).forEach((itemIds) => {
          itemIds.forEach((id) => allItemIds.add(id.toString()));
        });
      }
    });

    // Fetch all items
    const items = await Item.find({
      _id: { $in: Array.from(allItemIds) },
    }).lean();

    const itemMap = new Map(items.map((item) => [item._id.toString(), item]));

    console.log("[Debug KOT] Found items:", {
      count: items.length,
      sampleItems: items.slice(0, 3).map((item) => item.nameEnglish),
    });

    // Generate KOTs
    const kots = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const weeklyMenu = menuMap.get(subscription.plan.planId._id.toString());
        const dayMenu = weeklyMenu?.weekMenu[dayOfWeek];
        const orderItems = [];

        // Process each package
        for (const packageType of subscription.plan.selectedPackages) {
          const packageItems = dayMenu?.[packageType];
          if (!packageItems) continue;

          for (const itemId of packageItems) {
            const item = itemMap.get(itemId.toString());
            if (item) {
              orderItems.push({
                name: item.nameEnglish,
                quantity: 1,
                packageType,
              });
            }
          }
        }

        return {
          customerName: `${subscription.user.firstName} ${subscription.user.lastName}`,
          phoneNumber: subscription.user.phoneNumber,
          deliveryAddress: {
            type: subscription.deliveryAddress.type,
            street: subscription.deliveryAddress.street,
            area: subscription.deliveryAddress.area,
          },
          items: orderItems,
          deliveryTime: `${fromTime}-${toTime}`,
        };
      })
    );

    console.log("[Debug KOT] Generated KOTs:", {
      count: kots.length,
      sample: kots[0],
    });

    const responseData = {
      branch: {
        name: branch.name,
        address: {
          main: branch.address.mainAddress,
          city: branch.address.city,
          state: branch.address.state,
          pincode: branch.address.pincode,
        },
      },
      date: queryDate,
      deliveryTime: `${fromTime}-${toTime}`,
      kots,
    };

    console.log("[Debug KOT] Final response:", {
      branchName: responseData.branch.name,
      kotCount: responseData.kots.length,
    });

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[Error KOT]:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating KOTs",
      error: error.message,
    });
  }
};
