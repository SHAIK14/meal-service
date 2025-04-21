// controllers/kitchen/mealOrderController.js
const Order = require("../../models/Mobile/Order");
const Item = require("../../models/admin/Item");
const MobileUser = require("../../models/Mobile/MobileUser");

// Get pending orders that need acceptance
const getPendingMealOrders = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    console.log("Fetching pending meal orders for branch:", branchId);

    // Find all pending orders for this branch
    const pendingOrders = await Order.find({
      branch: branchId,
      status: "pending",
    }).sort({ createdAt: -1 });

    console.log(`Found ${pendingOrders.length} pending meal orders`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(pendingOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching pending meal orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders",
      error: error.message,
    });
  }
};

// Get accepted orders for kitchen staff
const getAcceptedMealOrders = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    console.log("Fetching accepted meal orders for branch:", branchId);

    // Find all accepted or preparing orders for this branch
    const acceptedOrders = await Order.find({
      branch: branchId,
      status: { $in: ["accepted", "preparing"] },
    }).sort({ createdAt: -1 });

    console.log(`Found ${acceptedOrders.length} accepted meal orders`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(acceptedOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching accepted meal orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching accepted orders",
      error: error.message,
    });
  }
};

// Get ready for pickup/delivery orders
const getReadyMealOrders = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    console.log("Fetching ready meal orders for branch:", branchId);

    // Find all ready or out_for_delivery orders for this branch
    const readyOrders = await Order.find({
      branch: branchId,
      status: { $in: ["ready", "out_for_delivery"] },
    }).sort({ createdAt: -1 });

    console.log(`Found ${readyOrders.length} ready meal orders`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(readyOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching ready meal orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ready orders",
      error: error.message,
    });
  }
};

// Get orders by date
const getMealOrdersByDate = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    const { date } = req.params;

    console.log(`Fetching meal orders for branch ${branchId} on date ${date}`);

    // Create date range for the specified date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all orders for this date range
    const orders = await Order.find({
      branch: branchId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    console.log(`Found ${orders.length} meal orders for date ${date}`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching meal orders by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders by date",
      error: error.message,
    });
  }
};

// Get staff orders by date (only shows accepted/preparing)
const getStaffMealOrdersByDate = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    const { date } = req.params;

    console.log(
      `Fetching staff meal orders for branch ${branchId} on date ${date}`
    );

    // Create date range for the specified date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all accepted/preparing orders for this date range
    const orders = await Order.find({
      branch: branchId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["accepted", "preparing"] },
    }).sort({ createdAt: -1 });

    console.log(`Found ${orders.length} staff meal orders for date ${date}`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching staff meal orders by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders by date",
      error: error.message,
    });
  }
};

// Get all orders with filters (for admin dashboard)
const getAllMealOrders = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;
    const { status, startDate, endDate } = req.query;

    console.log(
      `Fetching all meal orders for branch ${branchId} with filters:`,
      {
        status,
        startDate,
        endDate,
      }
    );

    // Build query
    const query = { branch: branchId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: start, $lte: end };
    }

    // Get orders
    const orders = await Order.find(query).sort({
      createdAt: -1,
    });

    console.log(`Found ${orders.length} orders with applied filters`);

    // Populate item and user details
    const populatedOrders = await populateOrderDetails(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching all meal orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Update order status (admin only)
const updateMealOrderStatus = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;
    const branchId = req.branch._id;

    console.log(
      `Updating meal order ${orderId} to status ${status} for branch ${branchId}`
    );

    // Validate status
    const validStatuses = [
      "accepted",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      branch: branchId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the status transition is valid
    const validTransitions = getValidStatusTransitions(
      order.status,
      order.deliveryType
    );
    if (!validTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
        validTransitions,
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating meal order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get specific order by ID
const getMealOrderById = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const { orderId } = req.params;
    const branchId = req.branch._id;

    console.log(`Fetching meal order ${orderId} for branch ${branchId}`);

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      branch: branchId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Populate item details
    const populatedOrder = await populateOrderDetails([order]);

    res.json({
      success: true,
      data: populatedOrder[0],
    });
  } catch (error) {
    console.error("Error fetching meal order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Get dashboard statistics
const getMealOrderStats = async (req, res) => {
  try {
    // Check if branch object is properly set
    if (!req.branch || !req.branch._id) {
      console.error("Branch object not set correctly:", req.branch);
      return res.status(400).json({
        success: false,
        message: "Branch identification failed",
      });
    }

    const branchId = req.branch._id;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get counts by status
    const statusCounts = await Order.aggregate([
      {
        $match: {
          branch: branchId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get today's orders count
    const todayCount = await Order.countDocuments({
      branch: branchId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get delivery vs pickup counts
    const deliveryTypeCounts = await Order.aggregate([
      {
        $match: {
          branch: branchId,
        },
      },
      {
        $group: {
          _id: "$deliveryType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the status counts
    const formattedStatusCounts = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      formattedStatusCounts[item._id] = item.count;
    });

    // Format delivery type counts
    const formattedDeliveryTypeCounts = {
      pickup: 0,
      delivery: 0,
    };

    deliveryTypeCounts.forEach((item) => {
      formattedDeliveryTypeCounts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        statusCounts: formattedStatusCounts,
        todayCount,
        deliveryTypeCounts: formattedDeliveryTypeCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching meal order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// Helper function to get valid status transitions
const getValidStatusTransitions = (currentStatus, deliveryType) => {
  switch (currentStatus) {
    case "pending":
      return ["accepted", "cancelled"];
    case "accepted":
      return ["preparing"];
    case "preparing":
      return ["ready"];
    case "ready":
      return deliveryType === "pickup" ? ["completed"] : ["out_for_delivery"];
    case "out_for_delivery":
      return ["delivered"];
    case "delivered":
      return ["completed"];
    default:
      return [];
  }
};

// Helper function to populate order items and user details
const populateOrderDetails = async (orders) => {
  // Convert to plain objects to make them mutable
  const plainOrders = orders.map((order) => order.toObject());

  if (plainOrders.length === 0) {
    return [];
  }

  try {
    // Get all item IDs from the orders
    const itemIds = plainOrders
      .flatMap((order) => order.items.map((item) => item.item))
      .filter((id) => id);

    console.log(`Populating details for ${itemIds.length} items`);

    // Fetch all items in a single query
    const items = await Item.find(
      { _id: { $in: itemIds } },
      "nameEnglish nameArabic price image"
    );

    console.log(`Found ${items.length} items for populating details`);

    // Create a lookup map for items
    const itemMap = {};
    items.forEach((item) => {
      itemMap[item._id.toString()] = item;
    });

    // Get all user IDs
    const userIds = plainOrders.map((order) => order.user).filter((id) => id);

    // Fetch all users in a single query
    const users = await MobileUser.find(
      { _id: { $in: userIds } },
      "name phoneNumber countryCode"
    );

    // Create a lookup map for users
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Add item and user details to each order
    plainOrders.forEach((order) => {
      // Add item details
      order.items = order.items.map((item) => {
        const itemId = item.item.toString();
        const itemDetails = itemMap[itemId];

        return {
          ...item,
          nameEnglish: itemDetails?.nameEnglish,
          nameArabic: itemDetails?.nameArabic,
          image: itemDetails?.image,
        };
      });

      // Add user details
      if (order.user) {
        const userId = order.user.toString();
        const userDetails = userMap[userId];

        if (userDetails) {
          order.userDetails = {
            name: userDetails.name,
            phoneNumber: userDetails.phoneNumber,
            countryCode: userDetails.countryCode,
          };
        }
      }

      // Calculate time elapsed since order creation
      order.elapsedTime = Math.floor(
        (new Date() - new Date(order.createdAt)) / 60000
      ); // in minutes
    });

    return plainOrders;
  } catch (error) {
    console.error("Error in populateOrderDetails:", error);
    // Return the original plain orders without populating if there's an error
    return plainOrders;
  }
};

module.exports = {
  getPendingMealOrders,
  getAcceptedMealOrders,
  getReadyMealOrders,
  getMealOrdersByDate,
  getStaffMealOrdersByDate,
  getAllMealOrders,
  updateMealOrderStatus,
  getMealOrderById,
  getMealOrderStats,
};
