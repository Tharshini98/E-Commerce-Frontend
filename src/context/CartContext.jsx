import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart({ items: [] });
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const { data } = await API.get("/cart");
      setCart(data.cart);
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) { toast.error("Please login to add items to cart"); return; }
    try {
      const { data } = await API.post("/cart/add", { productId, quantity });
      setCart(data.cart);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await API.put(`/cart/item/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await API.delete(`/cart/item/${itemId}`);
      setCart(data.cart);
      toast.success("Item removed");
    } catch {}
  };

  const clearCart = async () => {
    try {
      await API.delete("/cart/clear");
      setCart({ items: [] });
    } catch {}
  };

  const cartCount = cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
