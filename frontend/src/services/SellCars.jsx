import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../util/api.js"; // <-- If util is in project root util/api.jsrc/util/api.js

const conditions = ["New", "Reconditioned", "Used"];
const fuelTypes = ["Diesel", "Petrol", "CNG", "Hybrid", "Electric", "Other Fuel type"];
const transmissions = ["Manual", "Automatic", "Tiptronic", "Other transmission"];
const bodyTypes = [
  { label: "Saloon", emoji: "🚗" },
  { label: "Hatchback", emoji: "🚗" },
  { label: "Station wagon", emoji: "🚗" },
  { label: "Convertible", emoji: "🚘" },
  { label: "Coupe/Sport", emoji: "🏎️" },
  { label: "MPV", emoji: "🚐" },
  { label: "SUV/4 * 4", emoji: "🚙" } // <-- Added this line
];

export default function SellCars() {
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Cars");
  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [model, setModel] = useState("");
  const [models, setModels] = useState([]);
  const [trim, setTrim] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [engine, setEngine] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [photos, setPhotos] = useState([null, null, null, null, null]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
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

    // Fetch brands for Cars from vehiclemodelbrands table
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        // Filter brands for Cars category and remove duplicates
        const carBrands = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Cars")
              .map((item) => item.brand)
          )
        );
        setBrands(carBrands);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Fetch models for selected brand
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        // Filter models for Cars category and selected brand, remove duplicates
        const carModels = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Cars" && item.brand === brand)
              .map((item) => item.model)
          )
        );
        setModels(carModels);
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

  const handlePhotoChange = (idx, file) => {
    const newPhotos = [...photos];
    newPhotos[idx] = file;
    setPhotos(newPhotos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowValidation(true);
    const priceValid = price && !isNaN(price) && Number(price) > 0;
    const yearValid = year && !isNaN(year) && Number(year) >= 1886;
    const mileageValid = mileage && !isNaN(mileage) && Number(mileage) >= 0;
    const engineValid = engine && !isNaN(engine) && Number(engine) >= 1;
    if (
      !brand ||
      !model ||
      !yearValid ||
      !mileageValid ||
      !engineValid ||
      !fuel ||
      !transmission ||
      !description ||
      !priceValid ||
      !photos.some((p) => p)
    ) {
      return;
    }
    // ...submit code...
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
                      setShowCategoryModal(false);
                      if (cat === "Bicycles") navigate("/sell/bicycle");
                      else if (cat === "Boats & Water Transport" || cat === "Boats" || cat === "Water Transport") navigate("/sell/boats");
                      else if (cat === "Buses") navigate("/sell/busses");
                      else if (cat === "Heavy Duty") navigate("/sell/heavyduty");
                      else if (cat === "Lorries & Trucks") navigate("/sell/lorries");
                      else if (cat === "Motorbikes") navigate("/sell/motorbike");
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
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 flex-wrap">
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
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${showValidation && !brand ? "border-red-500" : ""}`}
          >
            <option value="">Brand</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {!brand && showValidation && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${showValidation && !model ? "border-red-500" : ""}`}
            disabled={!brand}
          >
            <option value="">Model</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {!model && showValidation && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Trim / Edition (optional)</label>
          <input
            type="text"
            value={trim}
            onChange={e => setTrim(e.target.value)}
            className="border rounded px-3 py-3 w-full min-w-0 block text-base"
            placeholder="What is the trim/edition of your car?"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Year of Manufacture</label>
          <input
            type="text"
            value={year}
            onChange={e => setYear(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base ${showValidation && (!year || isNaN(year) || Number(year) < 1886) ? "border-red-500" : ""}`}
            placeholder="When was your car manufactured?"
          />
          {showValidation && (!year || isNaN(year) || Number(year) < 1886) && (
            <div className="text-xs text-red-500 mt-1">Must be at least 1886</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Mileage (km)</label>
          <input
            type="text"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base ${showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) ? "border-red-500" : ""}`}
            placeholder="What is the mileage of your car?"
          />
          {showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) && (
            <div className="text-xs text-red-500 mt-1">Must be at least 0</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Engine capacity (cc)</label>
          <input
            type="text"
            value={engine}
            onChange={e => setEngine(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base ${showValidation && (!engine || isNaN(engine) || Number(engine) < 1) ? "border-red-500" : ""}`}
            placeholder="What is the engine capacity of your car?"
          />
          {showValidation && (!engine || isNaN(engine) || Number(engine) < 1) && (
            <div className="text-xs text-red-500 mt-1">Must be at least 1</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Fuel type</label>
          <select
            value={fuel}
            onChange={e => setFuel(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${showValidation && !fuel ? "border-red-500" : ""}`}
          >
            <option value="">Fuel type</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          {!fuel && showValidation && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Transmission</label>
          <select
            value={transmission}
            onChange={e => setTransmission(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${showValidation && !transmission ? "border-red-500" : ""}`}
          >
            <option value="">Transmission</option>
            {transmissions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {!transmission && showValidation && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Body type (optional)</label>
          <select
            value={bodyType}
            onChange={e => setBodyType(e.target.value)}
            className="border rounded px-3 py-3 w-full min-w-0 block text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <option value="">Body type</option>
            {bodyTypes.map((b) => (
              <option key={b.label} value={b.label}>
                {b.emoji} {b.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base ${showValidation && !description ? "border-red-500" : ""}`}
            rows={4}
            maxLength={5000}
            placeholder="Describe the main features of your car"
          />
          <div className="text-xs text-gray-500 text-right mt-1">{description.length}/5000</div>
          {showValidation && !description && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Price (Rs)</label>
          <input
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={`border rounded px-3 py-3 w-full min-w-0 block text-base ${showValidation && (!price || isNaN(price) || Number(price) <= 0) ? "border-red-500" : ""}`}
            placeholder="How much do you want to sell your car for?"
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
          <div className="font-medium mb-2">Add up to 5 photos <span className="text-xs text-gray-500 ml-1">(You must upload at least one photo)</span></div>
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
          {showValidation && !photos.some((p) => p) && (
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
