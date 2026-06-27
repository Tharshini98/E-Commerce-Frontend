import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import ProductForm from "../../components/seller/ProductForm";
import Spinner from "../../components/shared/Spinner";

const SellerEditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.product);
      } catch {
        toast.error("Product not found");
        navigate("/seller/products");
      }
      setFetching(false);
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await API.put(`/products/${id}`, formData);
      toast.success("Product updated!");
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    }
    setLoading(false);
  };

  if (fetching) return <div className="page-container py-8"><Spinner size="lg" /></div>;
  if (!product) return null;

  return (
    <div className="page-container py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller/products" className="text-sky-600 hover:text-sky-700 text-sm font-medium">← My Products</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">Edit Product</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default SellerEditProduct;
