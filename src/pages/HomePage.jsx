import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import ProductCard from "../components/shared/ProductCard";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptop,
  faShirt,
  faHouse,
  faDumbbell,
  faBook,
  faStar,
  faPuzzlePiece,
  faCar,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Toys", "Automotive"];

const CATEGORY_ICONS = {
  Electronics: faLaptop,
  Fashion: faShirt,
  "Home & Garden": faHouse,
  Sports: faDumbbell,
  Books: faBook,
  Beauty: faStar,
  Toys: faPuzzlePiece,
  Automotive: faCar,
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get("/products?limit=8&sort=popular");
        setFeaturedProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setWishlistIds([]);
        return;
      }
      try {
        const { data } = await API.get("/wishlist");
        setWishlistIds(data.wishlist?.products?.map((p) => p._id) || []);
      } catch {}
    };
    fetchWishlist();
  }, [isAuthenticated]);

  const handleWishlistToggle = (productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?keyword=${searchQuery}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white py-20">
        <div className="page-container text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Shop Smart.<br />
            <span className="text-sky-200">Sell Easy.</span>
          </h1>
          <p className="text-sky-100 text-lg mb-8 max-w-xl mx-auto">
            Discover thousands of products from trusted sellers. Join ShopNest — the marketplace built for everyone.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              type="submit"
              className="bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 mt-8 text-sky-200 text-sm">
            <span>✓ Secure Payments</span>
            <span>✓ Easy Returns</span>
            <span>✓ Trusted Sellers</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="page-container">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-sky-50 hover:border-sky-200 border border-gray-100 transition-all group"
              >
                <div className="mb-2">
                  <FontAwesomeIcon
                    icon={CATEGORY_ICONS[cat] || faShoppingBag}
                    className="text-2xl text-sky-600 group-hover:text-sky-700 transition-colors"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-sky-700 text-center">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-gray-900">Popular Products</h2>
            <Link to="/products" className="text-sky-600 hover:text-sky-700 font-medium text-sm">
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  inWishlist={wishlistIds.includes(product._id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No products yet. Be the first seller!</p>
              <Link to="/register" className="mt-4 inline-block btn-primary">
                Start Selling
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-100">
        <div className="page-container text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Start Selling Today</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join thousands of sellers on ShopNest. List your products and reach millions of buyers.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Become a Seller
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;