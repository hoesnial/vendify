"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
      title: "Jam Detected - Slot A4",
      message: "Dispenser motor failure detected at 10:42 AM.",
      time: "5 mins ago",
    },
    {
      id: "2",
      type: "warning",
      title: "Receipt Paper Low",
      message: "Printer status indicates < 10% remaining.",
      time: "15 mins ago",
    },
    {
      id: "3",
      type: "info",
      title: "Software Update Ready",
      message: "Version 2.4.1 is available for download.",
      time: "1 hour ago",
    },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "sale",
      title: "Sale #9921",
      time: "2 mins ago",
      value: "$12.50",
    },
    {
      id: "2",
      type: "login",
      title: "Admin Login",
      time: "15 mins ago",
      value: "ID: 402-A",
    },
    {
      id: "3",
      type: "restock",
      title: "Restock Zone B",
      time: "1 hour ago",
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
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="h-auto shrink-0 px-8 py-6 bg-[#f6f8f8] z-10">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0d1a1b] text-3xl font-black tracking-tight">
                Station #402 Overview
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#078834] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#078834]"></span>
                </span>
                <p className="text-[#4c939a] text-sm font-medium">
                  System Operational | Last Sync: Just now
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 h-12 px-6 rounded-xl bg-white border border-slate-200 hover:border-[#13daec] text-[#0d1a1b] font-bold text-sm shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#4c939a]">
                  notifications
                </span>
                <span>Alerts ({stats.criticalAlerts})</span>
              </button>
              <button className="flex items-center gap-2 h-12 px-6 rounded-xl bg-white border border-slate-200 hover:border-[#13daec] text-[#0d1a1b] font-bold text-sm shadow-sm transition-all">
                <span className="material-symbols-outlined text-[#4c939a]">
                  lock
                </span>
                <span>Lock Screen</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-2">
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Sales Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative group">
              <div className="absolute top-4 right-4 p-2 bg-[#13daec]/10 rounded-lg text-[#13daec]">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-[#4c939a] text-sm font-medium mb-1">
                  Sales Today
                </p>
                <p className="text-[#0d1a1b] text-3xl font-bold tracking-tight">
                  ${stats.salesToday.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#078834] text-sm font-bold bg-[#078834]/10 w-fit px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[16px]">
                  trending_up
                </span>
                <span>+12% vs avg</span>
              </div>
            </div>

            {/* Alerts Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative group hover:border-[#e73108]/30 transition-colors cursor-pointer">
              <div className="absolute top-4 right-4 p-2 bg-[#e73108]/10 rounded-lg text-[#e73108]">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-[#4c939a] text-sm font-medium mb-1">
                  Critical Alerts
                </p>
                <p className="text-[#0d1a1b] text-3xl font-bold tracking-tight">
                  {stats.criticalAlerts}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#e73108] text-sm font-bold bg-[#e73108]/10 w-fit px-2 py-1 rounded-lg">
                <span>Requires Attention</span>
              </div>
            </div>

            {/* Temp Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative group">
              <div className="absolute top-4 right-4 p-2 bg-[#13daec]/10 rounded-lg text-[#13daec]">
                <span className="material-symbols-outlined">thermometer</span>
              </div>
              <div>
                <p className="text-[#4c939a] text-sm font-medium mb-1">
                  Internal Temp
                </p>
                <p className="text-[#0d1a1b] text-3xl font-bold tracking-tight">
                  {stats.temperature}°C
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#4c939a] text-sm font-bold bg-slate-100 w-fit px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                <span>Stable</span>
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative group cursor-pointer hover:border-[#e77f08]/50 transition-colors">
              <div className="absolute top-4 right-4 p-2 bg-[#e77f08]/10 rounded-lg text-[#e77f08]">
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <div>
                <p className="text-[#4c939a] text-sm font-medium mb-1">
                  Low Stock Items
                </p>
                <p className="text-[#0d1a1b] text-3xl font-bold tracking-tight">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#e77f08] text-sm font-bold bg-[#e77f08]/10 w-fit px-2 py-1 rounded-lg">
                <span>Restock Soon</span>
              </div>
            </div>
          </section>

          {/* Main Interactive Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
            {/* Quick Actions Grid (Takes up 2 columns) */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <h3 className="text-[#0d1a1b] text-xl font-bold tracking-tight">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Action Item 1 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#13daec] hover:shadow-lg hover:shadow-[#13daec]/5 transition-all text-left group h-48 justify-between">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      thermostat
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0d1a1b] group-hover:text-[#13daec] transition-colors">
                      Temperature Monitor
                    </h4>
                    <p className="text-[#4c939a] text-sm mt-1">
                      Check cooling zones & history
                    </p>
                  </div>
                </button>

                {/* Action Item 2 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#13daec] hover:shadow-lg hover:shadow-[#13daec]/5 transition-all text-left group h-48 justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4 px-2 py-1 bg-[#e77f08]/20 text-[#e77f08] text-xs font-bold rounded-lg uppercase tracking-wider">
                    Attention
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      shelves
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0d1a1b] group-hover:text-[#13daec] transition-colors">
                      Stock Management
                    </h4>
                    <p className="text-[#4c939a] text-sm mt-1">
                      Refill slots & update counts
                    </p>
                  </div>
                </button>

                {/* Action Item 3 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#13daec] hover:shadow-lg hover:shadow-[#13daec]/5 transition-all text-left group h-48 justify-between">
                  <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      receipt_long
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0d1a1b] group-hover:text-[#13daec] transition-colors">
                      Transaction Log
                    </h4>
                    <p className="text-[#4c939a] text-sm mt-1">
                      View recent purchases & errors
                    </p>
                  </div>
                </button>

                {/* Action Item 4 */}
                <button className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#13daec] hover:shadow-lg hover:shadow-[#13daec]/5 transition-all text-left group h-48 justify-between">
                  <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      category
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0d1a1b] group-hover:text-[#13daec] transition-colors">
                      Product Catalog
                    </h4>
                    <p className="text-[#4c939a] text-sm mt-1">
                      Manage items & pricing
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Side Panel (Alerts & Recent) */}
            <div className="flex flex-col gap-6 h-full">
              {/* Critical Alerts Panel */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 h-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#0d1a1b] text-lg font-bold tracking-tight">
                    System Alerts
                  </h3>
                  <button className="text-sm text-[#13daec] font-semibold hover:underline">
                    View All
                  </button>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex gap-3 p-3 rounded-xl items-start ${
                        alert.type === "error"
                          ? "bg-[#e73108]/5 border border-[#e73108]/20"
                          : alert.type === "warning"
                          ? "bg-[#e77f08]/5 border border-[#e77f08]/20"
                          : "bg-[#f6f8f8] border border-slate-200"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined shrink-0 mt-0.5 ${
                          alert.type === "error"
                            ? "text-[#e73108]"
                            : alert.type === "warning"
                            ? "text-[#e77f08]"
                            : "text-[#13daec]"
                        }`}
                      >
                        {alert.type === "error"
                          ? "error"
                          : alert.type === "warning"
                          ? "warning"
                          : "info"}
                      </span>
                      <div>
                        <p className="text-[#0d1a1b] font-bold text-sm">
                          {alert.title}
                        </p>
                        <p className="text-[#4c939a] text-xs mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Mini List */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-[#0d1a1b] text-lg font-bold tracking-tight">
                  Recent Activity
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
                          <span className="material-symbols-outlined text-sm">
                            {activity.type === "sale"
                              ? "shopping_cart"
                              : activity.type === "login"
                              ? "person"
                              : "inventory_2"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0d1a1b]">
                            {activity.title}
                          </p>
                          <p className="text-xs text-[#4c939a]">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm ${
                          activity.type === "sale"
                            ? "font-bold text-[#0d1a1b]"
                            : "font-medium text-[#4c939a]"
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
          <div className="text-center pb-6 opacity-50">
            <p className="text-xs text-[#4c939a]">
              MediVend OS System Status: Normal • Connected to Server: us-east-1
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
