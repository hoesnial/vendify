"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    icon: string;
  };
  amount: number;
  method: {
    type: string;
    details: string;
    icon: string;
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
      timestamp: "Oct 24, 10:42 AM",
      item: {
        name: "Ibuprofen 200mg",
        quantity: 1,
        icon: "pill",
      },
      amount: 8.5,
      method: {
        type: "Visa",
        details: "Visa •••• 4242",
        icon: "credit_card",
      },
      status: "completed",
    },
    {
      id: "#TRX-8920",
      timestamp: "Oct 24, 10:15 AM",
      item: {
        name: "First Aid Kit (Compact)",
        quantity: 1,
        icon: "medical_services",
      },
      amount: 24.0,
      method: {
        type: "Apple Pay",
        details: "Apple Pay",
        icon: "phone_iphone",
      },
      status: "completed",
    },
    {
      id: "#TRX-8919",
      timestamp: "Oct 24, 09:58 AM",
      item: {
        name: "N95 Mask (Pack of 3)",
        quantity: 2,
        icon: "masks",
      },
      amount: 12.5,
      method: {
        type: "Mastercard",
        details: "Mastercard •••• 8812",
        icon: "credit_card",
      },
      status: "failed",
      statusMessage: "Failed (Declined)",
    },
    {
      id: "#TRX-8918",
      timestamp: "Oct 24, 09:30 AM",
      item: {
        name: "Hand Sanitizer 50ml",
        quantity: 1,
        icon: "water_drop",
      },
      amount: 4.25,
      method: {
        type: "Tap to Pay",
        details: "Tap to Pay",
        icon: "contactless",
      },
      status: "completed",
    },
    {
      id: "#TRX-8917",
      timestamp: "Oct 24, 09:12 AM",
      item: {
        name: "Allergy Relief Pack",
        quantity: 1,
        icon: "medication",
      },
      amount: 15.0,
      method: {
        type: "Cash",
        details: "Cash",
        icon: "payments",
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

    // Fetch transactions from API
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { vendingAPI } = await import("@/lib/api");
      const response = await vendingAPI.getOrdersByMachine("VM01", {
        limit: 50,
      });

      // Transform orders to transactions
      const transformedTransactions: Transaction[] =
        response.orders?.map(
          (order: {
            order_id: string;
            status: string;
            total_amount: string | number;
            created_at: string;
            product_name?: string;
            quantity?: number;
            total_quantity?: number;
            payment_method?: string;
          }) => {
            const timestamp = new Date(order.created_at).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }
            );

            // Determine payment method
            let methodType = "QRIS";
            let methodIcon = "qr_code_2";
            if (order.payment_method?.includes("gopay")) {
              methodType = "GoPay";
              methodIcon = "account_balance_wallet";
            } else if (order.payment_method?.includes("shopeepay")) {
              methodType = "ShopeePay";
              methodIcon = "account_balance_wallet";
            } else if (order.payment_method?.includes("card")) {
              methodType = "Card";
              methodIcon = "credit_card";
            }

            // Map status
            let status: "completed" | "failed" | "syncing" = "syncing";
            if (order.status === "COMPLETED") status = "completed";
            else if (order.status === "FAILED" || order.status === "CANCELLED")
              status = "failed";
            else if (order.status === "PAID" || order.status === "DISPENSING")
              status = "syncing";

            return {
              id: order.order_id,
              timestamp,
              item: {
                name: order.product_name || "Multiple Items",
                quantity: order.quantity || order.total_quantity || 1,
                icon: "medical_services",
              },
              amount:
                typeof order.total_amount === "number"
                  ? order.total_amount
                  : parseFloat(order.total_amount) || 0,
              method: {
                type: methodType,
                details: methodType,
                icon: methodIcon,
              },
              status,
              statusMessage: status === "failed" ? order.status : undefined,
            };
          }
        ) || [];

      setTransactions(transformedTransactions);

      // Calculate stats
      const totalRevenue = transformedTransactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalTransactions = transformedTransactions.length;
      const completedCount = transformedTransactions.filter(
        (t) => t.status === "completed"
      ).length;
      const successRate =
        totalTransactions > 0 ? (completedCount / totalTransactions) * 100 : 0;
      const failedCount = transformedTransactions.filter(
        (t) => t.status === "failed"
      ).length;

      setStats({
        totalRevenue,
        transactions: totalTransactions,
        successRate: Math.round(successRate * 10) / 10,
        systemAlerts: failedCount,
        alertMessage:
          failedCount > 0
            ? `${failedCount} Failed Transaction${failedCount > 1 ? "s" : ""}`
            : "",
      });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Use mock data as fallback
      setTransactions(transactionsMock);
    } finally {
      setIsLoading(false);
    }
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
        (transaction.method?.type?.includes("Visa") ||
          transaction.method?.type?.includes("Mastercard") ||
          transaction.method?.type?.includes("card")));

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#e0f7fa] text-[#006064]">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#ffebee] text-[#c62828]">
            <span className="material-symbols-outlined text-[14px]">close</span>
            {transaction.statusMessage || "Failed"}
          </span>
        );
      case "syncing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            <span className="material-symbols-outlined text-[14px]">sync</span>
            Syncing
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Section */}
        <header className="px-8 pt-8 pb-4">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#111718] text-4xl font-black leading-tight tracking-[-0.033em]">
                Transaction Log
              </h2>
              <p className="text-[#618689] text-base font-normal">
                Viewing activity for October 24, 2023
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-[#dbe5e6] text-[#618689] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  calendar_today
                </span>
                Today, Oct 24
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#13daec] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#618689] font-medium">
                Loading transactions...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white border border-[#dbe5e6] shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-[#618689] text-sm font-medium uppercase tracking-wide">
                      Total Revenue
                    </p>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      +12%
                    </span>
                  </div>
                  <p className="text-[#111718] text-3xl font-bold leading-tight tracking-tight">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white border border-[#dbe5e6] shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-[#618689] text-sm font-medium uppercase tracking-wide">
                      Transactions
                    </p>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      +5%
                    </span>
                  </div>
                  <p className="text-[#111718] text-3xl font-bold leading-tight tracking-tight">
                    {stats.transactions}
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white border border-[#dbe5e6] shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-[#618689] text-sm font-medium uppercase tracking-wide">
                      Success Rate
                    </p>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      +0.2%
                    </span>
                  </div>
                  <p className="text-[#111718] text-3xl font-bold leading-tight tracking-tight">
                    {stats.successRate}%
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white border border-orange-200 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1 bg-orange-400"></div>
                  <div className="flex justify-between items-start">
                    <p className="text-[#618689] text-sm font-medium uppercase tracking-wide">
                      System Alerts
                    </p>
                    <span className="material-symbols-outlined text-orange-500 text-xl">
                      warning
                    </span>
                  </div>
                  <div>
                    <p className="text-[#111718] text-3xl font-bold leading-tight tracking-tight">
                      {stats.systemAlerts} Active
                    </p>
                    <p className="text-orange-600 text-sm font-medium mt-1">
                      {stats.alertMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls & Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">
                <div className="w-full lg:w-auto lg:flex-1 max-w-2xl flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <label className="flex items-center h-14 w-full bg-white rounded-xl border border-[#dbe5e6] shadow-sm focus-within:ring-2 focus-within:ring-[#13daec] focus-within:border-[#13daec] transition-all overflow-hidden">
                    <div className="pl-4 text-[#618689] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">
                        search
                      </span>
                    </div>
                    <input
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-[#111718] placeholder:text-[#618689] px-3 text-base font-normal outline-none"
                      placeholder="Search ID, Item Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </label>

                  {/* Filter Chips */}
                  <div className="flex gap-2 pb-1 sm:pb-0 items-center">
                    <button
                      onClick={() => setFilter("all")}
                      className={`h-12 px-4 rounded-xl text-sm font-medium whitespace-nowrap shadow-md flex items-center gap-2 ${
                        filter === "all"
                          ? "bg-[#111718] text-white"
                          : "bg-white border border-[#dbe5e6] text-[#111718] hover:bg-[#f0f4f4]"
                      }`}
                    >
                      All Logs
                    </button>
                    <button
                      onClick={() => setFilter("failed")}
                      className={`h-12 px-4 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                        filter === "failed"
                          ? "bg-[#111718] text-white"
                          : "bg-white border border-[#dbe5e6] text-[#111718] hover:bg-[#f0f4f4]"
                      }`}
                    >
                      Failed Only
                      <span className="material-symbols-outlined text-[18px]">
                        error
                      </span>
                    </button>
                    <button
                      onClick={() => setFilter("card")}
                      className={`h-12 px-4 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                        filter === "card"
                          ? "bg-[#111718] text-white"
                          : "bg-white border border-[#dbe5e6] text-[#111718] hover:bg-[#f0f4f4]"
                      }`}
                    >
                      Card Payments
                      <span className="material-symbols-outlined text-[18px]">
                        credit_card
                      </span>
                    </button>
                  </div>
                </div>

                {/* Export Button */}
                <button className="h-14 px-6 rounded-xl bg-[#13daec] hover:bg-[#0ebac9] text-[#102022] text-base font-bold shadow-lg shadow-[#13daec]/20 flex items-center gap-3 transition-colors shrink-0 w-full lg:w-auto justify-center">
                  <span className="material-symbols-outlined">download</span>
                  Export Log
                </button>
              </div>

              {/* Transactions Table */}
              <div className="bg-white border border-[#dbe5e6] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#dbe5e6] bg-[#f8fafb]">
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider w-[120px]">
                          ID
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider">
                          Item(s)
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider text-right">
                          Amount
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider">
                          Method
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider text-center">
                          Status
                        </th>
                        <th className="py-4 px-6 text-[#618689] font-medium text-sm uppercase tracking-wider w-[60px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbe5e6]">
                      {filteredTransactions.map((transaction, index) => (
                        <tr
                          key={transaction.id || `transaction-${index}`}
                          className={`group cursor-pointer transition-colors ${
                            transaction.status === "failed"
                              ? "bg-red-50/50 hover:bg-red-50"
                              : "hover:bg-[#f0f4f4]"
                          }`}
                        >
                          <td className="py-5 px-6 font-mono text-sm text-[#618689]">
                            {transaction.id}
                          </td>
                          <td className="py-5 px-6 text-[#111718] font-medium">
                            {transaction.timestamp}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#f0f4f4] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[#618689] text-[20px]">
                                  {transaction.item.icon}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[#111718] font-medium text-base">
                                  {transaction.item.name}
                                </span>
                                <span className="text-[#618689] text-xs">
                                  x{transaction.item.quantity} Unit
                                  {transaction.item.quantity > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-right font-bold text-[#111718] text-lg">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2 text-[#618689]">
                              <span className="material-symbols-outlined text-[20px]">
                                {transaction.method.icon}
                              </span>
                              <span className="text-sm">
                                {transaction.method.details}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-center">
                            {getStatusBadge(transaction)}
                          </td>
                          <td className="py-5 px-6 text-right">
                            <span className="material-symbols-outlined text-[#9ca3af] group-hover:text-[#111718] transition-colors">
                              chevron_right
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafb] border-t border-[#dbe5e6]">
                  <p className="text-sm text-[#618689]">
                    Showing{" "}
                    <span className="font-bold text-[#111718]">
                      1-{filteredTransactions.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-[#111718]">
                      {stats.transactions}
                    </span>{" "}
                    transactions
                  </p>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#dbe5e6] text-[#618689] opacity-50 cursor-not-allowed">
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#dbe5e6] text-[#111718] hover:bg-[#f0f4f4]">
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
