import React from "react";

const Sidebar = ({ isOpen, toggleSidebar, cart }) => {
  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-gray-800 text-white p-4 transform transition-all ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button onClick={toggleSidebar} className="absolute top-4 left-4 text-xl">
        X
      </button>
      <h2 className="text-xl font-semibold mb-4">Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between mb-2">
              <span>{item.name}</span>
              <span>{item.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
