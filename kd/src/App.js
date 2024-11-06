// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Import Dashboard
import CurrentOrder from "./pages/CurrentOrder"; // Import CurrentOrder
import Alacarte from "./pages/Alacarte"; // Import CurrentOrder
import TopNav from "./components/TopNav"; // Import TopNav

import "./App.css";

function App() {
  return (
    <Router>
      <TopNav /> {/* Display TopNav on all pages */}
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />{" "}
          {/* Default to Dashboard */}
          <Route path="/orders" element={<CurrentOrder />} />
          <Route path="/Alacarte" element={<Alacarte />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
