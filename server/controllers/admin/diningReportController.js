const Session = require("../../models/menu/session");
const DiningOrder = require("../../models/menu/DiningOrder");
const Branch = require("../../models/admin/Branch");
const mongoose = require("mongoose");

// Helper function to build date filter
const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    dateFilter["$gte"] = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter["$lte"] = end;
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

// Get summary statistics for dashboard
exports.getDiningReportSummary = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { startDate, endDate } = req.query;

    console.log("Summary request for branchId:", branchId);
    console.log("Date range:", startDate, "to", endDate);

    // Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID format",
      });
    }

    // Build date filter
    const dateFilter = buildDateFilter(startDate, endDate);
    console.log("Built date filter:", dateFilter);

    const queryFilter = {
      branchId,
      ...(dateFilter && { createdAt: dateFilter }),
    };
    console.log("Query filter for sessions and orders:", queryFilter);

    // Get sessions data
    const sessionsQuery = Session.find({
      ...queryFilter,
      status: "completed", // Only consider completed sessions
    });

    // Get orders data for the same time period
    const ordersQuery = DiningOrder.find({
      branchId,
      ...(dateFilter && { createdAt: dateFilter }),
    });

    // Execute both queries in parallel
    const [sessions, orders] = await Promise.all([
      sessionsQuery.exec(),
      ordersQuery.exec(),
    ]);

    console.log(
      `Found ${sessions.length} sessions and ${orders.length} orders`
    );

    // Calculate summary statistics
    const totalSessions = sessions.length;
    const totalOrders = orders.length;
    const totalRevenue = sessions.reduce(
      (sum, session) => sum + (session.totalAmount || 0),
      0
    );

    // Calculate payment method distribution
    const paymentMethodCount = {
      cash: 0,
      card: 0,
      mixed: 0,
    };

    sessions.forEach((session) => {
      if (session.paymentMethod) {
        paymentMethodCount[session.paymentMethod] += 1;
      } else if (session.payments && session.payments.length > 0) {
        // If using the new payment structure
        const hasCash = session.payments.some((p) => p.method === "cash");
        const hasCard = session.payments.some((p) => p.method === "card");

        if (hasCash && hasCard) {
          paymentMethodCount.mixed += 1;
        } else if (hasCash) {
          paymentMethodCount.cash += 1;
        } else if (hasCard) {
          paymentMethodCount.card += 1;
        }
      }
    });

    // Calculate tips total
    const totalTips = sessions.reduce((sum, session) => {
      if (!session.excessAllocation) return sum;

      const tipAllocations = session.excessAllocation.filter(
        (a) => a.type === "tip"
      );
      return (
        sum +
        tipAllocations.reduce((tipSum, tip) => tipSum + (tip.amount || 0), 0)
      );
    }, 0);

    const summaryData = {
      totalRevenue,
      totalOrders,
      totalSessions,
      paymentMethodDistribution: paymentMethodCount,
      totalTips,
    };

    console.log("Returning summary data:", summaryData);

    res.status(200).json({
      success: true,
      data: summaryData,
    });
  } catch (error) {
    console.error("Error in getDiningReportSummary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report summary",
      error: error.message,
    });
  }
};

// Get filtered orders for reports table
exports.getDiningReportOrders = async (req, res) => {
  try {
    const { branchId } = req.params;
    const {
      startDate,
      endDate,
      paymentMethod,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("Orders request for branchId:", branchId);
    console.log("Filter params:", {
      startDate,
      endDate,
      paymentMethod,
      status,
      search,
      page,
      limit,
    });

    // Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID format",
      });
    }

    // Build basic query first with just branchId
    let orderQuery = { branchId };

    // Add date filter if specified
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) {
      orderQuery.createdAt = dateFilter;
    }

    // Add status filter if needed
    if (status && status !== "all") {
      orderQuery.status = status;
    }

    // Add search on order fields
    if (search) {
      const searchRegex = new RegExp(search, "i");
      orderQuery = {
        $and: [
          orderQuery,
          {
            $or: [{ orderNumber: searchRegex }, { tableName: searchRegex }],
          },
        ],
      };
    }

    console.log("Final order query:", JSON.stringify(orderQuery));

    // Get total count for pagination
    const totalItems = await DiningOrder.countDocuments(orderQuery);
    console.log("Total matching orders:", totalItems);

    // Apply pagination and get orders
    const skip = (page - 1) * limit;
    const orders = await DiningOrder.find(orderQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .exec();

    console.log(`Retrieved ${orders.length} orders after pagination`);

    // Get session IDs for looking up session data
    const sessionIds = orders
      .map((order) => order.sessionId)
      .filter((id) => id);
    console.log(`Found ${sessionIds.length} unique sessionIds`);

    // Get all related sessions in one query
    const sessions = await Session.find({
      _id: { $in: sessionIds },
    }).exec();

    console.log(`Retrieved ${sessions.length} associated sessions`);

    // Create a map for quick session lookup
    const sessionMap = sessions.reduce((map, session) => {
      map[session._id.toString()] = session;
      return map;
    }, {});

    // Format the response data
    const formattedOrders = orders
      .map((order) => {
        // Find matching session
        const session = order.sessionId
          ? sessionMap[order.sessionId.toString()]
          : null;

        // Determine payment method
        let paymentMethod = "Unknown";
        if (session) {
          if (session.paymentMethod) {
            paymentMethod = session.paymentMethod;
          } else if (session.payments && session.payments.length > 0) {
            const hasCash = session.payments.some((p) => p.method === "cash");
            const hasCard = session.payments.some((p) => p.method === "card");

            if (hasCash && hasCard) {
              paymentMethod = "mixed";
            } else if (hasCash) {
              paymentMethod = "cash";
            } else if (hasCard) {
              paymentMethod = "card";
            }
          }
        }

        // Check if this order should be filtered by payment method
        if (
          paymentMethod !== "all" &&
          paymentMethod.toLowerCase() !== paymentMethod.toLowerCase()
        ) {
          return null;
        }

        return {
          orderId: order._id,
          orderNumber:
            order.orderNumber || `#${order._id.toString().slice(-4)}`,
          date: order.createdAt,
          tableName: order.tableName,
          customerName: session?.customerName || "Unknown",
          totalAmount: order.totalAmount,
          status: order.status,
          items: order.items.map((item) => ({
            name: item.name,
            quantity:
              item.quantity -
              (item.returnedQuantity || 0) -
              (item.cancelledQuantity || 0),
            price: item.price,
            totalPrice:
              item.price *
              (item.quantity -
                (item.returnedQuantity || 0) -
                (item.cancelledQuantity || 0)),
          })),
          sessionData: session
            ? {
                sessionId: session._id,
                paymentMethod,
                payments: session.payments || [],
                excessAllocation: session.excessAllocation || [],
                status: session.status,
                createdAt: session.createdAt,
                completedAt: session.paymentTimestamp,
              }
            : {
                paymentMethod: "Unknown",
                status: "Unknown",
              },
        };
      })
      .filter((order) => order !== null); // Remove filtered orders

    console.log(
      `Formatted ${formattedOrders.length} orders for response after payment filtering`
    );

    const responseData = {
      orders: formattedOrders,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    };

    console.log("Sending response with pagination:", responseData.pagination);

    // Return the formatted response
    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in getDiningReportOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report orders",
      error: error.message,
    });
  }
};

// Get detailed information for a specific order/session
exports.getDiningReportDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Details request for orderId:", orderId);

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // Find the order
    const order = await DiningOrder.findById(orderId);
    if (!order) {
      console.log("Order not found with ID:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("Found order:", {
      _id: order._id,
      sessionId: order.sessionId,
      branchId: order.branchId,
      status: order.status,
      items: order.items.length,
    });

    // Find the session associated with this order
    let session = null;
    if (order.sessionId) {
      session = await Session.findById(order.sessionId);
      console.log("Session lookup result:", session ? "Found" : "Not found");
    } else {
      console.log("Order has no sessionId");
    }

    // Find branch info
    const branch = await Branch.findById(
      order.branchId,
      "name address.currency"
    );
    console.log("Branch lookup result:", branch ? "Found" : "Not found");

    // Determine payment method
    let paymentMethod = "Unknown";
    if (session) {
      if (session.paymentMethod) {
        paymentMethod = session.paymentMethod;
      } else if (session.payments && session.payments.length > 0) {
        const hasCash = session.payments.some((p) => p.method === "cash");
        const hasCard = session.payments.some((p) => p.method === "card");

        if (hasCash && hasCard) {
          paymentMethod = "mixed";
        } else if (hasCash) {
          paymentMethod = "cash";
        } else if (hasCard) {
          paymentMethod = "card";
        }
      }
    }

    // Prepare detailed response
    const orderDetails = {
      orderId: order._id,
      orderNumber: order.orderNumber || `#${order._id.toString().slice(-4)}`,
      date: order.createdAt,
      statusTimestamps: order.statusTimestamps,
      tableName: order.tableName,
      branchName: branch?.name || "Unknown Branch",
      currency: branch?.address?.currency || "SAR",
      items: order.items.map((item) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        returnedQuantity: item.returnedQuantity || 0,
        returnReason: item.returnReason || "",
        cancelledQuantity: item.cancelledQuantity || 0,
        cancelReason: item.cancelReason || "",
        effectiveQuantity:
          item.quantity -
          (item.returnedQuantity || 0) -
          (item.cancelledQuantity || 0),
        effectivePrice:
          item.price *
          (item.quantity -
            (item.returnedQuantity || 0) -
            (item.cancelledQuantity || 0)),
      })),
      orderTotal: order.totalAmount,
      status: order.status,
      // Session data
      session: session
        ? {
            id: session._id,
            customerName: session.customerName,
            customerPhone: session.customerPhone,
            totalAmount: session.totalAmount,
            startTime: session.createdAt,
            endTime: session.paymentTimestamp || null,
            status: session.status,
            paymentMethod,
            // Detailed payment info
            payments: session.payments || [],
            excessAllocation: session.excessAllocation || [],
          }
        : {
            customerName: "Unknown",
            customerPhone: "Unknown",
            totalAmount: 0,
            status: "Unknown",
            payments: [],
            excessAllocation: [],
          },
    };

    console.log("Sending order details response");

    res.status(200).json({
      success: true,
      data: orderDetails,
    });
  } catch (error) {
    console.error("Error in getDiningReportDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};
