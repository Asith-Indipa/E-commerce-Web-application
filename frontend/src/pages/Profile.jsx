import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../util/api.js";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [favourites, setFavourites] = useState([]); // array of vehicle objects
  const [myAds, setMyAds] = useState([]);
  const [myAdsLoading, setMyAdsLoading] = useState(false);
  const [myAdsError, setMyAdsError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNegotiable, setEditNegotiable] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editSubLocation, setEditSubLocation] = useState("");
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/location/all`)
      .then(res => res.json())
      .then(data => {
        const arr = Object.entries(data).map(([district, sublocations]) => ({
          district,
          sublocations
        }));
        setLocations(arr);
      })
      .catch(() => setLocations([]));
  }, []);

  // Load favourites when Favorites tab is opened
  useEffect(() => {
    const loadFavourites = async () => {
      setFavError("");
      setFavLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFavourites([]);
          setFavLoading(false);
          return;
        }
        // 1) Fetch favourite ids
        const res = await fetch(`${BASE_URL}/api/favorite/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const favs = Array.isArray(data?.favorites) ? data.favorites : [];
        const ids = favs.map((f) => f.vehicle).filter(Boolean);
        if (ids.length === 0) {
          setFavourites([]);
          setFavLoading(false);
          return;
        }
        // 2) Fetch vehicle details in parallel (bounded)
        const fetchOne = (id) =>
          fetch(`${BASE_URL}/api/sellvehicle/details/${id}`).then((r) => r.json()).catch(() => null);
        const chunks = [];
        const concurrency = 4;
        for (let i = 0; i < ids.length; i += concurrency) {
          chunks.push(ids.slice(i, i + concurrency));
        }
        const results = [];
        for (const group of chunks) {
          const items = await Promise.all(group.map((vid) => fetchOne(vid)));
          results.push(...items);
        }
        const vehicles = results.filter(Boolean);
        setFavourites(vehicles);
      } catch (e) {
        setFavError("Failed to load favourites");
        setFavourites([]);
      } finally {
        setFavLoading(false);
      }
    };
    if (activeTab === "favorites") {
      loadFavourites();
    }
  }, [activeTab]);

  // Map category to selling route
  const routeForCategory = (category) => {
    switch (category) {
      case 'Bicycles': return '/sell/bicycle';
      case 'Boats':
      case 'Water Transport':
      case 'Boats & Water Transport': return '/sell/boats';
      case 'Buses': return '/sell/busses';
      case 'Cars': return '/sell/cars';
      case 'Heavy Duty': return '/sell/heavyduty';
      case 'Lorries':
      case 'Lorries & Trucks': return '/sell/lorries';
      case 'Motorbikes': return '/sell/motorbike';
      case 'Three Wheelers': return '/sell/threewheel';
      case 'Tractors': return '/sell/tractors';
      case 'Vans': return '/sell/vans';
      default: return '/sell';
    }
  };

  const goToEditForm = (v) => {
    const route = routeForCategory(v?.category);
    navigate(route, { state: { editId: v?._id } });
  };

  const openEditAd = (v) => {
    setEditAd(v);
    setEditTitle(v?.title || "");
    setEditPrice(typeof v?.price === 'number' ? String(v.price) : (v?.price || ""));
    setEditNegotiable(!!v?.negotiable);
    setEditDescription(v?.description || "");
    setEditDistrict(v?.district || "");
    setEditSubLocation(v?.subLocation || "");
    setEditMsg("");
    setEditOpen(true);
  };

  const closeEditAd = () => {
    setEditOpen(false);
    setEditAd(null);
  };

  const submitEditAd = async (e) => {
    e?.preventDefault?.();
    if (!editAd?._id) return;
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: editTitle,
        price: editPrice,
        negotiable: editNegotiable,
        description: editDescription,
        district: editDistrict,
        subLocation: editSubLocation,
      };
      const res = await fetch(`${BASE_URL}/api/sellvehicle/update/${editAd._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const j = await res.json();
      if (j?.success && j.vehicle) {
        setMyAds(prev => prev.map(v => v._id === j.vehicle._id ? j.vehicle : v));
        setEditMsg('Saved successfully');
        setTimeout(() => { closeEditAd(); }, 600);
      } else {
        setEditMsg(j?.error || 'Failed to save changes');
      }
    } catch (_) {
      setEditMsg('Network error. Please try again.');
    }
  };

  // Load my ads when My Ads tab is opened
  useEffect(() => {
    const loadMyAds = async () => {
      setMyAdsError("");
      setMyAdsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMyAds([]);
          setMyAdsLoading(false);
          return;
        }
        const res = await fetch(`${BASE_URL}/api/sellvehicle/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success && Array.isArray(data.vehicles)) {
          setMyAds(data.vehicles);
        } else if (Array.isArray(data)) {
          // In case backend returns array directly
          setMyAds(data);
        } else {
          setMyAds([]);
        }
      } catch (e) {
        setMyAdsError("Failed to load your ads");
        setMyAds([]);
      } finally {
        setMyAdsLoading(false);
      }
    };

    if (activeTab === "ads") {
      loadMyAds();
    }
  }, [activeTab]);

  const removeFavourite = async (vehicleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/favorite/${vehicleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (j?.success) {
        setFavourites((prev) => prev.filter((v) => v?._id !== vehicleId));
      } else {
        alert(j?.error || "Failed to remove favourite");
      }
    } catch (_) {
      alert("Network error. Please try again.");
    }
  };

  // Move deleteMyAd to top-level so it's available to the JSX click handler
  const deleteMyAd = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this ad? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/sellvehicle/delete/${vehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j?.success) {
        setMyAds(prev => prev.filter(v => v._id !== vehicleId));
      } else {
        alert(j?.error || 'Failed to delete ad');
      }
    } catch (_) {
      alert('Network error. Please try again.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setLocation(data.user.location || "");
          setSubLocation(data.user.subLocation || "");
          setPhone(data.user.phone || "");
          setProfileImage(data.user.profileImage || "");
        }
      });
  }, []);

  const handleUpdateDetails = async e => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, location, subLocation, phone })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Details updated successfully!");
        setName(data.user.name);
        setLocation(data.user.location);
        setSubLocation(data.user.subLocation);
        setPhone(data.user.phone);
        localStorage.setItem("userName", data.user.name);
        window.location.reload(); // Refresh page after update
      } else {
        setError(data.error || "Failed to update details");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setError("Please fill all password fields correctly.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImageFile) {
      setError("Please select an image to upload");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profileImage", profileImageFile);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/upload-profile-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setProfileImage(data.profileImage);
        // Persist to localStorage so other components can access immediately
        try {
          localStorage.setItem("profileImage", data.profileImage || "");
        } catch (_) {}
        // Notify listeners (e.g., Header) that the profile image changed
        try {
          window.dispatchEvent(
            new CustomEvent("profile-image-updated", {
              detail: { profileImage: data.profileImage },
            })
          );
        } catch (_) {}
        setImagePreview("");
        setProfileImageFile(null);
        setSuccess("Profile image updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload(); // Force refresh after logout
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        navigate("/register");
      } else {
        setError(data.error || "Failed to delete account");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-5xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-50 border-r px-4 py-6">
        <nav className="space-y-2">
          <div className="font-bold text-gray-700 mb-4">Account</div>
          <button
            className={`block w-full text-left py-2 px-2 rounded font-semibold ${
              activeTab === "ads"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-blue-50 text-blue-700"
            }`}
            onClick={() => setActiveTab("ads")}
          >
            My ads
          </button>
          <button
            className={`block w-full text-left py-2 px-2 rounded ${
              activeTab === "favorites"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            Favorites
          </button>
          <button
            className={`block w-full text-left py-2 px-2 rounded ${
              activeTab === "settings"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        {activeTab === "ads" && (
          <div>
            <h2 className="text-xl font-bold mb-6">My Ads</h2>
            {myAdsLoading ? (
              <div className="text-gray-500">Loading your ads…</div>
            ) : myAdsError ? (
              <div className="text-red-600">{myAdsError}</div>
            ) : myAds.length === 0 ? (
              <div className="text-gray-500">You have no ads yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAds.map((v) => (
                  <div key={v._id} className="bg-white border rounded-lg shadow hover:shadow-md transition p-3 flex flex-col">
                    <Link to={`/vehicle/${v._id}`} className="block">
                      <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
                        {Array.isArray(v.photos) && v.photos[0] ? (
                          <img
                            src={`${BASE_URL}/sellvehicle/${v.photos[0]}`}
                            alt={v.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/no-image.png")}
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
                      </div>
                      <div className="font-semibold text-blue-900 truncate">{v.title}</div>
                    </Link>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <div className="font-bold text-green-600">{v.price ? `Rs ${v.price.toLocaleString()}` : ''}</div>
                      <div>{v.district}{v.subLocation ? `, ${v.subLocation}` : ''}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/vehicle/${v._id}`} className="px-3 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                        View
                      </Link>
                      <button onClick={() => goToEditForm(v)} className="px-3 py-2 rounded bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
                        Edit
                      </button>
                      <button onClick={() => deleteMyAd(v._id)} className="px-3 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "favorites" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Favorites</h2>
            {favLoading ? (
              <div className="text-gray-500">Loading favourites…</div>
            ) : favError ? (
              <div className="text-red-600">{favError}</div>
            ) : favourites.length === 0 ? (
              <div className="text-gray-500">You have no favourites yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favourites.map((v) => (
                  <div key={v._id} className="bg-white border rounded-lg shadow hover:shadow-md transition p-3 flex flex-col">
                    <Link to={`/vehicle/${v._id}`} className="block">
                      <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
                        {Array.isArray(v.photos) && v.photos[0] ? (
                          <img
                            src={`${BASE_URL}/sellvehicle/${v.photos[0]}`}
                            alt={v.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/no-image.png")}
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
                      </div>
                      <div className="font-semibold text-blue-900 truncate">{v.title}</div>
                    </Link>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <div className="font-bold text-green-600">{v.price ? `Rs ${v.price.toLocaleString()}` : ''}</div>
                      <div>{v.district}{v.subLocation ? `, ${v.subLocation}` : ''}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/vehicle/${v._id}`} className="px-3 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                        View
                      </Link>
                      <button onClick={() => removeFavourite(v._id)} className="px-3 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "settings" && (
          <>
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <form className="space-y-6 max-w-lg" onSubmit={handleUpdateDetails}>
              <div>
                <div className="font-semibold mb-4">Profile Image</div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={`${BASE_URL}/profile_image/${profileImage}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-600 text-2xl font-semibold">
                          {name ? name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {/* Hide native file input to avoid 'No file chosen' text */}
                    <input
                      id="profileFileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileFileInput"
                      className="inline-block mr-3 px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                    >
                      Choose File
                    </label>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={!profileImageFile}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Change details</div>
                <div className="mb-2 text-gray-700">
                  Email: <span className="font-mono">{email}</span>
                </div>
                <div className="mb-2 text-gray-700">
                  Phone: <span className="font-mono">{phone}</span>
                </div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border rounded px-3 py-2 w-full mb-2"
                  required
                />
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    setSubLocation("");
                  }}
                  className="border rounded px-3 py-2 w-full mb-2"
                >
                  <option value="">Select District</option>
                  {locations.map(loc => (
                    <option key={loc.district} value={loc.district}>
                      {loc.district}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium mb-1">Sub location</label>
                <select
                  value={subLocation}
                  onChange={e => setSubLocation(e.target.value)}
                  className="border rounded px-3 py-2 w-full mb-4"
                  disabled={!location}
                >
                  <option value="">Select Area</option>
                  {locations
                    .find(loc => loc.district === location)
                    ?.sublocations.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  className="border rounded px-3 py-2 w-full mb-2"
                  required
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold border hover:bg-gray-200"
                >
                  Update details
                </button>
                {success && <div className="text-green-600 mt-2">{success}</div>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>
            </form>
            <form
              className="space-y-4 max-w-lg mt-8"
              onSubmit={handleChangePassword}
            >
              <div className="font-semibold mb-2">Change password</div>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Current password"
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="New password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Confirm new password"
              />
              <button
                type="submit"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold border hover:bg-gray-200"
              >
                Change password
              </button>
            </form>
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleDeleteAccount}
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
              >
                Delete account
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
              >
                Log out
              </button>
            </div>
            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm mx-auto flex flex-col items-center">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
                  <p className="mb-6 text-gray-700 text-center">
                    Are you sure you want to delete this account? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={confirmDeleteAccount}
                      className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Edit Ad Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeEditAd} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">Edit Ad</h3>
              <form onSubmit={submitEditAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input value={editPrice} onChange={e=>setEditPrice(e.target.value.replace(/[^0-9]/g, ''))} className="border rounded px-3 py-2 w-full" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input id="negChk" type="checkbox" checked={editNegotiable} onChange={e=>setEditNegotiable(e.target.checked)} />
                  <label htmlFor="negChk" className="text-sm">Negotiable</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} rows={4} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <select value={editDistrict} onChange={e=>{ setEditDistrict(e.target.value); setEditSubLocation(''); }} className="border rounded px-3 py-2 w-full">
                    <option value="">Select District</option>
                    {locations.map(loc => (
                      <option key={loc.district} value={loc.district}>{loc.district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Area</label>
                  <select value={editSubLocation} onChange={e=>setEditSubLocation(e.target.value)} className="border rounded px-3 py-2 w-full" disabled={!editDistrict}>
                    <option value="">Select Area</option>
                    {locations.find(l=>l.district===editDistrict)?.sublocations.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
                  <button type="button" onClick={closeEditAd} className="px-4 py-2 rounded border font-semibold hover:bg-gray-50">Cancel</button>
                  {editMsg && <span className={`text-sm ${editMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{editMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
