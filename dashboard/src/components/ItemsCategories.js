import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemsByCategory, toggleItemAvailability } from "../utils/api";
import { Edit2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import "../styles/ItemsCategories.CSS";

const ITEMS_PER_PAGE = 5;

const ItemsCategories = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState({ veg: 1, nonVeg: 1 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getItemsByCategory(categoryName);
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

  const handleEdit = (id) => {
    navigate(`/edit-item/${id}`);
  };

  const handleToggle = async (itemId) => {
    try {
      const result = await toggleItemAvailability(itemId);
      if (result.success) {
        setItems(
          items.map((item) =>
            item._id === itemId ? { ...item, available: !item.available } : item
          )
        );
      } else {
        console.error("Failed to toggle item availability:", result.error);
      }
    } catch (error) {
      console.error("Error in handleToggle:", error);
    }
  };

  const renderPagination = (type) => {
    const filteredItems = items.filter((item) => item.type === type);
    const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const currentPageType = type === "Veg" ? "veg" : "nonVeg";

    return (
      <div className="pagination">
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [currentPageType]: Math.max(prev[currentPageType] - 1, 1),
            }))
          }
          disabled={currentPage[currentPageType] === 1}
        >
          <ChevronLeft size={20} />
        </button>
        <span>
          {currentPage[currentPageType]} / {pageCount}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [currentPageType]: Math.min(prev[currentPageType] + 1, pageCount),
            }))
          }
          disabled={currentPage[currentPageType] === pageCount}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderItems = (type) => {
    const filteredItems = items.filter((item) => item.type === type);
    const pageType = type === "Veg" ? "veg" : "nonVeg";
    const startIndex = (currentPage[pageType] - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

    return itemsToDisplay.map((item) => (
      <div key={item._id} className="menu-item">
        <img src={item.image} alt={item.nameEnglish} />
        <p>{item.nameEnglish}</p>
        <div className="item-actions">
          <button onClick={() => handleEdit(item._id)} className="edit-btn">
            <Edit2 size={20} />
          </button>
          <label className="switch">
            <input
              type="checkbox"
              checked={item.available}
              onChange={() => handleToggle(item._id)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    ));
  };

  if (loading) return <div className="loading">Loading items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="items-categories">
      <div className="items-categories-header">
        <button onClick={() => navigate("/items")} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1>{categoryName} Items</h1>
      </div>
      <div className="menu-category">
        <h3>Veg</h3>
        {renderItems("Veg")}
        {renderPagination("Veg")}
      </div>
      <div className="menu-category">
        <h3>Non-Veg</h3>
        {renderItems("Non Veg")}
        {renderPagination("Non Veg")}
      </div>
    </div>
  );
};

export default ItemsCategories;
