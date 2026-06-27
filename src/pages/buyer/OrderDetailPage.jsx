import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";
import Spinner from "../../components/shared/Spinner";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {}
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="page-container py-8"><Spinner size="lg" /></div>;
  if (!order) return <div className="page-container py-8 text-center"><p>Order not found.</p></div>;

  const currentStep = order.orderStatus === "Cancelled"
    ? -1
    : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="page-container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-sky-600 hover:text-sky-700 text-sm font-medium">← My Orders</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">Order #{order._id.slice(-8).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progress */}
          {order.orderStatus !== "Cancelled" ? (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Order Progress</h2>
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        i <= currentStep ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs font-medium ${i <= currentStep ? "text-sky-700" : "text-gray-400"}`}>{step}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-sky-600" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {order.shippingInfo?.trackingNumber && (
                <div className="mt-4 p-3 bg-sky-50 rounded-lg text-sm">
                  <span className="font-medium text-sky-800">Tracking:</span>
                  <span className="ml-2 text-sky-700">{order.shippingInfo.trackingNumber}</span>
                  {order.shippingInfo.carrier && <span className="ml-2 text-sky-600">({order.shippingInfo.carrier})</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="card border-red-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">X</span>
                <div>
                  <p className="font-semibold text-red-700">Order Cancelled</p>
                  <p className="text-sm text-gray-500">This order has been cancelled.</p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-gray-200" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              {order.shippingAddress?.phone && <p className="font-medium text-gray-900">📞 {order.shippingAddress.phone}</p>}
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Order ID</span>
                <span className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status</span>
                <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment</span>
                <span className={`badge ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span>
              </div>

              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span><span>₹{order.taxPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span><span>₹{order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Link to="/products" className="btn-secondary w-full py-2.5 text-center text-sm block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
