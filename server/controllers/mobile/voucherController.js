const Voucher = require("../../models/admin/voucher");
const Cart = require("../../models/Mobile/Cart");

/**
 * Validate a voucher code and calculate discount
 */
exports.validateVoucher = async (req, res) => {
  try {
    const { promoCode } = req.body;
    const userId = req.user._id;

    if (!promoCode) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    // Get cart total to calculate discount
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

    // Find valid voucher - Fix the query
    const voucher = await Voucher.findOne({
      promoCode: promoCode.toUpperCase(),
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired promo code",
      });
    }

    // Check if the voucher has reached its usage limit
    if (voucher.usedCount >= voucher.eligibleMembers) {
      return res.status(400).json({
        success: false,
        message: "This promo code has reached its usage limit",
      });
    }

    // Check if user has already used this voucher
    if (voucher.appliedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this promo code",
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
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

    return res.status(200).json({
      success: true,
      data: {
        voucherId: voucher._id,
        promoCode: voucher.promoCode,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxThreshold: voucher.maxThreshold,
        discountAmount: discountAmount,
        cartTotal: cartTotal,
        finalTotal: cartTotal - discountAmount,
      },
    });
  } catch (error) {
    console.error("Validate voucher error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate voucher",
    });
  }
};

/**
 * Apply voucher to order (this is just a validation step before order creation)
 */
exports.applyVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const userId = req.user._id;

    if (!voucherId) {
      return res.status(400).json({
        success: false,
        message: "Voucher ID is required",
      });
    }

    // Find valid voucher - Fix the query
    const voucher = await Voucher.findOne({
      _id: voucherId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired voucher",
      });
    }

    // Check if the voucher has reached its usage limit
    if (voucher.usedCount >= voucher.eligibleMembers) {
      return res.status(400).json({
        success: false,
        message: "This voucher has reached its usage limit",
      });
    }

    // Check if user has already used this voucher
    if (voucher.appliedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this voucher",
      });
    }

    // Get cart total to calculate discount
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

    // Calculate discount amount
    let discountAmount = 0;
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

    // Return success with discount info
    return res.status(200).json({
      success: true,
      data: {
        voucherId: voucher._id,
        promoCode: voucher.promoCode,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxThreshold: voucher.maxThreshold,
        discountAmount: discountAmount,
        cartTotal: cartTotal,
        finalTotal: cartTotal - discountAmount,
      },
    });
  } catch (error) {
    console.error("Apply voucher error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply voucher",
    });
  }
};
