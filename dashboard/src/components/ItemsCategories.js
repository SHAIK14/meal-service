import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getItemsByCategory,
  toggleItemAvailability,
  deleteItem,
} from "../utils/api";
import {
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 5; // We'll keep this for client-side pagination

const ItemsCategories = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState({ veg: 1, nonVeg: 1 });
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getItemsByCategory(categoryName);
      if (result.success) {
        setItems(result.items);
        setTotalItems(result.totalItems);
        console.log(
          `Total items in category '${categoryName}': ${result.totalItems}`
        );
        console.log(`Displaying all ${result.items.length} items`);
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
        toast.success(`Item availability updated`);
      } else {
        console.error("Failed to toggle item availability:", result.error);
        toast.error("Failed to update item availability");
      }
    } catch (error) {
      console.error("Error in handleToggle:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        const result = await deleteItem(itemId);
        if (result.success) {
          toast.success("Item deleted successfully");
          // Remove the item from state
          setItems(items.filter((item) => item._id !== itemId));
          setTotalItems((prev) => prev - 1);
        } else {
          toast.error(result.error || "Failed to delete item");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the item");
        console.error("Error deleting item:", error);
      }
    }
  };

  const renderPagination = (type) => {
    const filteredItems = items.filter((item) => item.type === type);
    const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const currentPageType = type === "Veg" ? "veg" : "nonVeg";

    return (
      <div className="flex items-center justify-center p-4">
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [currentPageType]: Math.max(prev[currentPageType] - 1, 1),
            }))
          }
          disabled={currentPage[currentPageType] === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="mx-4">
          {currentPage[currentPageType]} / {Math.max(1, pageCount)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [currentPageType]: Math.min(
                prev[currentPageType] + 1,
                pageCount || 1
              ),
            }))
          }
          disabled={
            currentPage[currentPageType] === pageCount || pageCount === 0
          }
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderItems = (type) => {
    const filteredItems = items.filter((item) => item.type === type);

    if (filteredItems.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No {type === "Veg" ? "vegetarian" : "non-vegetarian"} items found in
          this category.
        </div>
      );
    }

    const pageType = type === "Veg" ? "veg" : "nonVeg";
    const startIndex = (currentPage[pageType] - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

    const itemCount = filteredItems.length;
    const displayingStart = startIndex + 1;
    const displayingEnd = Math.min(startIndex + ITEMS_PER_PAGE, itemCount);

    return (
      <>
        <div className="text-sm text-gray-500 mb-3">
          Displaying {displayingStart}-{displayingEnd} of {itemCount} {type}{" "}
          items
        </div>
        <div className="space-y-4">
          {itemsToDisplay.map((item) => (
            <div
              key={item._id}
              className="bg-white border shadow-lg rounded-lg p-4 flex justify-between items-center hover:shadow-xl transition-shadow"
            >
              {/* Item Image */}
              <img
                src={item.image}
                alt={item.nameEnglish}
                className="w-24 h-24 object-cover rounded-md border-2 border-gray-300"
              />

              {/* Item Name */}
              <div className="flex-1 mx-4">
                <p className="text-lg font-semibold text-gray-800">
                  {item.nameEnglish}
                </p>
                <p className="text-sm text-gray-500">{item.nameArabic}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.calories} calories
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-3">
                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(item._id)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  title="Edit Item"
                >
                  <Edit2 size={20} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item._id, item.nameEnglish)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  title="Delete Item"
                >
                  <Trash2 size={20} />
                </button>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={() => handleToggle(item._id)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all duration-300 relative">
                    <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Just a Moment</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => navigate("/items")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back to Categories
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/items")}
          className="rounded-lg border-gray-300 hover:text-black text-gray-800 duration-200 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="p-0 m-0 font-semibold text-gray-800 text-2xl">
          {categoryName} Items
        </h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {totalItems} Total Items
        </span>
      </div>

      {/* Item Stats */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-green-800 font-medium">Veg Items</p>
            <p className="text-2xl font-bold text-green-700">
              {items.filter((item) => item.type === "Veg").length}
            </p>
          </div>

          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-red-800 font-medium">Non-Veg Items</p>
            <p className="text-2xl font-bold text-red-700">
              {items.filter((item) => item.type === "Non Veg").length}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-gray-800 font-medium">Available Items</p>
            <p className="text-2xl font-bold text-gray-700">
              {items.filter((item) => item.available).length}
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Veg Category */}
        <div className="bg-white shadow-md rounded-lg p-4 h-auto flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-green-600 border-b pb-2 mb-4">
            Veg
          </h3>
          <div className="mt-4">{renderItems("Veg")}</div>
          <div className="mt-4">{renderPagination("Veg")}</div>
        </div>

        {/* Non-Veg Category */}
        <div className="bg-white shadow-md rounded-lg p-4 h-auto flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-red-600 border-b pb-2 mb-4">
            Non-Veg
          </h3>
          <div className="mt-4">{renderItems("Non Veg")}</div>
          <div className="mt-4">{renderPagination("Non Veg")}</div>
        </div>
      </div>
    </div>
  );
};

export default ItemsCategories;
