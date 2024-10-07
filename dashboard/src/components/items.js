import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Items.css";

const Items = () => {
  const navigate = useNavigate();

  const handleAddItem = () => {
    navigate("/add-item");
  };

  return (
    <div className="items-page">
      <div className="header">
        <h2>Items</h2>
        <button className="add-item-btn" onClick={handleAddItem}>
          Add Item +
        </button>
      </div>

      <div className="items-container">
        <div className="item" onClick={() => navigate("/lunch")}>
          <img src="/lunch.jpg" alt="Lunch Icon" />
          <h3>Lunch</h3>
        </div>
        <div className="item" onClick={() => navigate("/dinner")}>
          <img src="/dinner.jpg" alt="Dinner Icon" />
          <h3>Dinner</h3>
        </div>
      </div>
    </div>
  );
};

export default Items;
