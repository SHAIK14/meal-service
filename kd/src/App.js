import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Import Dashboard
import CurrentOrder from "./pages/CurrentOrder"; // Import CurrentOrder
import Alacarte from "./pages/Alacarte"; // Import Alacarte
import TopNav from "./components/TopNav"; // Import TopNav
import Kot from "./pages/kot"; // Import Kot (PascalCase for component names)

import "./App.css"; // Ensure CSS is properly configured

function App() {
  return (
    <Router>
      <TopNav /> {/* Display TopNav on all pages */}
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<CurrentOrder />} />
          <Route path="/Alacarte" element={<Alacarte />} />
          <Route path="/Kot" element={<Kot />} /> {/* Route to Kot */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
