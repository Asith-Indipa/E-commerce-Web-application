import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { BASE_URL } from "../util/api.js"; // Add this import
import Select from "react-select"; // Add this import

const conditions = ["Used", "Reconditioned", "New"];

export default function SellBicycle() {
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Bicycles");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("Used");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [photos, setPhotos] = useState([null, null, null, null, null]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [success, setSuccess] = useState(""); // Add this state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclecategory/all`);
        const data = await res.json();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();

    // Fetch brands for Bicycles from vehiclemodelbrands table
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        // Filter brands for Bicycles category and remove duplicates
        const bicycleBrands = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Bicycles")
              .map((item) => item.brand)
          )
        );
        setBrands(bicycleBrands);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  const handlePhotoChange = (idx, file) => {
    const newPhotos = [...photos];
    newPhotos[idx] = file;
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    setSuccess(""); // Reset success message
    const priceValid = price && !isNaN(price) && Number(price) > 0;
    if (!brand || !title || !description || !priceValid || !photos.some((p) => p)) {
      return;
    }
    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("negotiable", negotiable);
    formData.append("location", location);   // Add this line
    formData.append("category", category);   // Add this line
    photos.forEach((photo) => {
      if (photo) formData.append("photos", photo);
    });
    try {
      const res = await fetch(`${BASE_URL}/api/sellvehicle/add`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Post your Ad successfully");
        setShowValidation(false);
        // Reset all fields
        setBrand("");
        setCondition("Used");
        setTitle("");
        setDescription("");
        setPrice("");
        setNegotiable(false);
        setPhotos([null, null, null, null, null]);
        setError("");
        setTimeout(() => setSuccess(""), 3000); // Hide after 3 seconds
      } else {
        setError(data.error || "Failed to save vehicle details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Fill in the details</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-semibold">{location}</span>
          <button className="text-blue-600 underline text-xs">Change</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-semibold">{category}</span>
          <button
            className="text-blue-600 underline text-xs"
            onClick={() => setShowCategoryModal(true)}
          >
            Change
          </button>
        </div>
      </div>
      {/* Category Change Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2 text-blue-700">Select Category</h4>
            <div className="flex flex-col gap-2 mb-4">
              {categories.length === 0 ? (
                <span className="text-gray-500 text-sm">No categories found.</span>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                      // Navigate to the correct page for the selected category
                      if (cat === "Bicycles") navigate("/sell/bicycle");
                      else if (cat === "Motorbikes") navigate("/sell/motorbike");
                      else if (
                        cat === "Boats and Water Transport" ||
                        cat === "Boats" ||
                        cat === "Water Transport" ||
                        cat === "Boats & Water Transport"
                      ) navigate("/sell/boats");
                      else if (cat === "Buses") navigate("/sell/busses");
                      else if (cat === "Heavy Duty") navigate("/sell/heavyduty");
                      else if (cat === "Lorries & Trucks") navigate("/sell/lorries");
                      else if (cat === "Three Wheelers") navigate("/sell/threewheel");
                      else if (cat === "Tractors") navigate("/sell/tractors");
                      else if (cat === "Vans") navigate("/sell/vans");
                      else if (cat === "Cars") navigate("/sell/cars");
                    }}
                    className={`px-4 py-2 rounded-full font-semibold text-sm shadow transition-all
                      ${category === cat
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
                    `}
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowCategoryModal(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Attractive notification sliding from right, mobile responsive */}
        {success && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold text-base transition-all animate-slide-in w-[90vw] max-w-xs sm:max-w-sm"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            <span role="alert">✅ {success}</span>
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm mb-2">{success}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <Select
            options={brands.map(b => ({ value: b, label: b }))}
            value={brand ? { value: brand, label: brand } : null}
            onChange={option => setBrand(option ? option.value : "")}
            isClearable
            placeholder="Brand"
            classNamePrefix="react-select"
            className={showValidation && !brand ? "border-red-500" : ""}
          />
          {showValidation && !brand && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="flex gap-4 flex-wrap">
          {conditions.map((c) => (
            <label key={c} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="condition"
                value={c}
                checked={condition === c}
                onChange={() => setCondition(c)}
                className="accent-blue-600"
              />
              {c}
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && !title ? "border-red-500" : ""}`}
            placeholder="Keep it short!"
          />
          {showValidation && !title && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && !description ? "border-red-500" : ""}`}
            rows={4}
            maxLength={5000}
            placeholder="More details = more interested buyers!"
          />
          {showValidation && !description && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (Rs)</label>
          <input
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && (!price || isNaN(price) || Number(price) <= 0) ? "border-red-500" : ""}`}
            placeholder="Pick a good price"
          />
          {showValidation && (!price || isNaN(price) || Number(price) <= 0) && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field with a valid price.</div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={e => setNegotiable(e.target.checked)}
            className="accent-blue-600"
          />
          Negotiable
        </label>
        <div>
          <div className="font-medium mb-2">Add up to 5 photos <span className="text-xs text-gray-500">(You must upload at least one photo)</span></div>
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, idx) => (
              <label
                key={idx}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded w-20 h-20 cursor-pointer ${
                  showValidation && !photos.some((p) => p)
                    ? "border-red-500"
                    : photo
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handlePhotoChange(idx, e.target.files[0])}
                />
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-500">Add a photo</span>
                )}
              </label>
            ))}
          </div>
          {/* Only show error if no photo is present */}
          {showValidation && !photos.some((p) => p) && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        {error && (
          <div className="text-xs text-red-500 mt-2">{error}</div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

// Add this CSS to your global styles or index.css for animation:
//
// .animate-slide-in {
//   animation: slideInRight 0.5s;
// }
// @keyframes slideInRight {
//   from { opacity: 0; transform: translateX(100px); }
//   to { opacity: 1; transform: translateX(0); }
// }
