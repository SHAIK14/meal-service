import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ onSearch, selectedFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(selectedFilter);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm, currentFilter); // Pass both search term and selected filter
    }
  };

  const handleFilterClick = () => {
    setIsFilterOpen((prevState) => !prevState);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilter(filter);
    setIsFilterOpen(false);
    if (onSearch) {
      onSearch(searchTerm, filter); // Trigger filter with selected filter
    }
  };

  return (
    <div className="relative flex items-center border-2 border-gray-300 rounded-full w-full max-w-md mx-auto p-1">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search items..."
        className="flex-1 p-2 rounded-full border-none focus:outline-none"
      />
      <button
        onClick={handleSearch}
        className="bg-transparent text-gray-700 hover:text-gray-900 p-2 focus:outline-none"
      >
        Search
      </button>
      <button
        onClick={handleFilterClick}
        className="ml-2 p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <FontAwesomeIcon icon={faFilter} size="lg" />
      </button>
      {isFilterOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-full z-10">
          <ul className="py-2">
            <li
              onClick={() => handleFilterSelect("Veg")}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              Veg
            </li>
            <li
              onClick={() => handleFilterSelect("Non-Veg")}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              Non-Veg
            </li>
          </ul>
        </div>
      )}
      {currentFilter && (
        <span className="ml-4 text-sm text-gray-600">
          Filter: {currentFilter}
        </span>
      )}
    </div>
  );
};

export default SearchBar;
