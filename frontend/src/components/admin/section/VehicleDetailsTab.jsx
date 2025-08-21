import React, { useState, useEffect } from "react";

export default function VehicleDetailsTab() {
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vehiclecategory/all");
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  // Fetch all vehicles from backend
  const fetchVehicles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vehiclemodelbrand/all");
      const data = await res.json();
      setVehicles(data);
    } catch {
      setVehicles([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchVehicles();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    if (newCategory && !categories.includes(newCategory)) {
      try {
        const res = await fetch("http://localhost:5000/api/vehiclecategory/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: newCategory }),
        });
        const data = await res.json();
        if (res.status === 409) {
          setError(data.error || "Category already exists");
        } else if (res.ok) {
          setNewCategory("");
          fetchCategories();
        } else {
          setError(data.error || "Failed to add category");
        }
      } catch {
        setError("Network error");
      }
    } else if (categories.includes(newCategory)) {
      setError("Category already exists");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/vehiclemodelbrand/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, brand, model }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted({ category, brand, model });
        setCategory("");
        setBrand("");
        setModel("");
        fetchVehicles();
      } else {
        setError(data.error || "Failed to submit");
      }
      fetchCategories();
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleEdit = (vehicle) => {
    setEditId(vehicle._id);
    setEditCategory(vehicle.category);
    setEditBrand(vehicle.brand);
    setEditModel(vehicle.model);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/vehiclemodelbrand/edit/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editCategory,
          brand: editBrand,
          model: editModel,
        }),
      });
      if (res.ok) {
        setEditId(null);
        fetchVehicles();
      }
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vehiclemodelbrand/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVehicles();
      }
    } catch {}
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Manage Vehicle Details</h2>
      <p className="text-gray-600 text-sm sm:text-base mb-4">
        Add Sri Lankan vehicles with category, brand, and model.
      </p>
      <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm sm:text-base w-full sm:w-auto"
          placeholder="Add new category"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto"
        >
          Add Category
        </button>
      </form>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mb-4 max-w-md"
      >
        <label className="text-sm font-medium">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Brand Name
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1"
            placeholder="Enter brand name"
            required
          />
        </label>
        <label className="text-sm font-medium">
          Model
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1"
            placeholder="Enter model"
            required
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 text-sm sm:text-base w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Vehicle"}
        </button>
      </form>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm sm:text-base">
          <div><strong>Category:</strong> {submitted.category}</div>
          <div><strong>Brand:</strong> {submitted.brand}</div>
          <div><strong>Model:</strong> {submitted.model}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold mt-8 mb-2">All Vehicles</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded text-xs sm:text-base">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 border">Category</th>
              <th className="px-2 sm:px-4 py-2 border">Brand</th>
              <th className="px-2 sm:px-4 py-2 border">Model</th>
              <th className="px-2 sm:px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) =>
              editId === v._id ? (
                <tr key={v._id}>
                  <td className="px-2 sm:px-4 py-2 border">
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs sm:text-base"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    <input
                      type="text"
                      value={editBrand}
                      onChange={(e) => setEditBrand(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs sm:text-base"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    <input
                      type="text"
                      value={editModel}
                      onChange={(e) => setEditModel(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs sm:text-base"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 border flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleEditSubmit}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={v._id}>
                  <td className="px-2 sm:px-4 py-2 border">{v.category}</td>
                  <td className="px-2 sm:px-4 py-2 border">{v.brand}</td>
                  <td className="px-2 sm:px-4 py-2 border">{v.model}</td>
                  <td className="px-2 sm:px-4 py-2 border flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
