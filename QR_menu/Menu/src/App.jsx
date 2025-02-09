import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ItemDetails from "./components/ItemDetails"; // Your ItemDetails component
import Navbar from "./components/Navbar"; // Your Navbar component
import Sidebar from "./Components/Sidebar"; // Your Sidebar component

const App = () => {
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleAddToCart = (item, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (quantity === 0) {
        // Remove item if quantity is 0
        return prevCart.filter((cartItem) => cartItem.id !== item.id);
      }

      if (existingItem) {
        // Update the existing item
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity } : cartItem
        );
      }

      // Add new item
      return [...prevCart, { ...item, quantity }];
    });
  };

  return (
    <Router>
      <Navbar />
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        cart={cart}
      />
      <Routes>
        <Route
          path="/item-details/:itemId"
          element={<ItemDetails onAddToCart={handleAddToCart} />}
        />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
