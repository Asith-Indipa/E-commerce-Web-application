import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import SellLorries from "./services/SellLorries"; // Add this import
import SellThreewheel from "./services/SellThreewheel";
import SellTractors from "./services/SellTractors";
import SellVans from "./services/SellVans";

function App() {
  return (
    <BrowserRouter>
      <>
        <SearchBar />
        <Header />
        <main className="pt-32 sm:pt-40">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/sell" element={<SellVehicle />} />
            <Route path="/sell/bicycle" element={<SellBicycle />} />
            <Route path="/sell/motorbike" element={<SellMotorbicycle />} />
            <Route path="/sell/boats" element={<SellBoats />} />
            <Route path="/sell/busses" element={<SellBusses />} />
            <Route path="/sell/cars" element={<SellCars />} />
            <Route path="/sell/heavyduty" element={<SellHeavyDuty />} />
            <Route path="/sell/lorries" element={<SellLorries />} /> {/* Add this route */}
            <Route path="/sell/threewheel" element={<SellThreewheel />} />
            <Route path="/sell/tractors" element={<SellTractors />} />
            <Route path="/sell/vans" element={<SellVans />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </>
    </BrowserRouter>
  );
}

export default App;