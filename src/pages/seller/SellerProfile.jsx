import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import toast from "react-hot-toast";

const SellerProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("store");
  const [saving, setSaving] = useState(false);

  const [storeForm, setStoreForm] = useState({
    storeName: user?.storeName || "",
    storeDescription: user?.storeDescription || "",
    storeLogo: user?.storeLogo || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleStoreSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put("/seller/profile", storeForm);
      updateUser(data.seller);
      toast.success("Store profile updated!");
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

  const TABS = [
    { id: "store", label: "Store Info" },
    { id: "password", label: "Password" },
  ];

  return (
    <div className="page-container py-8 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Store Profile</h1>

      {/* Store Header */}
      <div className="card flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user?.storeLogo || user?.avatar ? (
            <img src={user.storeLogo || user.avatar} alt={user.storeName || user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sky-700 font-bold text-2xl">🏪</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.storeName || user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.storeName && (
            <p className="text-xs text-gray-400 mt-1 max-w-xs line-clamp-1">{user?.storeDescription}</p>
          )}
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

      {activeTab === "store" && (
        <form onSubmit={handleStoreSave} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
              className="input-field" placeholder="My Awesome Store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              value={storeForm.storeDescription}
              onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell customers about your store..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo URL</label>
            <input value={storeForm.storeLogo} onChange={(e) => setStoreForm({ ...storeForm, storeLogo: e.target.value })}
              className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input value={storeForm.phone} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              className="input-field" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-2.5">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

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
    </div>
  );
};

export default SellerProfile;
