import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faBoxOpen, faStar, faXmark, faCartShopping } from "@fortawesome/free-solid-svg-icons";

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get("/wishlist");
      setProducts(data.wishlist?.products || []);
    } catch {}
    setLoading(false);
  };

  const removeFromWishlist = async (productId) => {
    try {
      await API.post("/wishlist/toggle", { productId });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {}
  };

  const moveToCart = async (product) => {
    await addToCart(product._id);
    await removeFromWishlist(product._id);
  };

  if (loading) return <div className="page-container py-8"><Spinner size="lg" /></div>;

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-500">{products.length} items</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <FontAwesomeIcon icon={faHeart} className="text-6xl text-red-300" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Save products you love and buy them later.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id} className="card p-0 overflow-hidden group">
              <Link to={`/products/${product._id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-50 relative">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${product._id}`}>
                  <p className="text-xs text-gray-400 uppercase mb-1">{product.category}</p>
                  <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 hover:text-sky-600">
                    {product.name}
                  </p>
                </Link>

                {/* Star Ratings */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FontAwesomeIcon
                      key={s}
                      icon={faStar}
                      className={`w-3 h-3 ${s <= Math.round(product.ratings) ? "text-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>

                <p className="font-bold text-gray-900 mb-3">₹{product.price?.toLocaleString()}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => moveToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 text-xs bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faCartShopping} className="w-3 h-3" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from wishlist"
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;