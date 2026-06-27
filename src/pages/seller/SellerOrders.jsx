import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  const [trackingData, setTrackingData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/seller/orders");
      setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const payload = { orderStatus: status };
      const td = trackingData[orderId];
      if (td?.trackingNumber) payload.trackingNumber = td.trackingNumber;
      if (td?.carrier) payload.carrier = td.carrier;

      await API.put(`/orders/${orderId}/status`, payload);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success("Order status updated!");
    } catch {
      toast.error("Failed to update status");
    }
    setUpdating(null);
  };

  const filtered = filterStatus ? orders.filter((o) => o.orderStatus === filterStatus) : orders;

  if (loading) return <div className="page-container py-8"><Spinner size="lg" /></div>;

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg font-semibold text-gray-700">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">Orders will appear here once customers buy your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="card">
              {/* Order Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                      {order.isPaid ? (
                        <span className="badge bg-green-100 text-green-700">Paid</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">Unpaid</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.buyer?.name} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedOrder === order._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Items</p>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                          {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString()} each</p>
                          </div>
                          <span className="font-semibold text-sm">₹{(item.price * item.quantity)?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ship To</p>
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-0.5">
                        <p className="font-medium text-gray-900">{order.buyer?.name}</p>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        {order.shippingAddress?.phone && <p className="text-sky-600">📞 {order.shippingAddress.phone}</p>}
                      </div>
                    </div>

                    {/* Update Status */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                      <div className="space-y-2">
                        <select
                          className="input-field text-sm py-2"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating === order._id}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Tracking */}
                        <input
                          className="input-field text-sm py-2"
                          placeholder="Tracking number (optional)"
                          value={trackingData[order._id]?.trackingNumber || ""}
                          onChange={(e) => setTrackingData({ ...trackingData, [order._id]: { ...trackingData[order._id], trackingNumber: e.target.value } })}
                        />
                        <input
                          className="input-field text-sm py-2"
                          placeholder="Carrier (e.g. DTDC, BlueDart)"
                          value={trackingData[order._id]?.carrier || ""}
                          onChange={(e) => setTrackingData({ ...trackingData, [order._id]: { ...trackingData[order._id], carrier: e.target.value } })}
                        />
                        {(trackingData[order._id]?.trackingNumber || trackingData[order._id]?.carrier) && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, order.orderStatus)}
                            disabled={updating === order._id}
                            className="btn-primary w-full py-2 text-sm"
                          >
                            {updating === order._id ? "Saving..." : "Save Tracking Info"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Existing tracking */}
                  {order.shippingInfo?.trackingNumber && (
                    <div className="bg-purple-50 rounded-lg p-3 text-sm">
                      <span className="font-medium text-purple-800">Tracking:</span>
                      <span className="ml-2 text-purple-700">{order.shippingInfo.trackingNumber}</span>
                      {order.shippingInfo.carrier && <span className="ml-2 text-purple-600">({order.shippingInfo.carrier})</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
