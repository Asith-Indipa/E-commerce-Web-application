import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../util/api.js";
import SearchBar from "../components/SearchBar"; // Import SearchBar

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const mainRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [district, setDistrict] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [hideSearchBar, setHideSearchBar] = useState(false);
  const [sortOption, setSortOption] = useState("Date: Newest on top");
  // Add state for location filter
  const [locationFilter, setLocationFilter] = useState({ district: "", subLocation: "" });

  useEffect(() => {
    fetch(`${BASE_URL}/api/sellvehicle/all`)
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setFilteredVehicles(data); // Show all by default
      })
      .catch(() => {
        setVehicles([]);
        setFilteredVehicles([]);
      });
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

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

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setHideSearchBar(true); // Hide only when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setHideSearchBar(false); // Show when scrolling up
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let sorted = [...vehicles];
    // Filter by category
    if (selectedCategory !== "All Categories") {
      sorted = sorted.filter(v => v.category === selectedCategory);
    }
    // Filter by location
    if (locationFilter.district) {
      sorted = sorted.filter(v => v.district === locationFilter.district);
    }
    if (locationFilter.subLocation) {
      sorted = sorted.filter(v => v.subLocation === locationFilter.subLocation);
    }
    // Sort
    switch (sortOption) {
      case "Date: Newest on top":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Date: Oldest on top":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "Price: High to low":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "Price: Low to high":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      default:
        break;
    }
    setFilteredVehicles(sorted);
    setCurrentPage(1);
  }, [selectedCategory, vehicles, sortOption, locationFilter]);

  useEffect(() => {
    if (district || subLocation) {
      setLocationFilter({ district, subLocation });
    } else {
      setLocationFilter({ district: "", subLocation: "" });
    }
  }, [district, subLocation]);

  // Helper to format number with commas
  function formatNumberWithCommas(num) {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper to render pagination numbers
  function renderPagination() {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`mx-1 px-2 py-1 rounded ${i === currentPage ? "font-bold text-black" : "text-gray-500 hover:text-blue-600"}`}
          onClick={() => setCurrentPage(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-6">
        <button
          className="text-gray-400 px-2 py-1 mr-2"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt; Previous
        </button>
        {pages}
        {endPage < totalPages && <span className="mx-1">...</span>}
        <button
          className="text-blue-600 px-2 py-1 ml-2"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &gt;
        </button>
      </div>
    );
  }

  const categories = [
    { name: "Motorbikes", count: 20613 },
    { name: "Cars", count: 9649 },
    { name: "Buses", count: 500 }, // <-- Changed from "Bus" to "Buses"
    { name: "Three Wheelers", count: 3183 },
    { name: "Bicycles", count: 1428 },
    { name: "Lorries & Trucks", count: 867 },
    { name: "Vans", count: 698 },
    { name: "Heavy Duty", count: 193 },
    { name: "Tractors", count: 187 },
    { name: "Boats & Water Transport", count: 50 }
  ];

  // Category icon mapping (use emoji or image URLs)
  const categoryIcons = {
    "Motorbikes": "🏍️",
    "Cars": "🚗",
    "Buses": "🚌", // <-- Changed from "Bus" to "Buses"
    "Three Wheelers": "🛺",
    "Bicycles": "🚲",
    "Lorries & Trucks": "🚚",
    "Vans": "🚐",
    "Heavy Duty": "🏗️",
    "Tractors": "🚜",
    "Boats & Water Transport": "🚤"
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <SearchBar show={!hideSearchBar} />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4 mb-6 md:mb-0">
          {/* Select Location section */}
          <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => setShowLocationModal(true)}>
            <span className="text-green-700 text-lg">
              {/* SVG pin icon */}
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="10" r="3" fill="#059669"/>
                <path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.05 10.61 8.13 11.39a1 1 0 0 0 1.13 0C13.95 21.61 21 16.25 21 11c0-4.97-4.03-9-9-9zm0 18.88C10.13 19.07 5 14.97 5 11c0-3.86 3.14-7 7-7s7 3.14 7 7c0 3.97-5.13 8.07-7 9.88z" fill="#059669"/>
              </svg>
            </span>
            <span className="font-semibold text-gray-800">
              {district && subLocation ? `${district}, ${subLocation}` : "Select Location"}
            </span>
          </div>
          {/* Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-auto flex flex-col sm:flex-row gap-0">
                {/* Left: Districts */}
                <div className="w-full sm:w-1/2 border-r pr-4">
                  <h4 className="text-lg font-semibold mb-2 text-blue-700">Select City or Division</h4>
                  <ul className="space-y-1">
                    <li>
                      <button
                        className="w-full text-left px-2 py-2 rounded font-semibold text-blue-700 hover:underline"
                        onClick={() => {
                          setSelectedDistrict(null);
                          setDistrict("");
                          setSubLocation("");
                          setShowLocationModal(false);
                        }}
                      >
                        All of Sri Lanka
                      </button>
                    </li>
                    {locations.map(loc => (
                      <li key={loc.district}>
                        <button
                          className={`w-full text-left px-2 py-2 rounded hover:bg-blue-50 font-semibold text-blue-700 transition-all flex justify-between items-center ${
                            selectedDistrict === loc.district ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedDistrict(loc.district);
                            setDistrict(loc.district);
                          }}
                        >
                          <span>{loc.district}</span>
                          <span className="text-gray-400">{'>'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Right: Sublocations */}
                <div className="w-full sm:w-1/2 pl-4">
                  <h4 className="text-lg font-semibold mb-2 text-blue-700">
                    {selectedDistrict
                      ? `Select a local area within ${selectedDistrict}`
                      : "Select a local area"}
                  </h4>
                  {selectedDistrict ? (
                    <>
                      <div className="mb-2 font-semibold text-gray-700">Popular areas</div>
                      <ul className="space-y-1 mb-4">
                        <li>
                          <button
                            className="w-full text-left px-2 py-2 rounded font-semibold text-green-700 hover:underline"
                            onClick={() => {
                              setSubLocation("");
                              setDistrict(selectedDistrict);
                              setShowLocationModal(false);
                            }}
                          >
                            All of {selectedDistrict}
                          </button>
                        </li>
                        {locations
                          .find(loc => loc.district === selectedDistrict)
                          ?.sublocations?.map(sub => (
                            <li key={sub}>
                              <button
                                className="w-full text-left px-2 py-2 rounded hover:bg-green-50 font-semibold text-green-700 transition-all"
                                onClick={() => {
                                  setSubLocation(sub);
                                  setShowLocationModal(false);
                                }}
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">Select a district to see areas</div>
                  )}
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all font-semibold mt-4"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Sort results by */}
          <div className="mb-4">
            <div className="font-semibold text-gray-700 mb-2">Sort results by</div>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option>Date: Newest on top</option>
              <option>Date: Oldest on top</option>
              <option>Price: High to low</option>
              <option>Price: Low to high</option>
            </select>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Category</div>
            <button
              className={`text-blue-700 font-semibold mb-2 w-full text-left ${selectedCategory === "All Categories" ? "underline" : ""}`}
              onClick={() => setSelectedCategory("All Categories")}
            >
              All Categories
              <span className="ml-2 text-gray-400">({vehicles.length})</span>
            </button>
            <div className="font-bold text-gray-700 mb-2">Vehicles</div>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat.name} className="flex justify-between items-center text-sm text-gray-600">
                  <button
                    className={`flex items-center gap-2 w-full text-left ${selectedCategory === cat.name ? "underline" : ""}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <span>
                      {categoryIcons[cat.name] ? (
                        <span className="text-lg">{categoryIcons[cat.name]}</span>
                      ) : (
                        <span className="text-lg">🚗</span>
                      )}
                    </span>
                    {cat.name}
                    <span className="ml-2 text-gray-400">
                      ({vehicles.filter(v => v.category === cat.name).length})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1" ref={mainRef}>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {selectedCategory === "All Categories"
              ? "New and Used Vehicles for Sale in Sri Lanka"
              : `${selectedCategory} for Sale in Sri Lanka`}
          </h2>
          <div className="text-xs text-gray-500 mb-4">
            Showing {paginatedVehicles.length} of {filteredVehicles.length} ads
          </div>
          <div className="flex flex-col gap-4">
            {paginatedVehicles.map((vehicle, idx) => (
              <Link
                key={vehicle._id || idx}
                to={`/vehicle/${vehicle._id}`}
                className="border border-yellow-400 bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-row items-center p-3 sm:p-4 relative cursor-pointer"
              >
                {/* Image */}
                <div className="w-32 h-24 sm:w-40 sm:h-32 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  {vehicle.photos && vehicle.photos.length > 0 && vehicle.photos[0] ? (
                    <img
                      src={`${BASE_URL}/sellvehicle/${vehicle.photos[0]}`}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = "/no-image.png"; }}
                    />
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-base">No Image</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 pl-4 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                      {vehicle.title || `${vehicle.brand || ""} ${vehicle.model || ""}`}
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
                    <div className="text-xs text-gray-500 mb-1">
                      {(() => {
                        // Extract numeric part and unit (e.g., "12345km")
                        const match = String(vehicle.mileage).match(/^(\d+)(km)?$/i);
                        if (match) {
                          const num = match[1];
                          return `${formatNumberWithCommas(num)} km`;
                        }
                        // If already formatted or has other text, show as is
                        return vehicle.mileage;
                      })()}
                    </div>
                  )}
                  {/* Show district and subLocation */}
                  {(vehicle.district || vehicle.subLocation) && (
                    <div className="text-xs text-gray-500 mb-1">
                      {vehicle.district}
                      {vehicle.subLocation ? `, ${vehicle.subLocation}` : ""}
                    </div>
                  )}
                  <div className="text-green-600 font-bold text-sm sm:text-base mb-1">
                    {vehicle.price ? `Rs ${formatNumberWithCommas(vehicle.price)}` : ""}
                  </div>
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
              </Link>
            ))}
          </div>
          {totalPages > 1 && renderPagination()}
        </main>
      </div>
    </div>
  );
}
