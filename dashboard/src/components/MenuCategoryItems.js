import React, { useState } from "react";

const MenuCategoryItems = () => {
  const [dummyItems] = useState([
    {
      id: 1,
      name: "Chicken Biryani",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF85ukwZdlpAUDrj7WPev_MCmMFoUh8ua_Lw&s",
    },
    {
      id: 2,
      name: "Mutton Biryani",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT66d8jsPBIoaw0xeBZWHL_T9OQPOBJDKeAlg&s",
    },
    {
      id: 3,
      name: "Fish Curry",
      image:
        "https://www.tamarindnthyme.com/wp-content/uploads/2020/10/Pinterest-2-500x500.jpg",
    },
  ]);

  const [addedItems, setAddedItems] = useState([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [error, setError] = useState(""); // To store the error message
  const [draggedItem, setDraggedItem] = useState(null); // To store the dragged item
  const [isDraggingOver, setIsDraggingOver] = useState(false); // To track if an item is being dragged over

  // Handle adding a dummy item to the added items list
  const handleAddDummyItem = (item) => {
    const isItemAdded = addedItems.some(
      (addedItem) => addedItem.id === item.id
    );

    if (isItemAdded) {
      setError("Item already available!");
    } else {
      setAddedItems([...addedItems, item]);
      setError(""); // Clear error when item is successfully added
    }
  };

  // Handle removing an item from the added items list
  const handleRemoveItem = (id) => {
    setAddedItems(addedItems.filter((item) => item.id !== id));
  };

  // Handle saving the added items
  const handleSaveItems = () => {
    alert("Items saved successfully!");
  };

  // Handle drag start
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault(); // Allow dropping
    setIsDraggingOver(true); // Highlight the drop area
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(false); // Remove highlight from drop area
  };

  // Handle drop
  const handleDrop = () => {
    if (draggedItem) {
      handleAddDummyItem(draggedItem);
      setDraggedItem(null); // Clear the dragged item
    }
    setIsDraggingOver(false); // Remove highlight from drop area
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col justify-center items-center  ">
      {/* Left Section (Dummy Items) */}
      <div className="flex w-full justify-center items-center ">
        <div className="w-1/2 p-8 h-[600px] bg-white  shadow-md rounded-md mr-4 overflow-y-scroll">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Available Items
            </h2>
          </div>
          <div className="w-full mb-4 flex justify-between items-center">
            <div className="w-full">
              <input
                type="text"
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Search in Dummy Items"
              />
            </div>
          </div>

          <div className="space-y-4">
            {dummyItems
              .filter((item) =>
                item.name.toLowerCase().includes(searchLeft.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-md  rounded-md flex items-center justify-between"
                  draggable
                  onDragStart={() => handleDragStart(item)} // Set the item being dragged
                  style={{ cursor: "pointer" }} // Hand cursor while dragging
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h2 className=" text-lg font-semibold text-gray-800">
                        {item.name}
                      </h2>
                      <p className="text-gray-400 ">
                        {" "}
                        Drag and Drop Item to Added List
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddDummyItem(item)}
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
          className={`w-1/2 p-8 bg-white h-[600px] shadow-md rounded-md overflow-y-scroll ${
            isDraggingOver ? "border-2 border-dashed border-blue-500" : ""
          }`}
          onDragOver={handleDragOver} // Allow dropping by preventing default behavior
          onDragLeave={handleDragLeave} // Remove highlight when leaving the drop area
          onDrop={handleDrop} // Handle drop event
        >
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Added Items
            </h2>
          </div>
          <div className="w-full mb-4">
            <div className="w-full">
              <input
                type="text"
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                className="w-full p-2 flex border border-gray-300 rounded-md"
                placeholder="Search in Added Items"
              />
            </div>
          </div>

          {/* Dragging Over Message */}
          {isDraggingOver && (
            <div className="text-center text-blue-500 font-semibold">
              Drop it here
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}

          <div className="space-y-4">
            {addedItems
              .filter((item) =>
                item.name.toLowerCase().includes(searchRight.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-md  rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <h2 className="ml-4 text-lg font-semibold text-gray-800">
                      {item.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="bg-red-500 text-white mr-8 px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleSaveItems}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
      >
        Save
      </button>
    </div>
  );
};

export default MenuCategoryItems;
