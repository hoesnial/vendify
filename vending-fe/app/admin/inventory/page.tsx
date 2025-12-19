"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Product {
  id: string;
  name: string;
  sku: string;
  slot: string;
  current: number;
  capacity: number;
  status: "out-of-stock" | "low-stock" | "in-stock";
  image: string;
}

interface ActivityLog {
  id: string;
  type: "refill" | "alert" | "error";
  title: string;
  user: string;
  time: string;
  message: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "low-stock" | "out-of-stock"
  >("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSKUs: 0,
    lowStockAlerts: 0,
    criticalEmpty: 0,
    storageTemp: 4.2,
  });

  const [productsMock] = useState<Product[]>([
    {
      id: "1",
      name: "Ibuprofen 200mg",
      sku: "89902",
      slot: "A4",
      current: 0,
      capacity: 40,
      status: "out-of-stock",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDiK7NkRor0OsN0X32yzJxWdjPMXpHpevg3EzwLV3VPAZQMaJ-JggSeo4jNVcK-Flx5-GzBYWfEQEgLskRPx8F_wdoehvOehUv4Oa726JGOxMVBXwXCFi2Oov9e4_StpV8YrOmuDOK6UUcn_71TcxznClYejQivbc699viU1HPsP4j93yOnQm3CiIUu1smKzJ44I2x1eXtpkZUP__f_q1Np8fuHEx2cBUvDerzH_kTCSbEK06ziRy_157x6nq5gEM9uMlRBYSbjHw8",
    },
    {
      id: "2",
      name: "Amoxicillin 500mg",
      sku: "11204",
      slot: "B2",
      current: 4,
      capacity: 30,
      status: "low-stock",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC4-iffvx82ZD_rdzTXWhhOrCO7-aEz3oAchTrjQwBCNz1vvC5OJGEI_ziZ3QfTuDXpwMXUsNJ0n5X_bo3xbMu_fWkmopSxPYnGMNBC8lyAjgrIDky1B3UtXZ5ZyukDW0-VpjugpbD1rT1QuwUzpzR1u7Ftgr-Z0mhcI9JUePaRBSbClkVi2AwPOGBkgf7DKjVLaeHRrrCAOdFOWCaz9HkIAhVu2QpedQ1YLxOw0SaD6EdbqBPcPgJS_ODUA9nsn-PrjE8WEqlpFig",
    },
    {
      id: "3",
      name: "Cetirizine 10mg",
      sku: "44021",
      slot: "C1",
      current: 42,
      capacity: 50,
      status: "in-stock",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDqJgJ9RI2LOak3VFMHoX4XzzZS2iIxyb7KjbqjEYuQ9mCxjzWMQSLwI1S1mu_SO5viBUWrQK0rmaHVsnyedJZHTKViuPa0hctnSqBumrFo2SyTHlihHBKsYvBeTWOqda9uL8mBWisBWZFW6NVh8lFLzbBccmbm51qAgVFwsRCCAb0es4uHeFI1SIb2T6FOJY-tU6nqNjdj0ZQ3iqHn0TuFA-vJk0nExu_6Vik8dS_1hqw3j8Te13LFwrtjgxFqId7B3P8lQGlCPhM",
    },
    {
      id: "4",
      name: "Multivitamin Daily",
      sku: "90022",
      slot: "C2",
      current: 18,
      capacity: 25,
      status: "in-stock",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB5qz1idAs_vCW00b0RoDdoWLPsYaurz8gu2NYspJaaUG7c1bKCzjopkbwYHCTksn6rCpkH5W6oRQuJhQqUF7u-4jih_eUAestfHwTU2o6nJG2vvifHKsvSGKzYWUU0TaMStTFuO9jxry8FqTqVnRqLhS8zRKNRUyykVt-YZ25Mz2dnqB56DOkLoL-Y2IWUf-MgtW9EYGlE21AaMrhvyeFXfiusNBp_OKxcG7Z_dXBAK_O1oQtXRsZyuX2-ZDDN7lPc0UJDOp15W-Y",
    },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }

    // Fetch products from API
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { vendingAPI } = await import("@/lib/api");
      const response = await vendingAPI.getAvailableProducts();

      // Transform API data to match our Product interface
      const transformedProducts: Product[] = response.products.map((p) => {
        const stockPercentage =
          p.current_stock && p.slot_id
            ? (p.current_stock / 50) * 100 // Assuming max capacity 50
            : 0;

        let status: "out-of-stock" | "low-stock" | "in-stock" = "in-stock";
        if (stockPercentage === 0) status = "out-of-stock";
        else if (stockPercentage < 20) status = "low-stock";

        return {
          id: String(p.id),
          name: p.name,
          sku: String(p.id).padStart(5, "0"),
          slot: p.slot_number ? `A${p.slot_number}` : "N/A",
          current: p.current_stock || 0,
          capacity: 50, // Default capacity
          status,
          image: p.image_url || "/placeholder-product.png",
        };
      });

      setProducts(transformedProducts);

      // Calculate stats
      const totalSKUs = transformedProducts.length;
      const lowStock = transformedProducts.filter(
        (p) => p.status === "low-stock"
      ).length;
      const outOfStock = transformedProducts.filter(
        (p) => p.status === "out-of-stock"
      ).length;

      setStats({
        totalSKUs,
        lowStockAlerts: lowStock,
        criticalEmpty: outOfStock,
        storageTemp: 4.2,
      });

      // Fetch stock logs
      await fetchStockLogs();
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Use mock data as fallback
      setProducts(productsMock);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockLogs = async () => {
    try {
      const { vendingAPI } = await import("@/lib/api");
      const response = await vendingAPI.getStockLogs("VM01", { limit: 10 });

      // Transform stock logs to activity logs
      const logs: ActivityLog[] =
        response.logs?.map(
          (log: {
            id: number;
            slot_id: number;
            change_type: string;
            quantity_change: number;
            stock_before: number;
            stock_after: number;
            quantity_before: number;
            quantity_after: number;
            created_at: string;
            performed_by?: string;
            product_name?: string;
            slot_number?: string;
          }) => {
            const timeAgo = getTimeAgo(new Date(log.created_at));
            let type: "refill" | "alert" | "error" = "refill";
            let title = "Stock Updated";

            if (log.change_type === "RESTOCK") {
              type = "refill";
              title = "Refill Completed";
            } else if (log.change_type === "DISPENSE") {
              type = "alert";
              title = "Product Dispensed";
            } else if (log.change_type === "AUDIT") {
              type = "error";
              title = "Stock Audit";
            }

            return {
              id: String(log.id),
              type,
              title,
              user: log.performed_by || "System Automated",
              time: timeAgo,
              message: `${log.product_name || `Slot ${log.slot_number}`}: ${
                log.quantity_before
              } → ${log.quantity_after} units (${
                log.quantity_change > 0 ? "+" : ""
              }${log.quantity_change})`,
            };
          }
        ) || [];

      setActivityLogs(logs);
    } catch (error) {
      console.error("Failed to fetch stock logs:", error);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "border-red-500";
      case "low-stock":
        return "border-orange-400";
      case "in-stock":
        return "border-green-500";
      default:
        return "border-gray-300";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return (
          <span className="text-sm font-semibold text-red-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">error</span> Out
            of Stock
          </span>
        );
      case "low-stock":
        return (
          <span className="text-sm font-semibold text-orange-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">warning</span>{" "}
            Low Stock
          </span>
        );
      case "in-stock":
        return (
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">
              check_circle
            </span>{" "}
            In Stock
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "bg-red-500";
      case "low-stock":
        return "bg-orange-400";
      case "in-stock":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.includes(searchQuery) ||
      product.slot.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "low-stock" && product.status === "low-stock") ||
      (filterStatus === "out-of-stock" && product.status === "out-of-stock");

    return matchesSearch && matchesFilter;
  });

  const lowStockCount = products.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = products.filter(
    (p) => p.status === "out-of-stock"
  ).length;

  return (
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Section */}
        <header className="px-8 py-6 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#618689] text-sm mb-1">
              <span>Admin</span>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span>Stock Management</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#111718]">
              Inventory Overview
            </h2>
            <p className="text-[#618689]">
              Monitor product levels and manage reorders for Machine #402
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="size-12 rounded-xl flex items-center justify-center bg-white border border-[#dbe5e6] text-[#618689] hover:text-[#13daec] transition-colors shadow-sm">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="h-12 px-6 rounded-xl bg-[#111718] text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all">
              <span className="material-symbols-outlined">add</span>
              <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pb-32">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#13daec] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#618689] font-medium">
                  Loading inventory...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Stat Card 1 */}
                <div className="bg-white p-6 rounded-2xl border border-[#dbe5e6] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-6xl text-[#111718]">
                      inventory_2
                    </span>
                  </div>
                  <p className="text-[#618689] font-medium z-10">Total SKUs</p>
                  <div>
                    <p className="text-4xl font-bold text-[#111718] z-10">
                      {stats.totalSKUs}
                    </p>
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">
                        trending_up
                      </span>
                      +2 items added
                    </p>
                  </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-orange-500">
                      warning
                    </span>
                  </div>
                  <p className="text-[#618689] font-medium z-10">
                    Low Stock Alerts
                  </p>
                  <div>
                    <p className="text-4xl font-bold text-orange-500 z-10">
                      {stats.lowStockAlerts}
                    </p>
                    <p className="text-sm text-[#618689] font-medium mt-1">
                      Requires refill soon
                    </p>
                  </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-red-500">
                      cancel
                    </span>
                  </div>
                  <p className="text-[#618689] font-medium z-10">
                    Critical (Empty)
                  </p>
                  <div>
                    <p className="text-4xl font-bold text-red-500 z-10">
                      {stats.criticalEmpty}
                    </p>
                    <p className="text-sm text-[#618689] font-medium mt-1">
                      Action needed
                    </p>
                  </div>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-white p-6 rounded-2xl border border-[#dbe5e6] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-blue-500">
                      thermostat
                    </span>
                  </div>
                  <p className="text-[#618689] font-medium z-10">
                    Storage Temp
                  </p>
                  <div>
                    <p className="text-4xl font-bold text-[#111718] z-10">
                      {stats.storageTemp}°F
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      Optimal Range
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6 sticky top-0 bg-[#f6f8f8] z-20 py-2 -mx-2 px-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#618689]">
                      search
                    </span>
                  </div>
                  <input
                    className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white shadow-sm text-[#111718] placeholder-[#618689] focus:ring-2 focus:ring-[#13daec] h-14 text-lg"
                    placeholder="Search by product name, SKU, or slot ID..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`flex items-center gap-2 h-14 px-6 rounded-xl font-medium shadow-sm whitespace-nowrap transition-transform hover:scale-105 ${
                      filterStatus === "all"
                        ? "bg-[#111718] text-white"
                        : "bg-white text-[#618689] border border-[#dbe5e6]"
                    }`}
                  >
                    <span className="material-symbols-outlined">view_list</span>
                    All Items
                  </button>
                  <button
                    onClick={() => setFilterStatus("low-stock")}
                    className={`flex items-center gap-2 h-14 px-6 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                      filterStatus === "low-stock"
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "bg-white text-[#618689] border-[#dbe5e6] hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-orange-500">
                      warning
                    </span>
                    Low Stock ({lowStockCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus("out-of-stock")}
                    className={`flex items-center gap-2 h-14 px-6 rounded-xl font-medium border transition-colors whitespace-nowrap ${
                      filterStatus === "out-of-stock"
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-white text-[#618689] border-[#dbe5e6] hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-red-500">
                      block
                    </span>
                    Out of Stock ({outOfStockCount})
                  </button>
                  <button className="flex items-center gap-2 h-14 px-6 rounded-xl bg-white text-[#618689] font-medium border border-[#dbe5e6] hover:border-[#13daec] hover:text-[#13daec] transition-colors whitespace-nowrap">
                    <span className="material-symbols-outlined">
                      filter_list
                    </span>
                    Filters
                  </button>
                </div>
              </div>

              {/* Product List */}
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-white shadow-sm border-l-8 hover:shadow-md transition-shadow ${getStatusColor(
                      product.status
                    )}`}
                  >
                    <div className="flex items-center gap-4 w-full md:w-1/3">
                      <div className="size-20 rounded-xl bg-[#f6f8f8] shrink-0 flex items-center justify-center p-2 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={`${product.name} packaging`}
                          className="w-full h-full object-contain"
                          src={product.image}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#111718]">
                          {product.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-[#f6f8f8] px-2 py-1 rounded-md text-xs font-mono text-[#618689]">
                            SKU: {product.sku}
                          </span>
                          <span className="bg-[#f6f8f8] px-2 py-1 rounded-md text-xs font-mono text-[#618689]">
                            Slot: {product.slot}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full px-4">
                      <div className="flex justify-between items-end mb-2">
                        {getStatusBadge(product.status)}
                        <span className="text-lg font-bold text-[#111718]">
                          {product.current} / {product.capacity}
                        </span>
                      </div>
                      <div className="w-full h-4 bg-[#f6f8f8] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(
                            product.status
                          )} transition-all`}
                          style={{
                            width: `${
                              (product.current / product.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end gap-3">
                      <button className="h-12 w-12 rounded-xl flex items-center justify-center border border-[#dbe5e6] text-[#618689] hover:bg-[#f6f8f8]">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      {product.status === "in-stock" ? (
                        <button className="h-12 px-8 bg-white border border-[#dbe5e6] text-[#111718] font-bold rounded-xl hover:bg-[#f6f8f8] transition-all flex items-center gap-2">
                          <span>Adjust</span>
                        </button>
                      ) : (
                        <button className="h-12 px-8 bg-[#13daec] hover:bg-[#0ea5b3] text-[#111718] font-bold rounded-xl shadow-lg shadow-[#13daec]/20 transition-all flex items-center gap-2">
                          <span className="material-symbols-outlined">
                            add_box
                          </span>
                          Refill
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Floating Quick Action Button for Mobile */}
        {!isLoading && (
          <button className="absolute bottom-8 right-8 size-16 bg-[#111718] rounded-full shadow-2xl shadow-black/20 flex items-center justify-center text-white z-30 md:hidden hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">
              qr_code_scanner
            </span>
          </button>
        )}
      </main>

      {/* Right side details panel - Activity Log */}
      {!isLoading && (
        <aside className="w-80 bg-white border-l border-[#dbe5e6] hidden xl:flex flex-col p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-[#111718] mb-6">
            Activity Log
          </h3>
          <div className="relative pl-6 border-l border-[#dbe5e6] space-y-8">
            {activityLogs.map((log, index) => (
              <div key={log.id} className="relative">
                <div
                  className={`absolute -left-[29px] top-1 size-3 rounded-full border-4 border-white ${
                    index === 0 ? "bg-[#13daec]" : "bg-[#dbe5e6]"
                  }`}
                ></div>
                <p className="text-sm font-bold text-[#111718]">{log.title}</p>
                <p className="text-xs text-[#618689] mt-0.5">{log.user}</p>
                <p className="text-xs text-[#618689] mt-0.5">{log.time}</p>
                <div
                  className={`mt-2 p-3 rounded-lg text-xs ${
                    log.type === "refill"
                      ? "bg-[#f6f8f8] text-[#618689]"
                      : log.type === "alert"
                      ? "bg-orange-50 text-orange-700 border border-orange-100"
                      : "bg-[#f6f8f8] text-[#618689]"
                  }`}
                >
                  {log.message.includes("Paracetamol") ? (
                    <>
                      Restocked{" "}
                      <span className="font-bold text-[#111718]">
                        Paracetamol
                      </span>{" "}
                      to 50 units.
                    </>
                  ) : log.message.includes("Amoxicillin") ? (
                    <>
                      <span className="font-bold">Amoxicillin</span> dropped
                      below 15% threshold.
                    </>
                  ) : (
                    log.message
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="bg-[#13daec]/10 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0ea5b3]">
                support_agent
              </span>
              <div>
                <p className="text-sm font-bold text-[#0ea5b3]">Need Help?</p>
                <p className="text-xs text-[#618689]">Contact Tech Support</p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
