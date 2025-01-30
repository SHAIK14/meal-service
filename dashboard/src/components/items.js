import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, createCategory, deleteCategory } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes } from "react-icons/fa";
// import "../styles/Items.css";

const Items = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getRandomColor = () => {
    const colors = [
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
      "bg-gradient-to-r from-green-400 to-blue-500",
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-red-500 to-yellow-500",
      "bg-gradient-to-r from-teal-400 to-blue-500",
      "bg-gradient-to-r from-pink-400 to-red-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getAllCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (error) {
      setError("An error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    navigate("/add-item");
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.name}`);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.trim() !== "") {
      try {
        const result = await createCategory({ name: newCategory.trim() });
        if (result.success) {
          setNewCategory("");
          toast.success("Category added successfully");
          setIsModalOpen(false); // Close modal after success
          await fetchCategories(); // Refresh categories
        } else {
          toast.error("Failed to add category");
        }
      } catch (error) {
        toast.error("An error occurred while adding the category");
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = async () => {
      try {
        const result = await deleteCategory(categoryId);
        if (result.success) {
          toast.success("Category deleted successfully");

          await fetchCategories();
        } else {
          toast.error(result.error || "Failed to delete category");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the category");
      }
    };

    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this category?</p>
          <div className="">
            <button
              onClick={() => {
                confirmDelete();
                closeToast();
              }}
              style={{
                padding: "5px 10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              style={{
                padding: "5px 10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="items-page bg-white p-8 h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center bg-gray-100 justify-between rounded-2xl p-4">
        <h1 className="font-semibold text-3xl text-gray-800 p-0 m-0">Items</h1>
        <div className="flex gap-3 p-0">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500 text-sm font-semibold text-black hover:text-white transition- duration-300 bg-gray-200"
            onClick={handleAddItem}
          >
            <FaPlus /> Add Items in Categories
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-500 text-sm font-semibold text-black hover:text-white transition-all duration-300 bg-gray-200"
          >
            Create Category
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add Category Button */}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
              {/* Form */}
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <div className="flex justify-between space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div
            key={category._id}
            className={`flex p-6 shadow-md rounded-lg items-center justify-between ${getRandomColor()}`}
          >
            <h3
              className="text-white text-lg font-semibold cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              {category.name}
            </h3>
            <button
              className="text-white hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category._id);
              }}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Items;
