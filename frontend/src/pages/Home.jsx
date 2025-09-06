import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

export default function Home() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/sellvehicle/all`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(() => setVehicles([]));
  }, []);

  const categories = [
    { name: "Auto Parts & Accessories", count: 30625 },
    { name: "Motorbikes", count: 20613 },
    { name: "Cars", count: 9649 },
    { name: "Rentals", count: 6695 },
    { name: "Auto Services", count: 5492 },
    { name: "Three Wheelers", count: 3183 },
    { name: "Bicycles", count: 1428 },
    { name: "Lorries & Trucks", count: 867 },
    { name: "Vans", count: 698 },
    { name: "Heavy Duty", count: 193 },
    { name: "Tractors", count: 187 },
    { name: "Maintenance and Repair", count: 179 },
    { name: "Boats & Water Transport", count: 50 }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4 mb-6 md:mb-0">
          <div className="mb-4">
            <div className="font-semibold text-gray-700 mb-2">Sort results by</div>
            <select className="border rounded px-2 py-1 w-full text-sm">
              <option>Date: Newest on top</option>
              <option>Date: Oldest on top</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-red-600" />
              <span>URGENT</span>
            </label>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-700 mb-2">Type of poster</div>
            <select className="border rounded px-2 py-1 w-full text-sm">
              <option>All</option>
              <option>Member</option>
              <option>Dealer</option>
            </select>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Category</div>
            <div className="text-blue-700 font-semibold mb-2">All Categories</div>
            <div className="font-bold text-gray-700 mb-2">Vehicles</div>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat.name} className="flex justify-between text-sm text-gray-600">
                  <span>{cat.name}</span>
                  <span className="text-gray-400">({cat.count})</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-4 text-sm text-gray-500">
            Home &gt; All ads &gt; Vehicles
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            New and Used Vehicles for Sale in Sri Lanka
          </h2>
          <div className="text-xs text-gray-500 mb-4">
            Showing {vehicles.length} ads
          </div>
          <div className="flex flex-col gap-4">
            {vehicles.map((vehicle, idx) => (
              <div
                key={vehicle._id || idx}
                className="border border-yellow-400 bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-row items-center p-3 sm:p-4 relative"
              >
                {/* Image */}
                <div className="w-32 h-24 sm:w-40 sm:h-32 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={`${BASE_URL}/sellvehicle/${vehicle.photos[0]}`}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-base">No Image</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 pl-4 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                      {vehicle.title}
                    </h3>
                    {vehicle.urgent && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold ml-2 absolute top-2 right-2">URGENT</span>
                    )}
                    {vehicle.featured && (
                      <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded font-bold ml-2 absolute top-2 left-2">FEATURED</span>
                    )}
                    {vehicle.member && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold ml-2">MEMBER</span>
                    )}
                  </div>
                  {/* If you store mileage/location, show here */}
                  {vehicle.mileage && (
                    <div className="text-xs text-gray-500 mb-1">{vehicle.mileage}</div>
                  )}
                  {vehicle.location && (
                    <div className="text-xs text-gray-500 mb-1">{vehicle.location}</div>
                  )}
                  <div className="text-green-600 font-bold text-sm sm:text-base mb-1">{vehicle.price}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {vehicle.createdAt && (
                      <span>{new Date(vehicle.createdAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {/* Pin icon bottom right */}
                <div className="absolute bottom-2 right-2 text-pink-500 text-xl">
                  <span role="img" aria-label="pin">📍</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
