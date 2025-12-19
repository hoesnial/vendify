import HealthAssistant from "@/components/HealthAssistant";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HealthAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-800">
              Asisten Kesehatan AI
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Informasi Obat</h3>
              <p className="text-sm text-gray-600">
                Tanyakan tentang kegunaan, dosis, dan efek samping obat-obatan
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Tips Kesehatan</h3>
              <p className="text-sm text-gray-600">
                Dapatkan saran untuk gaya hidup sehat dan pencegahan penyakit
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Gejala Penyakit</h3>
              <p className="text-sm text-gray-600">
                Pelajari gejala dan cara mengatasi penyakit umum
              </p>
            </div>
          </div>

          {/* Chatbot Component */}
          <HealthAssistant />

          {/* Disclaimer */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-yellow-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="font-bold text-yellow-800 mb-1">
                  Perhatian Penting
                </h4>
                <p className="text-sm text-yellow-700">
                  Asisten ini memberikan informasi umum dan tidak menggantikan
                  konsultasi medis profesional. Untuk kondisi serius atau
                  darurat, segera hubungi dokter atau layanan kesehatan
                  terdekat. Jangan menggunakan informasi ini sebagai dasar
                  diagnosis atau pengobatan tanpa berkonsultasi dengan tenaga
                  medis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
