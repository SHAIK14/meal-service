// controllers/admin/adminUserController.js
const User = require("../../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, isSubscribed } = req.query;
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by subscription status
    if (isSubscribed !== undefined) {
      query.isSubscribed = isSubscribed === "true";
    }

    const users = await User.find(query)
      .select(
        "phoneNumber firstName lastName email status address isSubscribed lastSubscriptionDate lastLogin createdAt"
      )
      .populate({
        path: "subscriptions.active",
        select: "planType startDate endDate status amount",
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: "subscriptions.active",
        select: "planType startDate endDate status amount",
      })
      .populate({
        path: "subscriptions.history",
        select: "planType startDate endDate status amount",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        status: user.status,
        address: user.address,
        isSubscribed: user.isSubscribed,
        lastSubscriptionDate: user.lastSubscriptionDate,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        subscriptions: {
          active: user.subscriptions.active,
          history: user.subscriptions.history,
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserDetailsById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active subscribers
    const activeSubscribers = await User.countDocuments({ isSubscribed: true });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    // Get users by status
    const statusCounts = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get users registered in the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: last7Days },
    });

    res.json({
      totalUsers,
      activeSubscribers,
      newUsersToday,
      newUsersLast7Days,
      statusBreakdown: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
