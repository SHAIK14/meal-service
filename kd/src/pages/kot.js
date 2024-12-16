import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import "../styles/kot.css";

// Sample data with multiple orders in each region
const orders = [
  {
    orderId: "ORD001",
    customerName: "Ali Al-Harbi",
    region: "East Riyadh",
    items: [
      { name: "Masala Dosa", quantity: 2 },
      { name: "Idly", quantity: 1 },
    ],
    address: "123 Main St, Riyadh, Saudi Arabia",
  },
  {
    orderId: "ORD002",
    customerName: "Mohammad",
    region: "East Riyadh",
    items: [
      { name: "Masala Dosa", quantity: 2 },
      { name: "Idly", quantity: 1 },
    ],
    address: "123 Main St, Riyadh, Saudi Arabia",
  },
  {
    orderId: "ORD002",
    customerName: "Fatima Al-Zahra",
    region: "West Riyadh",
    items: [
      { name: "Biryani Rice", quantity: 3 },
      { name: "Chicken 65", quantity: 2 },
    ],
    address: "456 King Fahd Rd, Riyadh, Saudi Arabia",
  },
  {
    orderId: "ORD003",
    customerName: "Ahmed Al-Saud",
    region: "North Riyadh",
    items: [
      { name: "Zeera Rice & Butter Chicken", quantity: 5 },
      { name: "Foul Tameez", quantity: 2 },
    ],
    address: "789 Al-Faisaliah St, Riyadh, Saudi Arabia",
  },
  {
    orderId: "ORD004",
    customerName: "Sara Al-Fahad",
    region: "South Riyadh",
    items: [
      { name: "Mandi", quantity: 4 },
      { name: "Grilled Chicken", quantity: 2 },
    ],
    address: "101 Olaya St, Riyadh, Saudi Arabia",
  },
];

// Main Kot Component
const Kot = () => {
  const [openRegions, setOpenRegions] = useState({});
  const printRefs = useRef({});

  const handlePrint = useReactToPrint({
    content: () => {
      const openRegionKeys = Object.keys(openRegions).find(
        (key) => openRegions[key]
      );
      if (openRegionKeys) {
        return printRefs.current[openRegionKeys];
      }
      alert("No region selected for printing!");
      return null;
    },
  });

  const toggleRegion = (region) => {
    setOpenRegions((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  const regions = orders.reduce((acc, order) => {
    if (!acc[order.region]) acc[order.region] = [];
    acc[order.region].push(order);
    return acc;
  }, {});

  return (
    <div className="kot-container">
      <div className="header">
        <h1>Zafran Valley Restaurant</h1>
        <p>Kitchen Order Tickets (KOT)</p>
      </div>

      <div className="regions-container">
        {Object.keys(regions).map((region) => (
          <div key={region} className="region-section">
            <div className="region-header-container">
              <button
                className="region-header"
                onClick={() => toggleRegion(region)}
              >
                {region} {openRegions[region] ? "▲" : "▼"}
              </button>
              <button
                className="print-button"
                onClick={() => {
                  // Ensure the ref for the region is set before printing
                  if (printRefs.current[region]) {
                    setOpenRegions((prev) => ({
                      ...prev,
                      [region]: true,
                    }));
                    handlePrint();
                  } else {
                    alert("Please open the region to enable printing.");
                  }
                }}
              >
                Print KOT
              </button>
            </div>

            {openRegions[region] && (
              <div
                className="region-orders"
                ref={(el) => (printRefs.current[region] = el)}
              >
                {regions[region].map((order) => (
                  <div key={order.orderId} className="kot-item">
                    <h3>Order ID: {order.orderId}</h3>
                    <p>
                      <strong>Customer:</strong> {order.customerName}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.address}
                    </p>
                    <div className="order-items">
                      <h4>Items:</h4>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            <strong>{item.name}</strong> - Quantity:{" "}
                            {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kot;
