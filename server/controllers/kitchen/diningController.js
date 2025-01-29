const Dining = require("../../models/admin/DiningConfig");
const Session = require("../../models/menu/session");
const DiningOrder = require("../../models/menu/DiningOrder");

exports.getBranchTables = async (req, res) => {
  try {
    const branchId = req.branch._id;
    console.log("Getting tables for branch:", branchId);

    const diningConfig = await Dining.findOne({ branchId });
    console.log("Found dining config:", diningConfig);

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "No dining configuration found for this branch",
      });
    }

    // Filter only enabled tables
    const enabledTables = diningConfig.tables.filter(
      (table) => table.isEnabled
    );
    console.log("Enabled tables:", enabledTables);

    // Format response - now including status
    const formattedTables = enabledTables.map((table) => ({
      id: table._id,
      name: table.name,
      customUrl: table.customUrl,
      qrCode: table.qrCode,
      status: table.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    console.error("Error fetching branch tables:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
      error: error.message,
    });
  }
};

// New function to update table status
exports.updateTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status } = req.body;
    const branchId = req.branch._id;

    // Validate status
    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'available' or 'occupied'",
      });
    }

    // Find and update table status
    const diningConfig = await Dining.findOne({
      branchId,
      "tables._id": tableId,
    });

    if (!diningConfig) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Update the specific table's status
    const result = await Dining.updateOne(
      {
        branchId,
        "tables._id": tableId,
      },
      {
        $set: { "tables.$.status": status },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update table status",
      });
    }

    res.json({
      success: true,
      message: `Table status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating table status",
      error: error.message,
    });
  }
};
exports.getTableSession = async (req, res) => {
  try {
    const { tableName } = req.params;
    const branchId = req.branch._id;

    // Find active session for table
    const session = await Session.findOne({
      branchId,
      tableName,
      status: "active",
    });

    if (!session) {
      return res.json({
        success: true,
        data: null,
      });
    }

    // Get all orders for this session
    const orders = await DiningOrder.find({
      sessionId: session._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        session,
        orders,
      },
    });
  } catch (error) {
    console.error("Error in getTableSession:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching table session",
    });
  }
};

// Complete session
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const branchId = req.branch._id;

    // Find and update session
    const session = await Session.findOne({
      _id: sessionId,
      branchId,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Active session not found",
      });
    }

    // Check if all orders are served
    const pendingOrders = await DiningOrder.exists({
      sessionId,
      status: { $ne: "served" },
    });

    if (pendingOrders) {
      return res.status(400).json({
        success: false,
        message: "Cannot complete session with pending orders",
      });
    }

    // Update session status
    session.status = "completed";
    await session.save();

    // Update table status
    await Dining.updateOne(
      {
        branchId,
        "tables.name": session.tableName,
      },
      {
        $set: { "tables.$.status": "available" },
      }
    );

    res.json({
      success: true,
      message: "Session completed successfully",
    });
  } catch (error) {
    console.error("Error in completeSession:", error);
    res.status(500).json({
      success: false,
      message: "Error completing session",
    });
  }
};

// Generate KOT for unserved orders
exports.generateKOT = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const branchId = req.branch._id;

    // Get all unserved orders
    const orders = await DiningOrder.find({
      sessionId,
      status: { $ne: "served" },
    }).populate("items.itemId", "nameEnglish nameArabic");

    if (!orders.length) {
      return res.status(400).json({
        success: false,
        message: "No unserved orders found",
      });
    }

    // Format orders for KOT
    const kotData = {
      sessionId,
      orders: orders.map((order) => ({
        orderId: order._id,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          notes: item.notes,
        })),
        status: order.status,
        createdAt: order.createdAt,
      })),
    };

    res.json({
      success: true,
      data: kotData,
    });
  } catch (error) {
    console.error("Error in generateKOT:", error);
    res.status(500).json({
      success: false,
      message: "Error generating KOT",
    });
  }
};
