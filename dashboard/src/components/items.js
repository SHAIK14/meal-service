import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, createCategory } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus } from "react-icons/fa";
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
      console.log("API response:", result);
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error("Failed to fetch categories:", result.error);
        setError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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
          setCategories([...categories, result.data]);
          setNewCategory("");
          toast.success("Category added successfully");
        } else {
          console.error("Failed to add category:", result.error);
          toast.error("Failed to add category");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("An error occurred while adding the category");
      }
    }
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
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="category-box">
              <h3 onClick={() => handleCategoryClick(category)}>
                {category.name}
              </h3>
            </div>
          ))
        ) : (
          <div>No categories available</div>
        )}
      </div>
    </div>
  );
};

export default Items;
