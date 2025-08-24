import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

const conditions = ["Used", "Reconditioned", "New"];

export default function SellBusses() {
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Buses");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [model, setModel] = useState("");
  const [models, setModels] = useState([]);
  const [trim, setTrim] = useState("");
  const [condition, setCondition] = useState("Used");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [engine, setEngine] = useState("");
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

    // Fetch brands for Buses from vehiclemodelbrands table
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiclemodelbrand/all`);
        const data = await res.json();
        // Filter brands for Buses category and remove duplicates
        const busBrands = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Buses")
              .map((item) => item.brand)
          )
        );
        setBrands(busBrands);
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
        // Filter models for Buses category and selected brand, remove duplicates
        const busModels = Array.from(
          new Set(
            data
              .filter((item) => item.category === "Buses" && item.brand === brand)
              .map((item) => item.model)
          )
        );
        setModels(busModels);
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
    const yearValid = year && !isNaN(year) && Number(year) >= 1926;
    const mileageValid = mileage && !isNaN(mileage) && Number(mileage) >= 0;
    const engineValid = engine && !isNaN(engine) && Number(engine) >= 1;
    if (
      !brand ||
      !model ||
      !yearValid ||
      !mileageValid ||
      !engineValid ||
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
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && !brand ? "border-red-500" : ""}`}
          >
            <option value="">Brand</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {showValidation && !brand && (
            <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${showValidation && !model ? "border-red-500" : ""}`}
            disabled={!brand}
          >
            <option value="">Model</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
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
          <label className="block text-sm font-medium mb-1">Condition</label>
          <div className="flex gap-6 mt-2">
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
        </div>
        <input
          type="text"
          value={year}
          onChange={e => setYear(e.target.value)}
          className={`border rounded px-3 py-2 w-full ${showValidation && (!year || isNaN(year) || Number(year) < 1926) ? "border-red-500" : ""}`}
          placeholder="Model year"
        />
        {showValidation && (!year || isNaN(year) || Number(year) < 1926) && (
          <div className="text-xs text-red-500 mt-1">Must be atleast 1926</div>
        )}
        <input
          type="text"
          value={mileage}
          onChange={e => setMileage(e.target.value)}
          className={`border rounded px-3 py-2 w-full ${showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) ? "border-red-500" : ""}`}
          placeholder="Enter the mileage of the vehicle."
        />
        {showValidation && (!mileage || isNaN(mileage) || Number(mileage) < 0) && (
          <div className="text-xs text-red-500 mt-1">Must be atleast 0</div>
        )}
        <input
          type="text"
          value={engine}
          onChange={e => setEngine(e.target.value)}
          className={`border rounded px-3 py-2 w-full ${showValidation && (!engine || isNaN(engine) || Number(engine) < 1) ? "border-red-500" : ""}`}
          placeholder="Engine capacity"
        />
        {showValidation && (!engine || isNaN(engine) || Number(engine) < 1) && (
          <div className="text-xs text-red-500 mt-1">Must be atleast 1</div>
        )}
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
            placeholder="Pick a good price - what would you pay?"
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
