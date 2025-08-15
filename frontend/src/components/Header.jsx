// frontend/src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // npm install lucide-react

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Buy Vehicles", path: "/vehicles" },
    { name: "Sell Vehicle", path: "/sell" },
    { name: "Contact", path: "/contact" },
    { name: "Admin Dashboard", path: "/admin/dashboard" },
  ];

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            🚗 VehicleMart
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-4 sm:space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 transition text-base sm:text-lg"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-2 sm:space-x-4">
            <Link
              to="/login"
              className="px-2 sm:px-4 py-1 sm:py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-sm sm:text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition text-base"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
