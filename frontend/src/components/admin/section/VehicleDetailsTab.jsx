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
  const [editCategoryIdx, setEditCategoryIdx] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [showCategories, setShowCategories] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

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

  const handleEditCategoryClick = (idx, cat) => {
    setEditCategoryIdx(idx);
    setEditCategoryValue(cat);
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!editCategoryValue) return;
    try {
      const res = await fetch("http://localhost:5000/api/vehiclecategory/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCategory: categories[editCategoryIdx],
          newCategory: editCategoryValue,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || "Category already exists");
      } else if (res.ok) {
        setEditCategoryIdx(null);
        setEditCategoryValue("");
        fetchCategories();
      } else {
        setError(data.error || "Failed to update category");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDeleteCategory = async (cat) => {
    setDeleteModal({ open: true, category: cat });
  };

  const confirmDeleteCategory = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/vehiclecategory/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: deleteModal.category }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchCategories();
      } else {
        setError(data.error || "Failed to delete category");
      }
    } catch {
      setError("Network error");
    }
    setDeleteModal({ open: false, category: null });
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
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Manage Vehicle Details</h2>
      <p className="text-gray-600 text-sm sm:text-base mb-4">
        Add Sri Lankan vehicles with category, brand, and model.
      </p>
      <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
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
      <div className="mb-4 w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold mb-2">Categories</h3>
          <button
            onClick={() => setShowCategories((prev) => !prev)}
            className={`px-3 py-1 rounded-full shadow text-sm font-semibold transition-all
              ${showCategories
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-blue-700 hover:bg-blue-100"}
            `}
            aria-label={showCategories ? "Hide categories" : "Show categories"}
          >
            {showCategories ? "Hide" : "Show"}
          </button>
        </div>
        {showCategories && (
          <div className="overflow-x-auto w-full">
            <table className="min-w-[300px] bg-white border rounded text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2 border">Category Name</th>
                  <th className="px-2 sm:px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.slice().sort().map((cat, idx) =>
                  editCategoryIdx === idx ? (
                    <tr key={cat}>
                      <td className="px-2 sm:px-4 py-2 border">
                        <form onSubmit={handleEditCategorySubmit} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editCategoryValue}
                            onChange={e => setEditCategoryValue(e.target.value)}
                            className="border rounded px-2 py-1 text-xs sm:text-sm w-full"
                            required
                          />
                          <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                          <button type="button" onClick={() => { setEditCategoryIdx(null); setEditCategoryValue(""); }} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                        </form>
                      </td>
                      <td className="px-2 sm:px-4 py-2 border"></td>
                    </tr>
                  ) : (
                    <tr key={cat}>
                      <td className="px-2 sm:px-4 py-2 border">{cat}</td>
                      <td className="px-2 sm:px-4 py-2 border">
                        <button
                          onClick={() => handleEditCategoryClick(idx, cat)}
                          className="bg-yellow-400 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-500 transition-all"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all"
                          title="Delete"
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
        )}
      </div>
      {/* Custom Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2 text-red-600">Delete Category</h4>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-bold text-blue-700">{deleteModal.category}</span>?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDeleteCategory}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, category: null })}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mb-4 max-w-md w-full"
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
        {/* Only show brand input if category is not Bicycles */}
        {category !== "Bicycles" && (
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
        )}
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
      <div className="overflow-x-auto w-full">
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
