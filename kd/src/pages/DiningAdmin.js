// src/components/DiningAdmin.jsx (formerly TableManagement.js)
import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaCreditCard,
  FaEye,
  FaPrint,
  FaTimes,
  FaCheck,
  FaBell,
  FaClock,
  FaArrowRight,
  FaUndo,
  FaTrash,
} from "react-icons/fa";
import {
  getBranchTables,
  updateTableStatus,
  getTableSession,
  completeSession,
  generateInvoice,
  updateKitchenOrderStatus,
  cancelOrderItem,
  returnOrderItem,
} from "../utils/api";
import "../styles/DiningAdmin.css";
import { useKitchenSocket } from "../contexts/KitchenSocketContext";

function DiningAdmin() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableSession, setTableSession] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showItemActionModal, setShowItemActionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [actionType, setActionType] = useState("cancel"); // "cancel" or "return"
  const [invoiceData, setInvoiceData] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [actionPending, setActionPending] = useState(false);

  // Socket context
  const {
    isConnected,
    newOrderEvents,
    orderStatusEvents,
    tableStatusEvents,
    paymentRequestEvents,
    clearNewOrderEvents,
    clearOrderStatusEvents,
    clearTableStatusEvents,
    clearPaymentRequestEvents,
    socket,
  } = useKitchenSocket();

  // Log connection status
  useEffect(() => {
    console.log("Dining Admin socket connection status:", isConnected);
  }, [isConnected]);

  // Initial data load
  useEffect(() => {
    fetchTables();
  }, []);

  // Handle new order events
  useEffect(() => {
    if (newOrderEvents.length > 0) {
      console.log("New order events received:", newOrderEvents);

      // Update notifications for tables with new orders
      setNotifications((prev) => {
        const updated = { ...prev };
        newOrderEvents.forEach((event) => {
          updated[event.tableName] = (updated[event.tableName] || 0) + 1;
        });
        return updated;
      });

      // If we have a selected table with session, update orders if needed
      if (selectedTable && tableSession) {
        const tableNewOrders = newOrderEvents.filter(
          (order) => order.tableName === selectedTable.name
        );

        if (tableNewOrders.length > 0) {
          // Reload the selected table's session to get updated orders
          getTableSession(selectedTable.name)
            .then((response) => {
              if (response.success && response.data) {
                setTableSession(response.data);
              }
            })
            .catch((error) => {
              console.error(
                "Error refreshing table session after new order:",
                error
              );
            });
        }
      }

      // Play notification sound if available
      const audio = document.getElementById("notification-sound");
      if (audio) {
        audio.play().catch((e) => console.log("Error playing sound:", e));
      }

      // Clear processed events
      clearNewOrderEvents();
    }
  }, [newOrderEvents, selectedTable]);

  // Handle order status update events
  useEffect(() => {
    if (orderStatusEvents.length > 0) {
      console.log("Order status updates received:", orderStatusEvents);

      // If we have a selected table with session, update orders if needed
      if (selectedTable && tableSession) {
        const tableStatusUpdates = orderStatusEvents.filter(
          (update) => update.tableName === selectedTable.name
        );

        if (tableStatusUpdates.length > 0) {
          // Update orders in the table session
          if (tableSession.orders) {
            const updatedOrders = tableSession.orders.map((order) => {
              const update = tableStatusUpdates.find(
                (u) => u.orderId === order._id
              );
              if (update) {
                // Update the status and timestamp
                return {
                  ...order,
                  status: update.status,
                  statusTimestamps: {
                    ...order.statusTimestamps,
                    [update.status]: update.timestamp || new Date(),
                  },
                };
              }
              return order;
            });

            setTableSession((prev) => ({
              ...prev,
              orders: updatedOrders,
            }));
          }
        }
      }

      // Update notifications for "ready_for_pickup" status
      const pickupOrders = orderStatusEvents.filter(
        (update) => update.status === "ready_for_pickup"
      );

      if (pickupOrders.length > 0) {
        setNotifications((prev) => {
          const updated = { ...prev };
          pickupOrders.forEach((event) => {
            updated[event.tableName] = (updated[event.tableName] || 0) + 1;
          });
          return updated;
        });

        // Play notification sound for pickup-ready orders
        const audio = document.getElementById("notification-sound");
        if (audio) {
          audio.play().catch((e) => console.log("Error playing sound:", e));
        }
      }

      // Clear processed events
      clearOrderStatusEvents();
    }
  }, [orderStatusEvents, selectedTable]);

  // Handle item cancellation/return events
  useEffect(() => {
    const handleItemAction = (data, actionType) => {
      if (selectedTable && tableSession) {
        if (data.tableName === selectedTable.name) {
          // Update the specific order and item
          const updatedOrders = tableSession.orders.map((order) => {
            if (order._id === data.orderId) {
              const updatedItems = [...order.items];
              if (updatedItems[data.itemIndex]) {
                if (actionType === "cancel") {
                  updatedItems[data.itemIndex] = {
                    ...updatedItems[data.itemIndex],
                    cancelledQuantity:
                      (updatedItems[data.itemIndex].cancelledQuantity || 0) +
                      data.quantity,
                    cancelReason: data.reason,
                    cancelledAt: new Date(),
                  };
                } else {
                  updatedItems[data.itemIndex] = {
                    ...updatedItems[data.itemIndex],
                    returnedQuantity:
                      (updatedItems[data.itemIndex].returnedQuantity || 0) +
                      data.quantity,
                    returnReason: data.reason,
                    returnedAt: new Date(),
                  };
                }
              }

              return {
                ...order,
                items: updatedItems,
                totalAmount: data.newOrderTotal,
              };
            }
            return order;
          });

          setTableSession((prev) => ({
            ...prev,
            orders: updatedOrders,
            session: {
              ...prev.session,
              totalAmount: data.newSessionTotal || prev.session.totalAmount,
            },
          }));

          // Force refresh of the Orders modal to show changes immediately
          if (showOrdersModal) {
            setShowOrdersModal(false);
            setTimeout(() => {
              setShowOrdersModal(true);
            }, 50);
          }
          setTimeout(() => {
            const updatedOrder = updatedOrders.find(
              (o) => o._id === data.orderId
            );
            if (updatedOrder && !hasActiveItems(updatedOrder)) {
              autoUpdateEmptyOrder(data.orderId);
            }
          }, 100);
        }
      }
    };

    // Set up socket listeners
    if (socket) {
      socket.on("order_item_cancelled", (data) =>
        handleItemAction(data, "cancel")
      );
      socket.on("order_item_returned", (data) =>
        handleItemAction(data, "return")
      );

      return () => {
        socket.off("order_item_cancelled");
        socket.off("order_item_returned");
      };
    }
  }, [socket, selectedTable, tableSession, showOrdersModal]);

  // Handle table status updates
  useEffect(() => {
    if (tableStatusEvents.length > 0) {
      console.log("Table status updates received:", tableStatusEvents);

      // Update tables with new status
      setTables((prevTables) => {
        return prevTables.map((table) => {
          // Find if there's an update for this table
          const update = tableStatusEvents.find(
            (event) =>
              event.tableId === table.id ||
              (event.tableName === table.name && table.id)
          );

          if (update) {
            return { ...table, status: update.status };
          }
          return table;
        });
      });

      // Clear processed events
      clearTableStatusEvents();
    }
  }, [tableStatusEvents]);

  // Handle payment request events
  useEffect(() => {
    if (paymentRequestEvents.length > 0) {
      console.log("Payment requests received:", paymentRequestEvents);

      // Update notifications for tables with payment requests
      setNotifications((prev) => {
        const updated = { ...prev };
        paymentRequestEvents.forEach((event) => {
          updated[event.tableName] = (updated[event.tableName] || 0) + 1;
        });
        return updated;
      });

      // If we have a selected table that matches a payment request, update UI
      if (selectedTable && tableSession) {
        const paymentRequest = paymentRequestEvents.find(
          (event) => event.tableName === selectedTable.name
        );

        if (paymentRequest) {
          // Update session with payment requested flag
          setTableSession((prev) => ({
            ...prev,
            session: {
              ...prev.session,
              paymentRequested: true,
            },
          }));
        }
      }

      // Play notification sound
      const audio = document.getElementById("notification-sound");
      if (audio) {
        audio.play().catch((e) => console.log("Error playing sound:", e));
      }

      // Clear processed events
      clearPaymentRequestEvents();
    }
  }, [paymentRequestEvents, selectedTable]);

  const fetchTables = async () => {
    try {
      const response = await getBranchTables();
      console.log("Initial tables response:", response);

      if (response.success && Array.isArray(response.data)) {
        const uniqueTables = Array.from(
          new Set(response.data.map((table) => table.id))
        ).map((id) => response.data.find((table) => table.id === id));

        const tablesWithStatus = uniqueTables.map((table) => ({
          ...table,
          status: table.status || "available",
        }));
        setTables(tablesWithStatus);

        // Initialize notifications for all tables
        const initialNotifications = {};
        tablesWithStatus.forEach((table) => {
          initialNotifications[table.name] = 0;
        });
        setNotifications(initialNotifications);
      } else if (response.success && response.data.data) {
        const uniqueTables = Array.from(
          new Set(response.data.data.map((table) => table.id))
        ).map((id) => response.data.data.find((table) => table.id === id));

        const tablesWithStatus = uniqueTables.map((table) => ({
          ...table,
          status: table.status || "available",
        }));
        setTables(tablesWithStatus);

        // Initialize notifications for all tables
        const initialNotifications = {};
        tablesWithStatus.forEach((table) => {
          initialNotifications[table.name] = 0;
        });
        setNotifications(initialNotifications);
      } else {
        setError(response.message || "Invalid data format received");
      }
    } catch (error) {
      console.error("Error details:", error);
      setError("Error fetching tables");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    try {
      const sessionResponse = await getTableSession(table.name);
      console.log("Table session response:", sessionResponse);

      if (sessionResponse.success && sessionResponse.data?.data) {
        setTableSession(sessionResponse.data.data);
        if (table.status === "available") {
          await handleTableStatusChange(table.id, "occupied", false);
        }

        // Clear notification for this table
        setNotifications((prev) => ({
          ...prev,
          [table.name]: 0,
        }));
      } else {
        setTableSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setTableSession(null);
    }
    setShowTableModal(true);
  };

  const handleTableStatusChange = async (
    tableId,
    newStatus,
    closeModal = true
  ) => {
    try {
      const response = await updateTableStatus(tableId, newStatus);
      if (response.success) {
        // Update local state to match the new status
        setTables(
          tables.map((table) => {
            if (table.id === tableId) {
              return { ...table, status: newStatus };
            }
            return table;
          })
        );

        if (closeModal) {
          setShowTableModal(false);
        }

        // No need to fetch tables again as socket will update it
      } else {
        alert(response.message || "Failed to update table status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Error updating table status");
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateKitchenOrderStatus(orderId, newStatus);
      if (response.success) {
        console.log(`Order ${orderId} status updated to ${newStatus}`);

        // Update local state immediately for better UX
        if (tableSession) {
          const updatedOrders = tableSession.orders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  statusTimestamps: {
                    ...order.statusTimestamps,
                    [newStatus]: new Date(),
                  },
                }
              : order
          );

          setTableSession((prev) => ({
            ...prev,
            orders: updatedOrders,
          }));
        }
      }
    } catch (error) {
      console.error("Order status update error:", error);
      alert("Error updating order status");
    }
  };
  // Add this function to auto-cancel orders when all items are cancelled
  const autoUpdateEmptyOrder = async (orderId) => {
    // Find the order in the current session
    const order = tableSession.orders.find((o) => o._id === orderId);

    // If no items are active and order is not already cancelled/served
    if (
      order &&
      !hasActiveItems(order) &&
      !["canceled", "served"].includes(order.status)
    ) {
      console.log("Auto-cancelling empty order:", orderId);

      try {
        // Call the existing API to update order status
        const response = await updateKitchenOrderStatus(orderId, "canceled");

        if (response.success) {
          console.log("Order auto-cancelled successfully");

          // Update local state immediately for better UX
          setTableSession((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              orders: prev.orders.map((o) =>
                o._id === orderId
                  ? {
                      ...o,
                      status: "canceled",
                      statusTimestamps: {
                        ...o.statusTimestamps,
                        canceled: new Date(),
                      },
                    }
                  : o
              ),
            };
          });
        }
      } catch (error) {
        console.error("Failed to auto-cancel empty order:", error);
      }
    }
  };

  const handleItemAction = (order, itemIndex, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setSelectedItemIndex(itemIndex);
    setReturnQuantity(1);
    setReturnReason("");

    // Determine action type based on order status
    setActionType(order.status === "served" ? "return" : "cancel");

    setShowItemActionModal(true);
  };

  const submitItemAction = async () => {
    if (!selectedOrder || selectedItemIndex === null) {
      alert("No item selected");
      return;
    }

    if (!returnQuantity || returnQuantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }
    if (!returnReason || returnReason.trim() === "") {
      setReturnReason("No reason provided");
    }

    try {
      setActionPending(true);

      let response;
      if (actionType === "return") {
        response = await returnOrderItem(
          selectedOrder._id,
          selectedItemIndex,
          returnQuantity,
          returnReason || "No reason provided"
        );
      } else {
        response = await cancelOrderItem(
          selectedOrder._id,
          selectedItemIndex,
          returnQuantity,
          returnReason || "No reason provided"
        );
      }

      if (response.success) {
        // Update UI will happen through socket events
        alert(
          `Item ${
            actionType === "return" ? "returned" : "cancelled"
          } successfully`
        );
        // Add this code to check for auto-cancellation
        setTimeout(() => {
          if (tableSession) {
            const updatedOrder = tableSession.orders.find(
              (o) => o._id === selectedOrder._id
            );
            if (updatedOrder && !hasActiveItems(updatedOrder)) {
              autoUpdateEmptyOrder(selectedOrder._id);
            }
          }
        }, 100);
        setShowItemActionModal(false);
      } else {
        alert(response.message || `Failed to ${actionType} item`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing item:`, error);
      alert(`Error processing item ${actionType}`);
    } finally {
      setActionPending(false);
    }
  };

  const getEffectiveQuantity = (item) => {
    const total = item.quantity;
    const returned = item.returnedQuantity || 0;
    const cancelled = item.cancelledQuantity || 0;
    return total - returned - cancelled;
  };

  const areAllOrdersServed = () => {
    return (
      tableSession?.orders?.every(
        (order) => order.status === "served" || order.status === "canceled"
      ) ?? false
    );
  };

  const handleGenerateInvoice = async () => {
    if (!tableSession?.session?._id) {
      alert("No active session found");
      return;
    }

    try {
      const response = await generateInvoice(tableSession.session._id);
      if (response.success) {
        setInvoiceData(response.data);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      alert("Error generating invoice");
    }
  };
  const cancelAllEmptyOrders = async () => {
    let hasEmptyOrders = false;

    if (!tableSession?.orders) return hasEmptyOrders;

    // Find all orders that are pending but have no active items
    const emptyOrders = tableSession.orders.filter(
      (order) =>
        !hasActiveItems(order) && !["canceled", "served"].includes(order.status)
    );

    if (emptyOrders.length > 0) {
      hasEmptyOrders = true;
      console.log(`Found ${emptyOrders.length} empty orders to cancel`);

      // Cancel each empty order
      for (const order of emptyOrders) {
        try {
          await updateKitchenOrderStatus(order._id, "canceled");
          console.log(`Auto-cancelled empty order: ${order._id}`);
        } catch (error) {
          console.error(`Failed to cancel empty order ${order._id}:`, error);
        }
      }
    }

    return hasEmptyOrders;
  };
  const handlePaymentConfirm = async () => {
    if (!tableSession?.session?._id) {
      alert("No active session found");
      return;
    }

    try {
      // First identify and cancel all empty orders
      const hasEmptyOrders = await cancelAllEmptyOrders();

      // Small delay to ensure server has processed cancellations
      if (hasEmptyOrders) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Then complete the session
      const response = await completeSession(tableSession.session._id);
      if (response.success) {
        // Close modals
        setShowPaymentModal(false);
        setShowTableModal(false);

        // Session is completed - the socket will handle table status update
        setTableSession(null);
      } else {
        alert(response.message || "Failed to complete session");
      }
    } catch (error) {
      console.error("Payment completion error:", error);
      alert("Error completing session");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString();
  };

  const hasActiveItems = (order) => {
    // Check if order and order.items exist before calling .some()
    if (!order || !order.items || !Array.isArray(order.items)) {
      return false;
    }

    // Check if the order has at least one item with quantity > 0
    return order.items.some((item) => {
      const effectiveQuantity =
        item.quantity -
        (item.cancelledQuantity || 0) -
        (item.returnedQuantity || 0);
      return effectiveQuantity > 0;
    });
  };

  const getNextAction = (order) => {
    // First check if the order has any active items
    if (!order || !hasActiveItems(order) || order.status === "canceled") {
      return null; // Don't show any action buttons for empty or canceled orders
    }

    // Original switch case for different statuses
    switch (order.status) {
      case "pending":
        return {
          label: "Approve",
          action: "admin_approved",
          icon: <FaCheck />,
          color: "green",
        };
      case "admin_approved":
        // This is used in kitchen dashboard, not here
        return null;
      case "in_preparation":
        // This is used in kitchen dashboard, not here
        return null;
      case "ready_for_pickup":
        return {
          label: "Serve to Customer",
          action: "served",
          icon: <FaArrowRight />,
          color: "blue",
        };
      default:
        return null;
    }
  };
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "New Order";
      case "admin_approved":
        return "Approved";
      case "in_preparation":
        return "Preparing";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "served":
        return "Served";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  if (loading) return <div className="loading-message">Loading tables...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dining-admin-container">
      {/* Notification sound */}
      <audio id="notification-sound" src="/notification.mp3" />

      {/* Connection status indicator (can be hidden in production) */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      <div className="dining-admin-header">
        <h1>Dining Tables</h1>
      </div>

      <div className="tables-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`table-card ${table.status}`}
          >
            <div className="table-header">
              <h3 className="table-title">{table.name}</h3>
              <span className={`status-badge ${table.status}`}>
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </span>
              {notifications[table.name] > 0 && (
                <div className="notification-badge">
                  {notifications[table.name]}
                </div>
              )}
            </div>
            <FaUtensils className={`table-icon ${table.status}`} />
          </div>
        ))}
      </div>

      {/* Table Actions Modal */}
      {showTableModal && selectedTable && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>{selectedTable.name}</h2>
                {tableSession?.session?.paymentRequested && (
                  <div className="payment-requested-badge">
                    <FaBell className="bell-icon" />
                    Payment Requested
                  </div>
                )}
              </div>
              <button
                className="close-button"
                onClick={() => setShowTableModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {/* Show Mark as Available only when no active session */}
              {selectedTable.status === "occupied" &&
                !tableSession?.session && (
                  <button
                    className="action-button available"
                    onClick={() =>
                      handleTableStatusChange(selectedTable.id, "available")
                    }
                  >
                    <FaCheck />
                    Mark as Available
                  </button>
                )}

              {selectedTable.status === "occupied" && (
                <>
                  <button
                    className="action-button view-orders"
                    onClick={() => {
                      setShowOrdersModal(true);
                      setShowTableModal(false);
                    }}
                  >
                    <FaEye />
                    View Orders
                  </button>
                  {tableSession?.session && (
                    <button
                      className="action-button payment"
                      onClick={() => {
                        setShowPaymentModal(true);
                        setShowTableModal(false);
                      }}
                    >
                      <FaCreditCard />
                      Payment Done
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && selectedTable && tableSession?.session && (
        <div className="modal-overlay">
          <div className="modal-content orders-modal">
            <div className="modal-header">
              <div>
                <h2>Orders for {selectedTable.name}</h2>
                <p className="session-total">
                  Session Total: {tableSession.session.totalAmount.toFixed(2)}{" "}
                  SAR
                </p>
              </div>
              <button
                className="close-button"
                onClick={() => {
                  setShowOrdersModal(false);
                  setShowTableModal(true);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="orders-list">
              {tableSession.orders && tableSession.orders.length > 0 ? (
                tableSession.orders.map((order) => (
                  <div key={order._id} className={`order-card ${order.status}`}>
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-title">
                          <span className="order-number">
                            Order #{order._id.slice(-4)}
                          </span>
                          <span className={`status-badge ${order.status}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        {/* Order timestamps */}
                        <div className="order-timestamps">
                          <span className="timestamp">
                            <FaClock className="timestamp-icon" />
                            Created: {formatTimestamp(order.createdAt)}
                          </span>
                          {order.statusTimestamps?.admin_approved && (
                            <span className="timestamp">
                              Approved:{" "}
                              {formatTimestamp(
                                order.statusTimestamps.admin_approved
                              )}
                            </span>
                          )}
                          {order.statusTimestamps?.in_preparation && (
                            <span className="timestamp">
                              Preparation:{" "}
                              {formatTimestamp(
                                order.statusTimestamps.in_preparation
                              )}
                            </span>
                          )}
                          {order.statusTimestamps?.ready_for_pickup && (
                            <span className="timestamp">
                              Ready:{" "}
                              {formatTimestamp(
                                order.statusTimestamps.ready_for_pickup
                              )}
                            </span>
                          )}
                          {order.statusTimestamps?.served && (
                            <span className="timestamp">
                              Served:{" "}
                              {formatTimestamp(order.statusTimestamps.served)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Next action button based on current status */}
                      <div className="order-actions">
                        {getNextAction(order) && (
                          <button
                            className={`status-button ${
                              getNextAction(order).color
                            }`}
                            onClick={() =>
                              handleOrderStatusChange(
                                order._id,
                                getNextAction(order).action
                              )
                            }
                          >
                            {getNextAction(order).icon}
                            {getNextAction(order).label}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="order-items">
                      <div className="order-items-wrapper">
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items
                              .filter((item) => {
                                const effectiveQuantity =
                                  getEffectiveQuantity(item);
                                return effectiveQuantity > 0;
                              })
                              .map((item, idx) => {
                                const effectiveQuantity =
                                  getEffectiveQuantity(item);
                                const isReturned =
                                  (item.returnedQuantity || 0) > 0;
                                const isCancelled =
                                  (item.cancelledQuantity || 0) > 0;

                                return (
                                  <tr
                                    key={idx}
                                    className={
                                      isReturned || isCancelled
                                        ? "returned-item"
                                        : ""
                                    }
                                  >
                                    <td>{item.name}</td>
                                    <td>
                                      {effectiveQuantity}
                                      {isReturned && (
                                        <span className="returned-qty">
                                          (-{item.returnedQuantity} returned)
                                        </span>
                                      )}
                                      {isCancelled && (
                                        <span className="returned-qty">
                                          (-{item.cancelledQuantity} cancelled)
                                        </span>
                                      )}
                                    </td>
                                    <td>{item.price} SAR</td>
                                    <td>
                                      {(effectiveQuantity * item.price).toFixed(
                                        2
                                      )}{" "}
                                      SAR
                                    </td>
                                    <td>
                                      {effectiveQuantity > 0 &&
                                        order.status !== "canceled" && (
                                          <button
                                            className="return-item-btn"
                                            onClick={() =>
                                              handleItemAction(order, idx, item)
                                            }
                                          >
                                            {order.status === "served" ? (
                                              <>
                                                <FaUndo /> Return
                                              </>
                                            ) : (
                                              <>
                                                <FaTrash /> Cancel
                                              </>
                                            )}
                                          </button>
                                        )}
                                    </td>
                                  </tr>
                                );
                              })}

                            {!hasActiveItems(order) &&
                              order.status !== "canceled" && (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="text-center text-gray-500 italic"
                                  >
                                    No active items in this order. It will be
                                    automatically canceled.
                                  </td>
                                </tr>
                              )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" className="text-right">
                                <strong>Order Total:</strong>
                              </td>
                              <td colSpan="2">
                                <strong>
                                  {order.totalAmount.toFixed(2)} SAR
                                </strong>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-orders-message">
                  No orders found for this session
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="invoice-button"
                onClick={handleGenerateInvoice}
              >
                <FaPrint />
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Action Modal (for returns or cancellations) */}
      {showItemActionModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content return-modal">
            <div className="modal-header">
              <h2>{actionType === "return" ? "Return Item" : "Cancel Item"}</h2>
              <button
                className="close-button"
                onClick={() => setShowItemActionModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="return-item-details">
                <p>
                  <strong>Item:</strong> {selectedItem.name}
                </p>
                <p>
                  <strong>Price:</strong> {selectedItem.price} SAR
                </p>
                <p>
                  <strong>Current Quantity:</strong>{" "}
                  {getEffectiveQuantity(selectedItem)}
                </p>
              </div>

              <div className="return-form">
                <div className="form-group">
                  <label>
                    Quantity to {actionType === "return" ? "Return" : "Cancel"}:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getEffectiveQuantity(selectedItem)}
                    value={returnQuantity}
                    onChange={(e) =>
                      setReturnQuantity(parseInt(e.target.value) || 1)
                    }
                    className="quantity-input"
                  />
                </div>

                <div className="form-group">
                  <label>Reason:</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="reason-select"
                  >
                    <option value="">Select a reason</option>
                    <option value="Customer changed mind">
                      Customer changed mind
                    </option>
                    <option value="Wrong item">Wrong item</option>
                    <option value="Quality issue">Quality issue</option>
                    <option value="Too long wait">Too long wait</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {returnReason === "Other" && (
                  <div className="form-group">
                    <label>Specify reason:</label>
                    <input
                      type="text"
                      value={returnReason === "Other" ? "" : returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="reason-input"
                      placeholder="Enter reason"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                disabled={actionPending}
                className="confirm-button"
                onClick={submitItemAction}
              >
                {actionPending
                  ? "Processing..."
                  : actionType === "return"
                  ? "Confirm Return"
                  : "Confirm Cancellation"}
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowItemActionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className="modal-overlay">
          <div className="modal-content invoice-modal">
            <div className="modal-header">
              <h2>Invoice</h2>
              <div className="invoice-actions">
                <button className="print-button" onClick={() => window.print()}>
                  <FaPrint />
                  Print
                </button>
                <button
                  className="close-button"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="invoice-content">
              <div className="invoice-header">
                <h3>{invoiceData.branchName}</h3>
                <p>{invoiceData.tableName}</p>
                <p>VAT: {invoiceData.vatNumber}</p>
              </div>

              <div className="invoice-info">
                <p>
                  <strong>Invoice No:</strong> {invoiceData.invoiceNo}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(invoiceData.date).toLocaleString()}
                </p>
                <p>
                  <strong>Table:</strong> {invoiceData.tableName}
                </p>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.orders &&
                    invoiceData.orders.map((order) =>
                      order.items.map((item, idx) => (
                        <tr key={`${order.orderId}-${idx}`}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price} SAR</td>
                          <td>{item.total.toFixed(2)} SAR</td>
                        </tr>
                      ))
                    )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right">
                      <strong>Total Amount:</strong>
                    </td>
                    <td>
                      <strong>{invoiceData.totalAmount.toFixed(2)} SAR</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="invoice-footer">
                <p>Thank you for dining with us!</p>
                <p className="small-text">
                  Customer: {tableSession?.session?.customerName || "Guest"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedTable && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <h2>Confirm Payment</h2>
            <p>
              Are you sure payment is complete for {selectedTable.name}? This
              will end the current session.
            </p>
            <div className="payment-actions">
              <button className="confirm-button" onClick={handlePaymentConfirm}>
                Yes, Complete
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowTableModal(true);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiningAdmin;
