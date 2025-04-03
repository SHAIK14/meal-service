import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemsByCategory, toggleItemAvailability } from "../utils/api";
import { Edit2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
// import "../styles/ItemsCategories.css";

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
      <div className="flex items-center justify-center p-4">
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
      <div
        key={item._id}
        className="bg-white border shadow-lg rounded-lg  p-4 flex  justify-between items-center"
      >
        {/* Item Image */}
        <img
          src={item.image}
          alt={item.nameEnglish}
          className="w-24 h-24 object-cover rounded-md border-2 border-gray-300"
        />

        {/* Item Name */}
        <p className="mt-3 text-lg font-semibold text-gray-800">
          {item.nameEnglish}
        </p>

        {/* Actions Section */}
        <div className="flex items-center gap-4 mt-4">
          {/* Edit Button */}
          <button
            onClick={() => handleEdit(item._id)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>

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
    ));
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Just a Moment</div>
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="p-6  mx-auto">
      {/* Header Section */}
      <div className="flex items-center  gap-4 mb-6 ">
        <button
          onClick={() => navigate("/items")}
          className=" rounded-lg   border-gray-300 hover:text-black text-gray-800 duration-200 transition-all "
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className=" p-0 m-0 font-semibold text-gray-800">
          {categoryName} Items
        </h1>
      </div>

      {/* Categories */}
      <div className="flex gap-6">
        {/* Veg Category */}
        <div className="bg-white  shadow-md rounded-lg p-4 h-screen flex flex-col flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-green-600 border-b pb-2 ">
            Veg
          </h3>
          <div className="mt-4 gap-4 grid">{renderItems("Veg")}</div>
          <div className="mt-4 ">{renderPagination("Veg")}</div>
        </div>

        {/* Non-Veg Category */}
        <div className="bg-white  shadow-md rounded-lg p-4 h-screen flex flex-col flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-red-600 border-b pb-2">
            Non-Veg
          </h3>
          <div className="mt-4  gap-4 grid">{renderItems("Non Veg")}</div>
          <div className="mt-4">{renderPagination("Non Veg")}</div>
        </div>
      </div>
    </div>
  );
};

export default ItemsCategories;
