import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import

const categoryEmojis = {
  "Cars": "🚗",
  "Motorbikes": "🏍️",
  "Three Wheelers": "🛺",
  "Bicycles": "🚲",
  "Vans": "🚐",
  "Buses": "🚌",
  "Lorries & Trucks": "🚚",
  "Heavy Duty": "🚛",
  "Tractors": "🚜",
  "Boats and Water Transport": "🛥️",
  "Boats": "🛥️",
  "Water Transport": "🛥️",
  "Boats & Water Transport": "🛥️"
};

export default function SellVehicle() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
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

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vehiclemodelbrand/all");
        const data = await res.json();
        setSubcategories(data);
      } catch {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, []);

  // Group subcategories by category
  const subcategoriesForSelected = subcategories
    .filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Sell Your Vehicle</h1>
        <h2 className="text-lg font-semibold mb-2 text-center">Select a Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 justify-center">
          {categories.length === 0 ? (
            <span className="text-gray-500 text-sm col-span-2 text-center">No categories found.</span>
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === "Cars") {
                    navigate("/sell/cars");
                  } else if (cat === "Bicycles") {
                    navigate("/sell/bicycle");
                  } else if (cat === "Motorbikes") {
                    navigate("/sell/motorbike");
                  } else if (
                    cat === "Boats and Water Transport" ||
                    cat === "Boats" ||
                    cat === "Water Transport" ||
                    cat === "Boats & Water Transport"
                  ) {
                    navigate("/sell/boats");
                  } else if (cat === "Buses") {
                    navigate("/sell/busses");
                  } else if (cat === "Heavy Duty") {
                    navigate("/sell/heavyduty");
                  } else if (cat === "Lorries & Trucks") {
                    navigate("/sell/lorries");
                  } else if (cat === "Three Wheelers") {
                    navigate("/sell/threewheel");
                  } else if (cat === "Tractors") {
                    navigate("/sell/tractors");
                  } else if (cat === "Vans") {
                    navigate("/sell/vans");
                  } else {
                    setSelectedCategory(cat);
                  }
                }}
                className={`flex flex-col items-center justify-center px-6 py-6 rounded-2xl shadow-lg transition-all border-2 font-semibold text-base
                  ${selectedCategory === cat
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-600 scale-105"
                    : "bg-gradient-to-br from-white to-blue-50 text-blue-700 border-blue-100 hover:scale-105 hover:border-blue-400 hover:shadow-xl"}
                `}
                style={{ transition: "all 0.2s cubic-bezier(.4,2,.3,1)" }}
              >
                <span className={`text-4xl mb-3 transition-all ${selectedCategory === cat ? "scale-125 drop-shadow" : ""}`}>
                  {categoryEmojis[cat] || "🚗"}
                </span>
                <span className="font-semibold text-center">{cat}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
