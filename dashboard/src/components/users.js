import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Dummy user data
  const userList = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com" },
    { id: 4, name: "Bob Brown", email: "bob@example.com" },
  ];

  // Dummy order data
  const orders = [
    { orderId: "A1001", dateModified: "2023-10-01", amount: "$150" },
    { orderId: "A1002", dateModified: "2023-10-03", amount: "$200" },
    { orderId: "A1003", dateModified: "2023-10-05", amount: "$250" },
  ];

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const goToInvoice = () => {
    navigate("/invoice");
  };

  const closeUserModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setActiveTab("details");
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.text(`Invoice for ${selectedUser.name}`, 10, 10);
    orders.forEach((order, index) => {
      doc.text(
        `Order ID: ${order.orderId} | Date: ${order.dateModified} | Amount: ${order.amount}`,
        10,
        20 + index * 10
      );
    });
    doc.save("invoice.pdf");
  };

  return (
    <div>
      <h1>Users Page</h1>
      <ul>
        {userList.map((user) => (
          <li
            key={user.id}
            onClick={() => openUserModal(user)}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            {user.name} (ID: {user.id})
          </li>
        ))}
      </ul>
      <div className="invoice-btn">
        <button onClick={goToInvoice}>Invoice</button>
      </div>
      {/* Modal Popup */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={closeUserModal}
            style={{ float: "right", cursor: "pointer" }}
          >
            X
          </button>
          <h2>{selectedUser.name}'s Information</h2>

          {/* Tab Navigation */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("details")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "details" ? "#eee" : "#fff",
              }}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "orders" ? "#eee" : "#fff",
              }}
            >
              Order Summary
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <ul>
                {orders
                  .sort(
                    (a, b) =>
                      new Date(b.dateModified) - new Date(a.dateModified)
                  )
                  .map((order) => (
                    <li key={order.orderId}>
                      {order.orderId} - {order.dateModified} - {order.amount}
                    </li>
                  ))}
              </ul>
              <button onClick={downloadInvoice}>Download Invoice</button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={closeUserModal}
        />
      )}
    </div>
  );
};

export default Users;
