"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Home } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Pembayaran Berhasil!
          </h1>

          <p className="text-gray-600 mb-6">
            Terima kasih! Pembayaran Anda telah berhasil diproses.
            {orderId && (
              <>
                <br />
                <span className="text-sm">Order ID: {orderId}</span>
              </>
            )}
          </p>

          {transactionStatus && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-800">
                Status: {transactionStatus}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Produk Anda sedang disiapkan. Silakan ambil di mesin vending.
          </p>

          <Button onClick={() => router.push("/")} variant="primary" fullWidth>
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            Halaman ini akan otomatis kembali ke beranda dalam 10 detik
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  );
}
