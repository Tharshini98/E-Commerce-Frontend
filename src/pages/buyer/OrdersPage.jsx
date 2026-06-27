import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import Spinner from "../../components/shared/Spinner";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders);
      } catch {}
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="page-container py-8"><Spinner size="lg" /></div>;

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg font-semibold text-gray-700">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                      {order.orderStatus}
                    </span>
                    {!order.isPaid && order.paymentMethod === "razorpay" && (
                      <span className="badge bg-red-100 text-red-600">Unpaid</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                        {item.product?.images?.[0]?.url && (
                          <img src={item.product.images[0].url} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="text-xs text-gray-700 max-w-[120px] truncate">{item.name}</span>
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <p className="font-bold text-gray-900 text-lg">₹{order.totalPrice?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary py-1.5 px-4 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
