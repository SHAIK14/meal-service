import React from "react";
import Items from "./Items";
import SearchBar from "./SearchBar";
import itemsData from "./DataProvider"; // Assuming you import itemsData here as well

const Menu = ({ selectedCategory }) => {
  console.log("Selected Category: ", selectedCategory); // Check what category is being passed
  return (
    <div className="p-8">
      <div className="w-full flex flex-1 mb-8">
        <SearchBar />
      </div>
      <h2 className="text-2xl font-semibold mb-4">{selectedCategory} Menu</h2>
      {/* Render Items component based on selected category */}
      <Items category={selectedCategory} />
    </div>
  );
};

export default Menu;
