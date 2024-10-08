import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, createCategory, deleteCategory } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes } from "react-icons/fa";
import "../styles/Items.css";

const Items = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const result = await getAllCategories();
    if (result.success) {
      setCategories(result.data);
    } else {
      console.error("Failed to fetch categories:", result.error);
      toast.error("Failed to fetch categories");
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
      const result = await createCategory({ name: newCategory.trim() });
      if (result.success) {
        setCategories([...categories, result.data]);
        setNewCategory("");
        toast.success("Category added successfully");
      } else {
        console.error("Failed to add category:", result.error);
        toast.error("Failed to add category");
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmDelete) {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter((cat) => cat._id !== id));
        toast.success("Category deleted successfully");
      } else {
        console.error("Failed to delete category:", result.error);
        toast.error("Failed to delete category");
      }
    }
  };

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
            <button
              className="delete-category-btn"
              onClick={() => handleDeleteCategory(category._id)}
            >
              <FaTimes />
            </button>
            <h3 onClick={() => handleCategoryClick(category)}>
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Items;
