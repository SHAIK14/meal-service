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
// import "../styles/DiningAdmin.css";
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
      console.log("Invoice response:", response);

      if (response.success) {
        // The data structure appears to be:
        // response = { success: true, data: { success: true, data: {...actual invoice data...} } }
        let processedData = response.data;

        // Check if we need to drill down one more level
        if (processedData.success && processedData.data) {
          processedData = processedData.data;
        }

        console.log("Final processed invoice data:", processedData);
        setInvoiceData(processedData);
        setShowInvoiceModal(true);
      } else {
        alert(response.message || "Failed to generate invoice");
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

  if (loading)
    return (
      <div className="loading-message flex flex-col  w-full h-screen items-center justify-center space-y-4">
        <div className="loader w-12 h-12 border-4 border-t-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        <span className="text-lg font-semibold">
          Loading Dining dashboard...
        </span>
      </div>
    );
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bg-white h-screen">
      {/* Notification sound */}
      <audio id="notification-sound" src="/notification.mp3" />

      {/* Connection status indicator (can be hidden in production) */}
      <div
        className={`connection-status hidden ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      <div className="text-2xl font-semibold mb-4">
        <h1>Dining Tables</h1>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`
        flex flex-col items-center justify-center gap-4 w-40 h-40 
        border-2 rounded-2xl p-4 cursor-pointer transition-colors duration-300
        ${
          table.status === "available"
            ? "bg-green-100 border-green-300"
            : "bg-red-100 border-red-300"
        }
      `}
          >
            <FaUtensils
              className={`text-4xl ${
                table.status === "available" ? "text-green-600" : "text-red-600"
              }`}
            />
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-2xl font-bold">{table.name}</h3>
              <span
                className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${
                  table.status === "available" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </span>
              {notifications[table.name] > 0 && (
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1">
                  {notifications[table.name]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table Actions Modal */}
      {showTableModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedTable.name}
                </h2>
                {tableSession?.session?.paymentRequested && (
                  <div className="flex items-center text-sm mt-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    <FaBell className="mr-2" />
                    Payment Requested
                  </div>
                )}
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowTableModal(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="space-y-3">
                {/* Show Mark as Available only when no active session */}
                {selectedTable.status === "occupied" &&
                  !tableSession?.session && (
                    <button
                      className="w-full flex items-center cursor-pointer justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-3 rounded-lg font-medium transition-colors"
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
                      className="w-full flex items-center justify-center cursor-pointer gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
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
                        className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 cursor-pointer text-green-700 px-4 py-3 rounded-lg font-medium transition-colors"
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

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3">
              <button
                className="w-full text-red-500 hover:text-white hover:bg-red-500 active:bg-red-500 cursor-pointer px-4 py-2 rounded-lg font-medium border border-gray-200  transition-colors"
                onClick={() => setShowTableModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && selectedTable && tableSession?.session && (
        <div className="fixed inset-0  bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedTable.name}
                  </h2>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">
                      Session Total:{" "}
                      {tableSession?.session?.totalAmount?.toFixed(2) || "0.00"}{" "}
                      SAR
                    </span>
                  </div>
                </div>
                <button
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-full p-2 text-gray-500 transition-all duration-200"
                  onClick={() => {
                    setShowOrdersModal(false);
                    setShowTableModal(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Orders List Container with Subtle Scrollbar */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {tableSession.orders && tableSession.orders.length > 0 ? (
                tableSession.orders.map((order) => (
                  <div
                    key={order._id}
                    className="mb-4 border-b border-gray-100 last:border-b-0"
                  >
                    {/* Order Header */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">
                            #{order._id.slice(-4)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-md 
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        order.status === "admin_approved"
                          ? "bg-blue-100 text-blue-800"
                          : ""
                      }
                      ${
                        order.status === "in_preparation"
                          ? "bg-orange-100 text-orange-800"
                          : ""
                      }
                      ${
                        order.status === "ready_for_pickup"
                          ? "bg-purple-100 text-purple-800"
                          : ""
                      }
                      ${
                        order.status === "served"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        order.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    `}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatTimestamp(order.createdAt)}
                        </div>
                      </div>

                      {/* Order Status Timeline */}
                      {(order.statusTimestamps?.admin_approved ||
                        order.statusTimestamps?.in_preparation ||
                        order.statusTimestamps?.ready_for_pickup ||
                        order.statusTimestamps?.served) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 overflow-x-auto pb-1">
                          <div className="flex items-center whitespace-nowrap">
                            {order.statusTimestamps?.admin_approved && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Approved:{" "}
                                {formatTimestamp(
                                  order.statusTimestamps.admin_approved
                                )}
                              </span>
                            )}
                          </div>
                          {order.statusTimestamps?.in_preparation && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md whitespace-nowrap">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              Prep:{" "}
                              {formatTimestamp(
                                order.statusTimestamps.in_preparation
                              )}
                            </span>
                          )}
                          {order.statusTimestamps?.ready_for_pickup && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md whitespace-nowrap">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              Ready:{" "}
                              {formatTimestamp(
                                order.statusTimestamps.ready_for_pickup
                              )}
                            </span>
                          )}
                          {order.statusTimestamps?.served && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md whitespace-nowrap">
                              <span className="w-2 h-2 bg-green-500  rounded-full"></span>
                              Served:{" "}
                              {formatTimestamp(order.statusTimestamps.served)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Next Action Button */}
                      {getNextAction(order) && (
                        <button
                          className={`w-full mt-2 px-4 py-2 cursor-pointer rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
                      ${
                        getNextAction(order).color === "green"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""
                      }
                      ${
                        getNextAction(order).color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : ""
                      }
                      ${
                        getNextAction(order).color === "orange"
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : ""
                      }
                      ${
                        getNextAction(order).color === "purple"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : ""
                      }
                      ${
                        getNextAction(order).color === "red"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }
                    `}
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

                    {/* Order Items */}
                    <div className="px-4 pb-4">
                      <div className="bg-gray-50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600">
                              <th className="px-4 py-2 text-left font-medium">
                                Item
                              </th>
                              <th className="px-4 py-2 text-center font-medium">
                                Qty
                              </th>
                              <th className="px-4 py-2 text-right font-medium">
                                Price
                              </th>
                              <th className="px-4 py-2 text-right font-medium">
                                Action
                              </th>
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
                                    className={`border-b border-gray-200 last:border-b-0 ${
                                      isReturned || isCancelled
                                        ? "bg-gray-50"
                                        : ""
                                    }`}
                                  >
                                    <td className="px-4 py-3 text-gray-800 font-medium">
                                      {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex flex-col items-center">
                                        <span className="font-medium">
                                          {effectiveQuantity}
                                        </span>
                                        {isReturned && (
                                          <span className="text-xs text-red-600">
                                            (-{item.returnedQuantity} returned)
                                          </span>
                                        )}
                                        {isCancelled && (
                                          <span className="text-xs text-red-600">
                                            (-{item.cancelledQuantity}{" "}
                                            cancelled)
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div>
                                        <div className="font-medium">
                                          {(
                                            effectiveQuantity *
                                              (item?.price || 0) || 0
                                          ).toFixed(2)}{" "}
                                          SAR
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.price} SAR each
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      {effectiveQuantity > 0 &&
                                        order.status !== "canceled" && (
                                          <button
                                            className={`cursor-pointer px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 
                                      ${
                                        order.status === "served"
                                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                      }`}
                                            onClick={() =>
                                              handleItemAction(order, idx, item)
                                            }
                                          >
                                            {order.status === "served" ? (
                                              <>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-3 w-3"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                                Return
                                              </>
                                            ) : (
                                              <>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-3 w-3"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                                Cancel
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
                                    colSpan="4"
                                    className="px-4 py-4 text-center text-gray-500 italic"
                                  >
                                    No active items in this order. It will be
                                    automatically canceled.
                                  </td>
                                </tr>
                              )}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100">
                              <td
                                colSpan="2"
                                className="px-4 py-3 text-right font-bold text-gray-700"
                              >
                                Order Total:
                              </td>
                              <td
                                colSpan="2"
                                className="px-4 py-3 text-right font-bold text-gray-800"
                              >
                                {(order?.totalAmount || 0).toFixed(2)} SAR
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This table has no orders in the current session
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                onClick={handleGenerateInvoice}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Action Modal (for returns or cancellations) */}
      {showItemActionModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden transform transition-all">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">
                {actionType === "return" ? "Return Item" : "Cancel Item"}
              </h2>
              <button
                className="text-gray-400 cursor-pointer hover:text-gray-500 transition-colors focus:outline-none"
                onClick={() => setShowItemActionModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Item details card */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Item</p>
                    <p className="font-medium text-gray-900">
                      {selectedItem.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Price</p>
                    <p className="font-medium text-gray-900">
                      {selectedItem.price} SAR
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Current Quantity</p>
                    <p className="font-medium text-gray-900">
                      {getEffectiveQuantity(selectedItem)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to {actionType === "return" ? "Return" : "Cancel"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getEffectiveQuantity(selectedItem)}
                    value={returnQuantity}
                    onChange={(e) =>
                      setReturnQuantity(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specify reason
                    </label>
                    <input
                      type="text"
                      value={returnReason === "Other" ? "" : returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter reason"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
              <button
                className="px-4 py-2 bg-white border cursor-pointer border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                onClick={() => setShowItemActionModal(false)}
              >
                Cancel
              </button>
              <button
                disabled={actionPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={submitItemAction}
              >
                {actionPending
                  ? "Processing..."
                  : actionType === "return"
                  ? "Confirm Return"
                  : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 ">
          <div className="bg-white  rounded-lg shadow-xl w-full max-w-2xl ">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6  border-b border-gray-100">
              <div className="flex items-center gap-4 mt-4">
                <h2 className="text-xl font-medium text-gray-900">Invoice</h2>
                <button
                  className="flex items-center cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => window.print()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Print
                </button>
              </div>
              <div className="flex items-center ">
                <button
                  className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="px-6  space-y-6">
              <div className="flex justify-between items-center mt-4">
                {/* Restaurant Info */}
                <div className="text-center flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {invoiceData?.branchName || "Restaurant"}
                  </h3>
                  {invoiceData?.tableName && (
                    <p className="text-gray-600 mt-1">
                      Table Name: {"  "} {invoiceData.tableName}
                    </p>
                  )}
                </div>
                {invoiceData?.vatNumber && (
                  <p className="text-gray-600 text-sm mt-1">
                    VAT: {invoiceData.vatNumber}
                  </p>
                )}
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Invoice No</p>
                  <p className="font-medium text-gray-900">
                    {invoiceData?.invoiceNo || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-900">
                    {invoiceData?.date
                      ? new Date(invoiceData.date).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Table</p>
                  <p className="font-medium text-gray-900">
                    {invoiceData?.tableName || "-"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceData?.orders &&
                      invoiceData.orders.map(
                        (order) =>
                          order.items &&
                          order.items.map((item, idx) => (
                            <tr
                              key={`${order.orderId}-${idx}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {item.price} SAR
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                {(item.total || 0).toFixed(2)} SAR
                              </td>
                            </tr>
                          ))
                      )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                      >
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {(invoiceData?.totalAmount || 0).toFixed(2)} SAR
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Invoice Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">Thank you for dining with us!</p>
                <p className="text-xs text-gray-500 mt-2">
                  Customer: {tableSession?.session?.customerName || "Guest"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedTable && (
        <div className="bg-black/50 w-full h-screen fixed flex items-center justify-center inset-0 z-40">
          <div className="bg-white p-4 w-full max-w-xl">
            <h2 className="font-semibold text-2xl py-2">Confirm Payment</h2>
            <p className="">
              Are you sure payment is complete for {selectedTable.name}? This
              will end the current session.
            </p>
            <div className="font-semibold flex flex-col gap-4 mt-4">
              <button
                className="bg-green-100 px-4 py-2 text-green-600 rounded-lg cursor-pointer hover:bg-green-500 hover:text-white transition-all ease-in-out w-full"
                onClick={handlePaymentConfirm}
              >
                Yes, Complete
              </button>
              <button
                className="bg-red-100 px-4 py-2 text-red-600 rounded-lg cursor-pointer hover:bg-red-500 hover:text-white transition-all ease-in-out w-full"
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
