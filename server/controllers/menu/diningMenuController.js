const Branch = require("../../models/admin/Branch");
const Dining = require("../../models/admin/DiningConfig");
const DiningOrder = require("../../models/menu/DiningOrder");
const DiningCategory = require("../../models/admin/DiningCategory");
const Item = require("../../models/admin/Item");
const Session = require("../../models/menu/session");
const socketService = require("../../services/socket/socketService");

// Validate QR code access
// Modify validateDiningAccess function
const validateDiningAccess = async (req, res) => {
  try {
    const { pincode, tableName } = req.params;

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Find dining config
    const diningConfig = await Dining.findOne({
      branchId: branch._id,
      "tables.name": tableName,
      "tables.isEnabled": true,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Table not found or disabled",
      });
    }

    // Check for active session
    let session = await Session.findOne({
      branchId: branch._id,
      tableName,
      status: "active",
    });

    // Prepare the response object with branch info
    const responseObj = {
      success: true,
      branch: {
        id: branch._id,
        name: branch.name,
        address: branch.address,
        coordinates: branch.address.coordinates,
        diningRadius: diningConfig.diningRadius,
      },
      sessionExists: !!session,
    };

    // If session exists, fetch orders and include in response
    if (session) {
      const sessionOrders = await DiningOrder.find({
        sessionId: session._id,
      }).sort({ createdAt: -1 });

      responseObj.session = {
        id: session._id,
        totalAmount: session.totalAmount,
        paymentRequested: session.paymentRequested,
        customerName: session.customerName || "Guest", // Fallback for legacy sessions
        orders: sessionOrders,
      };
    }

    // Send a single response with all the data
    return res.json(responseObj);
  } catch (error) {
    console.error("Error in validateDiningAccess:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const startSession = async (req, res) => {
  try {
    const { pincode, tableName, customerName, customerPhone, customerDob } =
      req.body;

    // Validate required fields
    if (!pincode || !tableName || !customerName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find branch by pincode
    const branch = await Branch.findOne({ "address.pincode": pincode });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch code",
      });
    }

    // Find dining config to verify table
    const diningConfig = await Dining.findOne({
      branchId: branch._id,
      "tables.name": tableName,
      "tables.isEnabled": true,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Table not found or disabled",
      });
    }

    // Check if session already exists
    let session = await Session.findOne({
      branchId: branch._id,
      tableName,
      status: "active",
    });

    if (session) {
      return res.json({
        success: true,
        message: "Session already exists",
        session: {
          id: session._id,
          totalAmount: session.totalAmount,
          paymentRequested: session.paymentRequested,
          customerName: session.customerName,
        },
      });
    }

    // Create new session
    session = new Session({
      branchId: branch._id,
      tableName,
      customerName,
      customerPhone: customerPhone || "",
      customerDob: customerDob ? new Date(customerDob) : null,
    });

    await session.save();

    // Update table status to occupied
    const tableIndex = diningConfig.tables.findIndex(
      (t) => t.name === tableName
    );
    if (tableIndex !== -1) {
      diningConfig.tables[tableIndex].status = "occupied";
      await diningConfig.save();

      // Emit socket event for table status update
      const kitchenRoom = `kitchen:${branch._id}`;
      const tableId = diningConfig.tables[tableIndex]._id;
      socketService.emitToRoom(kitchenRoom, "table_status_updated", {
        tableId,
        tableName,
        status: "occupied",
        customerName,
      });
      console.log(`Table ${tableName} marked as occupied by ${customerName}`);
    }

    res.status(201).json({
      success: true,
      message: "Session started successfully",
      session: {
        id: session._id,
        totalAmount: session.totalAmount,
        paymentRequested: session.paymentRequested,
        customerName: session.customerName,
      },
    });
  } catch (error) {
    console.error("Error in startSession:", error);
    res.status(500).json({
      success: false,
      message: "Error starting session",
      error: error.message,
    });
  }
};
// Create new dining order
const createDiningOrder = async (req, res) => {
  try {
    const { branchId, tableName, items, totalAmount, userLocation, sessionId } =
      req.body;

    // Validate required fields
    if (
      !branchId ||
      !tableName ||
      !items ||
      !totalAmount ||
      !userLocation ||
      !sessionId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate session
    const session = await Session.findOne({
      _id: sessionId,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    // Find branch and dining config
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const diningConfig = await Dining.findOne({
      branchId,
      "tables.name": tableName,
      "tables.isEnabled": true,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Table not found or disabled",
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      branch.address.coordinates.latitude,
      branch.address.coordinates.longitude
    );

    // Check if user is within dining radius
    if (distance > diningConfig.diningRadius) {
      return res.status(400).json({
        success: false,
        message: "You are outside the restaurant's dining radius",
      });
    }

    // Create order with session reference
    const diningOrder = new DiningOrder({
      sessionId,
      branchId,
      tableName,
      items,
      totalAmount,
      status: "pending",
      userLocation,
    });

    // Save order and update session
    await diningOrder.save();
    session.totalAmount += totalAmount;
    await session.save();
    const kitchenRoom = `kitchen:${branchId}`;
    socketService.emitToRoom(kitchenRoom, "new_order", {
      orderId: diningOrder._id,
      tableId: tableName,
      tableName: tableName,
      items: diningOrder.items,
      totalAmount: diningOrder.totalAmount,
      status: diningOrder.status,
      createdAt: diningOrder.createdAt,
    });
    console.log(`New order created and emitted to ${kitchenRoom}`);

    res.status(201).json({
      success: true,
      message: "Dining order created successfully",
      data: {
        order: diningOrder,
        sessionTotal: session.totalAmount,
      },
    });
  } catch (error) {
    console.error("Error in createDiningOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating dining order",
      error: error.message,
    });
  }
};
const requestPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.paymentRequested) {
      return res.status(400).json({
        success: false,
        message: "Payment already requested",
      });
    }

    session.paymentRequested = true;
    await session.save();
    const branchId = session.branchId;
    const tableName = session.tableName;

    // Emit socket events for payment request
    const kitchenRoom = `kitchen:${branchId}`;
    const tableRoom = `table:${branchId}:${tableName}`;

    // Emit to kitchen staff
    socketService.emitToRoom(kitchenRoom, "payment_requested", {
      sessionId: session._id,
      tableName: tableName,
      totalAmount: session.totalAmount,
    });

    // Emit to customer table for real-time UI update
    socketService.emitToRoom(tableRoom, "payment_request_confirmed", {
      sessionId: session._id,
      totalAmount: session.totalAmount,
    });

    console.log(
      `Payment requested for table ${tableName} and emitted to relevant rooms`
    );

    res.json({
      success: true,
      message: "Payment requested successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error in requestPayment:", error);
    res.status(500).json({
      success: false,
      message: "Error requesting payment",
    });
  }
};

// Get all dining categories with items for a branch
const getDiningMenuItems = async (req, res) => {
  try {
    const { branchId } = req.params;
    // console.log("Fetching menu items for branchId:", branchId);

    // Get all active categories with their items
    const categories = await DiningCategory.find({ active: true }).populate({
      path: "items",
      match: { available: true }, // Only get available items
    });

    // console.log("Categories found:", categories.length);

    // Just format the basic data we need
    const formattedCategories = categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        image: category.image,
        items: category.items.map((item) => ({
          id: item._id,
          nameEnglish: item.nameEnglish,
          nameArabic: item.nameArabic,
          image: item.image,
          price: item.prices[0].sellingPrice, // Take the first price
          type: item.type,
          calories: item.calories,
        })),
      }))
      .filter((category) => category.items.length > 0); // Only return categories with items

    // console.log(
    //   "Sending categories with items:",
    //   formattedCategories.map((cat) => `${cat.name}: ${cat.items.length} items`)
    // );

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("Error in getDiningMenuItems:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu items",
      error: error.message,
    });
  }
};

// Get specific item details
const getMenuItemDetails = async (req, res) => {
  try {
    const { branchId, itemId } = req.params;

    // Get branch for currency
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Get item with full details
    const item = await Item.findOne({
      _id: itemId,
      available: true,
      "services.dining": true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable",
      });
    }

    // Find correct price for branch currency
    const price = item.prices.find(
      (p) => p.currency === branch.address.currency
    );

    const formattedItem = {
      id: item._id,
      nameEnglish: item.nameEnglish,
      nameArabic: item.nameArabic,
      descriptionEnglish: item.descriptionEnglish,
      descriptionArabic: item.descriptionArabic,
      image: item.image,
      nutritionFacts: {
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      },
      type: item.type,
      price: price?.sellingPrice || 0,
      discountPrice: price?.discountPrice,
      currency: branch.address.currency,
    };

    res.json({
      success: true,
      data: formattedItem,
    });
  } catch (error) {
    console.error("Error in getMenuItemDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching item details",
      error: error.message,
    });
  }
};

// Add items to an existing order
const addItemsToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    // Find the order
    const order = await DiningOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order is in progress
    if (order.status !== "inProgress") {
      return res.status(400).json({
        success: false,
        message: "Cannot add items to a completed or cancelled order",
      });
    }

    // Add new items to the order
    items.forEach((newItem) => {
      const existingItem = order.items.find(
        (item) => item.itemId === newItem.itemId
      );
      if (existingItem) {
        // If the item already exists, update the quantity
        existingItem.quantity += newItem.quantity;
      } else {
        // If the item doesn't exist, add it to the order
        order.items.push(newItem);
      }
    });

    // Recalculate the total amount
    order.totalAmount = order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      message: "Items added to order successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in addItemsToOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error adding items to order",
      error: error.message,
    });
  }
};

// Get all orders for a branch
// In diningMenuController.js, update the getBranchOrders function:

const getBranchOrders = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status } = req.query;

    console.log("1. Received request with branchId:", branchId);
    console.log("   Status filter:", status || "none");

    // Validate branchId
    if (!branchId) {
      console.log("Error: Missing branchId");
      return res.status(400).json({
        success: false,
        message: "Branch ID is required",
      });
    }

    // Build query
    const query = { branchId };
    if (status) {
      query.status = status;
    }

    // Find orders and populate item details
    const orders = await DiningOrder.find(query)
      .populate({
        path: "items.itemId",
        model: "Item",
        select: "nameEnglish nameArabic image",
      })
      .sort({ createdAt: -1 });

    // Transform orders to include item details
    const transformedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map((item) => ({
        _id: item._id,
        itemId: item.itemId._id,
        nameEnglish: item.itemId.nameEnglish,
        nameArabic: item.itemId.nameArabic,
        image: item.itemId.image,
        price: item.price,
        quantity: item.quantity,
        cancelledQuantity: item.cancelledQuantity || 0, // Add this
        returnedQuantity: item.returnedQuantity || 0, // Add this
        cancelReason: item.cancelReason, // Optionally add these too
        returnReason: item.returnReason,
        cancelledAt: item.cancelledAt,
        returnedAt: item.returnedAt,
      }));
      return orderObj;
    });

    // Send response
    const response = {
      success: true,
      data: {
        orders: transformedOrders,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("ERROR in getBranchOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Simple distance calculation function using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["accepted", "served"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update order status
    const order = await DiningOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate({
      path: "items.itemId",
      select: "nameEnglish nameArabic image",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // Emit socket event for order status update
    const kitchenRoom = `kitchen:${order.branchId}`;
    const tableRoom = `table:${order.branchId}:${order.tableName}`;
    // Emit to kitchen staff
    socketService.emitToRoom(kitchenRoom, "order_status_updated", {
      orderId: order._id,
      tableName: order.tableName,
      status: status,
    });
    console.log(`Order status updated and emitted to ${kitchenRoom}`);
    // Emit to customer table
    socketService.emitToRoom(tableRoom, "order_status_updated", {
      orderId: order._id,
      status: status,
    });
    console.log(`Order status updated and emitted to ${tableRoom}`);

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: order,
    });
  } catch (error) {
    console.error(`Error updating order status:`, error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};
module.exports = {
  validateDiningAccess,
  getDiningMenuItems,
  getMenuItemDetails,
  createDiningOrder,
  addItemsToOrder,
  getBranchOrders,
  updateOrderStatus,
  requestPayment,
  startSession,
};
