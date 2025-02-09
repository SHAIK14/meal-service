import React, { useState, useEffect, useRef } from "react";
import {
  // FaArrowRight,
  // FaArrowLeft,
  FaBuilding,
  FaClipboardList,
  // FaBox,
  FaShoppingCart,
  FaTicketAlt,
  FaCreditCard,
  FaTruck,
  FaUtensilSpoon,
  FaUsers,
  FaBook,
  FaSignOutAlt,
  FaCaretDown,
  FaCaretUp,
  FaUtensils,
} from "react-icons/fa";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { MdFastfood } from "react-icons/md";

import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isItemsOpen, setIsItemsOpen] = useState(false); // State to control dropdown
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleItemsDropdown = () => {
    setIsItemsOpen(!isItemsOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex  z-50">
      {/* Sidebar */}
      <div className="flex z-50">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`flex flex-col h-full bg-gray-900 text-white transition-all duration-300 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700 ${
            isOpen ? "w-64" : "w-14"
          }`}
        >
          {/* Toggle Button */}
          <div className=" text-white flex  p-1 transition-all justify-end duration-300 items-center cursor-pointer ">
            <div
              className="p-2 m-2 hover:bg-gray-800 rounded-md"
              onClick={toggleSidebar}
            >
              {isOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
            </div>
          </div>
          {/* Navigation Links */}
          <ul className="mt-2 space-y-2">
            {[
              { to: "/branches", icon: FaBuilding, label: "Branches" },
              { to: "/plans", icon: FaClipboardList, label: "Plans" },

              // Items dropdown
              {
                isDropdown: true,
                label: "Items",
                icon: MdFastfood,
                children: [
                  { to: "/items", label: "Subscription Items" },
                  { to: "/menuItems", label: "Menu Items" },
                ],
              },

              {
                to: "/subscriptions",
                icon: FaShoppingCart,
                label: "Subscriptions",
              },
              { to: "/Vouchers", icon: FaTicketAlt, label: "Vouchers" },
              { to: "/payment-options", icon: FaCreditCard, label: "Payment" },
              {
                to: "/driver/register",
                icon: FaTruck,
                label: "Delivery Register",
              },
              {
                to: "/driver/management",
                icon: FaTruck,
                label: "Delivery Management",
              },
              {
                to: "/banners-container",
                icon: FaUtensilSpoon,
                label: "Banners",
              },
              { to: "/users", icon: FaUsers, label: "Users" },
              { to: "/Configuration", icon: FaBook, label: "Config" },
              {
                to: "/dining-config",
                icon: FaUtensils,
                label: "Dining Config",
              },
              { to: "/logout", icon: FaSignOutAlt, label: "Logout" },
            ].map((item, index) =>
              item.isDropdown ? (
                <li key={index}>
                  <div
                    onClick={toggleItemsDropdown}
                    className="flex items-center gap-4 px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-800 hover:text-indigo-300 transition-all duration-300"
                  >
                    <item.icon className="text-lg" />
                    <span
                      className={`${
                        isOpen ? "block" : "hidden"
                      } whitespace-nowrap`}
                    >
                      {item.label}
                    </span>
                    {isOpen &&
                      (isItemsOpen ? (
                        <FaCaretUp className="ml-auto" />
                      ) : (
                        <FaCaretDown className="ml-auto" />
                      ))}
                  </div>

                  {/* Dropdown Options */}
                  {isItemsOpen && isOpen && (
                    <ul className="pl-8 mt-2 space-y-2">
                      {item.children.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subItem.to}
                            className={({ isActive }) =>
                              `flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                isActive
                                  ? "bg-gray-800 text-indigo-400"
                                  : "hover:bg-gray-800 hover:text-indigo-300"
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-gray-800 text-indigo-400"
                          : "hover:bg-gray-800 hover:text-indigo-300"
                      }`
                    }
                  >
                    <item.icon className="text-lg" />
                    <span
                      className={`${
                        isOpen ? "block" : "hidden"
                      } whitespace-nowrap`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
