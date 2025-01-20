import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  Navigate,
} from "react-router-dom";
import { validateQRAccess } from "./utils/api";
import ItemDetails from "./components/ItemDetails";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Items from "./components/Items";

// Validate branch and table wrapper component
const ValidateRoute = ({ children }) => {
  const { pincode, tableName } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inside ValidateRoute component
  useEffect(() => {
    const validateAccess = async () => {
      try {
        const result = await validateQRAccess(pincode, tableName);
        if (result.success) {
          setIsValid(true);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to validate access");
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [pincode, tableName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
      </div>
    );
  }

  return isValid ? children : <Navigate to="/" />;
};

const App = () => {
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleAddToCart = (item, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (quantity === 0) {
        return prevCart.filter((cartItem) => cartItem.id !== item.id);
      }

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity } : cartItem
        );
      }

      return [...prevCart, { ...item, quantity }];
    });
  };

  return (
    <Router>
      <Routes>
        {/* Main menu route - redirects to items */}
        <Route
          path="/menu/:pincode/:tableName"
          element={
            <ValidateRoute>
              <Navigate to="items" replace />
            </ValidateRoute>
          }
        />

        {/* Items list route */}
        <Route
          path="/menu/:pincode/:tableName/items"
          element={
            <ValidateRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <div className="flex-1">
                  <Items onAddToCart={handleAddToCart} />
                </div>
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  cart={cart}
                />
              </div>
            </ValidateRoute>
          }
        />

        {/* Item details route */}
        <Route
          path="/menu/:pincode/:tableName/items/:itemId"
          element={
            <ValidateRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <div className="flex-1">
                  <ItemDetails onAddToCart={handleAddToCart} />
                </div>
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  cart={cart}
                />
              </div>
            </ValidateRoute>
          }
        />

        {/* Invalid route redirect */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-red-50 p-4 rounded-lg text-red-700">
                Invalid URL. Please scan a valid QR code.
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
