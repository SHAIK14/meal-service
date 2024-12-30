import React, { useState } from "react";
import Menu from "./Menu"; // Import the Menu component
import itemsData from "./DataProvider"; // Import the items data

const Navbar = () => {
  // Extract categories from the itemsData object and get the first item's image
  const navLinks = Object.keys(itemsData).map((category) => ({
    name: category,
    img: itemsData[category][0].img, // Get the image of the first item in the category
  }));

  const [activeLink, setActiveLink] = useState(navLinks[0].name);
  const [selectedCategory, setSelectedCategory] = useState(navLinks[0].name);
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query

  const handleLinkClick = (name) => {
    setActiveLink(name);
    setSelectedCategory(name);
  };

  const handleSearch = (query) => {
    setSearchQuery(query); // Update the search query
  };

  return (
    <div>
      <div>
        <div>
          <nav className="bg-white shadow-md p-4">
            <ul className="flex flex-wrap justify-around md:justify-center gap-4">
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className={`flex flex-col items-center w-20 relative ${
                    activeLink === link.name ? "" : ""
                  }`}
                >
                  <a
                    href={`#${link.name.toLowerCase()}`}
                    className="text-center"
                    onClick={() => handleLinkClick(link.name)}
                  >
                    <img
                      src={link.img}
                      alt={link.name}
                      className="w-16 h-16 object-cover rounded-full border border-gray-300"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/64")
                      }
                    />
                    <span className="mt-2 text-sm font-semibold text-gray-700">
                      {link.name}
                    </span>
                  </a>
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transition-all duration-300 ease-in-out ${
                      activeLink === link.name ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Render Menu component with selected category and search query */}
      <Menu selectedCategory={selectedCategory} searchQuery={searchQuery} />
    </div>
  );
};

export default Navbar;
