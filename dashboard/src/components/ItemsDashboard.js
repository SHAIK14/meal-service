import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardItems, deleteItem, getAllCategories } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const ItemsDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [pagination.currentPage, filters]);

  const fetchCategories = async () => {
    try {
      const result = await getAllCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await getDashboardItems({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      });

      if (result.success) {
        setItems(result.items);
        setPagination(result.pagination);
      } else {
        setError(result.error || "Failed to fetch items");
      }
    } catch (error) {
      setError("An error occurred while fetching items");
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        const result = await deleteItem(itemId);
        if (result.success) {
          toast.success("Item deleted successfully");
          fetchItems(); // Refresh the items list
        } else {
          toast.error(result.error || "Failed to delete item");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the item");
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleEditItem = (itemId) => {
    navigate(`/edit-item/${itemId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page when filter changes
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page when search changes
  };

  const handleClearFilters = () => {
    setFilters({ category: "", type: "", search: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-700">Loading Items...</div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
          Items Dashboard
        </h1>
        <button
          onClick={() => navigate("/add-item")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center"
        >
          + Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-2">
          <FaFilter className="text-gray-500 mr-2" />
          <h2 className="text-lg font-medium">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Veg">Veg</option>
              <option value="Non Veg">Non Veg</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

              {filters.search && (
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters & Clear Button */}
        <div className="flex justify-between mt-4 items-center">
          <div className="text-sm text-gray-600">
            {pagination.totalItems > 0 ? (
              <span>
                Showing {items.length} of {pagination.totalItems} items
              </span>
            ) : (
              <span>No items found</span>
            )}
          </div>

          {(filters.category || filters.type || filters.search) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X size={16} className="mr-1" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nameEnglish}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                    No Image
                  </div>
                )}

                <div className="absolute top-0 right-0 bg-white bg-opacity-80 px-2 py-1 m-2 rounded text-xs font-medium">
                  {item.type}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {item.nameEnglish}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{item.nameArabic}</p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">
                    {item.category ? item.category.name : "No Category"}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item._id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="Edit Item"
                    >
                      <FaEdit size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteItem(item._id, item.nameEnglish)
                      }
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Delete Item"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Item Availability Toggle */}
              <div
                className={`py-3 px-4 ${
                  item.available ? "bg-green-100" : "bg-red-100"
                } flex justify-between items-center`}
              >
                <span
                  className={`text-sm font-medium ${
                    item.available ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>

                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">
                    {item.calories} cal
                  </span>

                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      item.available ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 mb-4">
            No items found with the current filters
          </p>
          <button
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() =>
              handlePageChange(Math.max(1, pagination.currentPage - 1))
            }
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              handlePageChange(
                Math.min(pagination.totalPages, pagination.currentPage + 1)
              )
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemsDashboard;
