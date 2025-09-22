// frontend/src/components/Header.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // npm install lucide-react
import { BASE_URL } from "../util/api.js";

export default function Header({ onMenuToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return localStorage.getItem("profileImage") || "";
    } catch (_) {
      return "";
    }
  });
  const userName = localStorage.getItem("userName");

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Buy Vehicles", path: "/vehicles" },
    { name: "Sell Vehicle", path: "/sell" },
    { name: "Contact", path: "/contact" },
  ];

  // Fetch user profile image when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userName) return;
    
    fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const img = data.user.profileImage || "";
          setProfileImage(img);
          try { localStorage.setItem("profileImage", img); } catch (_) {}
        }
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
      });
  }, [userName]);

  // React to profile image updates dispatched from Profile.jsx
  useEffect(() => {
    const onProfileImageUpdated = (e) => {
      const img = e?.detail?.profileImage || "";
      setProfileImage(img);
    };
    window.addEventListener("profile-image-updated", onProfileImageUpdated);
    return () => window.removeEventListener("profile-image-updated", onProfileImageUpdated);
  }, []);

  // Notify parent when menu is toggled
  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    if (onMenuToggle) onMenuToggle(!isOpen);
  };

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

          {/* Auth/Profile Buttons - Desktop */}
          <div className="hidden md:flex space-x-2 sm:space-x-4">
            {!userName ? (
              <>
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
              </>
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold text-blue-700"
              >
                <span>{userName}</span>
                {profileImage ? (
                  <img
                    src={`${BASE_URL}/profile_image/${profileImage}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={handleMenuToggle}
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
            {!userName ? (
              <>
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
              </>
            ) : (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold text-blue-700"
              >
                <span>{userName}</span>
                {profileImage ? (
                  <img
                    src={`${BASE_URL}/profile_image/${profileImage}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
