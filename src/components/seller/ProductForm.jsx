import React, { useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Toys", "Automotive", "Other"];

const ProductForm = ({ initialData, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    category: initialData?.category || "",
    subcategory: initialData?.subcategory || "",
    brand: initialData?.brand || "",
    stock: initialData?.stock || "",
    tags: initialData?.tags?.join(", ") || "",
    images: initialData?.images || [],
    isActive: initialData?.isActive ?? true,
    specifications: initialData?.specifications || [],
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const addImageByUrl = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, { url: imageUrl.trim(), public_id: "" }] });
    setImageUrl("");
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await API.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, images: [...form.images, { url: data.url, public_id: data.public_id }] });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
    setUploading(false);
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const addSpec = () => {
    if (!specKey || !specVal) return;
    setForm({ ...form, specifications: [...form.specifications, { key: specKey, value: specVal }] });
    setSpecKey(""); setSpecVal("");
  };

  const removeSpec = (idx) => {
    setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="e.g. Premium Wireless Headphones" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
            className="input-field resize-none" placeholder="Describe your product in detail..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" required value={form.category} onChange={handleChange} className="input-field">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <input name="subcategory" value={form.subcategory} onChange={handleChange} className="input-field" placeholder="e.g. Audio" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input name="brand" value={form.brand} onChange={handleChange} className="input-field" placeholder="e.g. Sony" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="wireless, headphones, audio" />
          </div>
        </div>
      </div>

      
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
            <input name="price" type="number" min="0" required value={form.price} onChange={handleChange} className="input-field" placeholder="999" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
            <input name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleChange} className="input-field" placeholder="1499" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input name="stock" type="number" min="0" required value={form.stock} onChange={handleChange} className="input-field" placeholder="100" />
          </div>
        </div>
        {form.originalPrice && form.price && (
          <p className="text-sm text-green-600 font-medium">
            Discount: {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% off
          </p>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-sky-600 w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">Active (visible to buyers)</span>
        </label>
      </div>

      
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Product Images</h2>

        
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-sky-300 transition-colors">
          <input type="file" accept="image/*" onChange={uploadImage} className="hidden" id="img-upload" />
          <label htmlFor="img-upload" className="cursor-pointer">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-sm text-sky-600 font-medium">{uploading ? "Uploading..." : "Click to upload image"}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
          </label>
        </div>

        
        <div className="flex gap-2">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="input-field flex-1" placeholder="Or paste an image URL..." />
          <button type="button" onClick={addImageByUrl} className="btn-secondary py-2 px-3 text-sm">Add</button>
        </div>

        
        {form.images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && <span className="absolute top-1 left-1 badge bg-sky-600 text-white text-xs">Main</span>}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Specifications (optional)</h2>
        <div className="flex gap-2">
          <input value={specKey} onChange={(e) => setSpecKey(e.target.value)}
            className="input-field flex-1" placeholder="Key (e.g. Weight)" />
          <input value={specVal} onChange={(e) => setSpecVal(e.target.value)}
            className="input-field flex-1" placeholder="Value (e.g. 500g)" />
          <button type="button" onClick={addSpec} className="btn-secondary py-2 px-3 text-sm">Add</button>
        </div>
        {form.specifications.length > 0 && (
          <div className="space-y-2">
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700"><strong>{spec.key}:</strong> {spec.value}</span>
                <button type="button" onClick={() => removeSpec(idx)} className="text-red-400 hover:text-red-600 text-sm">X</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
};

export default ProductForm;
