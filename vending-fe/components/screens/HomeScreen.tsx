"use client";

import React, { useState, useEffect } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI, Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Loading } from "@/components/ui/Loading";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  // Settings,
  FileText,
  Stethoscope,
  // Pill,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
// import Link from "next/link";
import toast from "react-hot-toast";
import PrescriptionScanModal from "@/components/PrescriptionScanModal";
import Image from "next/image";

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const { setSelectedProduct, setCurrentScreen, isOnline, cartItems } =
    useVendingStore();

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await vendingAPI.getAvailableProducts();
      setProducts(response.products);
      setLastUpdate(new Date());
      toast.success("Produk berhasil dimuat");
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Auto refresh every 5 minutes
    const interval = setInterval(loadProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen("product-detail");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <Loading message="Memuat produk..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-lg shadow-teal-50">
          <div className="flex items-center space-x-4">
            <Image
              src="/MediVendLogo.png"
              alt="MediVend Logo"
              width={50}
              height={50}
              className="object-contain"
            />

            <div>
              <div className="flex items-center gap-3 text-teal-500">
                <Stethoscope className="h-6 w-6" />
                <p className="text-sm font-semibold tracking-wide uppercase">
                  Apotek Digital & Vending Obat
                </p>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                MediVend
              </h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">
                    {products.length} obat tersedia
                  </span>
                </div>
                <button className="flex items-center space-x-1 text-teal-400 hover:text-teal-800">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {isOnline ? (
              <div className="flex items-center border border-emerald-200 bg-emerald-50 text-emerald-500 px-4 py-2 rounded-full shadow-sm">
                <Wifi className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold tracking-wide">
                  Online
                </span>
              </div>
            ) : (
              <div className="flex items-center border border-red-200 bg-red-50 px-4 py-2 rounded-full text-red-600 shadow-sm">
                <WifiOff className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold tracking-wide">
                  Offline
                </span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCurrentScreen("cart")}
              className="relative flex items-center px-5 py-2 rounded-full bg-white border-2 border-teal-400 text-teal-500 shadow-md hover:bg-teal-50 transition-colors"
              title="Lihat Keranjang"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold tracking-wide">
                Keranjang
              </span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Prescription Scan Button */}
            <button
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="flex items-center px-5 py-2 rounded-full bg-teal-400 text-white shadow-lg shadow-teal-100 hover:bg-teal-600 transition-colors"
              title="Scan Resep Dokter"
            >
              <FileText className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold tracking-wide">
                Scan Resep
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadProducts}
              disabled={isLoading}
              className="p-2 rounded-full bg-white/80 text-teal-700 border border-gray-100 shadow-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-700 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </button>

            {/* Admin Button */}
            {/* <Link href="/admin">
              <button className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors shadow-md">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold tracking-wide">
                  Admin
                </span>
              </button>
            </Link> */}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-gray-200 bg-white/70">
            <div className="w-32 h-32 mx-auto mb-6 bg-teal-50 rounded-full flex items-center justify-center shadow-inner">
              <svg
                className="h-16 w-16 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Stok belum tersedia
            </h3>
            <p className="text-gray-500 mb-6">
              Refresh panel untuk menarik data terbaru dari apotek pusat.
            </p>
            <button
              onClick={loadProducts}
              className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Muat ulang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 rounded-3xl border-2 border-gray-100 bg-white/85 p-6 shadow-xl shadow-teal-50">
            {products.map((product) => (
              <div
                key={product.id}
                className="animate-fadeIn rounded-2xl bg-white/95 ring-1 ring-gray-50/80 shadow-sm shadow-gray-100 hover:-translate-y-1 hover:ring-gray-200 hover:shadow-xl transition-transform"
              >
                <ProductCard
                  product={product}
                  onSelect={handleProductSelect}
                  disabled={!isOnline}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Status */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-teal-500" />
            <p>Last update {formatTime(lastUpdate)}</p>
          </div>
        </div>
      </div>

      {/* Prescription Scan Modal */}
      <PrescriptionScanModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onAddToCart={handleProductSelect}
      />
    </div>
  );
};

export default HomeScreen;
