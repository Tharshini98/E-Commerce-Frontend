import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import Spinner from "../../components/shared/Spinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const SellerDashboard = () => {
  const [report, setReport] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, ordersRes, productsRes] = await Promise.all([
          API.get("/orders/seller/report"),
          API.get("/orders/seller/orders"),
          API.get("/products/seller/my-products"),
        ]);
        setReport(reportRes.data.report);
        setRecentOrders(ordersRes.data.orders.slice(0, 5));
        setProducts(productsRes.data.products);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-container py-8"><Spinner size="lg" /></div>;

  const chartData = report?.monthlyRevenue
    ? Object.entries(report.monthlyRevenue).map(([month, revenue]) => ({ month, revenue })).slice(-6)
    : [];

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const activeProducts = products.filter((p) => p.isActive).length;

  const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary py-2 text-sm">+ Add Product</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${(report?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="bg-green-50" />
        <StatCard label="Total Orders" value={report?.totalOrders || 0} icon="📦" color="bg-blue-50" />
        <StatCard label="Items Sold" value={report?.totalItemsSold || 0} icon="🛍️" color="bg-purple-50" />
        <StatCard label="Active Products" value={activeProducts} icon="📋" color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400">
              <p>No revenue data yet. Start selling!</p>
            </div>
          )}
        </div>

        {/* Quick Actions + Alerts */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/seller/products/add" className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <span className="text-lg">+</span>
                <span className="text-sm font-medium text-gray-700">Add New Product</span>
              </Link>
              <Link to="/seller/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <span className="text-lg"></span>
                <span className="text-sm font-medium text-gray-700">View All Orders</span>
              </Link>
              <Link to="/seller/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <span className="text-lg"></span>
                <span className="text-sm font-medium text-gray-700">Manage Products</span>
              </Link>
              <Link to="/seller/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <span className="text-lg"></span>
                <span className="text-sm font-medium text-gray-700">Store Settings</span>
              </Link>
            </div>
          </div>

          {outOfStock > 0 && (
            <div className="card bg-red-50 border-red-100">
              <div className="flex items-center gap-2">
                <span className="text-xl"></span>
                <div>
                  <p className="font-semibold text-red-700 text-sm">{outOfStock} out of stock</p>
                  <Link to="/seller/products" className="text-xs text-red-600 underline">Update inventory</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/seller/orders" className="text-sm text-sky-600 hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-4">Order</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-600">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{order.buyer?.name}</td>
                    <td className="py-3 pr-4 font-semibold">₹{order.totalPrice?.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
