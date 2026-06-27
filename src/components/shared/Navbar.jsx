import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCartShopping, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SN</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">ShopNest</span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/products?keyword=${e.target.value}`);
                }}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              />
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                {user?.role !== "seller" && (
                  <Link to="/cart" className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors">
                    <FontAwesomeIcon icon={faCartShopping} className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-sky-700 font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name?.split(" ")[0]}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>

                      {user?.role === "seller" ? (
                        <>
                          <NavMenuItem to="/seller/dashboard" label="Dashboard" onClick={() => setUserMenuOpen(false)} />
                          <NavMenuItem to="/seller/products" label="My Products" onClick={() => setUserMenuOpen(false)} />
                          <NavMenuItem to="/seller/orders" label="Orders" onClick={() => setUserMenuOpen(false)} />
                          <NavMenuItem to="/seller/profile" label="Store Profile" onClick={() => setUserMenuOpen(false)} />
                        </>
                      ) : (
                        <>
                          <NavMenuItem to="/profile" label="My Profile" onClick={() => setUserMenuOpen(false)} />
                          <NavMenuItem to="/orders" label="My Orders" onClick={() => setUserMenuOpen(false)} />
                          <NavMenuItem to="/wishlist" label="Wishlist" onClick={() => setUserMenuOpen(false)} />
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </nav>
  );
};

const NavMenuItem = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors">
    {label}
  </Link>
);

export default Navbar;