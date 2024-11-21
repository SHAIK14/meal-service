// components/Orders/Orders.jsx
import React, { useState, useEffect } from "react";
import { getMealCounts } from "../utils/api";
import "../styles/Orders.css";

const PackageItems = ({ items }) => (
  <div className="items-list">
    {Object.entries(items).map(([item, quantity]) => (
      <div key={item} className="item-row">
        <span className="item-name">{item}</span>
        <span className="item-quantity">× {quantity}</span>
      </div>
    ))}
  </div>
);

const Orders = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCounts, setMealCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const fetchMealCounts = async (date) => {
    setLoading(true);
    setError(null);

    try {
      const formattedDate = date.toISOString().split("T")[0];
      const result = await getMealCounts(formattedDate);

      if (result.success) {
        setMealCounts(result.data.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch meal counts");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchMealCounts(selectedDate);
    }
  }, [selectedDate]);

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

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : mealCounts ? (
        <div className="content">
          <div className="packages-grid">
            {Object.entries(mealCounts.packages)
              .filter(([_, data]) => data.totalQuantity > 0) // Only show packages with items
              .map(([pkg, data]) => (
                <div
                  key={pkg}
                  className={`package-card ${
                    selectedPackage === pkg ? "selected" : ""
                  }`}
                  onClick={() =>
                    setSelectedPackage(pkg === selectedPackage ? null : pkg)
                  }
                >
                  <div className="package-header">
                    <h2>
                      {pkg.charAt(0).toUpperCase() + pkg.slice(1)} -{" "}
                      {data.totalQuantity}
                    </h2>
                  </div>
                  {selectedPackage === pkg && (
                    <PackageItems items={data.items} />
                  )}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="empty">Select a date to view meal quantities</div>
      )}
    </div>
  );
};

export default Orders;
