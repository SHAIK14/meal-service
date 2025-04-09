// src/components/TableManagement.jsx
import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaCreditCard,
  FaEye,
  FaPrint,
  FaTimes,
  FaCheck,
  FaBell,
} from "react-icons/fa";
import {
  getBranchTables,
  updateTableStatus,
  getTableSession,
  completeSession,
  generateInvoice,
  updateOrderStatus,
} from "../utils/api";
import "../styles/TableManagement.css";
import { useKitchenSocket } from "../contexts/KitchenSocketContext";

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableSession, setTableSession] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

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
  } = useKitchenSocket();

  // Log connection status
  useEffect(() => {
    console.log("Table Management socket connection status:", isConnected);
  }, [isConnected]);

  // Initial data load
  useEffect(() => {
    fetchTables();
  }, []);

  // Handle new order events
  useEffect(() => {
    if (newOrderEvents.length > 0) {
      console.log(
        "Table Management - New order events received:",
        newOrderEvents
      );

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

      // Clear processed events
      clearNewOrderEvents();
    }
  }, [newOrderEvents, selectedTable]);

  // Handle order status update events
  useEffect(() => {
    if (orderStatusEvents.length > 0) {
      console.log(
        "Table Management - Order status updates received:",
        orderStatusEvents
      );

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
                return { ...order, status: update.status };
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

      // Clear processed events
      clearOrderStatusEvents();
    }
  }, [orderStatusEvents, selectedTable]);

  // Handle table status updates
  useEffect(() => {
    if (tableStatusEvents.length > 0) {
      console.log(
        "Table Management - Table status updates received:",
        tableStatusEvents
      );

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
      console.log(
        "Table Management - Payment requests received:",
        paymentRequestEvents
      );

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
      } else if (response.success && response.data.data) {
        const uniqueTables = Array.from(
          new Set(response.data.data.map((table) => table.id))
        ).map((id) => response.data.data.find((table) => table.id === id));

        const tablesWithStatus = uniqueTables.map((table) => ({
          ...table,
          status: table.status || "available",
        }));
        setTables(tablesWithStatus);
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
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.success) {
        // No need to fetch session again as socket will update it
        console.log(`Order ${orderId} status updated to ${newStatus}`);

        // Update local state immediately for better UX
        if (tableSession) {
          const updatedOrders = tableSession.orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
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

  const areAllOrdersServed = () => {
    return (
      tableSession?.orders?.every((order) => order.status === "served") ?? false
    );
  };

  const handleGenerateInvoice = async () => {
    if (!tableSession?.session?._id) {
      alert("No active session found");
      return;
    }

    if (!areAllOrdersServed()) {
      alert("All orders must be served before generating the invoice");
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

  const handlePaymentConfirm = async () => {
    if (!tableSession?.session?._id) {
      alert("No active session found");
      return;
    }

    if (!areAllOrdersServed()) {
      alert("All orders must be served before completing payment");
      return;
    }

    try {
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

  if (loading) return <div className="loading-message">Loading tables...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="table-management-container">
      {/* Connection status indicator (can be hidden in production) */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      <div className="table-management-header">
        <h1>Table Management</h1>
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
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-number">
                          Order #{order._id.slice(-4)}
                        </span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item">
                            {item.quantity} × {item.name}
                          </div>
                        ))}
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.status}`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        {order.status !== "served" && (
                          <button
                            className="status-button"
                            onClick={() =>
                              handleOrderStatusChange(
                                order._id,
                                order.status === "pending"
                                  ? "accepted"
                                  : "served"
                              )
                            }
                          >
                            Mark as{" "}
                            {order.status === "pending" ? "Accepted" : "Served"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="order-total">
                      Total: {order.totalAmount.toFixed(2)} SAR
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
              {areAllOrdersServed() && (
                <button
                  className="invoice-button"
                  onClick={handleGenerateInvoice}
                >
                  <FaPrint />
                  Generate Invoice
                </button>
              )}
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
                          <td>{item.total} SAR</td>
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
                      <strong>{invoiceData.totalAmount} SAR</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="invoice-footer">
                <p>Thank you for dining with us!</p>
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

export default TableManagement;
