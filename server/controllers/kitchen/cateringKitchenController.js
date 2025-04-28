const CateringOrder = require("../../models/catering/CateringOrder");
const Item = require("../../models/admin/Item");

// Get all pending orders that need acceptance
const getPendingOrders = async (req, res) => {
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
    console.log("Fetching pending orders for branch:", branchId);

    // Find all pending orders for this branch
    const pendingOrders = await CateringOrder.find({
      branchId,
      status: "pending",
    }).sort({ eventDate: 1, eventTime: 1 });

    console.log(`Found ${pendingOrders.length} pending orders`);

    // Populate item details
    const populatedOrders = await populateOrderItems(pendingOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching pending catering orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders",
      error: error.message,
    });
  }
};

// Get orders by date
const getOrdersByDate = async (req, res) => {
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

    console.log(`Fetching orders for branch ${branchId} on date ${date}`);

    // Create date range for the specified date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all orders for this date range
    const orders = await CateringOrder.find({
      branchId,
      eventDate: { $gte: startDate, $lte: endDate },
    }).sort({ eventTime: 1 });

    console.log(`Found ${orders.length} orders for date ${date}`);

    // Populate item details
    const populatedOrders = await populateOrderItems(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching catering orders by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders by date",
      error: error.message,
    });
  }
};

// Get upcoming accepted orders
const getUpcomingOrders = async (req, res) => {
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
    console.log("Fetching upcoming orders for branch:", branchId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find upcoming orders that are accepted, preparing, or ready
    const upcomingOrders = await CateringOrder.find({
      branchId,
      status: { $in: ["accepted", "preparing", "ready"] },
      eventDate: { $gte: today },
    })
      .sort({ eventDate: 1, eventTime: 1 })
      .limit(10); // Limit to 10 most recent

    console.log(`Found ${upcomingOrders.length} upcoming orders`);

    // Populate item details
    const populatedOrders = await populateOrderItems(upcomingOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching upcoming catering orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming orders",
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
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
      `Updating order ${orderId} to status ${status} for branch ${branchId}`
    );

    // Validate status
    const validStatuses = [
      "accepted",
      "preparing",
      "ready",
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
    const order = await CateringOrder.findOne({
      _id: orderId,
      branchId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
    console.error("Error updating catering order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get all orders with filters
const getAllOrders = async (req, res) => {
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

    console.log(`Fetching all orders for branch ${branchId} with filters:`, {
      status,
      startDate,
      endDate,
    });

    // Build query
    const query = { branchId };

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

      query.eventDate = { $gte: start, $lte: end };
    }

    // Get orders
    const orders = await CateringOrder.find(query).sort({
      eventDate: 1,
      eventTime: 1,
    });

    console.log(`Found ${orders.length} orders with applied filters`);

    // Populate item details
    const populatedOrders = await populateOrderItems(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching all catering orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order counts by date (for calendar view)
const getOrderCountsByDate = async (req, res) => {
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
    const { month, year } = req.params;

    console.log(
      `Fetching order counts for branch ${branchId} for ${month}/${year}`
    );

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year",
      });
    }

    // Calculate start and end of the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Get all orders for the month
    const orders = await CateringOrder.find({
      branchId,
      eventDate: { $gte: startDate, $lte: endDate },
    });

    console.log(`Found ${orders.length} orders for ${month}/${year}`);

    // Group orders by date and count
    const orderCounts = {};

    orders.forEach((order) => {
      const dateStr = order.eventDate.toISOString().split("T")[0];

      if (!orderCounts[dateStr]) {
        orderCounts[dateStr] = {
          total: 0,
          pending: 0,
          accepted: 0,
          preparing: 0,
          ready: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      orderCounts[dateStr].total += 1;
      orderCounts[dateStr][order.status] += 1;
    });

    res.json({
      success: true,
      data: orderCounts,
    });
  } catch (error) {
    console.error("Error fetching catering order counts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order counts",
      error: error.message,
    });
  }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
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

    console.log(`Fetching order ${orderId} for branch ${branchId}`);

    // Find the order
    const order = await CateringOrder.findOne({
      _id: orderId,
      branchId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Populate item details
    const populatedOrder = await populateOrderItems([order]);

    res.json({
      success: true,
      data: populatedOrder[0],
    });
  } catch (error) {
    console.error("Error fetching catering order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Helper function to populate items in orders
const populateOrderItems = async (orders) => {
  // We need this to get item images and extra details
  // Convert to plain objects to make them mutable
  const plainOrders = orders.map((order) => order.toObject());

  if (plainOrders.length === 0) {
    return [];
  }

  try {
    // Get all item IDs from the orders
    const itemIds = plainOrders.flatMap((order) =>
      order.items.map((item) => item.itemId)
    );

    console.log(`Populating details for ${itemIds.length} items`);

    // Fetch all items in a single query
    const items = await Item.find(
      {
        _id: { $in: itemIds },
      },
      "nameEnglish nameArabic image"
    );

    console.log(`Found ${items.length} items for populating details`);

    // Create a lookup map for items
    const itemMap = {};
    items.forEach((item) => {
      itemMap[item._id.toString()] = item;
    });

    // Add item details to each order
    plainOrders.forEach((order) => {
      order.items = order.items.map((item) => {
        const itemDetails = itemMap[item.itemId.toString()];

        return {
          ...item,
          nameEnglish: itemDetails?.nameEnglish || item.name,
          nameArabic: itemDetails?.nameArabic,
          image: itemDetails?.image,
        };
      });
    });

    return plainOrders;
  } catch (error) {
    console.error("Error in populateOrderItems:", error);
    // Return the original plain orders without populating if there's an error
    return plainOrders;
  }
};

module.exports = {
  getPendingOrders,
  getOrdersByDate,
  getUpcomingOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderCountsByDate,
  getOrderById,
};
