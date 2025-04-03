const Cart = require("../../models/Mobile/Cart");
const Order = require("../../models/Mobile/Order");
const Voucher = require("../../models/admin/voucher");
const Branch = require("../../models/admin/Branch");
const MobileUser = require("../../models/Mobile/MobileUser");

/**
 * Get available payment methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    // We're returning mock payment methods for now
    // In a production app, these could be fetched from a database or payment provider API
    const paymentMethods = [
      {
        id: "credit_card",
        name: "Credit/Debit Card",
        icon: "credit-card", // Icon name for frontend
        enabled: true,
      },
      {
        id: "apple_pay",
        name: "Apple Pay",
        icon: "apple", // Icon name for frontend
        enabled: true,
      },
      {
        id: "mada",
        name: "MADA",
        icon: "credit-card", // Icon name for frontend
        enabled: true,
      },
      {
        id: "stc_pay",
        name: "STC Pay",
        icon: "mobile", // Icon name for frontend
        enabled: true,
      },
      {
        id: "cash",
        name: "Cash on Delivery",
        icon: "cash", // Icon name for frontend
        enabled: true,
        deliveryOnly: true, // Only available for delivery orders
      },
    ];

    return res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
    });
  }
};

/**
 * Process payment (mock implementation)
 */
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, voucherId } = req.body;
    const userId = req.user._id;

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
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

    // Calculate cart total
    const cartTotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Apply voucher if provided
    let discountAmount = 0;
    let finalTotal = cartTotal;
    let appliedVoucher = null;

    if (voucherId) {
      // Find valid voucher - Fixed query
      const voucher = await Voucher.findOne({
        _id: voucherId,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        isActive: true,
      });

      if (voucher) {
        // Check if voucher has reached usage limit
        if (voucher.usedCount >= voucher.eligibleMembers) {
          return res.status(400).json({
            success: false,
            message: "This promo code has reached its usage limit",
          });
        }

        // Check if user has already used this voucher
        if (!voucher.appliedUsers.includes(userId)) {
          // Calculate discount amount
          if (voucher.discountType === "percentage") {
            discountAmount = (cartTotal * voucher.discountValue) / 100;

            // Check if discount exceeds max threshold for percentage discounts
            if (voucher.maxThreshold && discountAmount > voucher.maxThreshold) {
              discountAmount = voucher.maxThreshold;
            }
          } else {
            // Flat discount
            discountAmount = voucher.discountValue;

            // Make sure discount doesn't exceed cart total
            if (discountAmount > cartTotal) {
              discountAmount = cartTotal;
            }
          }

          finalTotal = cartTotal - discountAmount;
          appliedVoucher = voucher;
        }
      }
    }

    // For demonstration, we're just mocking a successful payment
    // In a real application, you would integrate with a payment gateway here
    const paymentResult = {
      success: true,
      transactionId: "mock_" + Date.now().toString(),
      amount: finalTotal,
      currency: "SAR", // Saudi Riyal
      paymentMethod: paymentMethod,
    };

    // Return payment result
    return res.status(200).json({
      success: true,
      data: {
        payment: paymentResult,
        cartTotal,
        discountAmount,
        finalTotal,
        voucherId: appliedVoucher ? appliedVoucher._id : null,
      },
    });
  } catch (error) {
    console.error("Process payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};

/**
 * Finalize order after payment
 */
exports.finalizeOrder = async (req, res) => {
  try {
    const {
      deliveryType,
      branchId,
      addressId,
      paymentMethod,
      voucherId,
      paymentDetails,
      notes,
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!deliveryType || !branchId || !paymentMethod || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Missing required order information",
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

    // Calculate cart total
    const cartTotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Apply voucher if provided
    let discountAmount = 0;
    let finalTotal = cartTotal;

    if (voucherId) {
      // Find valid voucher - Fixed query
      const voucher = await Voucher.findOne({
        _id: voucherId,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        isActive: true,
      });

      if (voucher) {
        // Check if voucher has reached usage limit
        if (voucher.usedCount >= voucher.eligibleMembers) {
          return res.status(400).json({
            success: false,
            message: "This promo code has reached its usage limit",
          });
        }

        if (!voucher.appliedUsers.includes(userId)) {
          // Calculate discount amount
          if (voucher.discountType === "percentage") {
            discountAmount = (cartTotal * voucher.discountValue) / 100;

            // Check if discount exceeds max threshold for percentage discounts
            if (voucher.maxThreshold && discountAmount > voucher.maxThreshold) {
              discountAmount = voucher.maxThreshold;
            }
          } else {
            // Flat discount
            discountAmount = voucher.discountValue;

            // Make sure discount doesn't exceed cart total
            if (discountAmount > cartTotal) {
              discountAmount = cartTotal;
            }
          }

          finalTotal = cartTotal - discountAmount;

          // Update voucher usage
          voucher.usedCount += 1;
          voucher.appliedUsers.push(userId);
          voucher.usedInOrders.push({
            orderId: null, // Will update this after order creation
            discountApplied: discountAmount,
          });
          await voucher.save();
        }
      }
    }

    // Create new order
    const order = new Order({
      user: userId,
      branch: branchId,
      items: cart.items.map((item) => ({
        item: item.item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryType,
      deliveryAddress:
        deliveryType === "delivery"
          ? {
              address: address.address,
              apartment: address.apartment,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              coordinates: address.coordinates,
            }
          : null,
      status: "pending",
      totalAmount: cartTotal,
      discountAmount: discountAmount,
      finalAmount: finalTotal,
      paymentStatus: "completed", // Since we're mocking payment
      paymentMethod,
      paymentDetails: paymentDetails || {
        transactionId: "mock_" + Date.now().toString(),
      },
      voucherId: voucherId || null,
      notes: notes || "",
    });

    // Save order
    await order.save();

    // If voucher was applied, update the order ID
    if (voucherId) {
      const voucher = await Voucher.findById(voucherId);
      if (voucher) {
        const orderEntry = voucher.usedInOrders.find((o) => o.orderId === null);
        if (orderEntry) {
          orderEntry.orderId = order._id;
          await voucher.save();
        }
      }
    }

    // Clear the cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );

    // Return the created order
    return res.status(201).json({
      success: true,
      data: {
        orderId: order._id
          .toString()
          .substring(order._id.toString().length - 8),
        status: order.status,
        totalAmount: cartTotal,
        discountAmount,
        finalAmount: finalTotal,
        deliveryType,
        branch: {
          _id: branch._id,
          name: branch.name,
          address: branch.address,
        },
      },
    });
  } catch (error) {
    console.error("Finalize order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};
