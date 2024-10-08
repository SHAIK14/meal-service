import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemsByCategory } from "../utils/api";
import "../styles/ItemsCategories.CSS";

const ItemsCategories = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getItemsByCategory(categoryName);
      console.log("Fetched items:", result);
      if (result.success) {
        setItems(result.items);
      } else {
        setError(result.error || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("An error occurred while fetching items");
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="items-categories">
      <h1>{categoryName} Items</h1>
      {items.length === 0 ? (
        <div className="no-items">
          <p>No items available in this category.</p>
          <button
            onClick={() => navigate("/add-item")}
            className="add-item-btn"
          >
            Add Item
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <img
                src={item.image}
                alt={item.nameEnglish}
                className="item-image"
              />
              <h3>{item.nameEnglish}</h3>
              <p>{item.descriptionEnglish}</p>
              <p>
                Price: {item.prices[0].sellingPrice} {item.prices[0].currency}
              </p>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate("/items")} className="back-btn">
        Back to Categories
      </button>
    </div>
  );
};

export default ItemsCategories;
