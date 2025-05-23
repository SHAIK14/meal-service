import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "../styles/CurrentOrder.css";
import { useNavigate } from "react-router-dom";

const orderData = {
  "2024-11-06": [
    {
      category: "Breakfast",
      readyTime: "08:30 AM",
      items: [
        { id: 1, name: "Masla Dosa", quantity: 2 },
        { id: 2, name: "Idly", quantity: 1 },
        { id: 3, name: "Kabsa", quantity: 25 },
      ],
    },
    {
      category: "Lunch",
      readyTime: "12:30 PM",
      items: [
        { id: 4, name: "Biryani Rice", quantity: 2 },
        { id: 5, name: "Chicken 65", quantity: 1 },
      ],
    },
  ],
  "2024-11-07": [
    {
      category: "Breakfast",
      readyTime: "08:30 AM",
      items: [
        { id: 1, name: "Zeera Rice & Butter Chicken ", quantity: 60 },
        { id: 2, name: "Masala Dosa", quantity: 120 },
        { id: 3, name: "Foul Tameez", quantity: 50 },
      ],
    },
    {
      category: "Lunch",
      readyTime: "12:30 PM",
      items: [
        { id: 4, name: "Biryani Rice", quantity: 2 },
        { id: 5, name: "Chicken 65", quantity: 1 },
      ],
    },
    {
      category: "Dinner",
      readyTime: "12:30 PM",
      items: [
        { id: 4, name: "Biryani Rice", quantity: 2 },
        { id: 5, name: "Chicken 65", quantity: 1 },
      ],
    },
  ],
};

function CurrentOrder() {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const handleToggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleReadyForPickup = () => {
    navigate("/kot");
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getOrdersForSelectedDate = () => {
    const dateKey = selectedDate.toISOString().split("T")[0];
    return orderData[dateKey] || [];
  };

  const ordersForDate = getOrdersForSelectedDate();

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue.$d);
  };

  return (
    <div className="current-order-container">
      <div className="header-wrapper">
        <div className="header-title">
          <h2>
            Orders for{" "}
            <span style={{ marginLeft: "10px" }}>
              {formatDate(selectedDate)}
            </span>
          </h2>
        </div>
        <div className="calendar-container">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
            />
          </LocalizationProvider>
        </div>
      </div>
      {ordersForDate.length > 0 ? (
        ordersForDate.map((orderCategory) => (
          <div key={orderCategory.category} className="order-category">
            <div
              className="category-header"
              onClick={() => handleToggleCategory(orderCategory.category)}
            >
              <h3>{orderCategory.category}</h3>
              <span
                className={`arrow ${
                  expandedCategory === orderCategory.category ? "down" : "right"
                }`}
              ></span>
            </div>
            {expandedCategory === orderCategory.category && (
              <div className="inner-content">
                <p>
                  <strong>Pickup Time:</strong> {orderCategory.readyTime}
                </p>
                <ul>
                  {orderCategory.items.map((item) => (
                    <li key={item.id} className="order-item">
                      <p>
                        <strong className="item">{item.name}</strong>
                      </p>
                      <p>
                        <strong className="quantity">{item.quantity}</strong>
                      </p>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleReadyForPickup}
                  className="ready-for-pickup-button"
                >
                  Ready for Pickup
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No orders for {formatDate(selectedDate)}</p>
      )}
    </div>
  );
}

export default CurrentOrder;
