import React, { useState, useEffect } from "react";
import { getMealCounts, getOrdersForKOT } from "../utils/api";
import "../styles/Orders.css";

const Orders = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCounts, setMealCounts] = useState(null);
  const [ordersForKot, setOrdersForKot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPackage, setExpandedPackage] = useState(null);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const fetchData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const [mealCountsResult, kotOrdersResult] = await Promise.all([
        getMealCounts(formattedDate),
        getOrdersForKOT(formattedDate),
      ]);

      if (kotOrdersResult.success) {
        setOrdersForKot(kotOrdersResult.data.data);
        // Only set meal counts if we have orders
        if (
          Object.keys(kotOrdersResult.data.data).length > 0 &&
          mealCountsResult.success
        ) {
          setMealCounts(mealCountsResult.data.data);
        } else {
          setMealCounts(null);
        }
      } else {
        setOrdersForKot(null);
        setMealCounts(null);
      }
    } catch (err) {
      setError("Failed to fetch data");
      setOrdersForKot(null);
      setMealCounts(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
    }
  }, [selectedDate]);

  const handleGenerateKOT = async (timeSlot, orders) => {
    try {
      const printContent = `
      <html>
        <head>
          <title>Kitchen Orders - ${timeSlot}</title>
          <style>
            @media print {
              @page { 
                size: 80mm 297mm; 
                margin: 0;
              }
              body { 
                width: 80mm;
                margin: 0;
                padding: 5mm;
              }
              .kot {
                page-break-after: always;
                border-bottom: 1px dashed #000;
                padding-bottom: 5mm;
              }
              .kot:last-child {
                page-break-after: avoid;
                border-bottom: none;
              }
            }
            body { 
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .kot-header { 
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 5mm;
              margin-bottom: 5mm;
            }
            .kot-header h2 {
              margin: 0 0 2mm 0;
              font-size: 14px;
            }
            .customer-info {
              margin: 3mm 0;
            }
            .customer-info p {
              margin: 1mm 0;
            }
            .package-title {
              font-weight: bold;
              margin: 2mm 0;
            }
            .item {
              margin-left: 3mm;
            }
          </style>
        </head>
        <body>
          ${orders
            .map(
              (order) => `
            <div class="kot">
              <div class="kot-header">
                <h2>KOT #${Math.random()
                  .toString(36)
                  .substr(2, 6)
                  .toUpperCase()}</h2>
                <div>${selectedDate.toLocaleDateString()} - ${timeSlot}</div>
              </div>
              <div class="customer-info">
                <p><strong>${order.customerName}</strong></p>
                <p>${order.phoneNumber}</p>
                <p>${order.area} - ${order.address.street}</p>
              </div>
              ${Object.entries(order.items)
                .map(
                  ([packageType, items]) => `
                <div class="package">
                  <div class="package-title">${packageType.toUpperCase()}</div>
                  ${items
                    .map((item) => `<div class="item">• ${item}</div>`)
                    .join("")}
                </div>
              `
                )
                .join("")}
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

      const printWindow = window.open("", "", "height=600,width=800");
      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (err) {
      console.error("Error printing KOT:", err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (!ordersForKot || Object.keys(ordersForKot).length === 0) {
      return (
        <div className="category-item">
          <div className="category-header">
            <h2>No orders found for this date</h2>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="time-slots-grid">
          {Object.entries(ordersForKot).map(([timeSlot, orders]) => (
            <div key={timeSlot} className="time-slot-card">
              <div className="time-slot-info">
                <h3>{timeSlot}</h3>
                <span className="orders-count">{orders.length} Orders</span>
              </div>
              {isToday(selectedDate) && (
                <button
                  className="print-kot-btn"
                  onClick={() => handleGenerateKOT(timeSlot, orders)}
                >
                  Print KOT
                </button>
              )}
            </div>
          ))}
        </div>

        {mealCounts && (
          <div className="categories">
            {Object.entries(mealCounts.packages)
              .filter(([_, data]) => data.totalQuantity > 0)
              .map(([pkg, data]) => (
                <div key={pkg} className="category-item">
                  <div
                    className="category-header"
                    onClick={() =>
                      setExpandedPackage(expandedPackage === pkg ? null : pkg)
                    }
                  >
                    <h2>
                      {pkg.charAt(0).toUpperCase() + pkg.slice(1)} -{" "}
                      {data.totalQuantity}
                    </h2>
                    <span
                      className={`arrow ${
                        expandedPackage === pkg ? "expanded" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                  {expandedPackage === pkg && (
                    <div className="category-details">
                      {Object.entries(data.items).map(([item, quantity]) => (
                        <div key={item} className="item-row">
                          <span className="item-name">{item}</span>
                          <span className="item-quantity">× {quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="orders-container">
      <div className="header">
        <h1>Kitchen Dashboard</h1>
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="date-input"
        />
      </div>
      {renderContent()}
    </div>
  );
};

export default Orders;
