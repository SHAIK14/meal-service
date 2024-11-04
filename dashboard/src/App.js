import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Sidebar from "./components/Sidebar";
import Plans from "./components/Plan";
import PlanCreate from "./components/PlanCreate";
import PlanEdit from "./components/PlanEdit";
import PlanItemSelection from "./components/Planitemselection";
import PlanItemEdit from "./components/PlanItemEdit";
import Items from "./components/items";
import Delivery from "./components/delivery";
import Subscriptions from "./components/Subscriptions";
import Users from "./components/users";
import SelectItemPage from "./components/SelectItemPage";
import AddItemPage from "./components/Additem";
import ItemsEdit from "./components/itemsEdit";
import ItemsCategories from "./components/ItemsCategories";
import Banners from "./components/Banners";
import PaymentPage from "./components/payment";
import Vouchers from "./components/Vouchers";

const AuthenticatedLayout = ({ children }) => (
  <div
    style={{ display: "flex", backgroundColor: "#F4F4F4", minHeight: "100vh" }}
  >
    <Sidebar />
    <div style={{ flexGrow: 1, marginLeft: "100px" }}>{children}</div>
  </div>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/logout"
          element={<Logout setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <AuthenticatedLayout>
                <Routes>
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/plans/create" element={<PlanCreate />} />
                  <Route path="/plans/edit/:planId" element={<PlanEdit />} />
                  <Route
                    path="/plans/:planId/add-items"
                    element={<PlanItemSelection />}
                  />
                  <Route
                    path="/plans/:planId/edit-items"
                    element={<PlanItemEdit />}
                  />
                  <Route path="/items" element={<Items />} />
                  <Route
                    path="/category/:categoryName"
                    element={<ItemsCategories />}
                  />
                  <Route path="/edit-item/:id" element={<ItemsEdit />} />
                  <Route path="/add-item" element={<AddItemPage />} />
                  <Route path="/payment-options" element={<PaymentPage />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/banners-container" element={<Banners />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/users" element={<Users />} />
                  <Route
                    path="/select-item-page"
                    element={<SelectItemPage />}
                  />
                  <Route path="/Vouchers" element={<Vouchers />} />
                  <Route
                    path="/Planitemselection/:planId"
                    element={<PlanItemSelection />}
                  />
                  <Route path="/" element={<Navigate to="/plans" replace />} />
                </Routes>
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
