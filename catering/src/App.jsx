import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CateringMenu from "./components/CateringMenu";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/catering/:pincode" element={<CateringMenu />} />
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
}

export default App;
