import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Spinner from "../../components/shared/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faTrash } from "@fortawesome/free-solid-svg-icons";

const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart, cartTotal, loading } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 499 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + shipping + tax;

  if (loading) return <div className="page-container py-12"><Spinner /></div>;

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {!cart.items?.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Discover products and add them to your cart</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</p>
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear Cart</button>
            </div>

            {cart.items.map((item) => (
              <div key={item._id} className="card flex gap-4">
                <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product?.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?._id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-sky-600 transition-colors line-clamp-2">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-sky-600 font-bold mt-1">₹{item.product?.price?.toLocaleString()}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 font-bold transition-colors">−</button>
                      <span className="px-3 py-1 font-medium border-x border-gray-300 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product?.stock}
                        className="px-3 py-1 hover:bg-gray-100 font-bold transition-colors disabled:opacity-50">+</button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-900">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </span>
                      <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 transition-colors">
                       <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-400 hover:text-red-600" />

                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

         
          <div>
            <div className="card sticky top-20">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {cartTotal < 499 && shipping > 0 && (
                  <p className="text-xs text-sky-600 bg-sky-50 rounded-lg p-2">
                    Add ₹{(499 - cartTotal).toLocaleString()} more for FREE shipping!
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3 mt-6 text-base">
                Proceed to Checkout
              </button>
              <Link to="/products" className="block text-center text-sm text-sky-600 mt-3 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
