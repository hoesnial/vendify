"use client";

import React, { useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import {
  ArrowLeft,
  Smartphone,
  ClipboardCheck,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import toast from "react-hot-toast";

const OrderSummaryScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  const {
    selectedProduct,
    quantity,
    cartItems,
    setCurrentOrder,
    setCurrentScreen,
    setLoading,
    setError,
    clearCart,
  } = useVendingStore();

  // Check if cart has items or single product selected
  const hasCartItems = cartItems.length > 0;
  const hasSingleProduct = selectedProduct && quantity > 0;

  if (!hasCartItems && !hasSingleProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tidak ada produk dipilih</p>
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

  // Calculate total for cart or single product
  const displayItems = hasCartItems
    ? cartItems.map((item) => ({
        name: item.product.name,
        description: item.product.description,
        quantity: item.quantity,
        unitPrice: item.product.final_price ?? item.product.price,
        slot_id: item.product.slot_id,
      }))
    : selectedProduct
    ? [
        {
          name: selectedProduct.name,
          description: selectedProduct.description,
          quantity,
          unitPrice: selectedProduct.final_price ?? selectedProduct.price,
          slot_id: selectedProduct.slot_id,
        },
      ]
    : [];

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const tax = subtotal * 0.11;
  const totalPrice = subtotal + tax;

  const handleBack = () => {
    if (hasCartItems) {
      setCurrentScreen("cart");
    } else {
      setCurrentScreen("product-detail");
    }
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    setLoading(true);

    try {
      let order;

      if (hasCartItems) {
        // Multi-item order
        const orderData = {
          items: cartItems.map((item) => ({
            slot_id: item.product.slot_id!,
            quantity: item.quantity,
          })),
          ...(customerPhone && { customer_phone: customerPhone }),
        };

        console.log("Creating multi-item order:", orderData);
        order = await vendingAPI.createMultiItemOrder(orderData);

        // Clear cart after successful order
        clearCart();
      } else if (selectedProduct?.slot_id) {
        // Single item order
        const orderData = {
          slot_id: selectedProduct.slot_id,
          quantity,
          ...(customerPhone && { customer_phone: customerPhone }),
        };

        console.log("Creating single order:", orderData);
        order = await vendingAPI.createOrder(orderData);
      } else {
        toast.error("Slot produk tidak ditemukan");
        return;
      }

      console.log("Order created successfully:", order);

      // Clear any existing Midtrans token for this order ID to prevent conflicts
      const storageKey = `midtrans_token_${order.order_id}`;
      localStorage.removeItem(storageKey);
      console.log("🗑️ Cleared existing Midtrans token from cache");

      setCurrentOrder(order);
      setCurrentScreen("payment");
      toast.success("Pesanan berhasil dibuat");
    } catch (error: unknown) {
      console.error("Failed to create order:", error);
      console.error("Error details:", {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        response: (error as { response?: unknown })?.response,
        status: (error as { response?: { status?: number } })?.response?.status,
        data: (error as { response?: { data?: unknown } })?.response?.data,
      });

      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Gagal membuat pesanan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Format as Indonesian phone number
    if (numbers.startsWith("0")) {
      return numbers.replace(/^0/, "+62 ");
    } else if (numbers.startsWith("62")) {
      return "+" + numbers;
    } else if (numbers.startsWith("8")) {
      return "+62 " + numbers;
    }

    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="p-2 rounded-full bg-white border border-gray-50 text-teal-500 shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-teal-500 text-xs font-semibold uppercase tracking-[0.2em]">
              <Stethoscope className="h-4 w-4" /> Pesanan Obat
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {quantity}
          </div>
        </div>

        {/* Cart Items - Rounded container */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-md border border-gray-100">
          {/* Product Items */}
          <div className="space-y-3 mb-6">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-teal-50 rounded-2xl p-3 border border-teal-50"
              >
                {/* Product Image */}
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-teal-50 text-teal-400">
                  <Pill className="h-6 w-6" />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold">
                    {item.name}
                    <span className="text-teal-500 ml-2 text-xs">
                      x{item.quantity}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {item.description || "Produk"}
                  </p>
                </div>

                {/* Price */}
                <div className="bg-teal-400 text-white font-bold px-3 py-1.5 rounded-full text-sm">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Tax & Total Card */}
          <div className="bg-teal-50 rounded-2xl p-5 border border-teal-50">
            <div className="relative z-10">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Subtotal</span>
                <span className="text-gray-900 font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Tax Amount */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-teal-100">
                <span className="text-teal-500 font-semibold text-sm flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" /> Tax (11%)
                </span>
                <span className="text-gray-900 font-bold">
                  {formatPrice(tax)}
                </span>
              </div>

              {/* Total Amount */}
              <div>
                <p className="text-teal-500 font-semibold text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Total Amount
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info (Optional) */}
        {customerPhone && (
          <div className="bg-white rounded-2xl p-3 mb-4 border border-teal-100 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-900">
              <Smartphone className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium">{customerPhone}</span>
            </div>
          </div>
        )}

        {/* Make Payment Button */}
        <button
          onClick={handleCreateOrder}
          disabled={isLoading}
          className="w-full bg-teal-400 hover:bg-teal-500 text-white font-bold text-lg py-5 rounded-2xl shadow-md transition-all hover:scale-x-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loading />
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            <>
              <span>Make Payment</span>
            </>
          )}
        </button>

        {/* Optional: Phone Input */}
        <div className="mt-4">
          <details className="bg-white rounded-2xl border border-gray-50 overflow-hidden shadow-sm">
            <summary className="p-3 cursor-pointer text-gray-900 font-medium flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="flex items-center space-x-2 text-sm">
                <Smartphone className="h-4 w-4 text-teal-600" />
                <span>Add Contact (Optional)</span>
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="p-3 pt-0 bg-teal-50/60">
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="+62 812-3456-7890"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-600 mt-1.5">
                For order status notifications
              </p>
            </div>
          </details>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-600 text-center mt-4">
          <p className="inline-flex items-center gap-1 text-teal-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment will expire in 15
            minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryScreen;
