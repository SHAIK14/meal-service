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
import DiningKitchen from "./pages/DiningKitchen";
import DiningAdmin from "./pages/DiningAdmin";
import TopNav from "./components/TopNav";
import Kot from "./pages/kot";
import Login from "./components/Auth/Login";
import CateringDashboard from "./pages/CateringDashboard";
import TakeawayAdminDashboard from "./pages/TakeawayAdminDashboard";
import TakeawayWorkerDashboard from "./pages/TakeawayWorkerDashboard";
import MealAdminDashboard from "./pages/MealAdminDashboard";
import MealStaffDashboard from "./pages/MealStaffDashboard";
import { KitchenSocketProvider } from "./contexts/KitchenSocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./App.css";

// Add these styles to your App.css file
// .content-container {
//   margin-top: 64px; /* This should match the height of your navbar */
//   padding: 16px;
// }

const AuthenticatedLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <TopNav />
    <div className="content-container mt-16 p-4 flex-grow">
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </div>
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
                <KitchenSocketProvider>
                  <AuthenticatedLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route
                        path="/diningKitchen"
                        element={<DiningKitchen />}
                      />
                      <Route path="/tables" element={<DiningAdmin />} />
                      <Route path="/kot" element={<Kot />} />
                      <Route path="/catering" element={<CateringDashboard />} />
                      {/* Takeaway Routes */}
                      <Route
                        path="/takeaway-admin"
                        element={<TakeawayAdminDashboard />}
                      />
                      <Route
                        path="/takeaway-kitchen"
                        element={<TakeawayWorkerDashboard />}
                      />
                      {/* New Meal App Routes */}
                      <Route
                        path="/meal-admin"
                        element={<MealAdminDashboard />}
                      />
                      <Route
                        path="/meal-kitchen"
                        element={<MealStaffDashboard />}
                      />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </AuthenticatedLayout>
                </KitchenSocketProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
           {/* Audio element for notifications */}
      <audio id="notification-sound" preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
        <source src="/notification.wav" type="audio/wav" />
      </audio>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
