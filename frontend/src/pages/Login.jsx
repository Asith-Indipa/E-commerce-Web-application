import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [welcome, setWelcome] = useState(""); // Add welcome state
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setWelcome(""); // Clear previous welcome
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token); // Store JWT securely
        localStorage.setItem("userEmail", email); // Store user email

        // Fetch current user to determine role and correct display name
        try {
          const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const me = await meRes.json();
          const displayName = me?.user?.name || data.name || '';
          const role = me?.user?.role || '';
          if (displayName) localStorage.setItem("userName", displayName);

          if (role === 'admin') {
            // Admin: redirect immediately to admin dashboard
            navigate('/admin/dashboard');
            return;
          } else {
            // Non-admin: show welcome then go home
            setWelcome(`Welcome ${displayName || 'User'}`);
            setTimeout(() => {
              setWelcome("");
              navigate("/");
            }, 2000);
          }
        } catch (e) {
          // Fallback if /me fails: proceed as normal user
          localStorage.setItem("userName", data.name || '');
          setWelcome(`Welcome ${data.name || 'User'}`);
          setTimeout(() => {
            setWelcome("");
            navigate("/");
          }, 2000);
        }
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
            placeholder="Enter your password"
          />
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
        {welcome && (
          <div className="fixed top-8 right-8 bg-blue-600 border-4 border-white-400 text-white px-8 py-4 rounded-xl shadow-2xl text-xl font-bold z-50">
            {welcome}
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Login
        </button>
      </form>
      <div className="mt-2 text-sm text-center">
        <a href="/forgot-password" className="text-blue-600 underline">Forgot password?</a>
      </div>
      <div className="mt-4 text-sm text-center">
        Don't have an account? <a href="/register" className="text-blue-600 underline">Sign up</a>
      </div>
    </div>
  );
}
