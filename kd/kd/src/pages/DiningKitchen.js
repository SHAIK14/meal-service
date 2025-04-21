// src/Components/DiningKitchen.js
import React, { useState, useEffect } from "react";
import {
  getBranchTables,
  getBranchOrders,
  updateKitchenOrderStatus,
} from "../utils/api";
import "../styles/DiningKitchen.css";
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
    return <div className="loading-message">Loading kitchen dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Filter orders by status
  const ordersToProcess = ordersToDisplay.filter(
    (order) =>
      order.status === "admin_approved" || order.status === "in_preparation"
  );

  return (
    <div className="kitchen-dashboard-container">
      {/* Optional notification sound */}
      <audio id="notification-sound" src="/notification.mp3" />

      {/* Connection status indicator (can be hidden in production) */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      {/* Main dashboard header */}
      <div className="dashboard-header">
        <h1>Kitchen Dashboard</h1>
        <button className="refresh-button" onClick={fetchOrders}>
          Refresh Orders
        </button>
      </div>

      {/* Dashboard Content - Orders to Prepare */}
      <div className="dashboard-content">
        <h2>Orders To Prepare</h2>
        {ordersToProcess.length > 0 ? (
          <div className="orders-grid">
            {ordersToProcess.map((order) => (
              <div
                key={order._id}
                className={`order-card ${order.status} ${
                  order.status === "admin_approved" ? "new-order" : ""
                }`}
                onClick={() => handleOrderClick(order._id)}
              >
                <div className="order-header">
                  <div className="order-title">
                    <span className="table-name">Table {order.tableName}</span>
                    <span className="order-id">
                      Order #{order._id.slice(-4)}
                    </span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status}`}>
                      {order.status === "admin_approved"
                        ? "New Order"
                        : "In Preparation"}
                    </span>
                    <span className="time-elapsed">
                      {getTimeElapsed(
                        order.status === "admin_approved"
                          ? order.statusTimestamps?.admin_approved
                          : order.statusTimestamps?.in_preparation
                      )}
                    </span>
                    <span className="expand-indicator">
                      {expandedOrders[order._id] ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>
                </div>

                {expandedOrders[order._id] && (
                  <div className="order-items-container">
                    <h3>Items</h3>
                    <ul className="order-items">
                      {order.items
                        .filter((item) => {
                          // Verify we have a valid item to work with
                          if (!item) {
                            console.error(
                              "Encountered null item in order:",
                              order._id
                            );
                            return false;
                          }

                          // Calculate effective quantity after cancellations
                          const effectiveQty = getEffectiveQuantity(item);

                          // Only show items with positive effective quantity
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
                            <li key={i} className="order-item">
                              <span className="item-quantity">
                                {effectiveQty}×
                              </span>
                              <div className="item-details">
                                <span className="item-name">{itemName}</span>
                                {item.spiceLevel > 0 &&
                                  renderSpiceLevel(item.spiceLevel)}

                                {item.cancelledQuantity > 0 && (
                                  <span className="item-cancelled-note">
                                    ({item.cancelledQuantity} cancelled)
                                  </span>
                                )}

                                {item.dietaryNotes && (
                                  <div className="dietary-notes">
                                    <span className="dietary-notes-label">
                                      Notes:
                                    </span>
                                    <span className="dietary-notes-text">
                                      {item.dietaryNotes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>

                    <div className="order-action">
                      {order.status === "in_preparation" && (
                        <button
                          className="ready-pickup-btn"
                          onClick={(e) => handleMarkAsReady(order._id, e)}
                        >
                          <FaBell className="action-icon" />
                          Ready for Pickup
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders-message">
            <p>No orders to prepare</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal (legacy but keep for reference) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Table {modalOpen}</h4>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              {orders[modalOpen]?.length > 0 ? (
                <div className="orders-list">
                  {orders[modalOpen].map((order, orderIndex) => (
                    <div
                      key={order._id}
                      className={`order-section ${order.status}`}
                    >
                      <div className="order-header">
                        <h5>Order #{orderIndex + 1}</h5>
                        <span className="order-time">
                          {formatTime(order.createdAt)}
                        </span>
                        <span className={`order-status ${order.status}`}>
                          {order.status === "admin_approved"
                            ? "Approved"
                            : order.status === "in_preparation"
                            ? "Preparing"
                            : order.status}
                        </span>
                      </div>
                      <ul className="order-items">
                        {order.items
                          .filter((item) => getEffectiveQuantity(item) > 0)
                          .map((item, itemIndex) => {
                            const itemName = getItemName(item);
                            const effectiveQty = getEffectiveQuantity(item);
                            const partialCancelled =
                              item.cancelledQuantity > 0 && effectiveQty > 0;

                            return (
                              <li key={itemIndex} className="order-item">
                                <span className="item-name">{itemName}</span>
                                {item.spiceLevel > 0 &&
                                  renderSpiceLevel(item.spiceLevel)}
                                <span className="item-quantity">
                                  ×{effectiveQty}
                                </span>
                                {partialCancelled && (
                                  <span className="item-cancelled-note">
                                    ({item.cancelledQuantity} cancelled)
                                  </span>
                                )}
                                {item.dietaryNotes && (
                                  <div className="dietary-notes">
                                    <span className="dietary-notes-label">
                                      Notes:
                                    </span>
                                    <span className="dietary-notes-text">
                                      {item.dietaryNotes}
                                    </span>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-orders">No active orders for this table</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiningKitchen;
