import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, createCategory, deleteCategory } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes } from "react-icons/fa";

const Items = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

          await fetchCategories();
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "10px",
            }}
          >
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
    <div className="bg-white p-6 h-screen ">
      <div className="bg-gray-100 p-6 h-full">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className=" flex  justify-between items-center mb-6">
          <h1 className="text-left text-2xl font-semibold m-0">Items</h1>
          <button
            className="flex gap-2 items-center bg-green-500 text-white text-sm font-semibold px-6 py-3 hover:bg-green-600 hover:text-white transition-all ease-in-out duration-300"
            onClick={handleAddItem}
          >
            Add Item <FaPlus />
          </button>
        </div>

        <form onSubmit={handleAddCategory} className="">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 font-semibold text-sm px-6 py-3 bg-gray-200 tranistion-all ease-in-out duration-300 text-gray-800 hover:bg-gray-800 hover:text-white"
            >
              Create Category <FaPlus />
            </button>
          </div>
        </form>

        <div className="grid grid-cols-4 mt-6 gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-gray-800  text-white flex items-center justify-between p-4"
            >
              <h3
                className="cursor-pointer hover:underline transition ease-in-out duration-300 "
                onClick={() => handleCategoryClick(category)}
              >
                {category.name}
              </h3>
              <button
                className="cursor-pointer "
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
    </div>
  );
};

export default Items;
