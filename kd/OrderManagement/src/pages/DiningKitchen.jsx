// src/Components/DiningKitchen.js
import React, { useState, useEffect } from "react";
import {
  getBranchTables,
  getBranchOrders,
  updateKitchenOrderStatus,
} from "../utils/api";
// import "../styles/DiningKitchen.css";
import { useKitchenSocket } from "../contexts/KitchenSocketContext";
import {
  FaClock,
  FaTimes,
  FaCheck,
  FaUtensils,
  FaHourglass,
  FaBell,
  FaFire,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { TbReload } from "react-icons/tb";

function DiningKitchen() {
  const [modalOpen, setModalOpen] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState({});
  const [ordersToDisplay, setOrdersToDisplay] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({}); // Track expanded state of orders

  // Get branchId from localStorage
  const branchId = localStorage.getItem("branchId");
  console.log("Using branchId:", branchId);

  // Socket context
  const {
    isConnected,
    newOrderEvents,
    orderStatusEvents,
    clearNewOrderEvents,
    clearOrderStatusEvents,
    socket,
  } = useKitchenSocket();

  // Make fetchOrders globally accessible for socket context
  const fetchOrders = async () => {
    if (!branchId) {
      console.error("No branchId found in localStorage");
      return;
    }

    try {
      const response = await getBranchOrders(branchId);
      console.log("Fetching orders from server...");

      if (response.success && response.data?.orders) {
        console.log(
          "FULL ORDER DATA FROM SERVER:",
          JSON.stringify(response.data.orders)
        );

        // Fix: Process the data to ensure cancelledQuantity is properly set
        const processedOrders = response.data.orders.map((order) => {
          // Ensure items have proper cancelledQuantity values
          if (order.items) {
            order.items = order.items.map((item) => {
              // Ensure cancelledQuantity exists (even if 0)
              return {
                ...item,
                cancelledQuantity: item.cancelledQuantity || 0,
              };
            });
          }
          return order;
        });

        const ordersByTable = processedOrders.reduce((acc, order) => {
          // We only want orders that have been admin_approved or in_preparation
          if (
            order.status === "admin_approved" ||
            order.status === "in_preparation"
          ) {
            // Check if the order has any active items (not fully cancelled)
            const hasActiveItems = order.items.some((item) => {
              const effectiveQty =
                item.quantity - (item.cancelledQuantity || 0);
              return effectiveQty > 0;
            });

            // Only include orders with active items
            if (hasActiveItems) {
              if (!acc[order.tableName]) {
                acc[order.tableName] = [];
              }
              acc[order.tableName].push(order);
            }
          }
          return acc;
        }, {});

        setOrders(ordersByTable);

        // Create flat list of orders for display
        const allOrders = Object.values(ordersByTable).flat();
        setOrdersToDisplay(allOrders);

        console.log("Kitchen orders by table updated");

        // Update notifications for tables with new orders
        const newNotifications = { ...notifications };
        Object.entries(ordersByTable).forEach(([tableName, tableOrders]) => {
          newNotifications[tableName] = tableOrders.some(
            (order) => order.status === "admin_approved"
          );
        });
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Make fetchOrders globally accessible
  useEffect(() => {
    window.fetchKitchenOrders = fetchOrders;
    return () => {
      window.fetchKitchenOrders = null;
    };
  }, []);

  // Log connection status
  useEffect(() => {
    console.log("Kitchen dashboard socket connection status:", isConnected);
  }, [isConnected]);

  // Add dedicated handler for order_updated events
  useEffect(() => {
    if (socket) {
      const handleOrderUpdated = (data) => {
        console.log("Order updated event received with full details:", data);

        // If we have the full order data with items, update directly
        if (data.items) {
          console.log("RECEIVED FULL ORDER UPDATE:", JSON.stringify(data));
          setOrders((prevOrders) => {
            const updatedOrders = { ...prevOrders };

            if (data.tableName && updatedOrders[data.tableName]) {
              // Find and update the specific order
              updatedOrders[data.tableName] = updatedOrders[data.tableName].map(
                (order) => {
                  if (order._id === data.orderId) {
                    // Create a new order object with updated items
                    // Ensure each item has the cancelledQuantity property set
                    const processedItems = data.items.map((item) => ({
                      ...item,
                      cancelledQuantity: item.cancelledQuantity || 0,
                    }));

                    return {
                      ...order,
                      items: processedItems,
                      totalAmount: data.totalAmount || order.totalAmount,
                    };
                  }
                  return order;
                }
              );

              // Remove empty tables
              if (updatedOrders[data.tableName].length === 0) {
                delete updatedOrders[data.tableName];
              }

              // Update the flat list of orders
              const allOrders = Object.values(updatedOrders).flat();
              setOrdersToDisplay(allOrders);
            }

            return updatedOrders;
          });
        } else {
          // If we don't have full data, refresh all orders
          fetchOrders();
        }
      };

      socket.on("order_updated", handleOrderUpdated);

      return () => {
        socket.off("order_updated", handleOrderUpdated);
      };
    }
  }, [socket]);

  // Fetch tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getBranchTables();
        console.log("Fetching tables...");

        if (response.success && response.data) {
          const tableData = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];

          setTables(tableData);

          // Initialize notifications
          const initialNotifications = {};
          tableData.forEach((table) => {
            initialNotifications[table.name] = false;
          });
          setNotifications(initialNotifications);

          // Fetch initial orders
          await fetchOrders();
        } else {
          throw new Error("Failed to fetch tables");
        }
      } catch (err) {
        console.error("Error in initial fetch:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    } else {
      setError("Branch ID not found");
      setLoading(false);
    }
  }, []);

  // Handle order status update events
  useEffect(() => {
    if (orderStatusEvents.length > 0) {
      console.log("Processing order status updates in Kitchen");

      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };

        orderStatusEvents.forEach((statusEvent) => {
          const { orderId, tableName, status } = statusEvent;

          // Only handle specific statuses relevant to kitchen
          if (
            ![
              "admin_approved",
              "in_preparation",
              "ready_for_pickup",
              "served",
              "canceled",
            ].includes(status)
          ) {
            return;
          }

          // If this is a new admin_approved order
          if (status === "admin_approved") {
            // Find the table or create it
            if (!updatedOrders[tableName]) {
              updatedOrders[tableName] = [];
            }

            // Check if we already have this order
            const existingOrderIndex = updatedOrders[tableName].findIndex(
              (o) => o._id === orderId
            );

            // If we don't have it yet, we'll get the full order in newOrderEvents
            // If we do have it, update its status
            if (existingOrderIndex >= 0) {
              updatedOrders[tableName][existingOrderIndex].status = status;
              updatedOrders[tableName][existingOrderIndex].statusTimestamps = {
                ...updatedOrders[tableName][existingOrderIndex]
                  .statusTimestamps,
                [status]: new Date(),
              };
            }

            // Set notification for this table
            setNotifications((prev) => ({
              ...prev,
              [tableName]: true,
            }));
          }

          // If existing order is updated to in_preparation or ready_for_pickup
          else if (["in_preparation", "ready_for_pickup"].includes(status)) {
            // Find and update order
            Object.keys(updatedOrders).forEach((key) => {
              updatedOrders[key] = updatedOrders[key].map((order) => {
                if (order._id === orderId) {
                  return {
                    ...order,
                    status,
                    statusTimestamps: {
                      ...order.statusTimestamps,
                      [status]: new Date(),
                    },
                  };
                }
                return order;
              });
            });
          }

          // Remove orders that are complete or canceled
          if (status === "served" || status === "canceled") {
            Object.keys(updatedOrders).forEach((tableKey) => {
              updatedOrders[tableKey] = updatedOrders[tableKey].filter(
                (order) => order._id !== orderId
              );

              // Remove empty tables
              if (updatedOrders[tableKey].length === 0) {
                delete updatedOrders[tableKey];
              }
            });
          }
        });

        // Update flat list of orders
        const allOrders = Object.values(updatedOrders).flat();
        setOrdersToDisplay(allOrders);

        return updatedOrders;
      });

      // Clear processed events
      clearOrderStatusEvents();
    }
  }, [orderStatusEvents]);

  // Handle item cancellations
  useEffect(() => {
    const handleItemCancelled = (data) => {
      console.log("Item cancelled event received:", data);

      // Update orders state
      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };

        // Find the table and order
        if (updatedOrders[data.tableName]) {
          updatedOrders[data.tableName] = updatedOrders[data.tableName]
            .map((order) => {
              if (order._id === data.orderId) {
                // Update the specific item
                const updatedItems = [...order.items];

                // Make sure we can find the item
                const itemIndex =
                  typeof data.itemIndex === "string"
                    ? parseInt(data.itemIndex)
                    : data.itemIndex;

                if (updatedItems[itemIndex]) {
                  // Log before update for debugging
                  console.log(
                    `Item before update: ${getItemName(
                      updatedItems[itemIndex]
                    )}, quantity: ${
                      updatedItems[itemIndex].quantity
                    }, cancelled: ${
                      updatedItems[itemIndex].cancelledQuantity || 0
                    }`
                  );

                  // Update with new cancelled quantity (not just replacing)
                  const currentCancelled =
                    updatedItems[itemIndex].cancelledQuantity || 0;
                  updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    cancelledQuantity: currentCancelled + data.quantity,
                    cancelReason: data.reason,
                    cancelledAt: new Date(),
                  };

                  // Log after update for debugging
                  console.log(
                    `Item after update: ${getItemName(
                      updatedItems[itemIndex]
                    )}, quantity: ${
                      updatedItems[itemIndex].quantity
                    }, cancelled: ${
                      updatedItems[itemIndex].cancelledQuantity || 0
                    }`
                  );
                }

                // Check if any effective items remain
                const hasEffectiveItems = updatedItems.some((item) => {
                  const effectiveQty =
                    item.quantity - (item.cancelledQuantity || 0);
                  return effectiveQty > 0;
                });

                // Remove order if no effective items remain
                if (!hasEffectiveItems) {
                  // We'll filter this order out in the return below
                  return null;
                }

                // Return updated order
                return {
                  ...order,
                  items: updatedItems,
                  totalAmount: data.newOrderTotal,
                };
              }
              return order;
            })
            .filter(Boolean); // Remove any null orders (those with no effective items)

          // Remove empty tables
          if (updatedOrders[data.tableName].length === 0) {
            delete updatedOrders[data.tableName];
          }
        }

        // Update flat list of orders
        const allOrders = Object.values(updatedOrders).flat();
        setOrdersToDisplay(allOrders);

        return updatedOrders;
      });

      // Force refresh after a small delay to ensure data is up-to-date
      setTimeout(() => {
        console.log("Forcing order refresh after cancellation");
        fetchOrders();
      }, 500);
    };

    // Set up socket listeners for item cancellations
    if (socket) {
      socket.on("order_item_cancelled", handleItemCancelled);

      return () => {
        socket.off("order_item_cancelled");
      };
    }
  }, [socket]);

  // Handle new order events from socket - these are admin-approved orders
  useEffect(() => {
    if (newOrderEvents.length > 0) {
      console.log("Processing new order events in Kitchen");

      // Filter only for admin_approved orders
      const approvedOrders = newOrderEvents.filter(
        (event) => event.status === "admin_approved"
      );

      if (approvedOrders.length > 0) {
        setOrders((prevOrders) => {
          const updatedOrders = { ...prevOrders };

          approvedOrders.forEach((orderEvent) => {
            const { tableName, items = [] } = orderEvent;

            // Log detailed item information for debugging
            if (items && items.length > 0) {
              console.log("New order items details:", JSON.stringify(items));

              // Log cancellation details if any
              items.forEach((item, index) => {
                if (item.cancelledQuantity) {
                  console.log(
                    `Item #${index} (${getItemName(item)}) has ${
                      item.cancelledQuantity
                    } cancelled of ${item.quantity} total`
                  );
                }
              });
            }

            // Check if order has any active items (not fully cancelled before approval)
            const hasActiveItems = items.some((item) => {
              const effectiveQty =
                item.quantity - (item.cancelledQuantity || 0);
              return effectiveQty > 0;
            });

            // Only include orders with active items
            if (hasActiveItems) {
              if (!updatedOrders[tableName]) {
                updatedOrders[tableName] = [];
              }

              // Check if order already exists (avoid duplicates)
              const existingOrderIndex = updatedOrders[tableName].findIndex(
                (order) => order._id === orderEvent.orderId
              );

              if (existingOrderIndex >= 0) {
                // Update existing order
                updatedOrders[tableName][existingOrderIndex] = {
                  ...updatedOrders[tableName][existingOrderIndex],
                  items: items.map((item) => ({
                    ...item,
                    cancelledQuantity: item.cancelledQuantity || 0,
                  })),
                  totalAmount: orderEvent.totalAmount,
                  status: orderEvent.status,
                };

                console.log(
                  "Updated existing order:",
                  updatedOrders[tableName][existingOrderIndex]
                );
              } else {
                // Create a properly formatted order object with cancelled quantities
                const processedItems = items.map((item) => ({
                  ...item,
                  // Ensure cancelled quantities are properly set
                  cancelledQuantity: item.cancelledQuantity || 0,
                }));

                const newOrder = {
                  _id: orderEvent.orderId,
                  tableName: orderEvent.tableName,
                  items: processedItems,
                  totalAmount: orderEvent.totalAmount,
                  status: orderEvent.status,
                  createdAt: orderEvent.createdAt,
                  statusTimestamps: {
                    pending: new Date(orderEvent.createdAt),
                    admin_approved: new Date(),
                  },
                };

                console.log("Adding new order:", newOrder);

                // Add to beginning of array for this table
                updatedOrders[tableName].unshift(newOrder);
              }
            }
          });

          // Update flat list of orders
          const allOrders = Object.values(updatedOrders).flat();
          setOrdersToDisplay(allOrders);

          return updatedOrders;
        });

        // Update notifications for new admin-approved orders
        setNotifications((prevNotifications) => {
          const updatedNotifications = { ...prevNotifications };

          approvedOrders.forEach((orderEvent) => {
            updatedNotifications[orderEvent.tableName] = true;
          });

          return updatedNotifications;
        });

        // Play notification sound if available
        const audio = document.getElementById("notification-sound");
        if (audio) {
          audio.play().catch((e) => console.log("Error playing sound:", e));
        }
      }

      // Clear processed events
      clearNewOrderEvents();
    }
  }, [newOrderEvents]);

  const handleTableClick = (tableName) => {
    console.log("Table clicked:", tableName);
    setModalOpen(tableName);
    setNotifications((prev) => ({
      ...prev,
      [tableName]: false,
    }));
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  // New handler for order expansion toggle
  const handleOrderClick = async (orderId) => {
    setExpandedOrders((prev) => {
      const newState = { ...prev };
      const isCurrentlyExpanded = !!prev[orderId];

      // Toggle expansion state
      newState[orderId] = !isCurrentlyExpanded;

      return newState;
    });

    // Check the current order in the list
    const order = ordersToDisplay.find((order) => order._id === orderId);

    // If order is being expanded AND it's in admin_approved status, update to in_preparation
    if (
      !expandedOrders[orderId] &&
      order &&
      order.status === "admin_approved"
    ) {
      try {
        const response = await updateKitchenOrderStatus(
          orderId,
          "in_preparation"
        );
        if (response.success) {
          console.log("Order moved to preparation:", orderId);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error starting preparation:", error);
        alert("Failed to update order status. Please try again.");
      }
    }
  };

  const handleMarkAsReady = async (orderId, e) => {
    // Stop propagation to prevent toggling expansion state
    if (e) e.stopPropagation();

    try {
      const response = await updateKitchenOrderStatus(
        orderId,
        "ready_for_pickup"
      );
      if (response.success) {
        // Socket will update the UI
        console.log("Order marked as ready for pickup:", orderId);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error marking as ready:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Improved getEffectiveQuantity function
  const getEffectiveQuantity = (item) => {
    if (!item) {
      console.error("Item is undefined in getEffectiveQuantity");
      return 0;
    }

    // Ensure we have numeric values
    const total = typeof item.quantity === "number" ? item.quantity : 0;
    const cancelled =
      typeof item.cancelledQuantity === "number" ? item.cancelledQuantity : 0;

    // Calculate effective quantity
    const effective = total - cancelled;

    // More detailed logging for debugging
    console.log(
      `CALCULATING: Item ${getItemName(
        item
      )} - Total: ${total}, Cancelled: ${cancelled}, Effective: ${effective}`
    );

    return effective > 0 ? effective : 0;
  };

  // Improved getItemName function to handle different data structures
  const getItemName = (item) => {
    if (!item) return "Unknown Item";

    // Try different possible locations for the name
    if (item.name) return item.name;

    if (item.itemId) {
      // If itemId is an object with nameEnglish property
      if (typeof item.itemId === "object" && item.itemId.nameEnglish) {
        return item.itemId.nameEnglish;
      }

      // If itemId is a string but we have nameEnglish directly on the item
      if (item.nameEnglish) {
        return item.nameEnglish;
      }
    }

    // Last resort, use a placeholder with a shorter ID
    return "Item #" + (item._id ? item._id.slice(-4) : "????");
  };

  // Function to render spice level as emoji
  const renderSpiceLevel = (level) => {
    if (!level || level === 0) return null;

    const emojis = [];
    for (let i = 0; i < level; i++) {
      emojis.push(<FaFire key={i} className="text-red-500 spice-icon" />);
    }

    return <span className="spice-level">{emojis}</span>;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Improved time elapsed function to handle hours and days
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "N/A";

    const start = new Date(timestamp);
    const now = new Date();
    const diffMs = now - start;

    // Convert to different time units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Choose appropriate unit for display
    if (diffSecs < 60) return diffSecs + " seconds ago";
    if (diffMins < 60)
      return diffMins + (diffMins === 1 ? " minute ago" : " minutes ago");
    if (diffHours < 24)
      return diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
    return diffDays + (diffDays === 1 ? " day ago" : " days ago");
  };

  if (loading)
    return (
      <div className="loading-message flex flex-col  w-full h-screen items-center justify-center space-y-4">
        <div className="loader w-12 h-12 border-4 border-t-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        <span className="text-lg font-semibold">
          Loading kitchen dashboard...
        </span>
      </div>
    );
  if (error)
    return (
      <div className="error-message text-red-500 text-lg font-semibold text-center mt-5">
        {error}
      </div>
    );

  // Filter orders by status
  const ordersToProcess = ordersToDisplay.filter(
    (order) =>
      order.status === "admin_approved" || order.status === "in_preparation"
  );

  return (
    <div className="bg-white w-full">
      {/* Optional notification sound */}
      <audio id="notification-sound" src="/notification.mp3" />

      {/* Connection status indicator (can be hidden in production) */}
      <div
        className={`connection-status hidden ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      {/* Main dashboard header */}
      <div className="flex gap-2 items-center">
        <h1 className="font-semibold text-2xl">Kitchen Dashboard</h1>
        <button
          className="m-0 bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors text-xl font-bold"
          onClick={fetchOrders}
        >
          <TbReload />
        </button>
      </div>

      {/* Dashboard Content - Orders to Prepare */}
      <div className="w-full  mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Orders To Prepare
        </h2>

        {ordersToProcess.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ordersToProcess.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  order.status === "admin_approved"
                    ? "border-l-blue-500 hover:shadow-md"
                    : "border-l-amber-500 hover:shadow-md"
                } transition-all duration-200 cursor-pointer`}
                onClick={() => handleOrderClick(order._id)}
              >
                {/* Order Header */}
                <div className="p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-medium text-sm">
                        Table {order.tableName}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{order._id.slice(-4)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "admin_approved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status === "admin_approved"
                          ? "New Order"
                          : "In Preparation"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeElapsed(
                          order.status === "admin_approved"
                            ? order.statusTimestamps?.admin_approved
                            : order.statusTimestamps?.in_preparation
                        )}
                      </span>
                    </div>
                  </div>

                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    {expandedOrders[order._id] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Expanded Order Items */}
                {expandedOrders[order._id] && (
                  <div className="border-t border-gray-100 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Items
                    </h3>

                    <ul className="space-y-3">
                      {order.items
                        .filter((item) => {
                          if (!item) {
                            console.error(
                              "Encountered null item in order:",
                              order._id
                            );
                            return false;
                          }
                          const effectiveQty = getEffectiveQuantity(item);
                          return effectiveQty > 0;
                        })
                        .map((item, i) => {
                          const effectiveQty = getEffectiveQuantity(item);
                          const itemName = getItemName(item);
                          console.log(
                            `Rendering item: ${itemName}, qty=${
                              item.quantity
                            }, cancelled=${
                              item.cancelledQuantity || 0
                            }, effective=${effectiveQty}, spiceLevel=${
                              item.spiceLevel || 0
                            }`
                          );

                          return (
                            <li key={i} className="flex items-start gap-3">
                              <span className="h-6 w-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                                {effectiveQty}
                              </span>

                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-medium text-gray-800">
                                    {itemName}
                                  </span>

                                  {item.spiceLevel > 0 && (
                                    <div className="flex">
                                      {[...Array(item.spiceLevel)].map(
                                        (_, i) => (
                                          <svg
                                            key={i}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-red-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                              fillRule="evenodd"
                                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {item.cancelledQuantity > 0 && (
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
                                      {item.cancelledQuantity} cancelled
                                    </span>
                                  )}
                                </div>

                                {item.dietaryNotes && (
                                  <div className="mt-1 bg-gray-50 p-2 rounded text-sm text-gray-600">
                                    <span className="font-medium">Notes: </span>
                                    {item.dietaryNotes}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>

                    {/* Action Button */}
                    {order.status === "in_preparation" && (
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          onClick={(e) => handleMarkAsReady(order._id, e)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          Ready for Pickup
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
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
            <p className="mt-4 text-gray-600 font-medium">
              No orders to prepare
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              New orders will appear here when they're ready
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal (preserved for reference but redesigned) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h4 className="text-lg font-medium text-gray-900">
                Table {modalOpen}
              </h4>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
                onClick={closeModal}
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

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {orders[modalOpen]?.length > 0 ? (
                <div className="space-y-6">
                  {orders[modalOpen].map((order, orderIndex) => (
                    <div
                      key={order._id}
                      className={`border-l-4 ${
                        order.status === "admin_approved"
                          ? "border-l-blue-500"
                          : order.status === "in_preparation"
                          ? "border-l-amber-500"
                          : "border-l-green-500"
                      } bg-white rounded-md shadow-sm p-4`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">
                            Order #{orderIndex + 1}
                          </h5>
                          <span className="text-sm text-gray-500">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "admin_approved"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "in_preparation"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status === "admin_approved"
                            ? "Approved"
                            : order.status === "in_preparation"
                            ? "Preparing"
                            : order.status}
                        </span>
                      </div>

                      <ul className="space-y-3">
                        {order.items
                          .filter((item) => getEffectiveQuantity(item) > 0)
                          .map((item, itemIndex) => {
                            const itemName = getItemName(item);
                            const effectiveQty = getEffectiveQuantity(item);
                            const partialCancelled =
                              item.cancelledQuantity > 0 && effectiveQty > 0;

                            return (
                              <li
                                key={itemIndex}
                                className="flex items-start gap-3"
                              >
                                <span className="h-6 w-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                                  {effectiveQty}
                                </span>

                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-medium text-gray-800">
                                      {itemName}
                                    </span>

                                    {item.spiceLevel > 0 && (
                                      <div className="flex">
                                        {[...Array(item.spiceLevel)].map(
                                          (_, i) => (
                                            <svg
                                              key={i}
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 text-red-500"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                              <path
                                                fillRule="evenodd"
                                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          )
                                        )}
                                      </div>
                                    )}

                                    {partialCancelled && (
                                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
                                        {item.cancelledQuantity} cancelled
                                      </span>
                                    )}
                                  </div>

                                  {item.dietaryNotes && (
                                    <div className="mt-1 bg-gray-50 p-2 rounded text-sm text-gray-600">
                                      <span className="font-medium">
                                        Notes:{" "}
                                      </span>
                                      {item.dietaryNotes}
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
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
                  <p className="mt-4 text-gray-600">
                    No active orders for this table
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiningKitchen;
