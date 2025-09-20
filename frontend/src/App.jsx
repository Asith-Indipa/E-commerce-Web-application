import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import Header from "./components/header";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import SellVehicle from "./pages/SellVehicle";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SellBicycle from "./services/SellBicycle";
import SellMotorbicycle from "./services/SellMotorbicycle";
import SellBoats from "./services/SellBoats";
import SellBusses from "./services/SellBusses";
import SellCars from "./services/SellCars";
import SellHeavyDuty from "./services/SellHeavyDuty";
import SellLorries from "./services/SellLorries";
import SellThreewheel from "./services/SellThreewheel";
import SellTractors from "./services/SellTractors";
import SellVans from "./services/SellVans";
import Profile from "./pages/Profile";

function App() {
  const [hideSearchBar, setHideSearchBar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Listen for route changes and always show SearchBar
  const location = useLocation();
  useEffect(() => {
    setHideSearchBar(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!(hideSearchBar && isMobile) && <SearchBar />}
      <Header onMenuToggle={setHideSearchBar} />
      <main className="pt-32 sm:pt-40">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
          <Route path="/sell" element={<SellVehicle />} />
          <Route path="/sell/bicycle" element={<SellBicycle />} />
          <Route path="/sell/motorbike" element={<SellMotorbicycle />} />
          <Route path="/sell/boats" element={<SellBoats />} />
          <Route path="/sell/busses" element={<SellBusses />} />
          <Route path="/sell/cars" element={<SellCars />} />
          <Route path="/sell/heavyduty" element={<SellHeavyDuty />} />
          <Route path="/sell/lorries" element={<SellLorries />} />
          <Route path="/sell/threewheel" element={<SellThreewheel />} />
          <Route path="/sell/tractors" element={<SellTractors />} />
          <Route path="/sell/vans" element={<SellVans />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}