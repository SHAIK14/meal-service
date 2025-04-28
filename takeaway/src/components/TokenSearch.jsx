// src/components/TokenSearch.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const TokenSearch = () => {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      // Handle tokens without leading zeros
      const formattedToken = token.trim();
      navigate(`/takeaway/status/${formattedToken}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h2 className="text-sm font-medium text-gray-700 mb-2">
        Already placed an order?
      </h2>
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token number"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          />
          <FaSearch
            className="absolute left-3 top-2.5 text-gray-400"
            size={16}
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-green-700"
        >
          Track
        </button>
      </form>
    </div>
  );
};

export default TokenSearch;
