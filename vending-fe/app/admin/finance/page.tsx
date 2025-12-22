"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Download,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

interface KPIStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  avgTransaction: number;
}

interface TopProduct {
  id: string;
  name: string;
  productId: string;
  revenue: number;
  units: number;
  image: string;
}

interface Transaction {
  id: string;
  type: "purchase" | "warning";
  title: string;
  amount?: string;
  details: string;
  time: string;
}

export default function FinancePage() {
  const router = useRouter();
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">(
    "month"
  );

  const [stats] = useState<KPIStats>({
    totalRevenue: 12450000.0,
    totalExpenses: 4200000.0,
    netProfit: 8250000.0,
    avgTransaction: 15500.0,
  });

  const [topProducts] = useState<TopProduct[]>([
    {
      id: "1",
      name: "Keripik Singkong Balado",
      productId: "SNK-001",
      revenue: 800000.0,
      units: 140,
      image:
        "https://down-id.img.susercontent.com/file/id-11134207-7r98o-lsth7i5g3g7n4e",
    },
    {
      id: "2",
      name: "Good Time Cookies",
      productId: "SNK-045",
      revenue: 650000.0,
      units: 45,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/9/5/124e4d6d-6386-4f7f-a63e-787f0be0684f.jpg",
    },
    {
      id: "3",
      name: "Teh Botol Sosro",
      productId: "DRK-200",
      revenue: 600000.0,
      units: 200,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/6/2/c86c126d-2394-4d8b-96d5-a4768340d890.jpg",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "purchase",
      title: "Pembelian #9204",
      amount: "+Rp 12.500",
      details: "2 item • QRIS",
      time: "2 mnt lalu",
    },
    {
      id: "2",
      type: "purchase",
      title: "Pembelian #9203",
      amount: "+Rp 8.000",
      details: "1 item • Gopay",
      time: "15 mnt lalu",
    },
    {
      id: "3",
      type: "warning",
      title: "Peringatan Stok",
      details: "Choco Bar Menipis (2 unit)",
      time: "45 mnt lalu",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }
  }, [router]);

  // Helper to format currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex h-screen bg-amber-50/20 font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-[1200px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
          {/* Page Heading */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span>Keuangan</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-amber-900">
                Ringkasan Keuangan
              </h1>
              <p className="text-gray-500 font-medium">
                Update terakhir: Baru saja • Mesin ID: VD-402
              </p>
            </div>
            <button className="flex shrink-0 cursor-pointer items-center gap-2 justify-center rounded-xl h-12 px-6 bg-white border border-amber-100 hover:border-amber-300 hover:text-amber-600 text-gray-500 font-bold shadow-sm transition-all hover:-translate-y-0.5">
              <Download className="h-5 w-5" />
              <span>Export Laporan</span>
            </button>
          </header>

          {/* Filters */}
          <section>
            <div className="inline-flex h-12 items-center justify-center rounded-2xl bg-white border border-amber-100 p-1 w-full md:w-auto shadow-sm">
              <label
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-xl px-6 text-sm font-bold transition-all duration-200 ${
                  period === "today"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                    : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <span className="truncate">Hari Ini</span>
                <input
                  className="hidden"
                  name="period"
                  type="radio"
                  value="today"
                  checked={period === "today"}
                  onChange={() => setPeriod("today")}
                />
              </label>
              <label
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-xl px-6 text-sm font-bold transition-all duration-200 ${
                  period === "week"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                    : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <span className="truncate">Minggu Ini</span>
                <input
                  className="hidden"
                  name="period"
                  type="radio"
                  value="week"
                  checked={period === "week"}
                  onChange={() => setPeriod("week")}
                />
              </label>
              <label
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-xl px-6 text-sm font-bold transition-all duration-200 ${
                  period === "month"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                    : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <span className="truncate">Bulan Ini</span>
                <input
                  className="hidden"
                  name="period"
                  type="radio"
                  value="month"
                  checked={period === "month"}
                  onChange={() => setPeriod("month")}
                />
              </label>
              <label
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-xl px-6 text-sm font-bold transition-all duration-200 ${
                  period === "year"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                    : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <span className="truncate">Tahun Ini</span>
                <input
                  className="hidden"
                  name="period"
                  type="radio"
                  value="year"
                  checked={period === "year"}
                  onChange={() => setPeriod("year")}
                />
              </label>
            </div>
          </section>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm font-bold">
                  Total Pendapatan
                </p>
                <div className="bg-amber-100 p-2 rounded-xl">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-black tracking-tight truncate">
                {formatIDR(stats.totalRevenue)}
              </p>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded-lg border border-green-100">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-bold">+12%</span>
                </div>
                <span className="text-gray-400 text-xs font-medium ml-1">
                  vs periode lalu
                </span>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm font-bold">
                  Total Pengeluaran
                </p>
                <div className="bg-orange-100 p-2 rounded-xl">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-black tracking-tight truncate">
                {formatIDR(stats.totalExpenses)}
              </p>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded-lg border border-red-100">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-bold">+5%</span>
                </div>
                <span className="text-gray-400 text-xs font-medium ml-1">
                  vs periode lalu
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="flex flex-col gap-3 rounded-3xl p-6 bg-amber-500 border border-amber-400 shadow-lg shadow-amber-200 hover:-translate-y-1 transition-transform relative overflow-hidden group">
              {/* Decorative bg accent */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between relative z-10">
                <p className="text-amber-100 text-sm font-bold">Laba Bersih</p>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-white text-2xl font-black tracking-tight relative z-10 truncate">
                {formatIDR(stats.netProfit)}
              </p>
              <div className="flex items-center gap-1 relative z-10">
                <div className="flex items-center text-white bg-white/20 px-1.5 py-0.5 rounded-lg backdrop-blur-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-bold">+15%</span>
                </div>
                <span className="text-amber-100/70 text-xs font-medium ml-1">
                  vs periode lalu
                </span>
              </div>
            </div>

            {/* Avg Transaction */}
            <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm font-bold">
                  Rata-rata Transaksi
                </p>
                <div className="bg-blue-100 p-2 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-black tracking-tight truncate">
                {formatIDR(stats.avgTransaction)}
              </p>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded-lg border border-green-100">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-bold">+2%</span>
                </div>
                <span className="text-gray-400 text-xs font-medium ml-1">
                  vs periode lalu
                </span>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trends Chart */}
            <div className="lg:col-span-2 rounded-3xl bg-white border border-amber-50 shadow-lg shadow-amber-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-amber-900 text-lg font-black">
                    Tren Pendapatan
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    Performa pendapatan harian
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-900 text-2xl font-black">
                    {formatIDR(12450000)}
                  </p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Bulan Ini
                  </p>
                </div>
              </div>
              <div className="relative w-full h-[240px]">
                {/* SVG Chart Implementation */}
                <svg
                  className="w-full h-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 240"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="chartGradient"
                      x1="400"
                      x2="400"
                      y1="0"
                      y2="240"
                    >
                      <stop stopColor="#f59e0b" stopOpacity="0.3"></stop>
                      <stop
                        offset="1"
                        stopColor="#f59e0b"
                        stopOpacity="0"
                      ></stop>
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line
                    stroke="#f3f4f6"
                    strokeDasharray="4 4"
                    x1="0"
                    x2="800"
                    y1="200"
                    y2="200"
                  ></line>
                  <line
                    stroke="#f3f4f6"
                    strokeDasharray="4 4"
                    x1="0"
                    x2="800"
                    y1="140"
                    y2="140"
                  ></line>
                  <line
                    stroke="#f3f4f6"
                    strokeDasharray="4 4"
                    x1="0"
                    x2="800"
                    y1="80"
                    y2="80"
                  ></line>
                  {/* Chart Path */}
                  <path
                    d="M0 200 C50 200, 50 120, 100 130 C150 140, 150 180, 200 160 C250 140, 250 80, 300 90 C350 100, 350 120, 400 100 C450 80, 450 40, 500 50 C550 60, 550 100, 600 80 C650 60, 650 140, 700 120 C750 100, 750 30, 800 40 V 240 H 0 Z"
                    fill="url(#chartGradient)"
                  ></path>
                  <path
                    d="M0 200 C50 200, 50 120, 100 130 C150 140, 150 180, 200 160 C250 140, 250 80, 300 90 C350 100, 350 120, 400 100 C450 80, 450 40, 500 50 C550 60, 550 100, 600 80 C650 60, 650 140, 700 120 C750 100, 750 30, 800 40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                  {/* Data Points (Dots) */}
                  <circle
                    cx="300"
                    cy="90"
                    fill="#f59e0b"
                    r="6"
                    stroke="white"
                    strokeWidth="2"
                  ></circle>
                  <circle
                    cx="600"
                    cy="80"
                    fill="#f59e0b"
                    r="6"
                    stroke="white"
                    strokeWidth="2"
                  ></circle>
                </svg>
              </div>
              <div className="flex justify-between mt-4 px-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Minggu 1
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Minggu 2
                </span>
                <span className="text-xs text-text-gray-400 font-bold uppercase tracking-wider">
                  Minggu 3
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Minggu 4
                </span>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="flex flex-col rounded-3xl bg-white border border-amber-50 shadow-lg shadow-amber-100/50 p-6">
              <h3 className="text-amber-900 text-lg font-black mb-4">
                Rincian Pengeluaran
              </h3>
              <div className="flex-1 flex flex-col justify-center gap-6">
                {/* Donut Chart Representation */}
                <div className="flex justify-center py-2">
                  <div className="relative w-40 h-40">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 36 36"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Ring 1 */}
                      <circle
                        className="stroke-gray-100"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 2 (Value) */}
                      <circle
                        className="stroke-amber-500"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="70 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 3 (Value) */}
                      <circle
                        className="stroke-orange-400"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="20 100"
                        strokeDashoffset="-70"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 4 (Value) */}
                      <circle
                        className="stroke-red-400"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="10 100"
                        strokeDashoffset="-90"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></circle>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                        Total
                      </span>
                      <p className="text-amber-900 font-black text-lg">4.2jt</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                      <p className="text-gray-600 text-sm font-bold">
                        Restocking
                      </p>
                    </div>
                    <p className="text-amber-900 text-sm font-black">70%</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm shadow-orange-200"></div>
                      <p className="text-gray-600 text-sm font-bold">
                        Maintenance
                      </p>
                    </div>
                    <p className="text-amber-900 text-sm font-black">20%</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm shadow-red-200"></div>
                      <p className="text-gray-600 text-sm font-bold">Biaya</p>
                    </div>
                    <p className="text-amber-900 text-sm font-black">10%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Tables Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Top Products Table */}
            <div className="rounded-3xl bg-white border border-amber-50 shadow-lg shadow-amber-100/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-amber-900 text-lg font-black flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                  Produk Terlaris
                </h3>
                <button className="text-amber-600 text-sm font-bold hover:text-amber-700 hover:underline">
                  Lihat Semua
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 hover:bg-amber-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-amber-100 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-bold truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs font-medium truncate mt-0.5">
                        ID: {product.productId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-900 text-sm font-black">
                        {formatIDR(product.revenue)}
                      </p>
                      <p className="text-gray-500 text-xs font-medium mt-0.5">
                        {product.units} terjual
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Feed */}
            <div className="rounded-3xl bg-white border border-amber-50 shadow-lg shadow-amber-100/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-amber-900 text-lg font-black flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-500" />
                  Transaksi Terbaru
                </h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col relative pl-2">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex gap-4 items-start p-3 relative hover:bg-amber-50/50 rounded-2xl transition-colors group"
                  >
                    <div
                      className={`z-10 relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-4 border-white shadow-sm ${
                        transaction.type === "purchase"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "purchase" ? (
                        <DollarSign className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 flex items-center justify-center font-bold">!</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-900 text-sm font-bold group-hover:text-amber-700 transition-colors">
                          {transaction.title}
                        </p>
                        {transaction.amount ? (
                          <p className="text-green-600 text-sm font-black">
                            {transaction.amount}
                          </p>
                        ) : (
                          <p className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                            Perlu Refill
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-xs font-medium">
                          {transaction.details}
                        </p>
                        <p className="text-gray-400 text-xs font-medium">
                          {transaction.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
