const TakeAwayOrder = require("../../models/takeAway/TakeAwayOrder");
const Item = require("../../models/admin/Item");
const Branch = require("../../models/admin/Branch");

// Get pending orders that need acceptance
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
    console.log("Fetching pending takeaway orders for branch:", branchId);

    // Find all pending orders for this branch
    const pendingOrders = await TakeAwayOrder.find({
      branchId,
      status: "pending",
    }).sort({ orderDate: -1 }); // Most recent first

    console.log(`Found ${pendingOrders.length} pending takeaway orders`);

    // Populate item details
    const populatedOrders = await populateOrderItems(pendingOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching pending takeaway orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders",
      error: error.message,
    });
  }
};

// Get accepted orders
const getAcceptedOrders = async (req, res) => {
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
    console.log("Fetching accepted takeaway orders for branch:", branchId);

    // Find all accepted orders for this branch
    const acceptedOrders = await TakeAwayOrder.find({
      branchId,
      status: "accepted",
    }).sort({ orderDate: -1 }); // Most recent first

    console.log(`Found ${acceptedOrders.length} accepted takeaway orders`);

    // Populate item details
    const populatedOrders = await populateOrderItems(acceptedOrders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching accepted takeaway orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching accepted orders",
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

    console.log(
      `Fetching takeaway orders for branch ${branchId} on date ${date}`
    );

    // Create date range for the specified date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all orders for this date range
    const orders = await TakeAwayOrder.find({
      branchId,
      orderDate: { $gte: startDate, $lte: endDate },
    }).sort({ orderDate: -1 });

    console.log(`Found ${orders.length} takeaway orders for date ${date}`);

    // Populate item details
    const populatedOrders = await populateOrderItems(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching takeaway orders by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders by date",
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
      `Updating takeaway order ${orderId} to status ${status} for branch ${branchId}`
    );

    // Validate status
    const validStatuses = [
      "accepted",
      "declined",
      "completed",
      "kot-generated",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find the order
    const order = await TakeAwayOrder.findOne({
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
    console.error("Error updating takeaway order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Generate KOT for an order
const generateKOT = async (req, res) => {
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

    console.log(`Generating KOT for takeaway order ${orderId}`);

    // Find the order
    const order = await TakeAwayOrder.findOne({
      _id: orderId,
      branchId,
    }).populate("items.itemId", "nameEnglish nameArabic");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure order is in accepted status
    if (
      order.status !== "accepted" &&
      order.status !== "kot-generated" &&
      order.status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate KOT for this order status",
      });
    }

    // Get branch details
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Create KOT data
    const kotData = {
      orderDetails: {
        tokenNumber: order.tokenNumber, // Just the sequence part
        fullToken: order.fullToken,
        branchName: branch.name,
        orderDate: order.orderDate,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      },
      items: order.items.map((item) => ({
        name: item.itemId ? item.itemId.nameEnglish : item.name,
        nameArabic: item.itemId ? item.itemId.nameArabic : "",
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.totalAmount,
      notes: order.notes || "",
    };

    // Update order status to kot-generated
    order.status = "kot-generated";
    await order.save();

    res.json({
      success: true,
      message: "KOT generated successfully",
      data: kotData,
    });
  } catch (error) {
    console.error("Error generating KOT for takeaway order:", error);
    res.status(500).json({
      success: false,
      message: "Error generating KOT",
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

    console.log(
      `Fetching all takeaway orders for branch ${branchId} with filters:`,
      {
        status,
        startDate,
        endDate,
      }
    );

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

      query.orderDate = { $gte: start, $lte: end };
    }

    // Get orders
    const orders = await TakeAwayOrder.find(query).sort({
      orderDate: -1,
    });

    console.log(`Found ${orders.length} orders with applied filters`);

    // Populate item details
    const populatedOrders = await populateOrderItems(orders);

    res.json({
      success: true,
      data: populatedOrders,
    });
  } catch (error) {
    console.error("Error fetching all takeaway orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get specific order by ID
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

    console.log(`Fetching takeaway order ${orderId} for branch ${branchId}`);

    // Find the order
    const order = await TakeAwayOrder.findOne({
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
    console.error("Error fetching takeaway order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Helper function to populate items in orders
const populateOrderItems = async (orders) => {
  // Convert to plain objects to make them mutable
  const plainOrders = orders.map((order) => order.toObject());

  if (plainOrders.length === 0) {
    return [];
  }

  try {
    // Get all item IDs from the orders
    const itemIds = plainOrders
      .flatMap((order) => order.items.map((item) => item.itemId))
      .filter((id) => id); // Filter out any undefined/null IDs

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
        if (!item.itemId) return item;

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
  getAcceptedOrders,
  getOrdersByDate,
  updateOrderStatus,
  generateKOT,
  getAllOrders,
  getOrderById,
};
