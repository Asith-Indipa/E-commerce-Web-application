import React, { useState, useEffect } from "react";

const sriLankaDistricts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

export default function Addlocation() {
  const [district, setDistrict] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [locations, setLocations] = useState({});
  const [error, setError] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editSubLocation, setEditSubLocation] = useState("");
  const [newSubLocation, setNewSubLocation] = useState("");
  const [viewDistrict, setViewDistrict] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, district: null, subLocation: null });

  // Fetch locations from backend
  const fetchLocations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/location/all");
      const data = await res.json();
      setLocations(data);
    } catch {
      setLocations({});
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddSubLocation = async (e) => {
    e.preventDefault();
    setError("");
    if (!district) {
      setError("Please select a district.");
      return;
    }
    if (!subLocation) {
      setError("Please enter a sub location.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/location/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, subLocation }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || "Sub location already exists for this district");
      } else if (res.ok) {
        setSubLocation("");
        fetchLocations();
      } else {
        setError(data.error || "Failed to add location");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleEditClick = (district, subLocation) => {
    setEditDistrict(district);
    setEditSubLocation(subLocation);
    setNewSubLocation(subLocation);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!editDistrict || !editSubLocation || !newSubLocation) return;
    try {
      const res = await fetch("http://localhost:5000/api/location/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: editDistrict,
          oldSubLocation: editSubLocation,
          newSubLocation: newSubLocation,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || "Sub location already exists for this district");
      } else if (res.ok) {
        setEditDistrict("");
        setEditSubLocation("");
        setNewSubLocation("");
        fetchLocations();
      } else {
        setError(data.error || "Failed to update location");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDelete = (district, subLocation) => {
    setDeleteModal({ open: true, district, subLocation });
  };

  const confirmDelete = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/location/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district: deleteModal.district, subLocation: deleteModal.subLocation }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchLocations();
      } else {
        setError(data.error || "Failed to delete location");
      }
    } catch {
      setError("Network error");
    }
    setDeleteModal({ open: false, district: null, subLocation: null });
  };

  // Sorted districts for dropdown
  const sortedDistricts = Object.keys(locations).sort();

  // Sub locations for selected view district
  const subLocationsToShow = viewDistrict ? locations[viewDistrict] || [] : [];

  return (
    <div className="w-full max-w-md mx-auto p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-700">Add Location</h2>
      <form onSubmit={handleAddSubLocation} className="flex flex-col gap-2 sm:gap-3 mb-4 w-full">
        <label className="text-sm font-medium w-full">
          District
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1 text-sm sm:text-base focus:ring-2 focus:ring-blue-300"
            required
          >
            <option value="">Select district</option>
            {sriLankaDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium w-full">
          Add Sub Location
          <input
            type="text"
            value={subLocation}
            onChange={e => setSubLocation(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1 text-sm sm:text-base focus:ring-2 focus:ring-blue-300"
            placeholder="Add new sub location"
            required
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all mt-2 text-sm sm:text-base w-full shadow"
        >
          Add Sub Location
        </button>
      </form>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <div className="mb-4 w-full">
        <label className="text-sm font-medium w-full">
          View District Sub Locations
          <select
            value={viewDistrict}
            onChange={e => setViewDistrict(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1 text-sm sm:text-base"
          >
            <option value="">Select district</option>
            {sortedDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="text-base sm:text-lg font-semibold mt-6 mb-2">Sub Locations</h3>
      <div className="w-full">
        {viewDistrict === "" && (
          <div className="text-gray-500 text-sm">Select a district to view its sub locations.</div>
        )}
        {viewDistrict !== "" && subLocationsToShow.length === 0 && (
          <div className="text-gray-500 text-sm">No sub locations for this district.</div>
        )}
        {viewDistrict !== "" && subLocationsToShow.length > 0 && (
          <div className="mb-4 bg-white rounded-lg shadow p-3 w-full overflow-x-auto">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold mb-2">{viewDistrict}</span>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
              {subLocationsToShow.slice().sort().map((sub, idx) =>
                editDistrict === viewDistrict && editSubLocation === sub ? (
                  <div key={idx} className="flex items-center gap-2 w-full min-w-[180px]">
                    <form onSubmit={handleEditSubmit} className="flex gap-2 w-full">
                      <input
                        type="text"
                        value={newSubLocation}
                        onChange={e => setNewSubLocation(e.target.value)}
                        className="border rounded px-2 py-1 text-xs sm:text-sm w-full focus:ring-2 focus:ring-blue-300"
                        required
                      />
                      <div className="flex gap-2 ml-auto">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-all shadow"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditDistrict("");
                            setEditSubLocation("");
                            setNewSubLocation("");
                          }}
                          className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition-all shadow"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div key={idx} className="flex items-center gap-2 w-full min-w-[120px]">
                    <span className="px-2 py-1 rounded bg-gray-100">{sub}</span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => handleEditClick(viewDistrict, sub)}
                        className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition-all shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(viewDistrict, sub)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all shadow"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
      {/* Custom Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2 text-red-600">Delete Sub Location</h4>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-bold text-blue-700">{deleteModal.subLocation}</span> from <span className="font-bold text-blue-700">{deleteModal.district}</span>?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, district: null, subLocation: null })}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
