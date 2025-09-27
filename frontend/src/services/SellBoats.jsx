import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../util/api.js";
import { fetchUserLocation } from "../util/userLocation.js";

const conditions = ["Used", "Reconditioned", "New"];

export default function SellBoats() {
  const locationHook = useLocation();
  const editId = locationHook?.state?.editId || null;
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Boats & Water Transport");
  const [condition, setCondition] = useState("Used");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [photos, setPhotos] = useState([null, null, null, null, null]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removeSet, setRemoveSet] = useState(new Set());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [district, setDistrict] = useState("");
  const [subLocation, setSubLocation] = useState("");
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

    const fetchLocations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/location/all`);
        const data = await res.json();
        const arr = Object.entries(data).map(([district, sublocations]) => ({
          district,
          sublocations
        }));
        setLocations(arr);
      } catch {
        setLocations([]);
      }
    };
    fetchLocations();

    // Fetch user's location and set as default (skip when editing)
    if (!editId) {
      fetchUserLocation(setLocation, setDistrict, setSubLocation);
    }
  }, []);

  // If in edit mode, fetch existing vehicle and prefill
  useEffect(() => {
    const run = async () => {
      if (!editId) return;
      try {
        const res = await fetch(`${BASE_URL}/api/sellvehicle/details/${editId}`);
        const v = await res.json();
        if (!v || v.error) return;
        setCategory(v.category || "Boats & Water Transport");
        setCondition(v.condition || "Used");
        setTitle(v.title || "");
        setDescription(v.description || "");
        setPrice(String(v.price || ""));
        setNegotiable(!!v.negotiable);
        const locStr = v.subLocation ? `${v.district}, ${v.subLocation}` : (v.district || "");
        setLocation(locStr || "");
        setDistrict(v.district || "");
        setSubLocation(v.subLocation || "");
        setExistingPhotos(Array.isArray(v.photos) ? v.photos : []);
      } catch (_) {}
    };
    run();
  }, [editId]);

  const handlePhotoChange = (idx, file) => {
    const newPhotos = [...photos];
    newPhotos[idx] = file;
    setPhotos(newPhotos);
  };

  const toggleRemoveExisting = (filename) => {
    setRemoveSet(prev => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename); else next.add(filename);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    setSuccess("");
    const priceValid = price && !isNaN(price) && Number(price) > 0;
    if (!title || !description || !priceValid || (!editId && !photos.some((p) => p))) {
      return;
    }
    const token = localStorage.getItem("token"); // Get JWT token

    try {
      if (editId) {
        // Update fields
        const body = { title, description, price, negotiable, condition, location, category, district, subLocation };
        const res = await fetch(`${BASE_URL}/api/sellvehicle/update/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          const hasNewFiles = photos.some(p => !!p);
          const hasRemovals = removeSet.size > 0;
          if (hasNewFiles || hasRemovals) {
            const fd = new FormData();
            if (hasRemovals) fd.append('remove', JSON.stringify(Array.from(removeSet)));
            photos.forEach((file) => { if (file) fd.append('photos', file); });
            try {
              await fetch(`${BASE_URL}/api/sellvehicle/photos/${editId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
              });
            } catch (_) {}
          }
          setSuccess("Updated your ad successfully");
          setShowValidation(false);
          setTimeout(() => setSuccess(""), 1200);
        } else {
          setError(data.error || 'Failed to update vehicle details');
        }
      } else {
        // Create mode
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("negotiable", negotiable);
        formData.append("condition", condition);
        formData.append("location", location);
        formData.append("category", category);
        formData.append("district", district);
        formData.append("subLocation", subLocation);
        photos.forEach((photo) => { if (photo) formData.append("photos", photo); });
        const res = await fetch(`${BASE_URL}/api/sellvehicle/add`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("Post your Ad successfully");
          setShowValidation(false);
          setTitle("");
          setDescription("");
          setPrice("");
          setNegotiable(false);
          setPhotos([null, null, null, null, null]);
          setError("");
          setCondition("Used");
          setTimeout(() => { setSuccess(""); }, 3000);
        } else {
          setError(data.error || "Failed to save vehicle details");
        }
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">{editId ? 'Edit your ad' : 'Fill in the details'}</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-semibold">{location}</span>
          <button
            className="text-blue-600 underline text-xs"
            onClick={() => setShowLocationModal(true)}
          >
            Change
          </button>
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
      {/* Location Change Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-auto flex flex-col sm:flex-row gap-0">
            <div className="w-full sm:w-1/2 border-r pr-4">
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Select City or Division</h4>
              <ul className="space-y-1">
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
                    {locations
                      .find(loc => loc.district === selectedDistrict)
                      ?.sublocations?.map(sub => (
                        <li key={sub}>
                          <button
                            className="w-full text-left px-2 py-2 rounded hover:bg-green-50 font-semibold text-green-700 transition-all"
                            onClick={() => {
                              setSubLocation(sub);
                              setLocation(`${selectedDistrict}, ${sub}`);
                              setShowLocationModal(false);
                              setSelectedDistrict(null);
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
                      setShowCategoryModal(false);
                      if (cat === "Bicycles") navigate("/sell/bicycle");
                      else if (cat === "Boats & Water Transport" || cat === "Boats" || cat === "Water Transport") navigate("/sell/boats");
                      else if (cat === "Cars") navigate("/sell/cars");
                      else if (cat === "Heavy Duty") navigate("/sell/heavyduty");
                      else if (cat === "Lorries & Trucks") navigate("/sell/lorries");
                      else if (cat === "Motorbikes") navigate("/sell/motorbike");
                      else if (cat === "Three Wheelers") navigate("/sell/threewheel");
                      else if (cat === "Tractors") navigate("/sell/tractors");
                      else if (cat === "Vans") navigate("/sell/vans");
                      else if (cat === "Buses") navigate("/sell/busses");
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
        {success && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold text-base transition-all animate-slide-in w-[90vw] max-w-xs sm:max-w-sm"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            <span role="alert">✅ {success}</span>
          </div>
        )}
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
          <div className="text-xs text-gray-500 text-right mt-1">{description.length}/5000</div>
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
        <hr className="my-6" />
        <div>
          <div className="font-medium mb-2">Add up to 5 photos <span className="text-xs text-gray-500">{editId ? '(Existing photos shown below. You can remove or upload new ones.)' : '(You must upload at least one photo)'}</span></div>
          {editId && existingPhotos.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Existing photos (click to mark for removal):</div>
              <div className="flex gap-2 flex-wrap">
                {existingPhotos.map((fname) => (
                  <button
                    type="button"
                    key={fname}
                    onClick={() => toggleRemoveExisting(fname)}
                    className={`relative border rounded w-20 h-20 overflow-hidden ${removeSet.has(fname) ? 'ring-2 ring-red-500 opacity-60' : ''}`}
                    title={removeSet.has(fname) ? 'Marked for removal' : 'Click to remove'}
                  >
                    <img src={`${BASE_URL}/sellvehicle/${fname}`} alt="existing" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap mb-1">
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
          {showValidation && !editId && !photos.some((p) => p) && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
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
