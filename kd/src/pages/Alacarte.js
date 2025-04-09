import React, { useState, useEffect } from "react";
import {
  getBranchTables,
  getBranchOrders,
  updateOrderStatus,
} from "../utils/api";
import "../styles/Alacarte.css";
import { useKitchenSocket } from "../contexts/KitchenSocketContext";

function Alacarte() {
  const [modalOpen, setModalOpen] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState({});

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
  } = useKitchenSocket();

  // Log connection status
  useEffect(() => {
    console.log("Kitchen socket connection status:", isConnected);
  }, [isConnected]);

  // Fetch orders for the branch - used for initial load
  const fetchOrders = async () => {
    if (!branchId) {
      console.error("No branchId found in localStorage");
      return;
    }

    try {
      const response = await getBranchOrders(branchId);
      console.log("Initial orders response:", response);

      if (response.success && response.data?.orders) {
        // Group active orders (pending and accepted) by table
        const ordersByTable = response.data.orders.reduce((acc, order) => {
          if (order.status === "pending" || order.status === "accepted") {
            if (!acc[order.tableName]) {
              acc[order.tableName] = [];
            }
            acc[order.tableName].push(order);
          }
          return acc;
        }, {});

        setOrders(ordersByTable);
        console.log("Initial active orders by table:", ordersByTable);

        // Update notifications for tables with pending orders only
        const newNotifications = { ...notifications };
        Object.entries(ordersByTable).forEach(([tableName, tableOrders]) => {
          newNotifications[tableName] = tableOrders.some(
            (order) => order.status === "pending"
          );
        });
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error("Error fetching initial orders:", error);
    }
  };

  // Fetch tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getBranchTables();
        console.log("Tables response:", response);

        if (response.success && response.data.data) {
          const tableData = response.data.data;
          console.log("Table data:", tableData);
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

  // Handle new order events from socket
  useEffect(() => {
    if (newOrderEvents.length > 0) {
      console.log("Processing new order events:", newOrderEvents);

      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };

        newOrderEvents.forEach((orderEvent) => {
          const { tableName } = orderEvent;

          if (!updatedOrders[tableName]) {
            updatedOrders[tableName] = [];
          }

          // Check if order already exists (avoid duplicates)
          const orderExists = updatedOrders[tableName].some(
            (order) => order._id === orderEvent.orderId
          );

          if (!orderExists) {
            // Create a properly formatted order object
            const newOrder = {
              _id: orderEvent.orderId,
              tableName: orderEvent.tableName,
              items: orderEvent.items,
              totalAmount: orderEvent.totalAmount,
              status: orderEvent.status,
              createdAt: orderEvent.createdAt,
            };

            // Add to beginning of array for this table
            updatedOrders[tableName].unshift(newOrder);
          }
        });

        return updatedOrders;
      });

      // Update notifications for pending orders
      setNotifications((prevNotifications) => {
        const updatedNotifications = { ...prevNotifications };

        newOrderEvents.forEach((orderEvent) => {
          if (orderEvent.status === "pending") {
            updatedNotifications[orderEvent.tableName] = true;
          }
        });

        return updatedNotifications;
      });

      // Play notification sound if available
      const audio = document.getElementById("notification-sound");
      if (audio) {
        audio.play().catch((e) => console.log("Error playing sound:", e));
      }

      // Clear processed events
      clearNewOrderEvents();
    }
  }, [newOrderEvents]);

  // Handle order status update events
  useEffect(() => {
    if (orderStatusEvents.length > 0) {
      console.log("Processing order status updates:", orderStatusEvents);

      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };

        orderStatusEvents.forEach((statusEvent) => {
          const { orderId, tableName, status } = statusEvent;

          // Find and update the specific order for the table
          Object.keys(updatedOrders).forEach((tableKey) => {
            updatedOrders[tableKey] = updatedOrders[tableKey].map((order) =>
              order._id === orderId ? { ...order, status } : order
            );

            // If order is served, we may want to remove it from active orders
            if (status === "served") {
              updatedOrders[tableKey] = updatedOrders[tableKey].filter(
                (order) => order._id !== orderId || order.status !== "served"
              );
            }
          });
        });

        // Remove empty tables from orders
        Object.keys(updatedOrders).forEach((tableName) => {
          if (updatedOrders[tableName].length === 0) {
            delete updatedOrders[tableName];
          }
        });

        return updatedOrders;
      });

      // Update notifications based on pending orders
      setNotifications((prevNotifications) => {
        const updatedNotifications = { ...prevNotifications };

        // For each table, check if it has pending orders
        Object.keys(orders).forEach((tableName) => {
          const hasPendingOrders = orders[tableName]?.some(
            (order) => order.status === "pending"
          );
          updatedNotifications[tableName] = hasPendingOrders;
        });

        return updatedNotifications;
      });

      // Clear processed events
      clearOrderStatusEvents();
    }
  }, [orderStatusEvents]);

  const handleTableClick = (tableName) => {
    console.log("Table clicked:", tableName);
    console.log("Orders for table:", orders[tableName]);
    setModalOpen(tableName);
    setNotifications((prev) => ({
      ...prev,
      [tableName]: false,
    }));
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await updateOrderStatus(orderId, "accepted");
      if (response.success) {
        // No need to fetch orders anymore as socket will update it
        alert("Order accepted!");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. Please try again.");
    }
  };

  const handleServeOrder = async (orderId) => {
    try {
      const response = await updateOrderStatus(orderId, "served");
      if (response.success) {
        // No need to fetch orders anymore as socket will update it
        alert("Order served!");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error marking order as served:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const renderOrderActions = (order) => {
    if (order.status === "pending") {
      return (
        <button
          className="accept-order-btn"
          onClick={() => handleAcceptOrder(order._id)}
        >
          Accept Order
        </button>
      );
    } else if (order.status === "accepted") {
      return (
        <button
          className="serve-order-btn"
          onClick={() => handleServeOrder(order._id)}
        >
          Mark as Served
        </button>
      );
    }
    return null;
  };

  if (loading) return <div className="loading-message">Loading tables...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!tables || tables.length === 0) {
    return (
      <div className="loading-message">
        No tables found for this branch. Please add tables in the admin
        dashboard.
      </div>
    );
  }

  return (
    <div className="alacarte-container">
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

      <div className="dining-section">
        <h3>Dining Section</h3>
        <div className="table-container">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`table ${
                orders[table.name]?.length ? "has-orders" : ""
              }`}
              onClick={() => handleTableClick(table.name)}
            >
              <div className="table-header">
                {table.name}
                {notifications[table.name] && (
                  <div className="alacarte-notification-badge">
                    {orders[table.name]?.filter(
                      (order) => order.status === "pending"
                    ).length || 0}
                  </div>
                )}
              </div>
              {orders[table.name]?.length > 0 && (
                <div className="order-details">
                  <p className="order-count">
                    {
                      orders[table.name].filter(
                        (order) => order.status === "pending"
                      ).length
                    }{" "}
                    New Orders
                    {orders[table.name].filter(
                      (order) => order.status === "accepted"
                    ).length > 0 &&
                      ` | ${
                        orders[table.name].filter(
                          (order) => order.status === "accepted"
                        ).length
                      } In Progress`}
                  </p>
                  <div className="order-preview">
                    {orders[table.name].slice(0, 2).map((order, index) => (
                      <div key={order._id} className="preview-items">
                        Order #{index + 1}: {order.items.length} items
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                        <span className={`order-status ${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      <ul className="order-items">
                        {order.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="order-item">
                            <span className="item-name">
                              {item.nameEnglish}
                            </span>
                            <span className="item-quantity">
                              ×{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {renderOrderActions(order)}
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

export default Alacarte;
