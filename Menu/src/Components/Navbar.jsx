import { useState, useEffect } from "react";
import { getDiningMenuItems } from "../utils/api";
import { useDining } from "../contexts/DiningContext";

const Navbar = ({ activeCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const { branchDetails } = useDining();

  useEffect(() => {
    const fetchCategories = async () => {
      if (branchDetails?.id) {
        const response = await getDiningMenuItems(branchDetails.id);
        if (response.success) {
          setCategories(response.data);
          // Only set initial category when no category is selected and we have categories
          if (!activeCategory && response.data.length > 0) {
            onCategoryChange(response.data[0].name);
          }
        }
      }
    };

    fetchCategories();
  }, [branchDetails?.id]); // We only fetch categories when branchId changes

  return (
    <nav className="sticky top-0 bg-white shadow-md z-50">
      <div className="overflow-x-auto">
        <ul className="flex whitespace-nowrap px-4 py-3 space-x-6">
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <button
                onClick={() => onCategoryChange(category.name)}
                className={`flex flex-col items-center w-20 ${
                  activeCategory === category.name
                    ? "text-red-500"
                    : "text-gray-600"
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden mb-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/56";
                    }}
                  />
                </div>
                <span className="text-xs font-medium">{category.name}</span>
                {activeCategory === category.name && (
                  <div className="w-full h-0.5 bg-red-500 mt-1" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
