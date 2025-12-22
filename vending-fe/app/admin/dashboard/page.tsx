"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Bell,
  Lock,
  DollarSign,
  AlertTriangle,
  Info,
  Thermometer,
  CheckCircle,
  Package,
  TrendingUp,
  Activity as ActivityIcon,
  ShoppingBag,
  User,
  History,
  LayoutGrid,
} from "lucide-react";

interface DashboardStats {
  salesToday: number;
  criticalAlerts: number;
  temperature: number;
  lowStockItems: number;
}

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  time: string;
}

interface Activity {
  id: string;
  type: "sale" | "login" | "restock";
  title: string;
  time: string;
  value?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);
  const [stats] = useState<DashboardStats>({
    salesToday: 1240.5,
    criticalAlerts: 4,
    temperature: 3.5,
    lowStockItems: 12,
  });

  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      type: "error",
      title: "Macet - Slot A4",
      message: "Motor dispenser gagal berputar.",
      time: "5 mnt lalu",
    },
    {
      id: "2",
      type: "warning",
      title: "Kertas Struk Habis",
      message: "Status printer < 10%.",
      time: "15 mnt lalu",
    },
    {
      id: "3",
      type: "info",
      title: "Update Tersedia",
      message: "Versi 2.4.1 siap diunduh.",
      time: "1 jam lalu",
    },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "sale",
      title: "Penjualan #9921",
      time: "2 mnt lalu",
      value: "Rp 12.500",
    },
    {
      id: "2",
      type: "login",
      title: "Login Admin",
      time: "15 mnt lalu",
      value: "ID: ADM-01",
    },
    {
      id: "3",
      type: "restock",
      title: "Restock Zona B",
      time: "1 jam lalu",
      value: "+45 items",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (!token) {
      router.replace("/admin");
      return;
    }

    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, [router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-amber-50/20 font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="h-auto shrink-0 px-8 py-6 bg-white/50 backdrop-blur-sm border-b border-amber-100 z-10 sticky top-0">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-amber-900 text-3xl font-black tracking-tight">
                Dashboard Utama
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-gray-500 text-sm font-medium">
                  Sistem Operasional | Sinkronisasi: Baru saja
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-amber-900 font-bold text-sm shadow-sm hover:shadow-md transition-all">
                <Bell className="h-4 w-4 text-amber-500" />
                <span>Notifikasi ({stats.criticalAlerts})</span>
              </button>
              <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border border-transparent font-bold text-sm shadow-md hover:shadow-lg transition-all">
                <Lock className="h-4 w-4" />
                <span>Kunci Layar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-6">
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Sales Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-amber-100/50 border border-amber-50 flex flex-col justify-between h-40 relative group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-4 right-4 p-2 bg-amber-100 rounded-xl text-amber-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Penjualan Hari Ini
                </p>
                <p className="text-amber-900 text-3xl font-black tracking-tight">
                  Rp {stats.salesToday.toLocaleString("id-ID")}
                  <span className="text-lg text-gray-400 font-bold">rb</span>
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                <span>+12% vs rata-rata</span>
              </div>
            </div>

            {/* Alerts Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-red-100/50 border border-red-50 flex flex-col justify-between h-40 relative group hover:border-red-200 transition-colors cursor-pointer">
              <div className="absolute top-4 right-4 p-2 bg-red-100 rounded-xl text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Alert Kritikal
                </p>
                <p className="text-gray-900 text-3xl font-black tracking-tight">
                  {stats.criticalAlerts}
                </p>
              </div>
              <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 w-fit px-2 py-1 rounded-lg">
                <span>Perlu Perhatian</span>
              </div>
            </div>

            {/* Temp Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-blue-100/50 border border-blue-50 flex flex-col justify-between h-40 relative group">
              <div className="absolute top-4 right-4 p-2 bg-blue-100 rounded-xl text-blue-500">
                <Thermometer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Suhu Internal
                </p>
                <p className="text-gray-900 text-3xl font-black tracking-tight">
                  {stats.temperature}°C
                </p>
              </div>
              <div className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 w-fit px-2 py-1 rounded-lg">
                <CheckCircle className="h-3 w-3" />
                <span>Stabil</span>
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-orange-100/50 border border-orange-50 flex flex-col justify-between h-40 relative group cursor-pointer hover:border-orange-200 transition-colors">
              <div className="absolute top-4 right-4 p-2 bg-orange-100 rounded-xl text-orange-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Stok Menipis
                </p>
                <p className="text-gray-900 text-3xl font-black tracking-tight">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="flex items-center gap-1 text-orange-600 text-xs font-bold bg-orange-50 w-fit px-2 py-1 rounded-lg">
                <span>Restock Segera</span>
              </div>
            </div>
          </section>

          {/* Main Interactive Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
            {/* Quick Actions Grid (Takes up 2 columns) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h3 className="text-amber-900 text-xl font-bold tracking-tight flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-amber-500" /> Aksi Cepat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Action Item 1 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all text-left group h-40 justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Riwayat Suhu
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      Cek pendingin & grafik suhu
                    </p>
                  </div>
                </button>

                {/* Action Item 2 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all text-left group h-40 justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4 px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Penting
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Manajemen Stok
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      Isi ulang slot & update jumlah
                    </p>
                  </div>
                </button>

                {/* Action Item 3 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all text-left group h-40 justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Log Transaksi
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      Lihat pembelian terakhir & error
                    </p>
                  </div>
                </button>

                {/* Action Item 4 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all text-left group h-40 justify-between">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                    <ActivityIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Katalog Produk
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      Atur item & harga
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Side Panel (Alerts & Recent) */}
            <div className="flex flex-col gap-6 h-full">
              {/* Critical Alerts Panel */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-sm h-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900 text-lg font-bold tracking-tight">
                    Alert Sistem
                  </h3>
                  <button className="text-xs text-amber-500 font-bold hover:text-amber-600 uppercase tracking-wide">
                    Lihat Semua
                  </button>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-amber-200">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex gap-3 p-3 rounded-xl items-start ${
                        alert.type === "error"
                          ? "bg-red-50 border border-red-100"
                          : alert.type === "warning"
                          ? "bg-orange-50 border border-orange-100"
                          : "bg-blue-50 border border-blue-100"
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {alert.type === "error" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : alert.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                      </span>
                      <div>
                        <p className="text-gray-900 font-bold text-sm">
                          {alert.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Mini List */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
                <h3 className="text-gray-900 text-lg font-bold tracking-tight">
                  Aktivitas Terbaru
                </h3>
                <div className="flex flex-col gap-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === "sale"
                              ? "bg-green-100 text-green-600"
                              : activity.type === "login"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {activity.type === "sale" ? (
                            <ShoppingBag className="h-4 w-4" />
                          ) : activity.type === "login" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Package className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm ${
                          activity.type === "sale"
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-500"
                        }`}
                      >
                        {activity.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center pb-6 opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-xs text-amber-900 font-mono">
              Vendify System v2.0 • Status: OK • Server: sg-1
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
