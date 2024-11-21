import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Orders from "./components/Orders";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("kitchenToken");
    setIsAuth(!!token); // Convert to boolean
    setIsLoading(false);
  };

  // Important: Show loading state until we've checked auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/orders" /> : <Login />}
        />
        <Route
          path="/orders"
          element={
            isAuth ? (
              <>
                <Navbar />
                <Orders />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuth ? "/orders" : "/login"} />}
        />
        {/* Catch all other routes */}
        <Route
          path="*"
          element={<Navigate to={isAuth ? "/orders" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
