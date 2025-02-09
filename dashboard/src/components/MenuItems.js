import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import { createDiningCategory, getAllDiningCategories } from "../utils/api2";
import { FaTrash, FaEdit } from "react-icons/fa";

const MenuItems = () => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await getAllDiningCategories();
    if (response.success) {
      setCategories(response.data.categories);
    }
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
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 ">
        <h1 className="text-2xl m-0 font-bold text-gray-800">Dining Menu</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="bg-gray-100 text-black px-4 font-semibold py-2 rounded-lg text-sm hover:bg-green-500 hover:text-white transition-all duration-300"
        >
          + Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="  grid grid-cols-4 gap-4 ">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">
            No categories added yet. Click "Add Category" to get started.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="relative flex items-center border overflow-hidden rounded-2xl p-4 gap-4 hover:bg-gray-100 transition-all duration-300 group"
            >
              {/* Image Section */}
              <div className="w-24 h-24 rounded-2xl bg-red-500 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className=" w-full h-full object-cover"
                />
              </div>

              {/* Category Info Section */}
              <div className="flex flex-col ml-4 w-full">
                <h2 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="text-sm flex justify-center items-center text-blue-600 font-semibold underline"
                  >
                    Manage items
                  </button>
                </div>
              </div>

              {/* Edit & Delete Buttons with Drop Animation */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Edit Button */}
                <button
                  onClick={() => alert("Edit category")}
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-500 transform -translate-y-5 group-hover:translate-y-0"
                >
                  <FaEdit />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => alert("Delete category")}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-500 transform -translate-y-5 group-hover:translate-y-0"
                >
                  <FaTrash />
                </button>
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
              className="w-full mb-4 text-black bg-gray-100 p-2 border border-gray-300 rounded-md"
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-100 text-black-700 flex-1 p-1 rounded-md  hover:bg-gray-200 transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-red-500 text-white flex-1 p-1 rounded-md hover:bg-red-600 transition-all  duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
