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
import NewPlan from "./components/NewPlan";
import Items from "./components/items";
import Delivery from "./components/delivery";
import Orders from "./components/orders";
import Users from "./components/users";
import SelectItemPage from "./components/SelectItemPage";
import Lunchmenu from "./components/Lunchmenu";
import Dinnermenu from "./components/Dinnermenu";
import AddItemPage from "./components/Additem";
import ItemsEdit from "./components/itemsEdit";
import ItemsCategories from "./components/ItemsCategories";

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
                  <Route path="/plans/new" element={<NewPlan />} />
                  <Route path="/items" element={<Items />} />
                  <Route
                    path="/category/:categoryName"
                    element={<ItemsCategories />}
                  />

                  <Route path="/lunch/:id" element={<ItemsEdit />} />
                  <Route path="/add-item" element={<AddItemPage />} />
                  <Route path="/lunch" element={<Lunchmenu />} />
                  <Route path="/dinner" element={<Dinnermenu />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/users" element={<Users />} />
                  <Route
                    path="/select-item-page"
                    element={<SelectItemPage />}
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
