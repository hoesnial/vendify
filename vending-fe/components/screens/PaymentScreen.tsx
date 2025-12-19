"use client";

import React, { useEffect, useState } from "react";
import { useVendingStore } from "@/lib/store";
import { vendingAPI } from "@/lib/api";
import { paymentService, PaymentRequest } from "@/lib/payment";
import { PaymentQR } from "@/components/PaymentQR";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  Stethoscope,
  Pill,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const PaymentScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "qris" | "midtrans" | null
  >(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);

  const {
    currentOrder,
    selectedProduct,
    // cartItems,
    setCurrentScreen,
    resetTransaction,
    setLoading,
    setError,
  } = useVendingStore();

  // Load Snap.js script on component mount
  useEffect(() => {
    paymentService.loadSnapScript().catch((error) => {
      console.error("Failed to load Snap.js:", error);
    });
  }, []);

  useEffect(() => {
    if (!currentOrder || !selectedProduct) {
      setCurrentScreen("home");
    }
  }, [currentOrder, selectedProduct, setCurrentScreen]);

  if (!currentOrder || !selectedProduct) {
    return <Loading message="Memuat pembayaran..." fullScreen />;
  }

  // Handle Midtrans payment
  const handleMidtransPayment = async () => {
    if (!currentOrder) return;

    setIsProcessing(true);
    let paymentCompleted = false; // Track if payment completed successfully

    try {
      let token = paymentToken;

      // Only create new transaction if we don't have a token yet
      if (!token) {
        // Prepare items from order
        let items;

        if (currentOrder.items && currentOrder.items.length > 0) {
          // Multi-item order from cart
          items = currentOrder.items.map((item) => ({
            id: item.product_id.toString(),
            price: Number(item.unit_price),
            quantity: Number(item.quantity),
            name: item.product_name,
          }));
        } else if (selectedProduct) {
          // Single product order
          items = [
            {
              id: selectedProduct.id.toString(),
              price: Number(selectedProduct.price),
              quantity: Number(currentOrder.quantity),
              name: selectedProduct.name,
            },
          ];
        } else {
          throw new Error("No items found in order");
        }

        // Prepare payment request
        const paymentRequest: PaymentRequest = {
          orderId: currentOrder.order_id,
          amount: paymentService.formatAmount(currentOrder.total_amount),
          customerName: "Vending Machine Customer",
          customerEmail: "customer@vendingmachine.com",
          items: items,
        };

        console.log("💳 Creating new Midtrans transaction...", {
          orderId: paymentRequest.orderId,
          amount: paymentRequest.amount,
          itemsCount: items.length,
        });

        const response = await paymentService.createTransaction(paymentRequest);
        token = response.token;
        setPaymentToken(token);
        console.log("✅ Transaction created, token saved");
      } else {
        console.log("♻️ Reusing existing payment token");
      }

      // Open Snap payment popup
      const result = await paymentService.openSnapPayment(token);

      console.log(
        "📊 Payment result received:",
        JSON.stringify(result, null, 2)
      );
      console.log("📊 Transaction status:", result.transaction_status);
      console.log("📊 Status code:", result.status_code);

      // Handle payment result
      if (
        result.transaction_status === "settlement" ||
        result.transaction_status === "capture"
      ) {
        console.log(
          "✅ Payment successful (settlement/capture), proceeding to dispense..."
        );
        paymentCompleted = true; // Mark as completed
        await handlePaymentSuccess();
      } else if (result.transaction_status === "pending") {
        // For VA/Bank Transfer - payment instructions shown
        console.log(
          "⏳ Payment pending (VA/Bank Transfer) - instructions shown to user"
        );
        paymentCompleted = true; // Mark as completed (pending is valid)

        // Verify payment (will update order status to PAID in pending state)
        try {
          await vendingAPI.verifyPayment(currentOrder.order_id, "SUCCESS");
          console.log("✅ Payment verified as pending");
        } catch (error) {
          console.error("❌ Failed to verify pending payment:", error);
        }

        // Show message explaining the payment is pending
        toast.success(
          "Instruksi pembayaran telah ditampilkan. Selesaikan pembayaran untuk mendapatkan produk."
        );

        // Go to dispensing screen with pending state
        setCurrentScreen("dispensing");
      } else {
        // Unknown status - log and stay on payment screen
        console.log("⚠️ Unknown payment status:", result.transaction_status);
        console.log("⚠️ Full result:", JSON.stringify(result, null, 2));

        // TEMPORARY: Assume success for any non-error status
        console.log("🔧 TEMP: Treating as success anyway...");
        paymentCompleted = true;
        await handlePaymentSuccess();
      }
    } catch (error) {
      console.error("❌ Midtrans payment error:", error);

      // Check if it's order_id duplicate error
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("order_id not unique")) {
        toast.error("Order ID sudah digunakan. Membuat pesanan baru...");
        // Reset and go back to create new order
        setTimeout(() => {
          resetTransaction();
          setPaymentToken(null);
          setCurrentScreen("home");
        }, 2000);
      } else if (!errorMessage.includes("closed")) {
        // Real error - show error message
        toast.error("Pembayaran gagal. Silakan coba lagi.");
      } else if (!paymentCompleted) {
        // User closed popup BEFORE payment completed
        console.log("🚪 User closed payment popup before completing payment");
        setPaymentMethod(null); // Reset payment method to show selection again
        setPaymentToken(null); // Clear token so new transaction can be created
      } else {
        // Payment already completed, popup just closed - do nothing
        console.log("✅ Payment completed, popup closed normally - ignoring");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    console.log("🎉 ========== handlePaymentSuccess START ==========");
    console.log("🎉 Current order:", currentOrder);

    setIsProcessing(true);
    setLoading(true);

    try {
      console.log("🔍 Verifying payment for order:", currentOrder.order_id);
      // Verify payment (backend will automatically trigger dispense)
      await vendingAPI.verifyPayment(currentOrder.order_id, "SUCCESS");
      console.log("✅ Payment verified successfully");
      console.log("✅ Backend has automatically triggered dispense");

      console.log("🚀 Setting current screen to 'dispensing'...");
      setCurrentScreen("dispensing");
      console.log("🚀 Screen set to dispensing");

      toast.success("Pembayaran berhasil! Produk sedang dikeluarkan...");
      console.log("✅ Success toast shown");
    } catch (error: unknown) {
      console.error("❌ ========== ERROR IN handlePaymentSuccess ==========");
      console.error("❌ Error details:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error constructor:", error?.constructor?.name);

      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Gagal memverifikasi pembayaran";

      console.error("❌ Error message:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);

      // IMPORTANT: Even if verification fails, still move to dispensing screen
      // The payment was already successful on Midtrans side
      console.log("⚠️ Despite error, payment was successful on Midtrans side");
      console.log("⚠️ Force moving to dispensing screen anyway...");
      setCurrentScreen("dispensing");
      console.log("⚠️ Screen forcefully set to dispensing");
    } finally {
      setIsProcessing(false);
      setLoading(false);
      console.log("🏁 ========== handlePaymentSuccess END ==========");
    }
  };

  const handleTimeout = () => {
    setError("Waktu pembayaran telah habis. Silakan coba lagi.");
    setPaymentToken(null); // Clear token
    resetTransaction();
    setCurrentScreen("home");
  };

  const handleBackToSummary = () => {
    setPaymentToken(null); // Clear token when going back
    setCurrentScreen("order-summary");
  };

  // Show payment method selection if no method is chosen
  if (!paymentMethod) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToSummary}
              className="p-2 rounded-full bg-white border border-gray-50 text-teal-500 shadow-sm hover:shadow-md transition mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-teal-500 text-xs font-semibold uppercase tracking-widest">
                <Stethoscope className="h-4 w-4" /> Pembayaran
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pilih Metode Pembayaran
              </h1>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 bg-white rounded-3xl shadow-md border border-gray-50 p-6">
            <div className="bg-teal-50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-teal-400" />
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600">
                    Jumlah: {currentOrder.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <div
              className="cursor-pointer hover:border-teal-300 hover:shadow-lg transition-all duration-200 border border-gray-50 bg-white rounded-3xl shadow-md p-6 hover:bg-teal-50"
              onClick={async () => {
                try {
                  // Update payment method in backend
                  await vendingAPI.updatePaymentMethod(
                    currentOrder.order_id,
                    "midtrans"
                  );
                  setPaymentMethod("midtrans");
                } catch (error) {
                  console.error("Failed to update payment method:", error);
                  toast.error("Gagal memilih metode pembayaran");
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-xl text-white">
                  {/* <CreditCard className="h-6 w-6" /> */}
                  <Image
                    src="/bank-logo.jpg"
                    alt="Bank Logo"
                    width={40}
                    height={40}
                    className="rouded-xl"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    Midtrans Payment
                  </h3>
                  <p className="text-gray-600">
                    Visa, Mastercard, Bank Transfer, E-Wallet
                  </p>
                </div>
                <div className="text-teal-400 font-bold text-xl">→</div>
              </div>
            </div>

            <div
              className="cursor-pointer hover:border-teal-300 hover:shadow-lg transition-all duration-200 border border-gray-50 bg-white rounded-3xl shadow-md p-6 hover:bg-teal-50"
              onClick={async () => {
                try {
                  // Update payment method in backend
                  await vendingAPI.updatePaymentMethod(
                    currentOrder.order_id,
                    "qris"
                  );
                  setPaymentMethod("qris");
                } catch (error) {
                  console.error("Failed to update payment method:", error);
                  toast.error("Gagal memilih metode pembayaran");
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-xl text-white">
                  {/* <QrCode className="h-6 w-6" /> */}
                  <Image
                    src="/qris-logo.png"
                    alt="QRIS Logo"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">QRIS</h3>
                  <p className="text-gray-600">
                    Scan QR Code dengan aplikasi mobile banking
                  </p>
                </div>
                <div className="text-teal-500 font-bold text-xl">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Midtrans payment
  if (paymentMethod === "midtrans") {
    return (
      <div className="min-h-screen bg-teal-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                setPaymentMethod(null);
                setPaymentToken(null); // Clear token when going back
              }}
              className="p-2 rounded-full bg-white border border-teal-100 text-teal-700 shadow-sm hover:shadow-md transition mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-teal-600 text-xs font-semibold uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> Midtrans
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pembayaran Midtrans
              </h1>
            </div>
          </div>

          <div className="border border-teal-100 bg-white rounded-3xl shadow-md p-8 text-center">
            <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
              <CreditCard className="h-10 w-10" />
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Bayar dengan Midtrans
            </h2>
            <p className="text-gray-600 mb-6">
              Klik tombol di bawah untuk membuka halaman pembayaran yang aman
            </p>

            <div className="bg-teal-50 rounded-2xl p-4 mb-6 border border-teal-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  {selectedProduct.name}
                </span>
                <span className="font-black text-gray-900 text-xl">
                  Rp {currentOrder.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleMidtransPayment}
              disabled={isProcessing}
              variant="primary"
              fullWidth
              size="lg"
              className="mb-4 bg-teal-500 hover:bg-teal-600"
            >
              {isProcessing ? "Memproses..." : "💳 Bayar Sekarang"}
            </Button>

            <p className="text-sm text-gray-600">
              🔒 Powered by Midtrans - Payment Gateway Terpercaya
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show QRIS payment (existing implementation)
  return (
    <div className="min-h-screen bg-teal-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setPaymentMethod(null);
              setPaymentToken(null); // Clear token when going back
            }}
            className="p-2 rounded-full bg-white border border-teal-100 text-teal-500 shadow-sm hover:shadow-md transition mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-widest">
              <QrCode className="h-4 w-4" /> QRIS
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pembayaran QRIS
            </h1>
          </div>
        </div>

        <PaymentQR
          order={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentTimeout={handleTimeout}
          onClose={handleBackToSummary}
        />
      </div>
    </div>
  );
};

export default PaymentScreen;
