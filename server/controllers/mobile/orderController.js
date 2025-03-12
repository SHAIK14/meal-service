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
