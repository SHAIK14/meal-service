import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowRight,
  FaArrowLeft,
  FaBuilding,
  FaClipboardList,
  FaBox,
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
} from "react-icons/fa";
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
      <div
        ref={sidebarRef}
        className={`flex justify-between h-full bg-gray-900 text-white transition-all duration-300 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700 ${
          isOpen ? "w-64" : "w-28"
        }`}
      >
        {/* Navigation Links */}
        <ul className="mt-2 space-y-2">
          {[
            { to: "/branches", icon: FaBuilding, label: "Branches" },
            { to: "/plans", icon: FaClipboardList, label: "Plans" },

            // Added Items dropdown after Plans
            <li key="items-dropdown">
              <div
                onClick={toggleItemsDropdown}
                className="flex items-center gap-4 px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-800 hover:text-indigo-300 transition-all duration-300"
              >
                <FaBox className="text-lg" />
                <span
                  className={`${isOpen ? "block" : "hidden"} whitespace-nowrap`}
                >
                  Items
                </span>
                {isItemsOpen ? (
                  <FaCaretUp className="ml-auto" />
                ) : (
                  <FaCaretDown className="ml-auto" />
                )}
              </div>

              {/* Dropdown Options */}
              {isItemsOpen && isOpen && (
                <ul className="pl-8 mt-2 space-y-2">
                  <li>
                    <NavLink
                      to="/items"
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gray-800 text-indigo-400"
                            : "hover:bg-gray-800 hover:text-indigo-300"
                        }`
                      }
                    >
                      Subscription Items
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/menuItems"
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gray-800 text-indigo-400"
                            : "hover:bg-gray-800 hover:text-indigo-300"
                        }`
                      }
                    >
                      Menu Items
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>,
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
              label: "DeliveryRegister",
            },
            {
              to: "/driver/management",
              icon: FaTruck,
              label: "DeliveryManagement",
            },
            {
              to: "/banners-container",
              icon: FaUtensilSpoon,
              label: "Banners",
            },
            { to: "/users", icon: FaUsers, label: "Users" },
            { to: "/Configuration", icon: FaBook, label: "Config" },
            { to: "/logout", icon: FaSignOutAlt, label: "Logout" },
          ].map((item, index) =>
            item.to ? (
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
                  {item.icon && <item.icon className="text-lg" />}
                  <span
                    className={`${
                      isOpen ? "block" : "hidden"
                    } whitespace-nowrap`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ) : (
              item // Render the dropdown here
            )
          )}
        </ul>

        {/* Toggle Button */}
        <div
          className="hover:bg-gray-800 text-white flex h-full p-1 transition-all duration-300 items-center justify-center cursor-pointer shadow-lg"
          onClick={toggleSidebar}
        >
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
