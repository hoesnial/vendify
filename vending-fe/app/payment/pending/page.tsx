"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, Home, RefreshCw } from "lucide-react";
import { paymentService } from "@/lib/payment";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Memverifikasi status pembayaran..."
  );

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return;

    setIsChecking(true);
    try {
      const status = await paymentService.checkPaymentStatus(orderId);

      if (
        status.transaction_status === "settlement" ||
        status.transaction_status === "capture"
      ) {
        router.push(
          `/payment/success?order_id=${orderId}&transaction_status=${status.transaction_status}`
        );
      } else if (
        status.transaction_status === "deny" ||
        status.transaction_status === "cancel" ||
        status.transaction_status === "expire"
      ) {
        router.push(
          `/payment/error?order_id=${orderId}&status_code=${status.status_code}`
        );
      } else {
        setStatusMessage(
          "Pembayaran masih dalam proses. Silakan tunggu sebentar..."
        );
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatusMessage("Gagal memeriksa status pembayaran. Silakan coba lagi.");
    } finally {
      setIsChecking(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      // Check status immediately
      checkPaymentStatus();

      // Check status every 10 seconds
      const interval = setInterval(checkPaymentStatus, 10000);

      // Auto redirect after 5 minutes
      const timeout = setTimeout(() => {
        router.push("/");
      }, 300000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [orderId, checkPaymentStatus, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Pembayaran Dalam Proses
          </h1>

          <p className="text-gray-600 mb-6">
            Pembayaran Anda sedang diproses. Mohon tunggu konfirmasi.
            {orderId && (
              <>
                <br />
                <span className="text-sm">Order ID: {orderId}</span>
              </>
            )}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">{statusMessage}</p>
            {isChecking && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mx-auto"></div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={checkPaymentStatus}
              variant="primary"
              fullWidth
              disabled={isChecking}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
              />
              {isChecking ? "Memeriksa..." : "Periksa Status"}
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              fullWidth
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Status akan diperiksa otomatis setiap 10 detik
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentPendingContent />
    </Suspense>
  );
}
