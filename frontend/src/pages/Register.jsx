import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validation, setValidation] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch locations from backend
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

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errors.email = "Invalid email address.";
    if (!phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(phone)) errors.phone = "Enter a valid 10-digit phone number.";
    if (!location) errors.location = "Location is required.";
    if (!subLocation) errors.subLocation = "Sub Location is required.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = validate();
    setValidation(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, location, subLocation, password })
      });
      const data = await res.json();
      if (data.success) {
        // localStorage.setItem("userName", name); // Store user name
        // localStorage.setItem("userEmail", email); // Store user email
        navigate("/login"); // Redirect to home
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Register</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${validation.name ? "border-red-500" : ""}`}
            required
            placeholder="Enter your name"
          />
          {validation.name && <div className="text-xs text-red-500">{validation.name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${validation.email ? "border-red-500" : ""}`}
            required
            placeholder="Enter your email"
          />
          {validation.email && <div className="text-xs text-red-500">{validation.email}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            className={`border rounded px-3 py-2 w-full ${validation.phone ? "border-red-500" : ""}`}
            required
            placeholder="Enter your 10-digit phone number"
            maxLength={10}
          />
          {validation.phone && <div className="text-xs text-red-500">{validation.phone}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            value={location}
            onChange={e => {
              setLocation(e.target.value);
              setSubLocation(""); // Reset sublocation when location changes
            }}
            className={`border rounded px-3 py-2 w-full ${validation.location ? "border-red-500" : ""}`}
            required
          >
            <option value="">Select District</option>
            {locations.map(loc => (
              <option key={loc.district} value={loc.district}>{loc.district}</option>
            ))}
          </select>
          {validation.location && <div className="text-xs text-red-500">{validation.location}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub Location</label>
          <select
            value={subLocation}
            onChange={e => setSubLocation(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${validation.subLocation ? "border-red-500" : ""}`}
            required
            disabled={!location}
          >
            <option value="">Select Area</option>
            {locations
              .find(loc => loc.district === location)
              ?.sublocations.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
          </select>
          {validation.subLocation && <div className="text-xs text-red-500">{validation.subLocation}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${validation.password ? "border-red-500" : ""}`}
            required
            placeholder="Create a password"
          />
          {validation.password && <div className="text-xs text-red-500">{validation.password}</div>}
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
        {success && <div className="text-xs text-green-600">{success}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Register
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
      </div>
    </div>
  );
}
