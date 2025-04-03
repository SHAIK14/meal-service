import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import { createDiningCategory, getAllDiningCategories } from "../utils/api2";
import { IoMdAdd } from "react-icons/io";
import { IoTrash } from "react-icons/io5";

const MenuItems = () => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // Page Loading State
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsPageLoading(true); // Show Loader
    const response = await getAllDiningCategories();
    if (response.success) {
      setCategories(response.data.categories);
    }
    setIsPageLoading(false); // Hide Loader
  };

  // Handle navigation to category details
  const handleCategoryClick = (category) => {
    navigate(`/menuCategoryItems/${category._id}`, {
      state: {
        category: {
          id: category._id,
          name: category.name,
          items: category.items,
        },
      },
    });
  };

  // Placeholder function for handleDeleteCategory
  const handleDeleteCategory = (categoryId) => {
    alert(`Delete category with ID: ${categoryId}`);
  };

  // Handle image upload to Firebase
  const uploadImageToFirebase = async (file) => {
    const storageRef = ref(
      storage,
      `dining-categories/${Date.now()}-${file.name}`
    );
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryImage) {
      alert("Please enter a category name and upload an image!");
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Firebase
      const imageUrl = await uploadImageToFirebase(newCategoryImage);

      // Create category in database
      const response = await createDiningCategory({
        name: newCategoryName,
        image: imageUrl,
      });

      if (response.success) {
        await fetchCategories(); // Refresh categories list
        setNewCategoryName("");
        setNewCategoryImage(null);
        setShowPopup(false);
      } else {
        alert(response.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-screen p-6 flex items-center justify-center">
      {isPageLoading ? (
        // Loader Component
        <div className="flex items-center justify-center h-full w-full">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-full bg-gray-100 p-4 w-full">
          {/* Header */}
          <div className="flex justify-between items-center  rounded-2xl">
            <h1 className="text-2xl m-0 font-semibold  text-gray-800">
              Dining Menu
            </h1>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-green-500 flex items-center gap-2 text-white px-6 py-3 font-semibold text-sm  hover:bg-green-600"
            >
              <IoMdAdd />
              Add Category
            </button>
          </div>

          {/* Categories List */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {categories.length === 0 ? (
              <p className="text-gray-600 text-center col-span-full">
                No categories added yet. Click "Add Category" to get started.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-200 max-h-[150px] h-[120px] relative shadow-md p-4 flex items-center cursor-pointer transition-all duration-300 ease-in-out"
                  onMouseEnter={() => setHoveredCategory(category._id)} // Track hover
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Delete Icon (Initially Hidden) */}
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className={`absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md transition-opacity duration-300 ${
                      hoveredCategory === category._id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <IoTrash size={18} />
                  </button>

                  {/* Category Image */}
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Category Details */}
                  <div className="flex flex-col items-start ml-4 w-full">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {category.name}
                    </h2>
                    <div className="bottom-0 right-0 flex items-center justify-center">
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className="relative text-sm flex justify-center items-center text-gray-500 underline hover:text-gray-600 cursor-pointer font-semibold text-md"
                      >
                        Manage items
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Category Popup */}
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
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuItems;
