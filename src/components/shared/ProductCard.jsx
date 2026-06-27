import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid, faHeart, faBoxOpen } from "@fortawesome/free-solid-svg-icons";

const StarRating = ({ rating, size = "sm" }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <FontAwesomeIcon
          key={s}
          icon={faStarSolid}
          className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, onWishlistToggle, inWishlist }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    try {
      await API.post("/wishlist/toggle", { productId: product._id });
      if (onWishlistToggle) onWishlistToggle(product._id);
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FontAwesomeIcon icon={faBoxOpen} className="text-5xl text-gray-300" />
            </div>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={`w-4 h-4 ${inWishlist ? "text-red-500" : "text-gray-300"}`}
            />
          </button>
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 hover:text-sky-600 transition-colors">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.ratings || 0} />
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product._id)}
              className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              Add to Cart
            </button>
          ) : (
            <span className="text-xs text-red-500 font-medium">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { StarRating };
export default ProductCard;