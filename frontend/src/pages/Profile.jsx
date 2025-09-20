import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/location/all`)
      .then(res => res.json())
      .then(data => {
        const arr = Object.entries(data).map(([district, sublocations]) => ({
          district,
          sublocations
        }));
        setLocations(arr);
      })
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setLocation(data.user.location || "");
          setSubLocation(data.user.subLocation || "");
          setPhone(data.user.phone || "");
        }
      });
  }, []);

  const handleUpdateDetails = async e => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, location, subLocation, phone })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Details updated successfully!");
        setName(data.user.name);
        setLocation(data.user.location);
        setSubLocation(data.user.subLocation);
        setPhone(data.user.phone);
        localStorage.setItem("userName", data.user.name);
        window.location.reload(); // Refresh page after update
      } else {
        setError(data.error || "Failed to update details");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setError("Please fill all password fields correctly.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload(); // Force refresh after logout
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        navigate("/register");
      } else {
        setError(data.error || "Failed to delete account");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-5xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-50 border-r px-4 py-6">
        <nav className="space-y-2">
          <div className="font-bold text-gray-700 mb-4">Account</div>
          <button
            className={`block w-full text-left py-2 px-2 rounded font-semibold ${
              activeTab === "ads"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-blue-50 text-blue-700"
            }`}
            onClick={() => setActiveTab("ads")}
          >
            My ads
          </button>
          <button
            className={`block w-full text-left py-2 px-2 rounded ${
              activeTab === "favorites"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            Favorites
          </button>
          <button
            className={`block w-full text-left py-2 px-2 rounded ${
              activeTab === "settings"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        {activeTab === "ads" && (
          <div>
            <h2 className="text-xl font-bold mb-6">My Ads</h2>
            <div className="text-gray-500">You have no ads yet.</div>
            {/* Replace above with actual ads list if available */}
          </div>
        )}
        {activeTab === "favorites" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Favorites</h2>
            <div className="text-gray-500">You have no favorites yet.</div>
            {/* Replace above with actual favorites list if available */}
          </div>
        )}
        {activeTab === "settings" && (
          <>
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <form className="space-y-6 max-w-lg" onSubmit={handleUpdateDetails}>
              <div>
                <div className="font-semibold mb-2">Change details</div>
                <div className="mb-2 text-gray-700">
                  Email: <span className="font-mono">{email}</span>
                </div>
                <div className="mb-2 text-gray-700">
                  Phone: <span className="font-mono">{phone}</span>
                </div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border rounded px-3 py-2 w-full mb-2"
                  required
                />
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    setSubLocation("");
                  }}
                  className="border rounded px-3 py-2 w-full mb-2"
                >
                  <option value="">Select District</option>
                  {locations.map(loc => (
                    <option key={loc.district} value={loc.district}>
                      {loc.district}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium mb-1">Sub location</label>
                <select
                  value={subLocation}
                  onChange={e => setSubLocation(e.target.value)}
                  className="border rounded px-3 py-2 w-full mb-4"
                  disabled={!location}
                >
                  <option value="">Select Area</option>
                  {locations
                    .find(loc => loc.district === location)
                    ?.sublocations.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  className="border rounded px-3 py-2 w-full mb-2"
                  required
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold border hover:bg-gray-200"
                >
                  Update details
                </button>
                {success && <div className="text-green-600 mt-2">{success}</div>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>
            </form>
            <form
              className="space-y-4 max-w-lg mt-8"
              onSubmit={handleChangePassword}
            >
              <div className="font-semibold mb-2">Change password</div>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Current password"
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="New password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Confirm new password"
              />
              <button
                type="submit"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold border hover:bg-gray-200"
              >
                Change password
              </button>
            </form>
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleDeleteAccount}
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
              >
                Delete account
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
              >
                Log out
              </button>
            </div>
            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm mx-auto flex flex-col items-center">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
                  <p className="mb-6 text-gray-700 text-center">
                    Are you sure you want to delete this account? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={confirmDeleteAccount}
                      className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
