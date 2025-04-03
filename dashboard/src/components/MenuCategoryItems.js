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
        const response = await getAllItems({ service: "dining" });
        if (response.success) {
          const availableItemsData = response.items.filter(
            (item) =>
              !category.items.some((catItem) => catItem._id === item._id)
          );
          setAvailableItems(availableItemsData);
          setAddedItems(category.items || []);
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

  // Rest of your JSX remains the same
  return (
    <div className="p-8 bg-white h-screen overflow-y-auto">
      {/* Category Header */}
      <div className=" flex items-center p-0 m-0">
        <h1 className="text-2xl font-bold text-black">
          Managing Items for: {category?.name}
        </h1>
      </div>

      {/* Your existing JSX for the two columns */}
      <div className="flex w-full justify-center items-center p-4">
        {/* Left Section (Available Items) */}
        <div className="flex-1 flex flex-col p-8 h-[600px] bg-white border  rounded-md mr-4 overflow-y-scroll ">
          <div className="  bg-white w-full ">
            {/* ... rest of your existing JSX ... */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Available Items
              </h2>
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
            {availableItems
              .filter((item) =>
                item.nameEnglish
                  .toLowerCase()
                  .includes(searchLeft.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-md rounded-md flex items-center justify-between"
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
              ))}
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
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Category Items
            </h2>
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
            <div className="text-center text-blue-500 font-semibold">
              Drop item here
            </div>
          )}

          <div className="space-y-4">
            {addedItems
              .filter((item) =>
                item.nameEnglish
                  .toLowerCase()
                  .includes(searchRight.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-md rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.nameEnglish}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <h2 className="ml-4 text-lg font-semibold text-gray-800">
                      {item.nameEnglish}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="bg-red-500 text-white mr-8 px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategoryItems;
