import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Dashboard from "./pages/Dashboard";
import CurrentOrder from "./components/CurrentOrder";
import Alacarte from "./pages/Alacarte";
import TableManagement from "./pages/TableManagement";
import TopNav from "./components/TopNav";
import Kot from "./pages/kot";
import Login from "./components/Auth/Login";
import CateringDashboard from "./pages/CateringDashboard";
import "./App.css";

const AuthenticatedLayout = ({ children }) => (
  <div>
    <TopNav />
    <div className="content-container">{children}</div>
  </div>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kitchenToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <AuthenticatedLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<CurrentOrder />} />
                    <Route path="/alacarte" element={<Alacarte />} />
                    <Route path="/tables" element={<TableManagement />} />
                    <Route path="/kot" element={<Kot />} />
                    <Route path="/catering" element={<CateringDashboard />} />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </AuthenticatedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
