import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../../util/api.js";

export default function UserTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  // Create user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [formMsg, setFormMsg] = useState("");
  const [locations, setLocations] = useState([]);

  // Filters
  const [qName, setQName] = useState("");
  const [qId, setQId] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qLocation, setQLocation] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view users");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/auth/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          // Sort by newest joined (createdAt or ObjectId timestamp)
          const withJoined = (data.users || []).slice().sort((a, b) => {
            const aTs = getJoinedTimestamp(a);
            const bTs = getJoinedTimestamp(b);
            return bTs - aTs; // newest first
          });
          setUsers(withJoined);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch current user to enforce UI guards (no self-delete, no admin delete)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.user) {
          setCurrentUserId(data.user._id || "");
          setCurrentUserRole(data.user.role || "");
        }
      })
      .catch(() => {});
  }, []);

  // Open/Close modal helpers
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Confirm delete action (admin): soft-deletes user and cascades on backend
  const confirmDeleteUser = async () => {
    if (!userToDelete?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/admin/user/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        closeDeleteModal();
      } else {
        closeDeleteModal();
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      closeDeleteModal();
      alert('Network error. Please try again.');
    }
  };

  // Load locations for district/area selects
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

  // Fallback: derive a Date from Mongo ObjectId if createdAt not present
  const getJoinedTimestamp = (user) => {
    if (user?.createdAt) {
      const t = Date.parse(user.createdAt);
      if (!Number.isNaN(t)) return t;
    }
    // ObjectId: first 8 hex chars = seconds since epoch
    try {
      const hex = String(user?._id || '').slice(0, 8);
      const seconds = parseInt(hex, 16);
      if (!Number.isNaN(seconds)) return seconds * 1000;
    } catch (_) {}
    return 0;
  };

  const formatDate = (dateInput) => {
    const d = typeof dateInput === 'number' ? new Date(dateInput) : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Derived filtered users (client-side)
  const filteredUsers = React.useMemo(() => {
    const name = qName.trim().toLowerCase();
    const id = qId.trim().toLowerCase();
    const email = qEmail.trim().toLowerCase();
    const phone = qPhone.replace(/\D/g, '');
    const loc = qLocation.trim().toLowerCase();
    if (!name && !id && !email && !phone && !loc) return users;
    return users.filter(u => {
      const uName = (u?.name || '').toLowerCase();
      const uId = (u?._id || '').toLowerCase();
      const uEmail = (u?.email || '').toLowerCase();
      const uPhone = String(u?.phone || '').replace(/\D/g, '');
      const uLoc = `${u?.location || ''} ${u?.subLocation || ''}`.toLowerCase();
      const okName = name ? uName.includes(name) : true;
      const okId = id ? (uId.includes(id) || uId.slice(-8).includes(id)) : true;
      const okEmail = email ? uEmail.includes(email) : true;
      const okPhone = phone ? uPhone.includes(phone) : true;
      const okLoc = loc ? uLoc.includes(loc) : true;
      return okName && okId && okEmail && okPhone && okLoc;
    });
  }, [users, qName, qId, qEmail, qPhone, qLocation]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg("");
    setError("");
    if (!name || !email || !phone || !location || !subLocation || !password) {
      setFormMsg("Please fill all required fields.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, phone, location, subLocation, password, role })
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Prepend newly created user
        setUsers(prev => [data.user, ...prev]);
        setFormMsg("User created successfully.");
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setSubLocation("");
        setPassword("");
        setRole("user");
      } else {
        setFormMsg(data.error || 'Failed to create user');
      }
    } catch (e2) {
      setFormMsg('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-blue-600 font-semibold">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold text-blue-600">{users.length}</span>
        </div>
      </div>

      {/* Create User Form */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Create User</h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g, ''))} className="border rounded px-3 py-2 w-full" maxLength={10} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="border rounded px-3 py-2 w-full">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select value={location} onChange={e=>{ setLocation(e.target.value); setSubLocation(''); }} className="border rounded px-3 py-2 w-full" required>
              <option value="">Select District</option>
              {locations.map(loc => (
                <option key={loc.district} value={loc.district}>{loc.district}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Area</label>
            <select value={subLocation} onChange={e=>setSubLocation(e.target.value)} className="border rounded px-3 py-2 w-full" disabled={!location} required>
              <option value="">Select Area</option>
              {locations.find(l=>l.district===location)?.sublocations.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">Create</button>
            {formMsg && <span className={`text-sm ${formMsg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{formMsg}</span>}
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">By Name</label>
            <input value={qName} onChange={e=>setQName(e.target.value)} placeholder="Search name…" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">By User ID</label>
            <input value={qId} onChange={e=>setQId(e.target.value)} placeholder="Full or last 8 chars" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">By Email</label>
            <input value={qEmail} onChange={e=>setQEmail(e.target.value)} placeholder="Search email…" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">By Phone</label>
            <input value={qPhone} onChange={e=>setQPhone(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 0771234567" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">By Location</label>
            <input value={qLocation} onChange={e=>setQLocation(e.target.value)} placeholder="District or Area" className="border rounded px-3 py-2 w-full" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={() => { setQName(''); setQId(''); setQEmail(''); setQPhone(''); setQLocation(''); }} className="px-3 py-2 text-sm rounded border hover:bg-gray-50">Clear Filters</button>
          <span className="text-sm text-gray-600">Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span></span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No users found</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage ? (
                            <img
                              src={`${BASE_URL}/profile_image/${user.profileImage}`}
                              alt={user.name || 'User'}
                              className="h-10 w-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.location || 'Not specified'}
                      </div>
                      {user.subLocation && (
                        <div className="text-sm text-gray-500">{user.subLocation}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(getJoinedTimestamp(user))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(user.role === 'admin' || user._id === currentUserId) ? (
                        <button
                          disabled
                          className="px-3 py-1 bg-gray-300 text-gray-600 rounded text-sm font-semibold cursor-not-allowed"
                          title={user.role === 'admin' ? 'Cannot delete admin' : 'Cannot delete your own account'}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDeleteModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">!
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete User</h3>
            </div>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete
              <span className="font-semibold"> {userToDelete?.name || 'this user'}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The user's ads and images will be removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
