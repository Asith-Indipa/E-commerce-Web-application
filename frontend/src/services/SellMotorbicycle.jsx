import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { BASE_URL } from "../util/api.js";
import { fetchUserLocation } from "../util/userLocation.js";

const bikeTypes = [
  "E-bikes",
  "Motorbikes",
  "Quadricycles",
  "Scooters"
];
const conditions = ["Used", "Reconditioned", "New"];

export default function SellMotorbicycle() {
  const locationHook = useLocation();
  const editId = locationHook?.state?.editId || null;
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Motorbikes");
  const [bikeType, setBikeType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [engine, setEngine] = useState("");
  const [condition, setCondition] = useState("Used");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [photos, setPhotos] = useState([null, null, null, null, null]);
  const [existingPhotos, setExistingPhotos] = useState([]); // filenames from server
  const [removeSet, setRemoveSet] = useState(new Set()); // names to remove on save
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [district, setDistrict] = useState("");
  const [subLocation, setSubLocation] = useState("");
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
  }, []);

  useEffect(() => {
    // Fetch brands for Motorbikes from vehiclemodelbrand table
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        // Filter brands for Motorbikes category and remove duplicates
        const motorBrands = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Motorbikes")
              .map((item) => item.brand)
          )
        );
        setBrands(motorBrands);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    // Fetch models for selected brand in Motorbikes category
    const fetchModels = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        const motorModels = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Motorbikes" && item.brand === brand)
              .map((item) => item.model)
          )
        );
        setModels(motorModels);
      } catch {
        setModels([]);
      }
    };
    if (brand) {
      fetchModels();
    } else {
      setModels([]);
    }
  }, [brand]);

  useEffect(() => {
    // Fetch locations from backend
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
    // Fetch user's location and set as default (only when not editing)
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
        setCategory(v.category || "Motorbikes");
        setBikeType(v.bikeType || "");
        setBrand(v.brand || "");
        setModel(v.model || "");
        setTrim(v.trim || "");
        setYear((v.year || "").toString().replace(/[^0-9]/g, ""));
        setMileage((v.mileage || "").toString().replace(/[^0-9]/g, ""));
        setEngine((v.engine || "").toString().replace(/[^0-9]/g, ""));
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
    setSuccess(""); // Reset success message
    const priceValid = price && !isNaN(price) && Number(price) > 0;
    const yearValid = year && !isNaN(year) && Number(year) >= 1900;
    const mileageValid = mileage && !isNaN(mileage) && Number(mileage) >= 0;
    const engineValid = engine && !isNaN(engine) && Number(engine) >= 1;
    // Generate title from brand and model if not provided
    const title = brand && model ? `${brand} ${model}` : "";

    // Validation rules: in edit mode, photos are not required
    const missingRequired = (
      !bikeType ||
      !condition ||
      !brand ||
      !model ||
      !yearValid ||
      !mileageValid ||
      !engineValid ||
      !description ||
      !priceValid ||
      (!editId && !photos.some((p) => p))
    );
    if (missingRequired) return;

    const formData = new FormData();
    formData.append("title", title); // Add title to formData
    formData.append("bikeType", bikeType);
    formData.append("condition", condition);
    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("trim", trim);
    formData.append("year", year);
    formData.append("mileage", mileage + "km");
    formData.append("engine", engine + "cc");
    formData.append("description", description);
    formData.append("price", price);
    formData.append("negotiable", negotiable);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("district", location.split(",")[0]);
    formData.append("subLocation", location.split(",")[1] ? location.split(",")[1].trim() : "");
    photos.forEach((photo) => {
      if (photo) formData.append("photos", photo);
    });
    const token = localStorage.getItem("token"); // Get JWT token

    try {
      if (editId) {
        // In edit mode: send all fields to update endpoint
        const body = {
          bikeType,
          condition,
          brand,
          model,
          trim,
          year,
          mileage,
          engine,
          category,
          title,
          price,
          negotiable,
          description,
          district,
          subLocation,
        };
        const res = await fetch(`${BASE_URL}/api/sellvehicle/update/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          // If images changed, call photos endpoint
          const hasNewFiles = photos.some(p => !!p);
          const hasRemovals = removeSet.size > 0;
          if (hasNewFiles || hasRemovals) {
            const fd = new FormData();
            if (hasRemovals) fd.append('remove', JSON.stringify(Array.from(removeSet)));
            photos.forEach((file) => { if (file) fd.append('photos', file); });
            try {
              const pRes = await fetch(`${BASE_URL}/api/sellvehicle/photos/${editId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
              });
              await pRes.json();
            } catch (_) {}
          }
          setSuccess("✅ Updated your ad successfully!");
          setShowValidation(false);
          setTimeout(() => {
            setSuccess("");
            navigate("/profile", { state: { tab: 'ads' } });
          }, 1200);
        }
      } else {
        // Create mode
        const res = await fetch(`${BASE_URL}/api/sellvehicle/add`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}` // Add JWT token
          },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("✅ Post your Ad successfully!");
          setShowValidation(false);
          setBikeType("");
          setCondition("Used");
          setBrand("");
          setModel("");
          setTrim("");
          setYear("");
          setMileage("");
          setEngine("");
          setDescription("");
          setPrice("");
          setNegotiable(false);
          setPhotos([null, null, null, null, null]);
          setTimeout(() => {
            setSuccess("");
            navigate("/");
          }, 2000); // Show alert for 2 seconds, then redirect
        }
      }
    } catch (err) {
      // Optionally show error message
    }
  };

  // Helper to format number with commas
  function formatNumberWithCommas(num) {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {/* Success notification */}
      {success && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold text-base transition-all animate-slide-in w-[90vw] max-w-xs sm:max-w-sm"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <span role="alert">{success}</span>
        </div>
      )}
      <h1 className="text-xl sm:text-2xl font-bold mb-2">{editId ? 'Edit your ad' : 'Fill in the details'}</h1>
      {editId && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-100 border border-amber-200 px-3 py-2 rounded">
          You are editing an existing Motorbike ad. Photos are optional during edit.
        </div>
      )}
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
            {/* Left: Districts */}
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
                      setCategory(cat);
                      setShowCategoryModal(false);
                      // Navigate to correct page for selected category
                      if (cat === "Bicycles") navigate("/sell/bicycle");
                      else if (cat === "Boats & Water Transport" || cat === "Boats" || cat === "Water Transport") navigate("/sell/boats");
                      else if (cat === "Buses") navigate("/sell/busses");
                      else if (cat === "Cars") navigate("/sell/cars");
                      else if (cat === "Heavy Duty") navigate("/sell/heavyduty");
                      else if (cat === "Lorries & Trucks") navigate("/sell/lorries");
                      else if (cat === "Motorbikes") navigate("/sell/motorbike");
                      else if (cat === "Three Wheelers") navigate("/sell/threewheel");
                      else if (cat === "Tractors") navigate("/sell/tractors");
                      else if (cat === "Vans") navigate("/sell/vans");
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
        <div>
          <label className="block text-sm font-medium mb-1">Bike Type</label>
          <Select
            options={bikeTypes.map(b => ({ value: b, label: b }))}
            value={bikeType ? { value: bikeType, label: bikeType } : null}
            onChange={option => setBikeType(option ? option.value : "")}
            isClearable
            placeholder="Bike Type"
            classNamePrefix="react-select"
            className={showValidation && !bikeType ? "border-red-500" : ""}
          />
          {showValidation && !bikeType && (
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
          <label className="block text-sm font-medium mb-1">Brand</label>
          <Select
            options={brands.map(b => ({ value: b, label: b }))}
            value={brand ? { value: brand, label: brand } : null}
            onChange={option => {
              setBrand(option ? option.value : "");
              setModel(""); // Reset model when brand changes
            }}
            isClearable
            placeholder="Brand"
            classNamePrefix="react-select"
            className={showValidation && !brand ? "border-red-500" : ""}
          />
          {showValidation && !brand && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <Select
            options={models.map(m => ({ value: m, label: m }))}
            value={model ? { value: model, label: model } : null}
            onChange={option => setModel(option ? option.value : "")}
            isClearable
            isDisabled={!brand}
            placeholder="Model"
            classNamePrefix="react-select"
            className={showValidation && !model ? "border-red-500" : ""}
          />
          {showValidation && !model && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trim / Edition (optional)</label>
          <input
            type="text"
            value={trim}
            onChange={e => setTrim(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter edition."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model year</label>
          <input
            type="text"
            value={year}
            onChange={e => setYear(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && (!year || isNaN(year) || Number(year) < 1900) ? "border-red-500" : ""}`}
            placeholder="Model year"
          />
          {showValidation && (!year || isNaN(year) || Number(year) < 1900) && (
            <div className="text-xs text-red-500 mt-1">Must be at least 1900</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mileage (km)</label>
          <div className="relative">
            <input
              type="text"
              value={formatNumberWithCommas(mileage)}
              onChange={e => {
                // Remove commas and non-numeric chars before storing
                const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
                setMileage(raw);
              }}
              className={`border rounded px-3 py-2 w-full pr-10 ${showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) ? "border-red-500" : ""}`}
              placeholder="What is the mileage of your motorbike?"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">km</span>
          </div>
          {showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) && (
            <div className="text-xs text-red-500 mt-1">Must be a valid mileage.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engine capacity (cc)</label>
          <div className="relative">
            <input
              type="text"
              value={engine}
              onChange={e => setEngine(e.target.value.replace(/[^0-9]/g, ""))}
              className={`border rounded px-3 py-2 w-full pr-10 ${showValidation && (!engine || isNaN(engine) || Number(engine) < 1) ? "border-red-500" : ""}`}
              placeholder="What is the engine capacity of your motorbike?"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">cc</span>
          </div>
          {showValidation && (!engine || isNaN(engine) || Number(engine) < 1) && (
            <div className="text-xs text-red-500 mt-1">Must be a valid engine capacity.</div>
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
          <div className="relative">
            <input
              type="text"
              value={formatNumberWithCommas(price)}
              onChange={e => {
                // Remove commas and non-numeric chars before storing
                const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
                setPrice(raw);
              }}
              className={`border rounded px-3 py-2 w-full pr-10 ${showValidation && (!price || isNaN(price) || Number(price) <= 0) ? "border-red-500" : ""}`}
              placeholder="Pick a good price - what would you pay?"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">Rs</span>
          </div>
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
