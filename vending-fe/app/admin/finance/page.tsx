"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    totalRevenue: 12450.0,
    totalExpenses: 4200.0,
    netProfit: 8250.0,
    avgTransaction: 15.5,
  });

  const [topProducts] = useState<TopProduct[]>([
    {
      id: "1",
      name: "Ibuprofen 200mg",
      productId: "MED-001",
      revenue: 800.0,
      units: 140,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCEvlTcrOhlZVeXeoKRnI4fBcwIzN4dIzNclrgZ_GkE2WRCLGGq0VpaYBWqX_cnutHUKzLSP_oVvMkzRy4Ejl_TEz8G31It8w1Lv49lEJw241j_DE7M2-KESVs4kOCqR1JiSk9tnu2fCqnTtAo7ighXkeFJCP-RJiOiWtFgOta49AIcsa101N18uC4ksDUn-h1nqxvAnZL9vwXwVyK6xUR7Uz-sLCNUk9nnOlYNeosX4TSAV1dKd_9WgUuoJGtYDiP_fCntWytNPUo",
    },
    {
      id: "2",
      name: "First Aid Kit",
      productId: "MED-045",
      revenue: 650.0,
      units: 45,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBI5q1PS4ulrYdW8euaveVFN9uqPAGju-9aK1Ec_aM1zSOLOyDn0HRyjnsa0IWzwpaIGROQRBpVup5luYdQOdimpBybons_mms-txGJCPQovz7U98qO1kUciDT-xR1VzMK47QPJEGR8YTExlBEMmZQot0qK6OCVABFAeh01z8iypGlZ1kpNtRbQp4L4k9OpbdtNTJOBGB0swHb4YO6XZZXFF9jMKVP9IcLy0XFdbM8mwa_KrP5rcbqqjp5VLxcObDX4Dc3MGoPVjPU",
    },
    {
      id: "3",
      name: "Hand Sanitizer",
      productId: "HYG-200",
      revenue: 600.0,
      units: 200,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBa5TaSruIp8YKmJWEN5acVI00CMLUGFF28i4ZRQUFZPpJkJVmaEC_Qv8yG4i6uoVExeDj9gXlDaCD6bLvCoX-_8POahP1IffCDlTR9gT8NEq0LqsU2sTsIm1UVb-qy0L4hpbcGMRK2ClTBJYj8NWsM_FJxfPxitbKsMN0oBFGtID4Rz5vNNcnJklkkDPysj4lOJ6G4ZPaPIp7LE2PE9SzvZRBxIwwzyWVc4A4dNJNRYXebTdQwU0m3h4LEHPGNGPYLfiH7h7XBfcM",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "purchase",
      title: "Purchase #9204",
      amount: "+$12.50",
      details: "2 items • Credit Card",
      time: "2 min ago",
    },
    {
      id: "2",
      type: "purchase",
      title: "Purchase #9203",
      amount: "+$8.00",
      details: "1 item • Apple Pay",
      time: "15 min ago",
    },
    {
      id: "3",
      type: "warning",
      title: "Stock Warning",
      details: "Bandages Low (2 units)",
      time: "45 min ago",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-[1200px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
          {/* Page Heading */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#111718] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Financial Overview
              </h1>
              <p className="text-[#618689] text-sm md:text-base font-normal">
                Last updated: Just now • Machine ID: MV-042
              </p>
            </div>
            <button className="flex shrink-0 cursor-pointer items-center gap-2 justify-center rounded-xl h-12 px-6 bg-white border border-[#e6e8e8] hover:bg-[#f0f4f4] text-[#111718] text-sm font-bold shadow-sm transition-all">
              <span className="material-symbols-outlined text-xl">
                download
              </span>
              <span>Export Report</span>
            </button>
          </header>

          {/* Filters */}
          <section>
            <div className="inline-flex h-12 items-center justify-center rounded-xl bg-[#e6eaea] p-1 w-full md:w-auto">
              <label
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
                  period === "today"
                    ? "bg-white shadow-sm text-[#111718]"
                    : "text-[#618689]"
                }`}
              >
                <span className="truncate">Today</span>
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
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
                  period === "week"
                    ? "bg-white shadow-sm text-[#111718]"
                    : "text-[#618689]"
                }`}
              >
                <span className="truncate">This Week</span>
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
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
                  period === "month"
                    ? "bg-white shadow-sm text-[#111718]"
                    : "text-[#618689]"
                }`}
              >
                <span className="truncate">This Month</span>
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
                className={`flex-1 md:flex-none cursor-pointer h-full flex items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
                  period === "year"
                    ? "bg-white shadow-sm text-[#111718]"
                    : "text-[#618689]"
                }`}
              >
                <span className="truncate">This Year</span>
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
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#618689] text-sm font-medium">
                  Total Revenue
                </p>
                <span className="material-symbols-outlined text-[#13daec] bg-[#13daec]/10 p-2 rounded-lg">
                  attach_money
                </span>
              </div>
              <p className="text-[#111718] text-3xl font-bold tracking-tight">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#078834] text-lg">
                  trending_up
                </span>
                <p className="text-[#078834] text-sm font-bold">+12%</p>
                <span className="text-[#618689] text-xs ml-1">
                  vs last period
                </span>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#618689] text-sm font-medium">
                  Total Expenses
                </p>
                <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-2 rounded-lg">
                  payments
                </span>
              </div>
              <p className="text-[#111718] text-3xl font-bold tracking-tight">
                ${stats.totalExpenses.toFixed(2)}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-red-500 text-lg">
                  trending_up
                </span>
                <p className="text-red-500 text-sm font-bold">+5%</p>
                <span className="text-[#618689] text-xs ml-1">
                  vs last period
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Decorative bg accent */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#13daec]/5 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <p className="text-[#618689] text-sm font-medium">Net Profit</p>
                <span className="material-symbols-outlined text-[#078834] bg-[#078834]/10 p-2 rounded-lg">
                  account_balance_wallet
                </span>
              </div>
              <p className="text-[#111718] text-3xl font-bold tracking-tight relative z-10">
                ${stats.netProfit.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 relative z-10">
                <span className="material-symbols-outlined text-[#078834] text-lg">
                  trending_up
                </span>
                <p className="text-[#078834] text-sm font-bold">+15%</p>
                <span className="text-[#618689] text-xs ml-1">
                  vs last period
                </span>
              </div>
            </div>

            {/* Avg Transaction */}
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#618689] text-sm font-medium">
                  Avg. Transaction
                </p>
                <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-2 rounded-lg">
                  receipt_long
                </span>
              </div>
              <p className="text-[#111718] text-3xl font-bold tracking-tight">
                ${stats.avgTransaction.toFixed(2)}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#078834] text-lg">
                  trending_up
                </span>
                <p className="text-[#078834] text-sm font-bold">+2%</p>
                <span className="text-[#618689] text-xs ml-1">
                  vs last period
                </span>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trends Chart */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[#111718] text-lg font-bold">
                    Revenue Trends
                  </h3>
                  <p className="text-[#618689] text-sm">
                    Daily revenue performance
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#111718] text-2xl font-bold">
                    $12,450.00
                  </p>
                  <p className="text-[#618689] text-xs">This Month</p>
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
                      <stop stopColor="#13daec" stopOpacity="0.3"></stop>
                      <stop
                        offset="1"
                        stopColor="#13daec"
                        stopOpacity="0"
                      ></stop>
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line
                    stroke="#e6e8e8"
                    strokeDasharray="4 4"
                    x1="0"
                    x2="800"
                    y1="200"
                    y2="200"
                  ></line>
                  <line
                    stroke="#e6e8e8"
                    strokeDasharray="4 4"
                    x1="0"
                    x2="800"
                    y1="140"
                    y2="140"
                  ></line>
                  <line
                    stroke="#e6e8e8"
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
                    stroke="#13daec"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                  {/* Data Points (Dots) */}
                  <circle
                    cx="300"
                    cy="90"
                    fill="#13daec"
                    r="6"
                    stroke="white"
                    strokeWidth="2"
                  ></circle>
                  <circle
                    cx="600"
                    cy="80"
                    fill="#13daec"
                    r="6"
                    stroke="white"
                    strokeWidth="2"
                  ></circle>
                </svg>
              </div>
              <div className="flex justify-between mt-4 px-2">
                <span className="text-xs text-[#618689] font-medium">
                  Week 1
                </span>
                <span className="text-xs text-[#618689] font-medium">
                  Week 2
                </span>
                <span className="text-xs text-[#618689] font-medium">
                  Week 3
                </span>
                <span className="text-xs text-[#618689] font-medium">
                  Week 4
                </span>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="flex flex-col rounded-2xl bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <h3 className="text-[#111718] text-lg font-bold mb-4">
                Expense Breakdown
              </h3>
              <div className="flex-1 flex flex-col justify-center gap-6">
                {/* Donut Chart Representation */}
                <div className="flex justify-center py-2">
                  <div className="relative w-32 h-32">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 36 36"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Ring 1 */}
                      <circle
                        className="stroke-[#e6eaea]"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 2 (Value) */}
                      <circle
                        className="stroke-[#13daec]"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="70 100"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 3 (Value) */}
                      <circle
                        className="stroke-teal-700"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="20 100"
                        strokeDashoffset="-70"
                        strokeWidth="3.5"
                      ></circle>
                      {/* Ring 4 (Value) */}
                      <circle
                        className="stroke-teal-900"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="10 100"
                        strokeDashoffset="-90"
                        strokeWidth="3.5"
                      ></circle>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-xs text-[#618689] font-medium block">
                        Total
                      </span>
                      <p className="text-[#111718] font-bold text-sm">$4.2k</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#13daec]"></div>
                      <p className="text-[#618689] text-sm font-medium">
                        Restocking
                      </p>
                    </div>
                    <p className="text-[#111718] text-sm font-bold">70%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-700"></div>
                      <p className="text-[#618689] text-sm font-medium">
                        Maintenance
                      </p>
                    </div>
                    <p className="text-[#111718] text-sm font-bold">20%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-900"></div>
                      <p className="text-[#618689] text-sm font-medium">Fees</p>
                    </div>
                    <p className="text-[#111718] text-sm font-bold">10%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Tables Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Top Products Table */}
            <div className="rounded-2xl bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#111718] text-lg font-bold">
                  Top Selling Products
                </h3>
                <button className="text-[#13daec] text-sm font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-2 hover:bg-[#f6f8f8] rounded-xl transition-colors cursor-pointer"
                  >
                    <div
                      className="w-12 h-12 rounded-lg bg-[#f0f4f4] bg-center bg-cover shrink-0"
                      style={{ backgroundImage: `url("${product.image}")` }}
                    ></div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-[#111718] text-sm font-bold truncate">
                        {product.name}
                      </p>
                      <p className="text-[#618689] text-xs truncate">
                        ID: {product.productId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#111718] text-sm font-bold">
                        ${product.revenue.toFixed(2)}
                      </p>
                      <p className="text-[#618689] text-xs">
                        {product.units} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Feed */}
            <div className="rounded-2xl bg-white border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#111718] text-lg font-bold">
                  Recent Transactions
                </h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f4f4] text-[#618689] transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    refresh
                  </span>
                </button>
              </div>
              <div className="flex flex-col relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-[#e6eaea]"></div>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex gap-4 items-start p-3 relative hover:bg-[#f6f8f8] rounded-xl transition-colors group"
                  >
                    <div
                      className={`z-10 relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                        transaction.type === "purchase"
                          ? "bg-[#e0fbfd] text-[#13daec]"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {transaction.type === "purchase"
                          ? "check"
                          : "priority_high"}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[#111718] text-sm font-bold">
                          {transaction.title}
                        </p>
                        {transaction.amount ? (
                          <p className="text-[#078834] text-sm font-bold">
                            {transaction.amount}
                          </p>
                        ) : (
                          <p className="text-[#618689] text-xs">
                            Refill Needed
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#618689] text-xs">
                          {transaction.details}
                        </p>
                        <p className="text-[#618689] text-xs">
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
