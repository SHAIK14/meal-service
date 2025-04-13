const Dining = require("../../models/admin/DiningConfig");
const Session = require("../../models/menu/session");
const DiningOrder = require("../../models/menu/DiningOrder");
const Branch = require("../../models/admin/Branch");
const socketService = require("../../services/socket/socketService");
exports.getBranchTables = async (req, res) => {
  try {
    const branchId = req.branch._id;
    // console.log("Getting tables for branch:", branchId);

    const diningConfig = await Dining.findOne({ branchId });
    // console.log("Found dining config:", diningConfig);

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
    // console.log("Enabled tables:", enabledTables);

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
    const table = diningConfig.tables.find((t) => t._id.toString() === tableId);
    const tableName = table ? table.name : null;

    // Emit socket event for table status update
    if (tableName) {
      const kitchenRoom = `kitchen:${branchId}`;
      socketService.emitToRoom(kitchenRoom, "table_status_updated", {
        tableId,
        tableName,
        status,
      });
      console.log(`Table status updated and emitted to ${kitchenRoom}`);
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

    // Only update session status, don't change table status
    session.status = "completed";
    await session.save();
    // Emit socket event for session completion
    const kitchenRoom = `kitchen:${branchId}`;
    const tableRoom = `table:${branchId}:${session.tableName}`;

    socketService.emitToRoom(kitchenRoom, "session_completed", {
      sessionId: session._id,
      tableName: session.tableName,
    });
    console.log(`Session completed and emitted to ${kitchenRoom}`);

    socketService.emitToRoom(tableRoom, "session_completed", {
      sessionId: session._id,
    });

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const branchId = req.branch._id;

    // Validate status
    if (
      ![
        "admin_approved",
        "in_preparation",
        "ready_for_pickup",
        "served",
        "canceled",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find order
    const order = await DiningOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status and add timestamp
    order.status = status;
    order.statusTimestamps = {
      ...order.statusTimestamps,
      [status]: new Date(),
    };
    await order.save();

    // Emit to kitchen staff - INCLUDE FULL ORDER DETAILS
    const kitchenRoom = `kitchen:${branchId}`;

    // For admin_approved, we need to send both events
    if (status === "admin_approved") {
      // Send the full order data for new_order event
      const orderData = {
        orderId: order._id,
        tableName: order.tableName,
        status: status,
        items: order.items, // Include complete items array with cancelled quantities
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      };
      console.log(
        "Emitting new_order event to kitchen with data:",
        JSON.stringify(orderData)
      );
      console.log(
        "Items details for kitchen:",
        JSON.stringify(orderData.items)
      );
      socketService.emitToRoom(kitchenRoom, "new_order", orderData);
    }

    // Standard status update event
    socketService.emitToRoom(kitchenRoom, "order_status_updated", {
      orderId: order._id,
      tableName: order.tableName,
      status: status,
      timestamp: order.statusTimestamps[status],
    });

    // If status is seen by customer, map it correctly and notify customer
    if (["admin_approved", "served", "canceled"].includes(status)) {
      const tableRoom = `table:${branchId}:${order.tableName}`;
      // Map admin_approved to accepted for customer
      const customerStatus = status === "admin_approved" ? "accepted" : status;

      socketService.emitToRoom(tableRoom, "order_status_updated", {
        orderId: order._id,
        status: customerStatus,
      });
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
};

exports.processOrderItemAction = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { quantity, reason, actionType } = req.body; // Add actionType: 'cancel' or 'return'
    const branchId = req.branch._id;
    console.log(
      `Processing ${actionType} action for order ${orderId}, item index ${itemIndex}`
    );
    console.log(`Quantity: ${quantity}, Reason: ${reason}`);
    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    if (!["cancel", "return"].includes(actionType)) {
      return res.status(400).json({
        success: false,
        message: "Valid action type is required (cancel or return)",
      });
    }

    // Find order
    const order = await DiningOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    console.log("Original order before changes:", JSON.stringify(order));
    console.log("Item to modify:", JSON.stringify(order.items[itemIndex]));

    // Check if action type is appropriate for order status
    if (actionType === "return" && order.status !== "served") {
      return res.status(400).json({
        success: false,
        message: "Items can only be returned after they are served",
      });
    }

    if (actionType === "cancel" && order.status === "served") {
      return res.status(400).json({
        success: false,
        message: "Served items must be returned, not cancelled",
      });
    }

    // Validate item exists
    if (!order.items[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.items[itemIndex];

    // Check if return/cancel quantity is valid
    if (quantity > item.quantity - (item.returnedQuantity || 0)) {
      return res.status(400).json({
        success: false,
        message: "Action quantity exceeds available quantity",
      });
    }

    // Update item based on action type
    if (actionType === "return") {
      item.returnedQuantity = (item.returnedQuantity || 0) + quantity;
      item.returnReason = reason;
      item.returnedAt = new Date();
      console.log(
        `Item returned: ${quantity}, new returnedQuantity: ${item.returnedQuantity}`
      );
    } else {
      // cancel
      item.cancelledQuantity = (item.cancelledQuantity || 0) + quantity;
      item.cancelReason = reason;
      item.cancelledAt = new Date();
      console.log(
        `Item cancelled: ${quantity}, new cancelledQuantity: ${item.cancelledQuantity}`
      );
    }

    console.log("Modified item:", JSON.stringify(item));
    // Recalculate order total
    const actionAmount = item.price * quantity;
    order.totalAmount -= actionAmount;
    console.log("Order after changes (before save):", JSON.stringify(order));

    await order.save();

    // Update session total
    const session = await Session.findById(order.sessionId);
    if (session) {
      session.totalAmount -= actionAmount;
      await session.save();
    }

    // Emit appropriate socket events
    const kitchenRoom = `kitchen:${branchId}`;
    const tableRoom = `table:${branchId}:${order.tableName}`;

    // Different event names for cancel vs return
    const kitchenEventName =
      actionType === "cancel" ? "order_item_cancelled" : "order_item_returned";

    const actionData = {
      orderId: order._id,
      tableName: order.tableName,
      itemIndex: itemIndex,
      itemName: item.name,
      quantity: quantity,
      actionType: actionType,
      newOrderTotal: order.totalAmount,
      newSessionTotal: session ? session.totalAmount : null,
    };

    // Notify kitchen
    socketService.emitToRoom(kitchenRoom, kitchenEventName, actionData);

    // Add this additional event to refresh kitchen view completely
    // This is especially important for orders that are already in the kitchen view
    if (
      actionType === "cancel" &&
      (order.status === "admin_approved" || order.status === "in_preparation")
    ) {
      socketService.emitToRoom(kitchenRoom, "order_updated", {
        orderId: order._id,
        tableName: order.tableName,
        status: order.status,
        items: order.items, // Include complete items array with updated quantities
      });
      console.log(
        "Sending order_updated event with data:",
        JSON.stringify({
          orderId: order._id,
          tableName: order.tableName,
          status: order.status,
          items: order.items,
        })
      );
    }

    // Notify customer
    socketService.emitToRoom(tableRoom, "order_updated", {
      orderId: order._id,
      totalAmount: order.totalAmount,
      itemUpdated: {
        index: itemIndex,
        actionType: actionType,
        quantity: quantity,
      },
      sessionTotal: session ? session.totalAmount : null,
    });

    res.json({
      success: true,
      message: `Item ${
        actionType === "return" ? "returned" : "cancelled"
      } successfully`,
      data: {
        order,
        sessionTotal: session?.totalAmount,
      },
    });
  } catch (error) {
    console.error(`Error processing order item ${req.body.actionType}:`, error);
    res.status(500).json({
      success: false,
      message: `Error processing order item ${req.body.actionType}`,
    });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const branchId = req.branch._id;

    // Get ALL orders for this session, not just served ones
    const orders = await DiningOrder.find({
      sessionId,
      // No status filter
    });

    if (!orders.length) {
      return res.status(400).json({
        success: false,
        message: "No orders found",
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Format invoice data accounting for returned items
    const invoiceData = {
      invoiceNo: `INV-${Date.now()}-${sessionId.slice(-4)}`,
      branchName: branch.name,
      vatNumber: branch.vatNumber,
      tableName: session.tableName,
      date: new Date(),
      orders: orders.map((order) => ({
        orderId: order._id,
        items: order.items
          .map((item) => {
            const effectiveQuantity =
              item.quantity - (item.returnedQuantity || 0);
            return {
              name: item.name,
              quantity: effectiveQuantity,
              returnedQuantity: item.returnedQuantity || 0,
              price: item.price,
              total: effectiveQuantity * item.price,
            };
          })
          .filter((item) => item.quantity > 0), // Filter out fully returned items
        orderTotal: order.totalAmount,
      })),
      totalAmount: session.totalAmount,
    };

    res.json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    console.error("Error in generateInvoice:", error);
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
    });
  }
};
