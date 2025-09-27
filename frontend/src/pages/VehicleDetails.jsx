import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../util/api.js";
import { ChevronLeft, ChevronRight, ArrowLeftCircle, Heart } from "lucide-react";

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const similarAdsRef = useRef(null);
  const [imageModal, setImageModal] = useState({ open: false, src: "" });
  const [zoomed, setZoomed] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch(`${BASE_URL}/api/sellvehicle/details/${id}`)
      .then(res => res.json())
      .then(data => {
        setVehicle(data);
        setLoading(false);
        // Check favourite status from backend if logged in
        try {
          const token = localStorage.getItem('token');
          if (token && data?._id) {
            fetch(`${BASE_URL}/api/favorite/is/${data._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
              .then(r => r.json())
              .then(j => setIsFav(!!j?.isFav))
              .catch(() => setIsFav(false));
          } else {
            setIsFav(false);
          }
        } catch (_) { setIsFav(false); }
        // Fetch similar vehicles after main vehicle loads
        if (data && data.category) {
          fetch(`${BASE_URL}/api/sellvehicle/all`)
            .then(res => res.json())
            .then(all => {
              const filtered = all
                .filter(v => v.category === data.category && v._id !== data._id)
                .slice(0, 8); // Limit to 8 similar vehicles
              setSimilarVehicles(filtered);
            });
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const toggleFavourite = async () => {
    if (!vehicle?._id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const url = `${BASE_URL}/api/favorite/${vehicle._id}`;
      const method = isFav ? 'DELETE' : 'POST';
      const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` } });
      const j = await res.json();
      if (j?.success) {
        setIsFav(prev => !prev);
      } else {
        alert(j?.error || 'Failed to update favourites');
      }
    } catch (_) {
      alert('Network error. Please try again.');
    }
  };

  // Helper to format field names
  function formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, " ");
  }

  // Helper for "days ago"
  function daysAgo(dateStr) {
    if (!dateStr) return "";
    const days = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // List of fields to exclude from details
  const excludeFields = [
    "_id", "photos", "createdAt", "__v", "description", "price", "negotiable", "sellerName", "phone", "whatsapp", "title", "district", "subLocation", "category", "user"
  ];

  // Get all details except excluded fields
  const details = Object.entries(vehicle || {})
    .filter(([key, value]) => value && !excludeFields.includes(key) && typeof value !== 'object');

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  if (!vehicle) {
    return <div className="flex justify-center items-center h-96 text-red-600">Vehicle not found.</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Attractive Back Button - left aligned */}
      <div className="w-full max-w-3xl mx-auto flex">
        <button
          type="button"
          onClick={() => {
            navigate(-1);
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "auto" });
            }, 100);
          }}
          className="flex items-center gap-2 px-4 py-2 mb-4 mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg font-semibold transition-all"
          style={{ fontSize: "1rem" }}
        >
          <ArrowLeftCircle size={22} />
          Back
        </button>
      </div>
      {/* Image Modal */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => {
            setImageModal({ open: false, src: "" });
            setZoomed(false);
          }}
        >
          <img
            src={imageModal.src}
            alt="Large"
            className={`rounded-lg shadow-lg border-4 border-white transition-transform duration-200 cursor-zoom-in ${zoomed ? "max-h-[95vh] max-w-[98vw] scale-150" : "max-h-[80vh] max-w-[90vw] scale-100"}`}
            onClick={e => {
              e.stopPropagation();
              setZoomed(z => !z);
            }}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10 my-10">
        {/* Title and location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2 sm:mb-0">{vehicle.title}</h1>
          <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-semibold">
            {vehicle.district}{vehicle.subLocation ? `, ${vehicle.subLocation}` : ""}
          </div>
        </div>
        {/* Images */}
        <div className="flex flex-col sm:flex-row gap-8 mb-8">
          <div className="flex-1">
            <div
              className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center h-72 mb-3 border-2 border-blue-200 shadow cursor-pointer"
              onClick={() =>
                vehicle.photos && vehicle.photos[mainImageIdx]
                  ? setImageModal({ open: true, src: `${BASE_URL}/sellvehicle/${vehicle.photos[mainImageIdx]}` })
                  : null
              }
            >
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <img
                  src={`${BASE_URL}/sellvehicle/${vehicle.photos[mainImageIdx]}`}
                  alt={vehicle.title}
                  className="object-contain h-full w-full transition-transform duration-200 hover:scale-105"
                  onError={e => { e.target.src = "/no-image.png"; }}
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              {vehicle.photos && vehicle.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={`${BASE_URL}/sellvehicle/${photo}`}
                  alt={`Photo ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 ${mainImageIdx === idx ? "border-blue-500 scale-105" : "border-gray-300 hover:border-blue-400 hover:scale-105"}`}
                  onClick={() => setMainImageIdx(idx)}
                  onError={e => { e.target.src = "/no-image.png"; }}
                />
              ))}
            </div>
          </div>
          {/* Seller Info */}
          <div className="w-full sm:w-64 flex flex-col gap-4">
            <div className="bg-blue-50 rounded-xl shadow p-4 mb-2 border border-blue-200">
              <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">Seller</span>
                <span className="text-blue-700">{vehicle.user && typeof vehicle.user === 'object' && vehicle.user.name ? String(vehicle.user.name) : "Seller"}</span>
              </div>
              <div className="flex flex-col gap-2">
                {vehicle.user && typeof vehicle.user === 'object' && vehicle.user.phone && (
                  <>
                    <a href={`tel:${String(vehicle.user.phone)}`} className="bg-green-600 text-white rounded px-3 py-2 font-bold flex items-center gap-2 hover:bg-green-700 transition-all">
                      <span>Call seller</span>
                      <span>{String(vehicle.user.phone)}</span>
                    </a>
                    <a href={`https://wa.me/${String(vehicle.user.phone)}`} target="_blank" rel="noopener noreferrer"
                      className="bg-green-500 text-white rounded px-3 py-2 font-bold flex items-center gap-2 hover:bg-green-600 transition-all">
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 text-right">
              Posted on {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : ""}
            </div>
          </div>
        </div>
        {/* Price */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 w-full">
          <div className="text-3xl font-extrabold text-green-600 bg-green-50 px-4 py-2 rounded-xl shadow w-full sm:w-auto text-center sm:text-left">
            Rs {vehicle.price ? vehicle.price.toLocaleString() : ""}
          </div>
          {vehicle.negotiable && (
            <span className="bg-yellow-400 text-white text-sm px-3 py-1 rounded-full font-bold shadow">Negotiable</span>
          )}
          <button
            type="button"
            onClick={toggleFavourite}
            className={`sm:ml-auto ml-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold shadow transition-colors w-full sm:w-auto ${isFav ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
            title={isFav ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart size={20} className={isFav ? 'fill-current' : ''} />
            {isFav ? 'Favourited' : 'Add to favourites'}
          </button>
        </div>
        {/* Vehicle Info - dynamic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-base">
          <div className="space-y-2">
            {details.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-semibold text-blue-700">{formatLabel(key)}:</span>
                <span className="text-gray-800">{typeof value === 'string' ? value : String(value)}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-2 text-blue-700">Description</div>
            <div className="text-gray-700 whitespace-pre-line break-words bg-blue-50 rounded-lg p-3 shadow">{vehicle.description}</div>
          </div>
        </div>
        {/* Similar Vehicles Section */}
        {similarVehicles.length > 0 && (
          <div className="mt-10">
            <div className="font-bold text-lg mb-4 text-blue-700 border-b-2 border-blue-100 pb-2">
              Similar ads
            </div>
            <div className="relative">
              <button
                type="button"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-blue-200 rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                onClick={() => {
                  if (similarAdsRef.current) {
                    similarAdsRef.current.scrollBy({ left: -250, behavior: "smooth" });
                  }
                }}
                style={{ display: "block" }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-blue-200 rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                onClick={() => {
                  if (similarAdsRef.current) {
                    similarAdsRef.current.scrollBy({ left: 250, behavior: "smooth" });
                  }
                }}
                style={{ display: "block" }}
              >
                <ChevronRight size={24} />
              </button>
              <div
                ref={similarAdsRef}
                className="flex gap-6 overflow-x-auto pb-2 scroll-smooth px-8"
                style={{ scrollBehavior: "smooth" }}
              >
                {similarVehicles.map((v, idx) => (
                  <Link
                    key={v._id || idx}
                    to={`/vehicle/${v._id}`}
                    className="min-w-[220px] max-w-xs bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all flex flex-col items-center p-3 gap-2 border border-blue-200"
                    style={{ flex: "0 0 auto" }}
                  >
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-2 border border-blue-100">
                      {v.photos && v.photos[0] ? (
                        <img
                          src={`${BASE_URL}/sellvehicle/${v.photos[0]}`}
                          alt={v.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = "/no-image.png"; }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div className="w-full flex flex-col gap-1">
                      <div className="font-semibold text-base text-blue-900 truncate">{v.title}</div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{v.mileage}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{v.district}{v.subLocation ? `, ${v.subLocation}` : ""}</span>
                      </div>
                      <div className="text-green-600 font-bold text-base bg-green-50 px-2 py-1 rounded-lg shadow-sm w-fit">
                        {v.price ? `Rs ${v.price.toLocaleString()}` : ""}
                      </div>
                      <div className="text-xs text-gray-400">{daysAgo(v.createdAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
