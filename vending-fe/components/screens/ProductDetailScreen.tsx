"use client";

import React from "react";
import Image from "next/image";
import { useVendingStore } from "@/lib/store";
import { CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Plus,
  Minus,
  Stethoscope,
  Pill,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const ProductDetailScreen: React.FC = () => {
  const {
    selectedProduct,
    quantity,
    setQuantity,
    setCurrentScreen,
    resetTransaction,
    addToCart,
  } = useVendingStore();

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produk tidak ditemukan</p>
          <Button variant="primary" onClick={() => setCurrentScreen("home")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/images/placeholder-product.jpg";

    // If already full URL, return as is
    if (imageUrl.startsWith("http")) return imageUrl;

    // If relative path, add backend URL
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    return `${backendUrl}${imageUrl}`;
  };

  const unitPrice = selectedProduct.final_price ?? selectedProduct.price;
  const totalPrice = unitPrice * quantity;
  const maxQuantity = Math.min(10, selectedProduct.current_stock ?? 0);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleBack = () => {
    resetTransaction();
    setCurrentScreen("home");
  };

  const handleContinue = () => {
    setCurrentScreen("order-summary");
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      toast.success(`${selectedProduct.name} ditambahkan ke keranjang`);
      // Reset quantity and go back to home to continue shopping
      setQuantity(1);
      setCurrentScreen("home");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/90 border border-gray-100 text-teal-400 shadow-sm hover:shadow-lg transition-shadow mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-teal-500 font-semibold uppercase tracking-wide text-xs">
              <Stethoscope className="h-4 w-4" /> Detail Produk
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Informasi Obat</h1>
          </div>
        </div>

        <div className="bg-white/95 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 p-6">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative h-64 w-full rounded-2xl bg-white p-2 shadow-inner">
                  <Image
                    src={getImageUrl(selectedProduct.image_url)}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover rounded-2xl ring-1 ring-gray-100"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Stock & Slot Info */}
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Stok:</span>
                    <span
                      className={`font-semibold ${
                        (selectedProduct.current_stock ?? 0) > 5
                          ? "text-teal-400"
                          : "text-orange-600"
                      }`}
                    >
                      {selectedProduct.current_stock} pcs
                    </span>
                  </div>

                  {selectedProduct.slot_number && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Slot:</span>
                      <span className="font-semibold">
                        {selectedProduct.slot_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                {/* Category */}
                {selectedProduct.category && (
                  <div className="inline-block">
                    <span className="px-3 py-1 bg-teal-50 text-teal-500 text-sm rounded-full font-semibold border border-gray-100">
                      {selectedProduct.category}
                    </span>
                  </div>
                )}
                {/* Price */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-teal-500" /> Harga per unit
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(unitPrice)}
                  </p>
                </div>{" "}
                {/* Quantity Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Jumlah:
                  </label>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 bg-white/90 text-teal-500 border border-gray-100 hover:bg-teal-50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="w-16 text-center">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val >= 1 && val <= maxQuantity) {
                            setQuantity(val);
                          }
                        }}
                        min={1}
                        max={maxQuantity}
                        className="w-full px-3 py-2 text-center rounded-2xl border border-gray-100 bg-white/90 focus:outline-none focus:ring-1 focus:ring-teal-200"
                      />
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="p-2 bg-white/90 text-teal-500 border border-gray-100 hover:bg-teal-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Maksimal {maxQuantity} pcs
                  </p>
                </div>
                {/* Total Price */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center rounded-2xl bg-teal-50 p-4">
                    <span className="text-lg font-semibold text-teal-500 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" /> Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    className="bg-teal-400 text-white shadow-lg shadow-teal-100 hover:bg-teal-500"
                  >
                    Tambah ke Keranjang
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                    className="bg-teal-500 text-white shadow-lg shadow-teal-100 hover:bg-teal-600"
                  >
                    Beli Sekarang
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={handleBack}
                    className="border border-teal-100 text-teal-500 hover:bg-teal-50"
                  >
                    Pilih Produk Lain
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailScreen;
