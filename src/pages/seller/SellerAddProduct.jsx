import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import ProductForm from "../../components/seller/ProductForm";

const SellerAddProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await API.post("/products", formData);
      toast.success("Product added successfully!");
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
    setLoading(false);
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller/products" className="text-sky-600 hover:text-sky-700 text-sm font-medium">← My Products</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">Add New Product</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default SellerAddProduct;
