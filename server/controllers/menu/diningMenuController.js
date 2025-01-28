const Branch = require("../../models/admin/Branch");
const Dining = require("../../models/admin/DiningConfig");
const DiningOrder = require("../../models/menu/DiningOrder");
const DiningCategory = require("../../models/admin/DiningCategory");
const Item = require("../../models/admin/Item");

// Validate QR code access
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

    // Check for inProgress orders
    const inProgressOrder = await DiningOrder.findOne({
      branchId: branch._id,
      tableName,
      status: "inProgress",
    });

    // Modified response to include dining radius, coordinates, and inProgress order
    res.json({
      success: true,
      branch: {
        id: branch._id,
        name: branch.name,
        address: branch.address,
        coordinates: branch.address.coordinates,
        diningRadius: diningConfig.diningRadius,
      },
      inProgressOrder: inProgressOrder || null,
    });
  } catch (error) {
    console.error("Error in validateDiningAccess:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create new dining order
const createDiningOrder = async (req, res) => {
  try {
    const { branchId, tableName, items, totalAmount, userLocation } = req.body;

    console.log("Creating order with data:", {
      branchId,
      tableName,
      items,
      totalAmount,
      userLocation,
    });

    // Validate required fields
    if (!branchId || !tableName || !items || !totalAmount || !userLocation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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

    // Create order
    const diningOrder = new DiningOrder({
      branchId,
      tableName,
      items,
      totalAmount,
      status: "pending",
      userLocation,
    });

    // Save order to database
    await diningOrder.save();

    console.log("Order created successfully:", diningOrder);

    res.status(201).json({
      success: true,
      message: "Dining order created successfully",
      data: diningOrder,
    });
  } catch (error) {
    console.error("Error in createDiningOrder:", error);

    // Log the full error for debugging
    if (error.name === "ValidationError") {
      console.error("Validation Error Details:", error.errors);
    }

    res.status(500).json({
      success: false,
      message: "Error creating dining order",
      error: error.message,
    });
  }
};

// Get all dining categories with items for a branch
const getDiningMenuItems = async (req, res) => {
  try {
    const { branchId } = req.params;
    console.log("Fetching menu items for branchId:", branchId);

    // Get all active categories with their items
    const categories = await DiningCategory.find({ active: true }).populate({
      path: "items",
      match: { available: true }, // Only get available items
    });

    console.log("Categories found:", categories.length);

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

    console.log(
      "Sending categories with items:",
      formattedCategories.map((cat) => `${cat.name}: ${cat.items.length} items`)
    );

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
};
