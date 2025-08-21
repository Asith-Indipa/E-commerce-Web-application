import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const conditions = ["Used", "Reconditioned", "New"];
const brands = ["Brand 1", "Brand 2", "Brand 3"];
const models = ["Model 1", "Model 2", "Model 3"];

export default function SellBusses() {
  const [location, setLocation] = useState("Kamburupitiya");
  const [category, setCategory] = useState("Buses");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vehiclecategory/all");
        const data = await res.json();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handlePhotoChange = (idx, file) => {
    const newPhotos = [...photos];
    newPhotos[idx] = file;
    setPhotos(newPhotos);
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
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Brand</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <div className="text-xs text-red-500 mt-1">You must fill out this field.</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Model</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
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
          className="border rounded px-3 py-2 w-full"
          placeholder="Model year"
        />
        <input
          type="text"
          value={mileage}
          onChange={e => setMileage(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter the mileage of the vehicle."
        />
        <input
          type="text"
          value={engine}
          onChange={e => setEngine(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Engine capacity"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            rows={4}
            maxLength={5000}
            placeholder="More details = more interested buyers!"
          />
          <div className="text-xs text-gray-500 text-right mt-1">{description.length}/5000</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (Rs)</label>
          <input
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Pick a good price - what would you pay?"
          />
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
                  photo ? "border-blue-600" : "border-gray-300"
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
        </div>
      </form>
    </div>
  );
}
