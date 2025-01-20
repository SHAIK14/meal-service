import React, { useState, useEffect } from "react";
import { getBranchTables } from "../utils/api";
import "../styles/Alacarte.css";

function Alacarte() {
  const [modalOpen, setModalOpen] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [orderReady, setOrderReady] = useState({});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await getBranchTables();
        console.log("Tables response:", response);
        if (response.success && response.data.data) {
          // Check for nested data
          const tableData = response.data.data; // Get the nested array
          setTables(tableData);
          // Initialize notifications for each table
          const initialNotifications = {};
          const initialOrderReady = {};
          tableData.forEach((table) => {
            initialNotifications[table.id] = true; // Using table.id as it's in the response
            initialOrderReady[table.id] = {};
          });
          setNotifications(initialNotifications);
          setOrderReady(initialOrderReady);
        } else {
          setError("Failed to fetch tables");
        }
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Error loading tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading tables...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (tables.length === 0) {
    return (
      <div className="loading-message">
        No tables found for this branch. Please add tables in the admin
        dashboard.
      </div>
    );
  }

  const handleTableClick = (tableId) => {
    setModalOpen(tableId);
    setNotifications((prev) => ({
      ...prev,
      [tableId]: false,
    }));
  };

  const closeModal = () => {
    setModalOpen(null);
  };

  const handleCheckboxChange = (tableId, itemIndex) => {
    setOrderReady((prev) => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [itemIndex]: !prev[tableId][itemIndex],
      },
    }));
  };

  const handleOrderReady = () => {
    alert("Order is ready!");
  };

  // Keeping your existing mock data for now
  const tableDetails = {
    numberOfPersons: 4,
    orderItems: ["Butter Chicken - 2", "Biryani - 1", "Garlic Naan - 3"],
    orderTime: "1:30 PM",
  };

  return (
    <div className="alacarte-container">
      <div className="dining-section">
        <h3>Dining Section</h3>
        <div className="table-container">
          {tables.map((table) => (
            <div
              key={table.id}
              className="table"
              onClick={() => handleTableClick(table.id)}
            >
              <div className="table-header">
                {table.name}
                {notifications[table.id] && (
                  <div className="alacarte-notification-badge">3</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>
                {`Details for Table ${
                  tables.find((t) => t.id === modalOpen)?.name
                }`}
              </h4>
              <button className="close-btn" onClick={closeModal}>
                X
              </button>
            </div>
            <div className="modal-content">
              <p>
                <strong>Number of Persons:</strong>{" "}
                {tableDetails.numberOfPersons}
              </p>
              <h4>Order Items:</h4>
              <ul className="order-items">
                {tableDetails.orderItems.map((item, index) => (
                  <li key={index} className="order-item">
                    <input
                      type="checkbox"
                      checked={orderReady[modalOpen]?.[index] || false}
                      onChange={() => handleCheckboxChange(modalOpen, index)}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Order Time:</strong> {tableDetails.orderTime}
              </p>
              <button className="order-ready-btn" onClick={handleOrderReady}>
                Order is Ready
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alacarte;
