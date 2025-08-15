import React, { useState } from "react";
import HomeTab from "../../components/admin/section/HomeTab";
import UserTab from "../../components/admin/section/UserTab";
import VehicleDetailsTab from "../../components/admin/section/VehicleDetailsTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-700 text-center">Admin Dashboard</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 items-stretch">
        <button
          className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded ${activeTab === "home" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} text-sm sm:text-base`}
          onClick={() => setActiveTab("home")}
        >
          Home Page
        </button>
        <button
          className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} text-sm sm:text-base`}
          onClick={() => setActiveTab("users")}
        >
          User Details
        </button>
        <button
          className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded ${activeTab === "vehicles" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} text-sm sm:text-base`}
          onClick={() => setActiveTab("vehicles")}
        >
          Manage Vehicle Details
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 min-h-[180px]">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "users" && <UserTab />}
        {activeTab === "vehicles" && <VehicleDetailsTab />}
      </div>
    </div>
  );
}
