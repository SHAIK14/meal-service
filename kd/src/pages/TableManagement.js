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

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await getBranchTables();
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
        await fetchTables();
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
        if (selectedTable) {
          const sessionResponse = await getTableSession(selectedTable.name);
          if (sessionResponse.success && sessionResponse.data) {
            setTableSession(sessionResponse.data);
          }
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
        // Don't automatically mark table as available
        setShowPaymentModal(false);
        setShowTableModal(false);
        await fetchTables(); // Refresh tables
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

              {selectedTable.status === "available" && (
                <button
                  className="action-button occupy"
                  onClick={() =>
                    handleTableStatusChange(selectedTable.id, "occupied")
                  }
                >
                  <FaUtensils />
                  Mark as Occupied
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
