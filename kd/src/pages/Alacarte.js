import React, { useState } from "react";
import "../styles/Alacarte.css";

function Alacarte() {
  // State to track the open modal (which table's details are being shown)
  const [modalOpen, setModalOpen] = useState(null);
  const [notifications, setNotifications] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
  }); // Tracking notification badge visibility for each table
  // State to track which items have been marked as ready
  const [orderReady, setOrderReady] = useState({
    1: {},
    2: {},
    3: {},
    4: {},
  });
  // Handle table click to open the modal and remove the notification badge
  const handleTableClick = (tableId) => {
    setModalOpen(tableId); // Open the modal for the clicked table
    // Remove the notification badge for the clicked table
    setNotifications((prevState) => ({
      ...prevState,
      [tableId]: false, // Hide the notification badge for the clicked table
    }));
  };

  // Close the modal
  const closeModal = () => {
    setModalOpen(null); // Close the modal
  };
  // Mark an item as ready (checkbox handler)
  const handleCheckboxChange = (tableId, itemIndex) => {
    setOrderReady((prevState) => ({
      ...prevState,
      [tableId]: {
        ...prevState[tableId],
        [itemIndex]: !prevState[tableId][itemIndex],
      },
    }));
  };

  // Handle "Order is Ready" button click
  const handleOrderReady = () => {
    alert("Order is ready!");
  };

  const generalTables = [
    { id: 1, name: "T1" },
    { id: 2, name: "T2" },
    { id: 3, name: "T3" },
    { id: 4, name: "T4" },
  ];

  const tableDetails = {
    1: {
      numberOfPersons: 4,
      orderItems: ["Butter Chicken - 2", "Biryani - 1", "Garlic Naan - 3"],
      orderTime: "1:30 PM",
    },
    2: {
      numberOfPersons: 2,
      orderItems: ["Grilled Fish - 1", "Veg Biryani - 2"],
      orderTime: "2:15 PM",
    },
    3: {
      numberOfPersons: 3,
      orderItems: ["Paneer Tikka - 2", "Chole Bhature - 1"],
      orderTime: "3:00 PM",
    },
    4: {
      numberOfPersons: 5,
      orderItems: ["Butter Chicken - 1", "Rogan Josh - 1", "Garlic Naan - 4"],
      orderTime: "4:00 PM",
    },
  };

  return (
    <div className="alacarte-container">
      {/* General Dining Section */}
      <div className="section general-section dining-section">
        <h3>General Dining</h3>
        <div className="table-container">
          {generalTables.map((table) => (
            <div
              key={table.id}
              className="table"
              onClick={() => handleTableClick(table.id)}
            >
              <div className="table-header">
                {table.name}
                {/* Conditionally render the notification badge */}
                {notifications[table.id] && (
                  <div className="alacarte-notification-badge">3</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section family-section dining-section">
        <h3>Family Dining</h3>
        <div className="table-container">
          {generalTables.map((table) => (
            <div
              key={table.id}
              className="table"
              onClick={() => handleTableClick(table.id)}
            >
              <div className="table-header">
                {table.name}
                {/* Conditionally render the notification badge */}
                {notifications[table.id] && (
                  <div className="alacarte-notification-badge">3</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Pop-up for Table Details */}
      {modalOpen !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>{`Details for Table ${
                generalTables.find((table) => table.id === modalOpen).name
              }`}</h4>
              <button className="close-btn" onClick={closeModal}>
                X
              </button>
            </div>
            <div className="modal-content">
              <p>
                <strong>Number of Persons:</strong>{" "}
                {tableDetails[modalOpen].numberOfPersons}
              </p>
              <h4>Order Items:</h4>
              <ul className="order-items">
                {tableDetails[modalOpen].orderItems.map((item, index) => (
                  <li key={index} className="order-item">
                    <input
                      type="checkbox"
                      checked={orderReady[modalOpen][index] || false}
                      onChange={() => handleCheckboxChange(modalOpen, index)}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Order Time:</strong> {tableDetails[modalOpen].orderTime}
              </p>

              {/* Button to mark the order as ready */}
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
