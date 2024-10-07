import React, { useState } from "react";
import "../styles/Lunchmenu.css";

const Lunchmenu = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Shawarma",
      type: "Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: true,
    },
    {
      id: 2,
      name: "Bihari Kabab Roll with Berries Salad",
      type: "Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: true,
    },
    {
      id: 3,
      name: "Bihari Kabab Roll with Berries Salad",
      type: "Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: true,
    },
    {
      id: 4,
      name: "Bihari Kabab Roll with Berries Salad",
      type: "Non-Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: false,
    },
    {
      id: 5,
      name: "Bihari Kabab Roll with Berries Salad",
      type: "Non-Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: false,
    },
    {
      id: 6,
      name: "Bihari Kabab Roll with Berries Salad",
      type: "Non-Veg",
      imgSrc: "/lunch.jpg",
      isAvailable: false,
    },
  ]);

  // Toggle availability handler
  const handleToggleAvailability = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Edit item handler
  const handleEdit = (id) => {
    console.log("Edit item:", id);
  };

  // Delete item handler
  const handleDelete = (id) => {
    console.log("Delete item:", id);
  };

  return (
    <div className="lunch-menu-page">
      <div className="lunch-menu-header">
        <h2>Lunch Menu</h2>
        <button className="add-item-btn">Add Item +</button>
      </div>
      <div className="menu-category">
        <h3>Veg</h3>
        {items
          .filter((item) => item.type === "Veg")
          .map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.imgSrc} alt={item.name} />
              <p>{item.name}</p>
              <div className="item-actions">
                <button onClick={() => handleEdit(item.id)}>✏️</button>
                <button onClick={() => handleDelete(item.id)}>🗑️</button>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={() => handleToggleAvailability(item.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
      </div>

      <div className="menu-category">
        <h3>Non-Veg</h3>
        {items
          .filter((item) => item.type === "Non-Veg")
          .map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.imgSrc} alt={item.name} />
              <p>{item.name}</p>
              <div className="item-actions">
                <button onClick={() => handleEdit(item.id)}>✏️</button>
                <button onClick={() => handleDelete(item.id)}>🗑️</button>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={() => handleToggleAvailability(item.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Lunchmenu;
