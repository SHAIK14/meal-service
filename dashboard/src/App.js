import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Sidebar from "./components/Sidebar";
import Plans from "./components/Plan";
import PlanCreate from "./components/PlanCreate";
import PlanEdit from "./components/PlanEdit";
import PlanItemSelection from "./components/Planitemselection";
import PlanItemEdit from "./components/PlanItemEdit";
import Items from "./components/items";
import DriverRegistration from "./components/DriverRegistration";
import DriverManagement from "./components/DriverManagement";
import DriverRegisterEdit from "./components/DriverRegisterEdit";
import Subscriptions from "./components/Subscriptions";
import Users from "./components/users";
import SelectItemPage from "./components/SelectItemPage";
import AddItemPage from "./components/Additem";
import ItemsEdit from "./components/itemsEdit";
import ItemsDashboard from "./components/ItemsDashboard";
import ItemsCategories from "./components/ItemsCategories";
import Banners from "./components/Banners";
import PaymentPage from "./components/payment";
import Vouchers from "./components/Vouchers";
import InvoiceTemplate from "./components/InvoiceTemplate";
import Configuration from "./components/Configuration";
import Branch from "./components/Branch";
import AddBranch from "./components/AddBranch";
import EditBranch from "./components/BranchEdit";
import DiningConfig from "./components/DiningConfig";
import MenuItems from "./components/MenuItems";
import MenuCategoryItems from "./components/MenuCategoryItems";
import RoleServiceManagement from "./components/RoleServiceManagement";
import StaffManagement from "./components/StaffManagement";
import StaffList from "./components/StaffList";
import CateringConfig from "./components/CateringConfig";
import TakeAwayConfig from "./components/TakeAwayConfig";
import Catering from "./components/Catering/Catering";
import AddSetup from "./components/Catering/AddSetup";
import PerHeadCateringItems from "./components/Catering/PerHeadCateringItems";
import FixedDishesCateringItems from "./components/Catering/fixedDishesCateringItems";
import CateringOrders from "./components/Catering/CateringOrders";
import CheckList from "./components/Catering/CheckList";
import DiningReports from "./components/DiningReports";
const AuthenticatedLayout = ({ children }) => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <div style={{ flexGrow: 1 }}>{children}</div>
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
                  <Route
                    path="/role-service"
                    element={
                      <ProtectedRoute
                        element={<RoleServiceManagement />}
                        path="/role-service"
                      />
                    }
                  />
                  <Route
                    path="/staff-management"
                    element={
                      <ProtectedRoute
                        element={<StaffManagement />}
                        path="/staff-management"
                      />
                    }
                  />
                  <Route
                    path="/staff-list"
                    element={
                      <ProtectedRoute
                        element={<StaffList />}
                        path="/staff-list"
                      />
                    }
                  />
                  <Route
                    path="/branches"
                    element={
                      <ProtectedRoute element={<Branch />} path="/branches" />
                    }
                  />
                  <Route
                    path="/branches/add"
                    element={
                      <ProtectedRoute
                        element={<AddBranch />}
                        path="/branches"
                      />
                    }
                  />
                  <Route
                    path="/branches/edit/:branchId"
                    element={
                      <ProtectedRoute
                        element={<EditBranch />}
                        path="/branches"
                      />
                    }
                  />
                  <Route
                    path="/plans"
                    element={
                      <ProtectedRoute element={<Plans />} path="/plans" />
                    }
                  />
                  <Route
                    path="/plans/create"
                    element={
                      <ProtectedRoute element={<PlanCreate />} path="/plans" />
                    }
                  />
                  <Route
                    path="/plans/edit/:planId"
                    element={
                      <ProtectedRoute element={<PlanEdit />} path="/plans" />
                    }
                  />
                  <Route
                    path="/plans/:planId/add-items"
                    element={
                      <ProtectedRoute
                        element={<PlanItemSelection />}
                        path="/plans"
                      />
                    }
                  />
                  <Route
                    path="/plans/:planId/edit-items"
                    element={
                      <ProtectedRoute
                        element={<PlanItemEdit />}
                        path="/plans"
                      />
                    }
                  />
                  <Route
                    path="/items"
                    element={
                      <ProtectedRoute element={<Items />} path="/items" />
                    }
                  />
                  <Route
                    path="/category/:categoryName"
                    element={
                      <ProtectedRoute
                        element={<ItemsCategories />}
                        path="/items"
                      />
                    }
                  />
                  <Route
                    path="/edit-item/:id"
                    element={
                      <ProtectedRoute element={<ItemsEdit />} path="/items" />
                    }
                  />
                  <Route
                    path="/add-item"
                    element={
                      <ProtectedRoute element={<AddItemPage />} path="/items" />
                    }
                  />
                  <Route
                    path="/items-dashboard"
                    element={
                      <ProtectedRoute
                        element={<ItemsDashboard />}
                        path="/items"
                      />
                    }
                  />
                  <Route
                    path="/payment-options"
                    element={
                      <ProtectedRoute
                        element={<PaymentPage />}
                        path="/payment-options"
                      />
                    }
                  />
                  <Route
                    path="/driver/register"
                    element={
                      <ProtectedRoute
                        element={<DriverRegistration />}
                        path="/driver"
                      />
                    }
                  />
                  <Route
                    path="/driver/edit/:driverId"
                    element={
                      <ProtectedRoute
                        element={<DriverRegisterEdit />}
                        path="/driver"
                      />
                    }
                  />
                  <Route
                    path="/driver/management"
                    element={
                      <ProtectedRoute
                        element={<DriverManagement />}
                        path="/driver"
                      />
                    }
                  />
                  <Route
                    path="/banners-container"
                    element={
                      <ProtectedRoute element={<Banners />} path="/banners" />
                    }
                  />
                  <Route
                    path="/subscriptions"
                    element={
                      <ProtectedRoute
                        element={<Subscriptions />}
                        path="/subscriptions"
                      />
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute element={<Users />} path="/users" />
                    }
                  />
                  <Route
                    path="/select-item-page"
                    element={
                      <ProtectedRoute
                        element={<SelectItemPage />}
                        path="/items"
                      />
                    }
                  />
                  <Route
                    path="/vouchers"
                    element={
                      <ProtectedRoute element={<Vouchers />} path="/vouchers" />
                    }
                  />
                  <Route
                    path="/planitemselection/:planId"
                    element={
                      <ProtectedRoute
                        element={<PlanItemSelection />}
                        path="/plans"
                      />
                    }
                  />
                  <Route path="/" element={<Navigate to="/plans" replace />} />
                  <Route
                    path="/invoice"
                    element={
                      <ProtectedRoute
                        element={<InvoiceTemplate />}
                        path="/invoice"
                      />
                    }
                  />
                  <Route
                    path="/configuration"
                    element={
                      <ProtectedRoute
                        element={<Configuration />}
                        path="/configuration"
                      />
                    }
                  />
                  <Route
                    path="/dining-config"
                    element={
                      <ProtectedRoute
                        element={<DiningConfig />}
                        path="/dining-config"
                      />
                    }
                  />
                  <Route
                    path="/dining-reports"
                    element={
                      <ProtectedRoute
                        element={<DiningReports />}
                        path="/dining-reports"
                      />
                    }
                  />
                  <Route
                    path="/catering"
                    element={
                      <ProtectedRoute element={<Catering />} path="/catering" />
                    }
                  />
                  <Route
                    path="/catering-config"
                    element={
                      <ProtectedRoute
                        element={<CateringConfig />}
                        path="/catering-config"
                      />
                    }
                  />
                  <Route
                    path="/takeAway-config"
                    element={
                      <ProtectedRoute
                        element={<TakeAwayConfig />}
                        path="/takeAway-config"
                      />
                    }
                  />
                  <Route
                    path="/menuItems"
                    element={
                      <ProtectedRoute
                        element={<MenuItems />}
                        path="/menuItems"
                      />
                    }
                  />
                  <Route
                    path="/menuCategoryItems/:categoryId"
                    element={
                      <ProtectedRoute
                        element={<MenuCategoryItems />}
                        path="/menuItems"
                      />
                    }
                  />
                  <Route
                    path="/add-setup"
                    element={
                      <ProtectedRoute
                        element={<AddSetup />}
                        path="/add-setup"
                      />
                    }
                  />
                  <Route
                    path="/PerHeadCateringItems"
                    element={
                      <ProtectedRoute
                        element={<PerHeadCateringItems />}
                        path="/PerHeadCateringItems"
                      />
                    }
                  />
                  <Route
                    path="/fixedDishesCateringItems"
                    element={
                      <ProtectedRoute
                        element={<FixedDishesCateringItems />}
                        path="/fixedDishesCateringItems"
                      />
                    }
                  />
                  <Route
                    path="/cateringOrders"
                    element={
                      <ProtectedRoute
                        element={<CateringOrders />}
                        path="/cateringOrders"
                      />
                    }
                  />
                  <Route
                    path="/checklist"
                    element={
                      <ProtectedRoute
                        element={<CheckList />}
                        path="/checklist"
                      />
                    }
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
  );
};

export default App;
