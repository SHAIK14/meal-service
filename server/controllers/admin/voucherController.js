const Voucher = require("../../models/admin/voucher");

exports.createVoucher = async (req, res) => {
  try {
    const {
      promoCode,
      startDate,
      endDate,
      eligibleMembers,
      discountType,
      discountValue,
      maxThreshold,
      eligiblePlans,
    } = req.body;

    const currentDate = new Date();
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Set end time to end of day (23:59:59.999)
    endDateTime.setHours(23, 59, 59, 999);

    // Validate dates
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check if promo code already exists
    const existingVoucher = await Voucher.findOne({ promoCode });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    const voucher = new Voucher({
      promoCode,
      startDate: startDateTime,
      endDate: endDateTime,
      eligibleMembers: parseInt(eligibleMembers),
      discountType,
      discountValue: parseFloat(discountValue),
      maxThreshold:
        discountType === "percentage" ? parseFloat(maxThreshold) : null,
      eligiblePlans,
      isActive: true,
      usedCount: 0,
      appliedUsers: [],
    });

    await voucher.save();

    res.status(201).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create voucher",
    });
  }
};

// Modify getVouchers to include additional information
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort("-createdAt").lean(); // Use lean() for better performance

    const currentDate = new Date();

    // Add status information to each voucher
    const enrichedVouchers = vouchers.map((voucher) => {
      const status = getVoucherStatus(voucher.startDate, voucher.endDate);
      return {
        ...voucher,
        status: status.status,
        statusText: status.text,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedVouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to get voucher status
const getVoucherStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return {
      status: "upcoming",
      text: `Starts in ${days} day${days !== 1 ? "s" : ""}`,
    };
  }

  if (now > end) {
    return { status: "expired", text: "Expired" };
  }

  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return {
    status: "active",
    text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
  };
};

// The rest of the controllers remain the same...

exports.toggleVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Just validate voucher, don't apply it
exports.validateVoucher = async (req, res) => {
  try {
    const { promoCode, planId } = req.body;
    const userId = req.user._id; // Get from auth middleware

    const voucher = await Voucher.findOne({ promoCode });
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

    if (voucher.appliedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this promo code",
      });
    }

    if (
      voucher.eligiblePlans.length > 0 &&
      !voucher.eligiblePlans.includes(planId)
    ) {
      return res.status(400).json({
        success: false,
        message: "This promo code is not valid for the selected plan",
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
