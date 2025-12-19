"use client";

import React from "react";
import Image from "next/image";
import { useVendingStore } from "@/lib/store";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CartScreen: React.FC = () => {
  const { cartItems, setCurrentScreen, removeFromCart, updateCartQuantity } =
    useVendingStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/images/placeholder-product.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    return `${backendUrl}${imageUrl}`;
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.product.final_price ?? item.product.price) * item.quantity,
    0
  );
  const serviceFee = 5000;
  const total = subtotal + serviceFee;

  const handleBack = () => {
    setCurrentScreen("home");
  };

  const handleRemove = (productId: number) => {
    removeFromCart(productId);
    toast.success("Produk dihapus dari keranjang");
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= 10) {
        updateCartQuantity(productId, newQuantity);
      }
    }
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    // Navigate to order summary for multi-item checkout
    setCurrentScreen("order-summary");
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC] p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-gray-600 mb-6">
            Belum ada produk di keranjang Anda
          </p>
          <button
            onClick={handleBack}
            className="w-full bg-teal-400 text-white font-bold py-4 rounded-xl text-lg hover:bg-teal-500 transition-all"
          >
            Mulai Belanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[90vh] max-h-[960px]">
        {/* Header */}
        <header className="p-6 flex items-center border-b border-gray-200">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-center flex-grow text-gray-800">
            Your Cart
          </h1>
          <div className="w-8"></div>
        </header>

        {/* Cart Items */}
        <main className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.map((item) => {
            const unitPrice = item.product.final_price ?? item.product.price;
            return (
              <div
                key={item.product.id}
                className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.product.image_url)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {item.product.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {formatPrice(unitPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(item.product.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-teal-400 font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-lg">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, 1)}
                      disabled={item.quantity >= 10}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-400 text-white font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-500 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-gray-200">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service Fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="w-full bg-teal-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-teal-400/30 hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-400/50 transition-transform transform hover:scale-105"
          >
            Proceed to Payment
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CartScreen;
