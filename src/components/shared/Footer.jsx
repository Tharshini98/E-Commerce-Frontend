import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SN</span>
            </div>
            <span className="font-display font-bold text-xl text-white">ShopNest</span>
          </div>
          <p className="text-sm text-gray-400">Your complete shopping destination for buyers and sellers alike.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-sky-400 transition-colors">All Products</Link></li>
            <li><Link to="/cart" className="hover:text-sky-400 transition-colors">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-sky-400 transition-colors">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Sellers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-sky-400 transition-colors">Sell on ShopNest</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-sky-400 transition-colors">Seller Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-gray-400">help@shopnest.com</span></li>
            <li><span className="text-gray-400">Secure payments via Razorpay</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} ShopNest. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
