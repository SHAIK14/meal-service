import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getItemsByCategory, toggleItemAvailability } from "../utils/api";
import { Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ItemsCategory.css";

const ITEMS_PER_PAGE = 5;

const ItemsCategory = () => {
  const { categoryName } = useParams();
  const [items, setItems] = useState({ veg: [], nonVeg: [] });
  const [currentPage, setCurrentPage] = useState({ veg: 1, nonVeg: 1 });
  const [totalPages, setTotalPages] = useState({ veg: 1, nonVeg: 1 });
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getItemsByCategory(categoryName);
      console.log("API Response:", result); // Debug log

      if (result.success && result.data && Array.isArray(result.data.data)) {
        const allItems = result.data.data;
        const vegItems = allItems.filter((item) => item.type === "Veg");
        const nonVegItems = allItems.filter((item) => item.type === "Non Veg");

        setItems({ veg: vegItems, nonVeg: nonVegItems });
        setTotalPages({
          veg: Math.ceil(vegItems.length / ITEMS_PER_PAGE),
          nonVeg: Math.ceil(nonVegItems.length / ITEMS_PER_PAGE),
        });

        if (allItems.length === 0) {
          toast.info(`No items found for ${categoryName}.`);
        }
      } else {
        throw new Error(result.error || "Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error(`Failed to fetch ${categoryName} items: ${error.message}`);
    }
    setLoading(false);
  }, [categoryName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggleAvailability = async (id) => {
    try {
      const result = await toggleItemAvailability(id);
      if (result.success) {
        setItems((prevItems) => ({
          veg: prevItems.veg.map((item) =>
            item._id === id ? { ...item, available: !item.available } : item
          ),
          nonVeg: prevItems.nonVeg.map((item) =>
            item._id === id ? { ...item, available: !item.available } : item
          ),
        }));
        toast.success("Item availability updated successfully");
      } else {
        toast.error("Failed to update item availability");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("An error occurred while updating item availability");
    }
  };

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log("Edit item:", id);
    toast.info("Edit functionality not implemented yet.");
  };

  const renderPagination = (type) => {
    const pageCount = totalPages[type.toLowerCase()];
    const currentPageNum = currentPage[type.toLowerCase()];

    return (
      <div className="pagination">
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [type.toLowerCase()]: Math.max(prev[type.toLowerCase()] - 1, 1),
            }))
          }
          disabled={currentPageNum === 1}
        >
          <ChevronLeft size={20} />
        </button>
        <span>
          {currentPageNum} / {pageCount}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [type.toLowerCase()]: Math.min(
                prev[type.toLowerCase()] + 1,
                pageCount
              ),
            }))
          }
          disabled={currentPageNum === pageCount}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderItems = (type) => {
    const filteredItems = items[type.toLowerCase()] || [];
    const startIndex = (currentPage[type.toLowerCase()] - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

    if (itemsToDisplay.length === 0) {
      return (
        <div className="no-items">
          <p>
            No {type} items available for {categoryName}.
          </p>
        </div>
      );
    }

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
              onChange={() => handleToggleAvailability(item._id)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    ));
  };

  if (loading)
    return <div className="loading">Loading {categoryName} items...</div>;

  return (
    <div className="category-items">
      <ToastContainer />
      <div className="category-items-header">
        <h2>{categoryName} Menu</h2>
      </div>
      <div className="menu-category">
        <h3>Veg</h3>
        {renderItems("Veg")}
        {items.veg.length > 0 && renderPagination("Veg")}
      </div>
      <div className="menu-category">
        <h3>Non-Veg</h3>
        {renderItems("Non Veg")}
        {items.nonVeg.length > 0 && renderPagination("Non Veg")}
      </div>
    </div>
  );
};

export default ItemsCategory;
