import React, { useState } from "react";
import { BASE_URL } from "../util/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset instructions sent to your email.");
      } else {
        setError(data.error || "Failed to send reset instructions.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Forgot Password</h1>
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
        {error && <div className="text-xs text-red-500">{error}</div>}
        {message && <div className="text-xs text-green-600">{message}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
