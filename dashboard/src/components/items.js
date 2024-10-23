import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, createCategory, deleteCategory } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import "../styles/Items.css";

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
    <div className="items-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="items-header">
        <h1>Items</h1>
        <button className="add-item-btn" onClick={handleAddItem}>
          Add Item <FaPlus />
        </button>
      </div>

      <form onSubmit={handleAddCategory} className="add-category-form">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="add-category-input"
        />
        <button type="submit" className="add-category-btn">
          Add Category <FaPlus />
        </button>
      </form>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category._id} className="category-box">
            <h3 onClick={() => handleCategoryClick(category)}>
              {category.name}
            </h3>
            <button
              className="delete-category-btn"
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
