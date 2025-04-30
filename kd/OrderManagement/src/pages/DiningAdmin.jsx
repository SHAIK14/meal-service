// src/pages/DiningAdmin.jsx
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
  FaMoneyBill,
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
  processPayment,
  getPaymentDetails,
} from "../utils/api";
import { useKitchenSocket } from "../contexts/KitchenSocketContext";

// Import new components
import TableGrid from "./TableGrid";
import OrdersDisplay from "./OrdersDisplay";
import PaymentProcessor from "./PaymentProcessor";

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

  // This will be replaced by the new payment flow
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

      // Include payment method data in the session completion
      const paymentData = {
        paymentMethod: receiptNumber ? "card" : "cash",
        // Only include receipt number if card payment was used
        ...(receiptNumber && { receiptNumber }),
      };
      // Then complete the session with payment data
      const response = await completeSession(
        tableSession.session._id,
        paymentData
      );

      if (response.success) {
        // Close all modals
        setShowPaymentModal(false);
        setShowTableModal(false);

        // Reset receipt number
        setReceiptNumber("");

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

  const handlePaymentComplete = () => {
    // Reset all payment related states
    setShowPaymentModal(false);
    setShowTableModal(false);

    // Refresh table status (the socket will probably handle this too)
    fetchTables();

    // Reset session
    setTableSession(null);

    alert("Payment completed successfully!");
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

  if (loading)
    return (
      <div className="loading-message flex flex-col w-full h-screen items-center justify-center space-y-4">
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

      {/* Use the TableGrid component for displaying tables */}
      <TableGrid
        tables={tables}
        notifications={notifications}
        onTableClick={handleTableClick}
      />

      {/* Table Actions Modal */}
      {showTableModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
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
                        Process Payment
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3">
              <button
                className="w-full text-red-500 hover:text-white hover:bg-red-500 active:bg-red-500 cursor-pointer px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors"
                onClick={() => setShowTableModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use the OrdersDisplay component */}
      {showOrdersModal && selectedTable && tableSession?.session && (
        <OrdersDisplay
          tableSession={tableSession}
          selectedTable={selectedTable}
          onClose={() => {
            setShowOrdersModal(false);
            setShowTableModal(true);
          }}
          handleOrderStatusChange={handleOrderStatusChange}
          handleItemAction={handleItemAction}
          handleGenerateInvoice={handleGenerateInvoice}
          formatTimestamp={formatTimestamp}
          getEffectiveQuantity={getEffectiveQuantity}
          hasActiveItems={hasActiveItems}
        />
      )}

      {/* Use the PaymentProcessor component for the new payment flow */}
      {showPaymentModal && selectedTable && tableSession?.session && (
        <PaymentProcessor
          selectedTable={selectedTable}
          tableSession={tableSession}
          onClose={() => {
            setShowPaymentModal(false);
            setShowTableModal(true);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
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
    </div>
  );
}

export default DiningAdmin;
