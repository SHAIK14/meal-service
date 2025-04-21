import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home";
import OutdoorPerHead from "./pages/outdoorCatering/OutdoorPerHead";
import PackageType from "./pages/PackageType";
import SetupSelection from "./components/SetupSelection";
import Packages from "./pages/Packages";
import ConfirmationPage from "./pages/ConfirmationPage";
import AddOns from "./pages/AddOns";
import Payment from "./pages/Payment";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="home" element={<Home />}></Route>
        <Route
          path="outdoorCatering/packageType"
          element={<PackageType />}
        ></Route>
        <Route
          path="outdoorCatering/packageType/perHead"
          element={<OutdoorPerHead />}
        ></Route>
        <Route
          path="outdoorCatering/packageType/perHead/packages"
          element={<Packages />}
        ></Route>
        <Route
          path="outdoorCatering/packageType/perHead/setupSelection"
          element={<SetupSelection />}
        ></Route>
        <Route
          path="outdoorCatering/packageType/perHead/confirmation"
          element={<ConfirmationPage />}
        ></Route>
        <Route
          path="/outdoorCatering/packageType/perHead/addOns"
          element={<AddOns />}
        ></Route>
        <Route
          path="/outdoorCatering/packageType/perHead/confirmation/payment"
          element={<Payment />}
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
