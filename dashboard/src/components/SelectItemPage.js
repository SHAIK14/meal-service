import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/SelectItemPage.css"; // Importing CSS file

const SelectItemPage = () => {
  const itemsData = [
    { id: 1, name: "Veg Lunch 1", price: 10, category: "veg-lunch" },
    { id: 2, name: "Non-Veg Lunch 1", price: 15, category: "non-veg-lunch" },
    { id: 3, name: "Veg Dinner 1", price: 20, category: "veg-dinner" },
    { id: 4, name: "Non-Veg Dinner 1", price: 25, category: "non-veg-dinner" },
    { id: 5, name: "Veg Lunch 2", price: 12, category: "veg-lunch" },
    { id: 6, name: "Non-Veg Lunch 2", price: 18, category: "non-veg-lunch" },
    { id: 7, name: "Veg Dinner 2", price: 22, category: "veg-dinner" },
    { id: 8, name: "Non-Veg Dinner 2", price: 28, category: "non-veg-dinner" },
  ];

  const [selectedItems, setSelectedItems] = useState([[], [], [], [], []]);
  const [totalAmount, setTotalAmount] = useState([0, 0, 0, 0, 0]);
  const [activeDay, setActiveDay] = useState(0);
  const [filter, setFilter] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleAddItem = (item) => {
    const isAlreadySelected = selectedItems[activeDay].find(
      (selectedItem) => selectedItem.id === item.id
    );

    if (!isAlreadySelected) {
      const newSelectedItems = [...selectedItems];
      newSelectedItems[activeDay].push(item);

      setSelectedItems(newSelectedItems);

      const newTotalAmount = [...totalAmount];
      newTotalAmount[activeDay] += item.price;
      setTotalAmount(newTotalAmount);
    }
  };

  const handleRemoveItem = (item) => {
    const newSelectedItems = [...selectedItems];
    const updatedItems = newSelectedItems[activeDay].filter(
      (selectedItem) => selectedItem.id !== item.id
    );

    newSelectedItems[activeDay] = updatedItems;
    setSelectedItems(newSelectedItems);

    const newTotalAmount = [...totalAmount];
    newTotalAmount[activeDay] -= item.price;
    setTotalAmount(newTotalAmount);
  };

  const handleDayChange = (day) => {
    setActiveDay(day);
  };

  const filteredItems = itemsData.filter((item) => {
    if (!filter) return true;
    return item.category === filter;
  });

  const handleSavePlan = () => {
    const savedPlans = JSON.parse(localStorage.getItem("plans")) || [];

    const newPlan = {
      id: savedPlans.length + 1,
      selectedItems,
      totalAmount,
      totalPrice: totalPriceAllDays,
      isActive: true, // Assuming the default state is active
    };

    savedPlans.push(newPlan);
    localStorage.setItem("plans", JSON.stringify(savedPlans));

    alert("Plan saved successfully!");

    // Redirect to plans page after saving
    navigate("/plans");
  };

  // Calculate total price of all days
  const totalPriceAllDays = totalAmount.reduce(
    (acc, amount) => acc + amount,
    0
  );

  return (
    <div className="select-item-page">
      {/* Days Navigation */}
      <div className="middle-Container" style={{ width: "50%" }}>
        <div className="days-nav">
          {Array.from({ length: 5 }, (_, index) => (
            <button
              key={index}
              onClick={() => handleDayChange(index)}
              className={`day-btn ${activeDay === index ? "active" : ""}`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filters">
          <button
            onClick={() => setFilter("veg-lunch")}
            className={`filter-btn ${filter === "veg-lunch" ? "active" : ""}`}
          >
            Veg Lunch
          </button>
          <button
            onClick={() => setFilter("non-veg-lunch")}
            className={`filter-btn ${
              filter === "non-veg-lunch" ? "active" : ""
            }`}
          >
            Non-Veg Lunch
          </button>
          <button
            onClick={() => setFilter("veg-dinner")}
            className={`filter-btn ${filter === "veg-dinner" ? "active" : ""}`}
          >
            Veg Dinner
          </button>
          <button
            onClick={() => setFilter("non-veg-dinner")}
            className={`filter-btn ${
              filter === "non-veg-dinner" ? "active" : ""
            }`}
          >
            Non-Veg Dinner
          </button>
          <button
            onClick={() => setFilter("")}
            className={`filter-btn ${filter === "" ? "active" : ""}`}
          >
            Show All
          </button>
        </div>

        {/* Items List */}
        <div className="items-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="item">
                <span>
                  {item.name} - SAR {item.price}
                </span>
                <button onClick={() => handleAddItem(item)} className="add-btn">
                  Add
                </button>
              </div>
            ))
          ) : (
            <p>No items available for this filter.</p>
          )}
        </div>
      </div>
      {/* Selected Items for the Active Day */}
      <div className="right-container">
        <div className="selected-items">
          <h3>Selected Items for Day {activeDay + 1}</h3>
          {selectedItems[activeDay].length > 0 ? (
            selectedItems[activeDay].map((item) => (
              <div key={item.id} className="selected-item">
                <span>{item.name}</span>
                <span>SAR {item.price}</span>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p>No items selected for this day.</p>
          )}
          <hr />
          <div className="total-amount">
            <span>Total for Day {activeDay + 1}:</span>
            <span>SAR {totalAmount[activeDay]}</span>
          </div>
          <div className="total-amount">
            <span>Total Price for All Days:</span>
            <span> SAR {totalPriceAllDays}</span>
          </div>
        </div>

        {/* Save Plan Button */}
        <div className="btn-div">
          <button onClick={handleSavePlan} className="save-plan-btn">
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectItemPage;
