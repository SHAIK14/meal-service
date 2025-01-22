// src/Components/MenuLayout.jsx
import { useState } from "react";
import Navbar from "./Navbar";
import Items from "./Items";
import Cart from "./Cart";
import { FaShoppingCart } from "react-icons/fa";

const MenuLayout = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item, quantity) => {
    setCart((prevCart) => {
      if (quantity === 0) {
        return prevCart.filter((i) => i.id !== item.id);
      }
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) => (i.id === item.id ? { ...i, quantity } : i));
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{activeCategory}</h1>
        </div>

        <Items activeCategory={activeCategory} onAddToCart={handleAddToCart} />
      </main>

      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors z-40"
      >
        <div className="relative">
          <FaShoppingCart size={24} />
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </div>
          )}
        </div>
      </button>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onQuantityChange={handleAddToCart}
      />
    </div>
  );
};

export default MenuLayout;
