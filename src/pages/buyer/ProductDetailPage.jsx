import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { StarRating } from "../../components/shared/ProductCard";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (isAuthenticated) checkWishlist();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
    } catch { toast.error("Product not found"); }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/${id}`);
      setReviews(data.reviews);
    } catch {}
  };

  const checkWishlist = async () => {
    try {
      const { data } = await API.get("/wishlist");
      setInWishlist(data.wishlist?.products?.some((p) => p._id === id) || false);
    } catch {}
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { toast.error("Please login first"); return; }
    try {
      const { data } = await API.post("/wishlist/toggle", { productId: id });
      setInWishlist(data.added);
      toast.success(data.added ? "Added to wishlist" : "Removed from wishlist");
    } catch {}
  };

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login to submit a review"); return; }
    setSubmittingReview(true);
    try {
      const { data } = await API.post("/reviews", { ...reviewForm, productId: id });
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, title: "", comment: "" });
      toast.success("Review submitted!");
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
    setSubmittingReview(false);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
    } catch {}
  };

  if (loading) return <div className="page-container py-12"><Spinner size="lg" /></div>;
  if (!product) return <div className="page-container py-12 text-center text-gray-500">Product not found</div>;

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-sky-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-sky-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-sky-600">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            {product.images?.[selectedImage]?.url ? (
              <img src={product.images[selectedImage].url} alt={product.name}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-sky-600" : "border-transparent"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="badge bg-sky-100 text-sky-700">{product.category}</span>
            <button onClick={handleWishlistToggle} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className={`w-6 h-6 ${inWishlist ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {product.brand && <p className="text-sm text-gray-500 mb-3">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>}

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.ratings} size="lg" />
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            <span className={`badge ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                <span className="text-green-600 font-semibold text-sm">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && user?.role !== "seller" && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-bold transition-colors">-</button>
                <span className="px-4 py-2 font-medium border-x border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-bold transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1 py-3">
                Add to Cart
              </button>
            </div>
          )}

          <Link to="/cart" onClick={handleAddToCart}
            className="block text-center btn-secondary py-3 mb-6">
            Buy Now
          </Link>

          {/* Seller info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sold by</p>
            <p className="font-semibold text-gray-900">{product.seller?.storeName || product.seller?.name}</p>
            {product.seller?.storeDescription && (
              <p className="text-sm text-gray-500 mt-1">{product.seller.storeDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {["description", "specifications", "reviews"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? "border-sky-600 text-sky-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab} {tab === "reviews" && `(${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "description" && (
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          <p>{product.description}</p>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "specifications" && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {product.specifications?.length > 0 ? (
            <table className="w-full text-sm">
              <tbody>
                {product.specifications.map((spec, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-medium text-gray-700 w-1/3">{spec.key}</td>
                    <td className="px-4 py-3 text-gray-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-8">No specifications available</p>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Review form */}
          {isAuthenticated && user?.role === "buyer" && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                        <svg className={`w-7 h-7 ${s <= reviewForm.rating ? "text-amber-400" : "text-gray-200"} hover:text-amber-300 transition-colors`}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" required placeholder="Review title" value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="input-field" />
                <textarea required rows={4} placeholder="Share your experience..." value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field resize-none" />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sky-700 font-semibold">{review.user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.user?.name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        {review.isVerifiedPurchase && (
                          <span className="badge bg-green-100 text-green-700">✓ Verified Purchase</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    {user?._id === review.user?._id && (
                      <button onClick={() => handleDeleteReview(review._id)}
                        className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
