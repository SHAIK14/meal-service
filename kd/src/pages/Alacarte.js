import React, { useState, useEffect } from "react";
import { getBranchTables, getBranchOrders } from "../utils/api";
import "../styles/Alacarte.css";

function Alacarte() {
  const [modalOpen, setModalOpen] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [orderReady, setOrderReady] = useState({});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState({});

  // Get branchId from localStorage
  const branchId = localStorage.getItem("branchId");
  console.log("Using branchId:", branchId);

  // Fetch orders for the branch
  const fetchOrders = async () => {
    if (!branchId) {
      console.error("No branchId found in localStorage");
      return;
    }

    try {
      const response = await getBranchOrders(branchId);
      console.log("Orders response:", response);

      if (response.success && response.data?.orders) {
        // Group pending orders by table
        const ordersByTable = response.data.orders.reduce((acc, order) => {
          if (order.status === "pending") {
            if (!acc[order.tableName]) {
              acc[order.tableName] = [];
            }
            acc[order.tableName].push(order);
          }
          return acc;
        }, {});

        setOrders(ordersByTable);
        console.log("Pending orders by table:", ordersByTable);

        // Update notifications for tables with pending orders
        const newNotifications = { ...notifications };
        Object.entries(ordersByTable).forEach(([tableName, tableOrders]) => {
          newNotifications[tableName] = tableOrders.length > 0;
        });
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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

          // Initialize states
          const initialStates = {};
          tableData.forEach((table) => {
            initialStates[table.name] = false;
          });

          setNotifications(initialStates);
          setOrderReady(initialStates);

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

  // Set up polling for orders
  useEffect(() => {
    if (!branchId) return;

    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, [branchId]);

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

  const handleCheckboxChange = (tableName, orderId, itemIndex) => {
    setOrderReady((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        [`${orderId}-${itemIndex}`]:
          !prev[tableName]?.[`${orderId}-${itemIndex}`],
      },
    }));
  };

  const handleOrderReady = (orderId) => {
    console.log("Marking order ready:", orderId);
    // Here you would add the API call to update the order status
    alert("Order is ready!");
    closeModal();
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
                    {orders[table.name]?.length || 0}
                  </div>
                )}
              </div>
              {orders[table.name]?.length > 0 && (
                <div className="order-details">
                  <p className="order-count">
                    {orders[table.name].length} Pending Orders
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
                    <div key={order._id} className="order-section">
                      <div className="order-header">
                        <h5>Order #{orderIndex + 1}</h5>
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="order-info">
                        <p>
                          <strong>Total:</strong> ${order.totalAmount}
                        </p>
                      </div>
                      <ul className="order-items">
                        {order.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="order-item">
                            <input
                              type="checkbox"
                              checked={
                                orderReady[modalOpen]?.[
                                  `${order._id}-${itemIndex}`
                                ] || false
                              }
                              onChange={() =>
                                handleCheckboxChange(
                                  modalOpen,
                                  order._id,
                                  itemIndex
                                )
                              }
                            />
                            <span className="item-name">
                              {item.nameEnglish}
                            </span>
                            <span className="item-quantity">
                              ×{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className="order-ready-btn"
                        onClick={() => handleOrderReady(order._id)}
                      >
                        Mark Order Ready
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-orders">No pending orders for this table</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alacarte;
