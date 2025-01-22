import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DiningProvider } from "./contexts/DiningContext";
import ValidateRoute from "./Components/ValidateRoute";
import MenuLayout from "./Components/MenuLayout";

const App = () => {
  return (
    <Router>
      <DiningProvider>
        <Routes>
          <Route
            path="/menu/:pincode/:tableName"
            element={
              <ValidateRoute>
                <MenuLayout />
              </ValidateRoute>
            }
          />
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
      </DiningProvider>
    </Router>
  );
};

export default App;
