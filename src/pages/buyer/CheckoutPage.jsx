import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import toast from "react-hot-toast";
import Spinner from "../../components/shared/Spinner";

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: user?.phone || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const shippingPrice = cartTotal > 999 ? 0 : 49;
  const taxPrice = Math.round(cartTotal * 0.18);
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  useEffect(() => {
    if (!cart?.items?.length) navigate("/cart");
  }, [cart]);

  // Fill from saved address
  useEffect(() => {
    const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddr) {
      setShipping({
        street: defaultAddr.street || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        pincode: defaultAddr.pincode || "",
        country: defaultAddr.country || "India",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  const handleShippingChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const createOrder = async () => {
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      seller: item.product.seller,
      name: item.product.name,
      image: item.product.images?.[0]?.url || "",
      price: item.product.price,
      quantity: item.quantity,
    }));

    const { data } = await API.post("/orders", {
      items: orderItems,
      shippingAddress: shipping,
      paymentMethod,
      itemsPrice: cartTotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
    return data.order;
  };

  const handleRazorpayPayment = async () => {
    setPlacingOrder(true);
    try {
      const order = await createOrder();

      const { data: rpData } = await API.post("/payment/razorpay/order", {
        amount: totalPrice,
        orderId: order._id,
      });

      const options = {
        key: rpData.key,
        amount: rpData.amount,
        currency: rpData.currency,
        name: "ShopNest",
        description: "Order Payment",
        order_id: rpData.razorpayOrderId,
        handler: async (response) => {
          try {
            await API.post("/payment/razorpay/verify", {
              ...response,
              orderId: order._id,
            });
            // Also update stock
            await API.put(`/orders/${order._id}/pay`, {
              razorpay_payment_id: response.razorpay_payment_id,
              status: "success",
            });
            await clearCart();
            toast.success("Payment successful!");
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shipping.phone,
        },
        theme: { color: "#0284c7" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
      setPlacingOrder(false);
    }
  };

  const handleCOD = async () => {
    setPlacingOrder(true);
    try {
      const order = await createOrder();
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
    setPlacingOrder(false);
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "razorpay") handleRazorpayPayment();
    else handleCOD();
  };

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: "Shipping" }, { n: 2, label: "Payment" }].map(({ n, label }) => (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > n ? "✓" : n}
              </div>
              <span className={`font-medium text-sm ${step >= n ? "text-sky-700" : "text-gray-400"}`}>{label}</span>
            </div>
            {n < 2 && <div className={`flex-1 h-0.5 ${step > n ? "bg-sky-600" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Shipping Address</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input name="phone" required value={shipping.phone} onChange={handleShippingChange}
                    className="input-field" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input name="street" required value={shipping.street} onChange={handleShippingChange}
                    className="input-field" placeholder="House no., Street, Area" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input name="city" required value={shipping.city} onChange={handleShippingChange}
                      className="input-field" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input name="state" required value={shipping.state} onChange={handleShippingChange}
                      className="input-field" placeholder="Maharashtra" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input name="pincode" required value={shipping.pincode} onChange={handleShippingChange}
                      className="input-field" placeholder="400001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input name="country" required value={shipping.country} onChange={handleShippingChange}
                      className="input-field" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3">Continue to Payment</button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: "razorpay", label: "Pay Online", desc: "Credit/Debit Card, UPI, Net Banking via Razorpay", icon: "💳" },
                  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: "💵" },
                ].map((m) => (
                  <label key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === m.id ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)} className="accent-sky-600" />
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm">
                <p className="font-medium text-gray-700 mb-1">Shipping to:</p>
                <p className="text-gray-600">{shipping.street}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="btn-primary flex-1 py-3">
                  {placingOrder ? "Processing..." : paymentMethod === "razorpay" ? "Pay Now" : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.items?.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-gray-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? "text-green-600 font-medium" : ""}>
                  {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span><span>₹{taxPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                <span>Total</span><span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            {shippingPrice > 0 && (
              <p className="text-xs text-gray-400 mt-3">Free shipping on orders above ₹999</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
