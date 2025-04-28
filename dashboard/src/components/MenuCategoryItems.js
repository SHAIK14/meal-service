import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  addItemsToDiningCategory,
  removeItemFromDiningCategory,
  getDiningCategoryById,
} from "../utils/api2";
import { getAllItems } from "../utils/api";

const MenuCategoryItems = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const [category, setCategory] = useState(location.state?.category || null);
  const [availableItems, setAvailableItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [error, setError] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAvailableItems, setTotalAvailableItems] = useState(0);

  // First fetch the category if not in state
  useEffect(() => {
    const fetchCategory = async () => {
      if (!category && categoryId) {
        try {
          const response = await getDiningCategoryById(categoryId);
          if (response.success) {
            setCategory(response.data.category);
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setError("Failed to load category");
        }
      }
    };
    fetchCategory();
  }, [categoryId, category]);

  // Then fetch items once we have category
  useEffect(() => {
    const fetchItems = async () => {
      if (!category) return;

      try {
        // Modify the API call to fetch all items with limit set very high
        const response = await getAllItems({
          service: "dining",
          limit: 1000, // Setting a high limit to effectively get all items
        });

        if (response.success) {
          const availableItemsData = response.items.filter(
            (item) =>
              !category.items.some((catItem) => catItem._id === item._id)
          );
          setAvailableItems(availableItemsData);
          setTotalAvailableItems(availableItemsData.length);
          setAddedItems(category.items || []);

          console.log(`Total available items: ${availableItemsData.length}`);
          console.log(`Total category items: ${category.items.length}`);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Failed to load items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  const handleAddItem = async (item) => {
    try {
      const isItemAdded = addedItems.some(
        (addedItem) => addedItem._id === item._id
      );

      if (isItemAdded) {
        setError("Item already added to this category!");
        return;
      }

      const response = await addItemsToDiningCategory(categoryId, [item._id]);

      if (response.success) {
        setAddedItems([...addedItems, item]);
        setAvailableItems(availableItems.filter((i) => i._id !== item._id));
        setTotalAvailableItems((prev) => prev - 1);
        setError("");
      } else {
        setError("Failed to add item to category");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await removeItemFromDiningCategory(categoryId, itemId);

      if (response.success) {
        const removedItem = addedItems.find((item) => item._id === itemId);
        setAddedItems(addedItems.filter((item) => item._id !== itemId));
        setAvailableItems([...availableItems, removedItem]);
        setTotalAvailableItems((prev) => prev + 1);
      } else {
        setError("Failed to remove item from category");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item");
    }
  };

  // Drag and drop handlers remain the same
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = () => {
    if (draggedItem) {
      handleAddItem(draggedItem);
      setDraggedItem(null);
    }
    setIsDraggingOver(false);
  };

  if (isLoading || !category) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Just a Moment</div>
      </div>
    );
  }

  // Filter available items based on search
  const filteredAvailableItems = availableItems.filter((item) =>
    item.nameEnglish.toLowerCase().includes(searchLeft.toLowerCase())
  );

  // Filter added items based on search
  const filteredAddedItems = addedItems.filter((item) =>
    item.nameEnglish.toLowerCase().includes(searchRight.toLowerCase())
  );

  return (
    <div className="p-8 bg-white h-screen overflow-y-auto">
      {/* Category Header */}
      <div className="flex items-center p-0 m-0">
        <h1 className="text-2xl font-bold text-black">
          Managing Items for: {category?.name}
        </h1>
      </div>

      {/* Item Counts */}
      <div className="mb-6 mt-2 flex flex-wrap gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 font-medium">Available Items</p>
          <p className="text-2xl font-bold text-blue-700">
            {totalAvailableItems}
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-green-800 font-medium">Added to Category</p>
          <p className="text-2xl font-bold text-green-700">
            {addedItems.length}
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-md">
          <p className="text-purple-800 font-medium">Total Items</p>
          <p className="text-2xl font-bold text-purple-700">
            {totalAvailableItems + addedItems.length}
          </p>
        </div>
      </div>

      {/* Your existing JSX for the two columns */}
      <div className="flex w-full justify-center items-center p-4">
        {/* Left Section (Available Items) */}
        <div className="flex-1 flex flex-col p-8 h-[600px] bg-white border rounded-md mr-4 overflow-y-scroll">
          <div className="bg-white w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Available Items
              </h2>
              <span className="text-sm text-gray-500">
                {filteredAvailableItems.length} of {availableItems.length} items
              </span>
            </div>
            <div className="w-full mb-4 relative">
              <input
                type="text"
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Search available items"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAvailableItems.length > 0 ? (
              filteredAvailableItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-md rounded-md flex items-center justify-between hover:shadow-lg transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.nameEnglish}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.nameEnglish}
                      </h2>
                      <p className="text-gray-400">
                        Drag and Drop Item to Added List
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="bg-green-500 text-white mr-8 px-6 py-2 rounded-md hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No available items found matching your search
              </div>
            )}
          </div>
        </div>

        {/* Right Section (Added Items) */}
        <div
          className={`flex-1 flex flex-col bg-white p-8 h-[600px] shadow-md rounded-md overflow-y-scroll ${
            isDraggingOver ? "border-2 border-dashed border-blue-500" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Category Items</h2>
            <span className="text-sm text-gray-500">
              {filteredAddedItems.length} of {addedItems.length} items
            </span>
          </div>

          <div className="w-full mb-4">
            <input
              type="text"
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search category items"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}

          {isDraggingOver && (
            <div className="text-center text-blue-500 font-semibold py-4 border-2 border-dashed border-blue-300 rounded-md my-4">
              Drop item here to add to category
            </div>
          )}

          <div className="space-y-4">
            {filteredAddedItems.length > 0 ? (
              filteredAddedItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-md rounded-md flex items-center justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.nameEnglish}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.nameEnglish}
                      </h2>
                      <p className="text-xs text-gray-500">{item.nameArabic}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="bg-red-500 text-white mr-8 px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No category items found matching your search
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategoryItems;
