"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Search,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Package,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  transactions: number;
  successRate: number;
  systemAlerts: number;
  alertMessage?: string;
}

interface Transaction {
  id: string;
  timestamp: string;
  item: {
    name: string;
    quantity: number;
    icon: any;
  };
  amount: number;
  method: {
    type: string;
    details: string;
    icon: any;
  };
  status: "completed" | "failed" | "syncing";
  statusMessage?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "failed" | "card">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    transactions: 0,
    successRate: 0,
    systemAlerts: 0,
    alertMessage: "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsMock] = useState<Transaction[]>([
    {
      id: "#TRX-8921",
      timestamp: "24 Okt, 10:42",
      item: {
        name: "Keripik Singkong Balado",
        quantity: 1,
        icon: Package,
      },
      amount: 12500,
      method: {
        type: "QRIS",
        details: "GoPay",
        icon: QrCode,
      },
      status: "completed",
    },
    {
      id: "#TRX-8920",
      timestamp: "24 Okt, 10:15",
      item: {
        name: "Teh Botol Sosro 450ml",
        quantity: 2,
        icon: ShoppingBag,
      },
      amount: 16000,
      method: {
        type: "QRIS",
        details: "ShopeePay",
        icon: Smartphone,
      },
      status: "completed",
    },
    {
      id: "#TRX-8919",
      timestamp: "24 Okt, 09:58",
      item: {
        name: "Choco Bar Dairy Milk",
        quantity: 1,
        icon: Package,
      },
      amount: 15000,
      method: {
        type: "Cash",
        details: "Tunai (Uang Pas)",
        icon: Banknote,
      },
      status: "failed",
      statusMessage: "Uang Macet",
    },
    {
      id: "#TRX-8918",
      timestamp: "24 Okt, 09:30",
      item: {
        name: "Kacang Atom Garuda",
        quantity: 1,
        icon: Package,
      },
      amount: 9500,
      method: {
        type: "Card",
        details: "Tap BCA Flazz",
        icon: CreditCard,
      },
      status: "completed",
    },
    {
      id: "#TRX-8917",
      timestamp: "24 Okt, 09:12",
      item: {
        name: "Pop Mie Ayam Bawang",
        quantity: 2,
        icon: Package,
      },
      amount: 24000,
      method: {
        type: "QRIS",
        details: "Dana",
        icon: QrCode,
      },
      status: "syncing",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }

    // Simulate fetch
    setTimeout(() => {
      setTransactions(transactionsMock);
      
      // Calculate stats based on mock
      const totalRevenue = transactionsMock
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalTransactions = transactionsMock.length;
      const completedCount = transactionsMock.filter(
        (t) => t.status === "completed"
      ).length;
      const successRate =
        totalTransactions > 0 ? (completedCount / totalTransactions) * 100 : 0;
      const failedCount = transactionsMock.filter(
        (t) => t.status === "failed"
      ).length;

      setStats({
        totalRevenue,
        transactions: totalTransactions,
        successRate: Math.round(successRate * 10) / 10,
        systemAlerts: failedCount,
        alertMessage:
          failedCount > 0
            ? `${failedCount} Transaksi Gagal`
            : "",
      });
      setIsLoading(false);
    }, 1000);
  }, [router, transactionsMock]);

  // Format IDR currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.item?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      false;

    const matchesFilter =
      filter === "all" ||
      (filter === "failed" && transaction.status === "failed") ||
      (filter === "card" &&
        ["QRIS", "Card"].includes(transaction.method.type));

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Berhasil
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            {transaction.statusMessage || "Gagal"}
          </span>
        );
      case "syncing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Proses
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-amber-50/20 font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Section */}
        <header className="px-8 pt-8 pb-6">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span>Transaksi</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-amber-900">
                Riwayat Transaksi
              </h2>
              <p className="text-gray-500 font-medium">
                Melihat aktivitas untuk 24 Oktober 2023
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-amber-100/50 text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Hari Ini, 24 Okt
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold animate-pulse">
                Memuat data transaksi...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Total Revenue
                  </p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    12%
                  </span>
                </div>
                <p className="text-gray-900 text-2xl font-black tracking-tight">
                  {formatIDR(stats.totalRevenue)}
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Total Transaksi
                  </p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    5%
                  </span>
                </div>
                <p className="text-gray-900 text-2xl font-black tracking-tight">
                  {stats.transactions}
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl p-6 bg-white border border-amber-50 shadow-lg shadow-amber-100/50 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Success Rate
                  </p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    0.2%
                  </span>
                </div>
                <p className="text-gray-900 text-2xl font-black tracking-tight">
                  {stats.successRate}%
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl p-6 bg-amber-500 border border-amber-400 shadow-lg shadow-amber-200 hover:-translate-y-1 transition-transform relative overflow-hidden text-white group">
                <div className="absolute right-0 top-0 h-full w-32 bg-white/10 skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform"></div>
                <div className="flex justify-between items-start relative z-10">
                  <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">
                    System Alerts
                  </p>
                  <AlertTriangle className="text-white w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <p className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
                    {stats.systemAlerts} <span className="text-lg font-bold opacity-80">Aktif</span>
                  </p>
                  <p className="text-amber-100 text-xs font-bold mt-1 bg-white/20 inline-block px-2 py-1 rounded-lg">
                    {stats.alertMessage || "Semua sistem normal"}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">
              <div className="w-full lg:w-auto lg:flex-1 max-w-2xl flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <label className="flex items-center h-12 w-full bg-white rounded-xl border border-amber-100 shadow-sm focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all overflow-hidden">
                  <div className="pl-4 text-gray-400 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 px-3 text-sm font-medium outline-none"
                    placeholder="Cari ID Transaksi, Nama Produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                {/* Filter Chips */}
                <div className="flex gap-2 pb-1 sm:pb-0 items-center overflow-x-auto">
                  <button
                    onClick={() => setFilter("all")}
                    className={`h-11 px-5 rounded-xl text-sm font-bold whitespace-nowrap shadow-sm transition-all flex items-center gap-2 ${
                      filter === "all"
                        ? "bg-amber-500 text-white shadow-amber-200"
                        : "bg-white border border-amber-100 text-gray-500 hover:text-amber-600 hover:border-amber-200"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFilter("failed")}
                    className={`h-11 px-5 rounded-xl text-sm font-bold whitespace-nowrap shadow-sm transition-all flex items-center gap-2 ${
                      filter === "failed"
                        ? "bg-red-500 text-white shadow-red-200"
                        : "bg-white border border-amber-100 text-gray-500 hover:text-red-500 hover:border-red-200"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Gagal
                  </button>
                  <button
                    onClick={() => setFilter("card")}
                    className={`h-11 px-5 rounded-xl text-sm font-bold whitespace-nowrap shadow-sm transition-all flex items-center gap-2 ${
                      filter === "card"
                        ? "bg-blue-500 text-white shadow-blue-200"
                        : "bg-white border border-amber-100 text-gray-500 hover:text-blue-500 hover:border-blue-200"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Non-Tunai
                  </button>
                </div>
              </div>

              {/* Export Button */}
              <button className="h-12 px-6 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-bold shadow-sm flex items-center gap-2 transition-colors shrink-0 w-full lg:w-auto justify-center">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-amber-100 rounded-3xl overflow-hidden shadow-lg shadow-amber-100/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-100 bg-amber-50/50">
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider w-[120px]">
                        ID
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider">
                        Produk & Item
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider text-right">
                        Total
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider">
                        Metode
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider text-center">
                        Status
                      </th>
                      <th className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-wider w-[60px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {filteredTransactions.map((transaction, index) => (
                      <tr
                        key={transaction.id || `transaction-${index}`}
                        className={`group cursor-pointer transition-colors ${
                          transaction.status === "failed"
                            ? "bg-red-50/30 hover:bg-red-50/60"
                            : "hover:bg-amber-50/40"
                        }`}
                      >
                        <td className="py-5 px-6 font-mono text-sm font-medium text-gray-500">
                          {transaction.id}
                        </td>
                        <td className="py-5 px-6 text-gray-900 font-bold text-sm">
                          {transaction.timestamp}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                              <transaction.item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-bold text-sm">
                                {transaction.item.name}
                              </span>
                              <span className="text-gray-400 text-xs font-medium">
                                x{transaction.item.quantity} Unit
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right font-black text-gray-900 text-sm">
                          {formatIDR(transaction.amount)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2 text-gray-500">
                            <transaction.method.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {transaction.method.details}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          {getStatusBadge(transaction)}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-100 text-gray-300 group-hover:text-amber-600 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-amber-50/30 border-t border-amber-100">
                <p className="text-sm text-gray-500 font-medium">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-900">
                    1-{filteredTransactions.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-gray-900">
                    {stats.transactions}
                  </span>{" "}
                  transaksi
                </p>
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-amber-100 text-gray-400 opacity-50 cursor-not-allowed">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-amber-100 text-gray-900 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
