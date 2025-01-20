import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const filterOptions = [
  { id: "veg", label: "Veg" },
  { id: "non-veg", label: "Non-Veg" },
];

const SearchBar = ({ onSearch, initialFilter, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value, selectedFilter);
  };

  const handleSearch = (term, filter) => {
    if (onSearch) {
      onSearch({ term, filter });
    }
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    handleSearch(searchTerm, filter);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search menu items..."
            className="w-full py-2 px-4 focus:outline-none text-gray-700"
            aria-label="Search menu items"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 border-l border-gray-300 hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="Filter menu"
            aria-expanded={isFilterOpen}
          >
            <FontAwesomeIcon
              icon={faFilter}
              className={`text-gray-600 ${
                selectedFilter ? "text-blue-500" : ""
              }`}
            />
            {selectedFilter && (
              <span className="ml-2 text-sm text-gray-600">
                {filterOptions.find((f) => f.id === selectedFilter)?.label}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <ul className="py-1" role="menu">
                {filterOptions.map((filter) => (
                  <li key={filter.id}>
                    <button
                      onClick={() => handleFilterSelect(filter.id)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        selectedFilter === filter.id
                          ? "text-blue-500 bg-blue-50"
                          : "text-gray-700"
                      }`}
                      role="menuitem"
                    >
                      {filter.label}
                    </button>
                  </li>
                ))}
                {selectedFilter && (
                  <li>
                    <button
                      onClick={() => handleFilterSelect(null)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-200"
                      role="menuitem"
                    >
                      Clear Filter
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialFilter: PropTypes.string,
  className: PropTypes.string,
};

SearchBar.defaultProps = {
  initialFilter: null,
  className: "",
};

export default SearchBar;
