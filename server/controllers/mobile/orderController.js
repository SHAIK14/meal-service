const Order = require("../../models/Mobile/Order");
const Cart = require("../../models/Mobile/Cart");
const Branch = require("../../models/admin/Branch");
const MobileUser = require("../../models/Mobile/MobileUser");

// Helper function to calculate distance between coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Prepare order for pickup
 */
exports.preparePickupOrder = async (req, res) => {
  try {
    const { branchId, addressId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!branchId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Branch ID and address ID are required",
      });
    }

    // Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.item",
      select: "nameEnglish price images",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get user address
    const user = await MobileUser.findById(userId);
    const address = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order object (not saving yet, just preparing for the frontend)
    const orderData = {
      user: userId,
      branch: branchId,
      items: cart.items.map((item) => ({
        item: item.item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryType: "pickup",
      totalAmount,
      branchDetails: {
        name: branch.name,
        address: branch.address.mainAddress,
        city: branch.address.city,
        state: branch.address.state,
        coordinates: branch.address.coordinates,
      },
    };

    return res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    console.error("Error preparing pickup order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to prepare pickup order",
    });
  }
};

/**
 * Prepare order for delivery
 */
exports.prepareDeliveryOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.item",
      select: "nameEnglish price images",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get user address
    const user = await MobileUser.findById(userId);
    const address = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Get all branches
    const branches = await Branch.find();

    // Find the nearest branch that can deliver to this address
    let nearestBranch = null;
    let shortestDistance = Infinity;

    branches.forEach((branch) => {
      const branchLat = branch.address.coordinates.latitude;
      const branchLng = branch.address.coordinates.longitude;
      const userLat = address.coordinates.latitude;
      const userLng = address.coordinates.longitude;

      const distance = calculateDistance(
        userLat,
        userLng,
        branchLat,
        branchLng
      );

      // Check if this branch is closer than the current nearest and can deliver
      if (distance < shortestDistance) {
        if (distance <= branch.serviceRadius) {
          nearestBranch = branch;
          shortestDistance = distance;
        }
      }
    });

    if (!nearestBranch) {
      return res.status(400).json({
        success: false,
        message: "No branches available for delivery to this location",
      });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order object (not saving yet, just preparing for the frontend)
    const orderData = {
      user: userId,
      branch: nearestBranch._id,
      items: cart.items.map((item) => ({
        item: item.item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryType: "delivery",
      deliveryAddress: {
        address: address.address,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        coordinates: address.coordinates,
      },
      totalAmount,
      branchDetails: {
        name: nearestBranch.name,
        address: nearestBranch.address.mainAddress,
        city: nearestBranch.address.city,
        state: nearestBranch.address.state,
        coordinates: nearestBranch.address.coordinates,
        distance: parseFloat(shortestDistance.toFixed(2)),
      },
    };

    return res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    console.error("Error preparing delivery order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to prepare delivery order",
    });
  }
};

// New functions for order tracking

/**
 * Get user's order history
 */
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Create base query
    const query = { user: userId };

    // Add status filter if provided
    if (status === "active") {
      // Active orders are pending, accepted, preparing, ready, out_for_delivery
      query.status = { $nin: ["completed", "delivered", "cancelled"] };
    } else if (status === "past") {
      // Past orders are completed, delivered, or cancelled
      query.status = { $in: ["completed", "delivered", "cancelled"] };
    } else if (status) {
      // Specific status filter
      query.status = status;
    }

    // Get total count
    const total = await Order.countDocuments(query);

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("branch", "name address")
      .select(
        "_id deliveryType status totalAmount discountAmount finalAmount items.quantity createdAt"
      );

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get order history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
    });
  }
};
/**
 * Get order details
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("branch", "name address serviceRadius")
      .populate("items.item", "nameEnglish nameArabic image type prices");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

/**
 * Get latest order (most recent active order)
 */
/**
 * Get latest order (most recent active order)
 */
exports.getLatestOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find latest non-completed, non-canceled order
    const order = await Order.findOne({
      user: userId,
      status: { $nin: ["completed", "delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 }) // newest first
      .populate("branch", "name address serviceRadius")
      .populate("items.item", "nameEnglish nameArabic image type prices");

    if (!order) {
      // Instead of 404, return success with empty data
      return res.status(200).json({
        success: true,
        active: false,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      active: true,
      data: order,
    });
  } catch (error) {
    console.error("Get latest order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest order",
    });
  }
};

/**
 * Cancel an order (only allowed for pending orders)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be canceled (only pending orders)
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

/**
 * Get order status with detailed information
 */
exports.getOrderStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("branch", "name address")
      .select(
        "_id deliveryType status totalAmount discountAmount finalAmount items createdAt"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get status text based on delivery type and status
    let statusText = "";

    if (order.deliveryType === "pickup") {
      switch (order.status) {
        case "pending":
          statusText = "Waiting for restaurant to accept your order";
          break;
        case "accepted":
          statusText = "Restaurant is preparing your order";
          break;
        case "preparing":
          statusText = "Your order is being prepared";
          break;
        case "ready":
          statusText = "Your order is ready for pickup";
          break;
        case "completed":
          statusText = "Order completed";
          break;
        case "cancelled":
          statusText = "Order cancelled";
          break;
        default:
          statusText = "Order status unknown";
      }
    } else {
      // delivery
      switch (order.status) {
        case "pending":
          statusText = "Waiting for restaurant to accept your order";
          break;
        case "accepted":
          statusText = "Restaurant is preparing your order";
          break;
        case "preparing":
          statusText = "Your order is being prepared";
          break;
        case "ready":
          statusText = "Your order is ready for delivery";
          break;
        case "out_for_delivery":
          statusText = "Your order is on the way";
          break;
        case "delivered":
          statusText = "Order delivered";
          break;
        case "cancelled":
          statusText = "Order cancelled";
          break;
        default:
          statusText = "Order status unknown";
      }
    }

    // Calculate estimated time (if not completed or cancelled)
    let estimatedMinutes = 0;
    let estimatedTime = null;

    if (!["completed", "delivered", "cancelled"].includes(order.status)) {
      // Base preparation time in minutes
      const basePreparationTime = 15;

      // Additional time per item
      const additionalTimePerItem = 2;

      // Calculate total items quantity
      const totalItems = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Calculate preparation time
      const preparationTime =
        basePreparationTime + additionalTimePerItem * totalItems;

      if (order.status === "pending") {
        estimatedMinutes = preparationTime + 10; // Add time for acceptance
      } else if (order.status === "accepted") {
        estimatedMinutes = preparationTime;
      } else if (order.status === "preparing") {
        estimatedMinutes = preparationTime / 2; // Half the preparation time left
      } else if (order.status === "ready") {
        estimatedMinutes = order.deliveryType === "delivery" ? 20 : 0;
      } else if (order.status === "out_for_delivery") {
        estimatedMinutes = 10;
      }

      estimatedTime = new Date(new Date().getTime() + estimatedMinutes * 60000);
    }

    return res.status(200).json({
      success: true,
      data: {
        order: {
          _id: order._id,
          deliveryType: order.deliveryType,
          status: order.status,
          statusText,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount,
          createdAt: order.createdAt,
          items: order.items,
          branch: order.branch,
        },
        estimatedTime: estimatedTime ? estimatedTime.toISOString() : null,
        estimatedMinutes: estimatedMinutes,
      },
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
    });
  }
};
