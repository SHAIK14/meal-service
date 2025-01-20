import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MenuItems = () => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);

  const navigate = useNavigate();

  // Handle navigation to category details
  const handleCategoryClick = (category) => {
    const sanitizedCategory = {
      id: category.id,
      name: category.name,
      items: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image, // Ensure this is a string or valid URL
      })),
    };
    navigate(`/menuCategoryItems`, { state: { category: sanitizedCategory } });
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName && newCategoryImage) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName,
        image: URL.createObjectURL(newCategoryImage),
        items: [],
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNewCategoryImage(null);
      setShowPopup(false);
    } else {
      alert("Please enter a category name and upload an image!");
    }
  };

  // Update category details
  const handleCategoryUpdate = (updatedCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center  bg-white shadow-md p-6 rounded-2xl">
        <h1 className="text-2xl m-0 font-bold px-2 text-gray-800">
          Dining Menu
        </h1>

        <button
          onClick={() => setShowPopup(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
        >
          + Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="mt-6 grid grid-cols-4  gap-4">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">
            No categories added yet. Click "Add Category" to get started.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="bg-white shadow-md p-4 rounded-2xl  flex items-center  cursor-pointer hover:shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-24 object-cover rounded-2xl"
              />
              <div className="flex items-center  justify-between ml-4 w-full">
                <h2 className=" text-lg  font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div className=" bg-white">
                  <button className="bg-green-600 rounded-full px-4 py-2 flex justify-center items-center  text-white font-semibold text-md">
                    Add items
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popup for Adding Category */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 shadow-lg w-80">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Category
            </h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Enter category name"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Cover Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewCategoryImage(e.target.files[0])}
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
