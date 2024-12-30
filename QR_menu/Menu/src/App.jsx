import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import ItemDetails from "./components/ItemDetails"; // Your ItemDetails component
import Navbar from "./components/Navbar"; // Your Navbar component

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Your navigation bar component */}
      <Routes>
        <Route path="/item-details/:itemId" element={<ItemDetails />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
