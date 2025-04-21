import React, { useState, useRef, useEffect } from "react";
import { getAllItems } from "../../utils/api";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

const PerHeadCateringItems = () => {
  const [activeCategory, setActiveCategory] = useState("Salads");
  const scrollRef = useRef(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [leftSearchTerm, setLeftSearchTerm] = useState("");
  const [rightSearchTerm, setRightSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggingItem, setDraggingItem] = useState(null);

  const categories = [
    "Salads",
    "Veg Main Course",
    "Non-Veg Main Course",
    "Sweets",
    "Drinks",
    "Snacks",
    "Soups",
    "Desserts",
  ];

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAllItems({ service: "dining" });

        if (response.success) {
          setAvailableItems(response.items || []);

          // Initialize selected items structure
          const initialSelectedItems = {};
          categories.forEach((category) => {
            initialSelectedItems[category] = [];
          });
          setSelectedItems(initialSelectedItems);
        } else {
          setError("Failed to load items");
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Failed to load items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  // Filter available items based on search term
  const filteredAvailableItems = availableItems.filter((item) =>
    item.nameEnglish?.toLowerCase().includes(leftSearchTerm.toLowerCase())
  );

  // Filter selected items based on search term
  const filteredSelectedItems =
    selectedItems[activeCategory]?.filter((item) =>
      item.nameEnglish?.toLowerCase().includes(rightSearchTerm.toLowerCase())
    ) || [];

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggingItem(item);
    setIsDragging(true);

    // Set a ghost drag image if browser supports it
    if (e.dataTransfer.setDragImage) {
      const ghostElement = document.createElement("div");
      ghostElement.classList.add("drag-ghost");
      ghostElement.innerHTML = `<div class="p-2 bg-blue-100 border border-blue-300 rounded-md text-blue-800">${item.nameEnglish}</div>`;
      ghostElement.style.position = "absolute";
      ghostElement.style.top = "-1000px";
      document.body.appendChild(ghostElement);
      e.dataTransfer.setDragImage(ghostElement, 0, 0);

      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggingItem(null);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle drop to add item to category
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggingItem) return;

    // Check if item is already in this category
    const isAlreadyAdded = selectedItems[activeCategory].some(
      (item) => item._id === draggingItem._id
    );

    if (!isAlreadyAdded) {
      setSelectedItems((prev) => ({
        ...prev,
        [activeCategory]: [...prev[activeCategory], draggingItem],
      }));
    }

    setDraggingItem(null);
  };

  // Remove item from category
  const removeItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(
        (item) => item._id !== itemId
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Just a Moment</div>
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-3rem)]">
          {/* Categories Header with Tabs */}
          <header className="bg-white sticky top-0 z-10">
            <div className="relative w-full overflow-hidden bg-white px-2 py-3 border-b">
              <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 transform -translate-y-1/2  p-2  rounded-full z-10 hover:bg-gray-100 transition-all duration-200"
              >
                <FaCaretLeft />
              </button>

              <ul
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto whitespace-nowrap scroll-smooth px-10 no-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`min-w-max font-medium cursor-pointer py-2 px-6 rounded-full transition-all duration-200 ${
                      activeCategory === category
                        ? "bg-gray-800 text-white "
                        : " hover:bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 transform -translate-y-1/2  p-2 flex items-center justify-center rounded-full z-10 hover:bg-gray-100 transition-all duration-200"
              >
                <FaCaretRight />
              </button>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeCategory}
              </h2>

              {error && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 font-semibold rounded">
                  {error}
                </div>
              )}
            </div>

            {/* Two column layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left column - Available items */}
              <div className="w-full md:w-1/2 p-4 overflow-hidden  flex flex-col">
                <div className="bg-white rounded p-2 gap-2 shadow-sm border h-full flex flex-col">
                  <div className="p-4  rounded bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Available Items
                      </h3>
                      <div className="text-sm text-gray-400 font-semibold">
                        {filteredAvailableItems.length} Items
                      </div>
                    </div>
                    <div className="mt-3 ">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search available items..."
                          className="w-full p-2 pl-8 border  rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          value={leftSearchTerm}
                          onChange={(e) => setLeftSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded ">
                    {filteredAvailableItems.length > 0 ? (
                      <div className="space-y-3">
                        {filteredAvailableItems.map((item) => (
                          <div
                            key={item._id}
                            className="bg-white border shadow-sm rounded-lg p-3 flex items-center cursor-grab hover:shadow-md transition-all duration-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.nameEnglish}
                                className="w-14 h-14 object-cover rounded-lg mr-3"
                              />
                            )}
                            {!item.image && (
                              <div className="w-14 h-14 bg-gray-200 rounded-lg mr-3 flex items-center justify-center text-gray-400">
                                🍽️
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">
                                {item.nameEnglish}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="ml-2 text-xs gap-2 text-gray-500 flex items-center">
                              <FaArrowRightArrowLeft />
                              Drag
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center p-6">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                          </svg>
                          <p className="mt-2">
                            No items found matching your search.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - Selected items for category */}
              <div className="w-full md:w-1/2 p-4 overflow-hidden flex flex-col">
                <div
                  className={`bg-white rounded gap-2  p-2 h-full flex flex-col relative ${
                    isDragging ? "ring-2 ring-blue-400 ring-opacity-70" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Drop overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-80 flex items-center justify-center z-10 border-2 border-dashed border-blue-400 rounded-lg">
                      <div className="text-center p-6 animate-pulse">
                        <div className="bg-blue-100 inline-block p-3 rounded-full shadow-sm">
                          <svg
                            className="w-10 h-10 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            ></path>
                          </svg>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-blue-700">
                          Drop It Like It's Hot!
                        </h3>
                        <p className="mt-1 text-blue-600">
                          Release to add to {activeCategory}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Selected {activeCategory}
                      </h3>
                      <div className="text-sm text-gray-400 font-semibold">
                        {selectedItems[activeCategory]?.length || 0} items
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search selected items..."
                          className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          value={rightSearchTerm}
                          onChange={(e) => setRightSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto ">
                    {filteredSelectedItems.length > 0 ? (
                      <div className="space-y-3">
                        {filteredSelectedItems.map((item) => (
                          <div
                            key={item._id}
                            className="bg-gray-50 border shadow-sm rounded-lg p-3 flex items-center hover:shadow-md transition-all duration-200"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.nameEnglish}
                                className="w-14 h-14 object-cover rounded-lg mr-3"
                              />
                            )}
                            {!item.image && (
                              <div className="w-14 h-14 bg-gray-200 rounded-lg mr-3 flex items-center justify-center text-gray-400">
                                🍽️
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">
                                {item.nameEnglish}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                ₹{item.price}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                              title="Remove item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-center p-6">
                          <div className="bg-gray-100 inline-block p-6 rounded-full mb-4">
                            {activeCategory === "Salads" && "🥗"}
                            {activeCategory === "Veg Main Course" && "🍲"}
                            {activeCategory === "Non-Veg Main Course" && "🍗"}
                            {activeCategory === "Sweets" && "🍰"}
                            {activeCategory === "Drinks" && "🥤"}
                            {activeCategory === "Snacks" && "🍟"}
                            {activeCategory === "Soups" && "🍜"}
                            {activeCategory === "Desserts" && "🍮"}
                          </div>
                          <p className="text-lg font-medium">
                            No {activeCategory.toLowerCase()} selected yet
                          </p>
                          <p className="text-sm mt-2 text-gray-500">
                            Drag items from the left panel to add them here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerHeadCateringItems;
