const Voucher = require("../models/admin/voucher");

exports.getAvailableVouchers = async (req, res) => {
  try {
    console.log("Getting available vouchers for user:", req.user._id);

    // First, get all vouchers to see what exists
    const allVouchers = await Voucher.find({});
    console.log("Total vouchers in database:", allVouchers.length);

    if (allVouchers.length === 0) {
      console.log("No vouchers exist in the database");
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const currentDate = new Date();
    console.log("Current date:", currentDate);

    // Check each condition separately
    const activeVouchers = allVouchers.filter((v) => v.isActive);
    console.log("Active vouchers:", activeVouchers.length);

    const dateValidVouchers = activeVouchers.filter(
      (v) => currentDate >= v.startDate && currentDate <= v.endDate
    );
    console.log("Date valid vouchers:", dateValidVouchers.length);

    const usageLimitVouchers = dateValidVouchers.filter(
      (v) => v.usedCount < v.eligibleMembers
    );
    console.log("Usage limit valid vouchers:", usageLimitVouchers.length);

    // const userEligibleVouchers = usageLimitVouchers.filter(
    //   (v) => !v.appliedUsers.includes(req.user._id)
    // );
    // console.log("User eligible vouchers:", userEligibleVouchers.length);

    // Return the final filtered vouchers
    const finalVouchers = usageLimitVouchers.map((v) => ({
      promoCode: v.promoCode,
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxThreshold: v.maxThreshold,
      description: v.description,
    }));

    console.log("Final vouchers to return:", finalVouchers);

    res.status(200).json({
      success: true,
      data: finalVouchers,
    });
  } catch (error) {
    console.error("Error in getAvailableVouchers:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Validate voucher
exports.validateVoucher = async (req, res) => {
  try {
    const { promoCode } = req.body;
    const userId = req.user._id;

    const voucher = await Voucher.findOne({
      promoCode: promoCode.toUpperCase(),
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid promo code",
      });
    }

    // Basic validations
    if (!voucher.isActive) {
      return res.status(400).json({
        success: false,
        message: "This promo code is no longer active",
      });
    }

    const currentDate = new Date();
    if (currentDate < voucher.startDate || currentDate > voucher.endDate) {
      return res.status(400).json({
        success: false,
        message: "This promo code has expired or is not yet valid",
      });
    }

    if (voucher.usedCount >= voucher.eligibleMembers) {
      return res.status(400).json({
        success: false,
        message: "This promo code has reached its maximum usage limit",
      });
    }

    // if (voucher.appliedUsers.includes(userId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You have already used this promo code",
    //   });
    // }

    // Return voucher details if valid
    res.status(200).json({
      success: true,
      data: {
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxThreshold: voucher.maxThreshold,
      },
    });
  } catch (error) {
    console.error("Error in validateVoucher:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
