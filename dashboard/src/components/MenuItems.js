import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import { createDiningCategory, getAllDiningCategories } from "../utils/api2";

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
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-md p-6 rounded-2xl">
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
      <div className="mt-6 grid grid-cols-4 gap-4">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">
            No categories added yet. Click "Add Category" to get started.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="bg-white shadow-md p-4 rounded-2xl flex items-center cursor-pointer hover:shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-24 object-cover rounded-2xl"
              />
              <div className="flex items-center justify-between ml-4 w-full">
                <h2 className="text-lg font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="bg-green-600 rounded-full px-4 py-2 flex justify-center items-center text-white font-semibold text-md"
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
  );
};

export default MenuItems;
