import React, { useState, useMemo } from "react";

const FixedDishesForm = ({ onClose, onSubmit }) => {
  // State for form inputs
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("");

  // State for categories
  const [categories, setCategories] = useState([
    "Vegetarian",
    "Non-Vegetarian",
    "Vegan",
    "Desserts",
    "Appetizers",
  ]);

  // State for category management
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }, [categories, searchCategory]);

  // Toggle category selection
  const toggleCategorySelection = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  // Add new category
  const handleAddNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setSelectedCategories([...selectedCategories, newCategory.trim()]);
      setNewCategory("");
      setIsAddCategoryDialogOpen(false);
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !packageName ||
      !packagePrice ||
      !numberOfGuests ||
      selectedCategories.length === 0
    ) {
      alert("Please fill in all fields and select at least one category");
      return;
    }

    // Create new package object
    const newPackage = {
      name: packageName,
      price: `${packagePrice} SAR`,
      numberOfGuests: numberOfGuests,
      categories: selectedCategories,
    };

    // Call the submit handler passed from parent
    onSubmit(newPackage);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white shadow-md -lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Package Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name
          </label>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Enter Package Name"
            required
            className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Package Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Price
          </label>
          <input
            type="number"
            value={packagePrice}
            onChange={(e) => setPackagePrice(e.target.value)}
            placeholder="Enter Package Price"
            required
            className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Number of Guests Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(e.target.value)}
            placeholder="Enter Number of Guests"
            required
            className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Categories Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Categories
          </label>

          {/* Dropdown Trigger */}
          <div
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full px-3 py-2 border border-gray-300 -md shadow-sm cursor-pointer flex justify-between items-center"
          >
            <span>
              {selectedCategories.length > 0
                ? `${selectedCategories.length} categories selected`
                : "Select Categories"}
            </span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Dropdown Content */}
          {isCategoryDropdownOpen && (
            <div className="realtive z-10 w-full mt-1 h-[300px] overflow-auto max-h-[200px] bg-white border border-gray-300 -md shadow-lg">
              {/* Search Input */}
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search categories"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 -md focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Category List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <div
                    key={category}
                    onClick={() => toggleCategorySelection(category)}
                    className="px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer"
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 mr-2 border  ${
                        selectedCategories.includes(category)
                          ? "bg-gray-500 border-gray-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedCategories.includes(category) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {category}
                  </div>
                ))}
              </div>

              {/* Add New Category */}
              <div className="sticky bottom-0 z-20 bg-white">
                <div
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="px-3 py-2 text-blue-600 hover:bg-gray-100 cursor-pointer border-t border-gray-200 flex items-center font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Category
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Button Group */}
        <div className="flex justify-between space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 -md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full bg-gray-500 text-white py-2 -md hover:bg-gray-600 transition-colors"
          >
            Submit Package
          </button>
        </div>
      </form>

      {/* Add New Category Dialog */}
      {isAddCategoryDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 -lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>

            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter Category Name"
              className="w-full px-3 py-2 border border-gray-300 -md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddCategoryDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 -md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewCategory}
                className="px-4 py-2 bg-gray-500 text-white -md hover:bg-gray-600"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedDishesForm;
