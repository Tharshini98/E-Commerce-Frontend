import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState({
    street: "", city: "", state: "", pincode: "", country: "India", isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", profileForm);
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match"); return;
    }
    setSaving(true);
    try {
      await API.put("/auth/password/change", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
    setSaving(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/address", addressForm);
      setAddresses(data.addresses);
      updateUser({ ...user, addresses: data.addresses });
      setShowAddressForm(false);
      setAddressForm({ street: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
      toast.success("Address added!");
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await API.delete(`/auth/address/${id}`);
      setAddresses(data.addresses);
      updateUser({ ...user, addresses: data.addresses });
      toast.success("Address removed");
    } catch {}
  };

  const TABS = [
    { id: "profile", label: "Personal Info" },
    { id: "password", label: "Password" },
    { id: "addresses", label: "Addresses" },
  ];

  return (
    <div className="page-container py-8 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Avatar + Name Header */}
      <div className="card flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sky-700 font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge bg-sky-100 text-sky-700 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? "border-sky-600 text-sky-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="input-field" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input value={profileForm.avatar} onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              className="input-field" placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-2.5">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required minLength={6} value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-2.5">
            {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}

      {/* Addresses */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          {addresses.length === 0 && !showAddressForm && (
            <div className="text-center py-8 text-gray-500">
              <p>No saved addresses yet.</p>
            </div>
          )}

          {addresses.map((addr) => (
            <div key={addr._id} className="card flex items-start justify-between gap-4">
              <div className="text-sm text-gray-700 space-y-0.5">
                {addr.isDefault && <span className="badge bg-green-100 text-green-700 mb-1">Default</span>}
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p>{addr.country}</p>
              </div>
              <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-600 text-sm shrink-0">
                Remove
              </button>
            </div>
          ))}

          {!showAddressForm ? (
            <button onClick={() => setShowAddressForm(true)} className="btn-secondary w-full py-2.5">
              + Add New Address
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="card space-y-3">
              <h3 className="font-semibold text-gray-900">New Address</h3>
              <input required placeholder="Street Address" value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="City" value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="input-field" />
                <input required placeholder="State" value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Pincode" value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} className="input-field" />
                <input placeholder="Country" value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="input-field" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-sky-600" />
                Set as default address
              </label>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 py-2">Save Address</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary flex-1 py-2">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
