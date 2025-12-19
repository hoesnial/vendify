"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { vendingAPI } from "@/lib/api";
import Image from "next/image";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      href: "/admin/dashboard",
    },
    {
      id: "temperature",
      label: "Temperature Monitor",
      icon: "thermostat",
      href: "/admin/temperature",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: "inventory_2",
      href: "/admin/inventory",
    },
    {
      id: "finance",
      label: "Finance",
      icon: "payments",
      href: "/admin/finance",
    },
    {
      id: "transactions",
      label: "Transactions Log",
      icon: "receipt_long",
      href: "/admin/transactions",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: "campaign",
      href: "/admin/announcements",
    },
    { id: "users", label: "Users", icon: "group", href: "/admin/users" },
  ];

  const handleLogout = async () => {
    try {
      await vendingAPI.adminLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove all admin tokens
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("isAdminLoggedIn");
      // Force full page reload to clear all state
      window.location.href = "/admin";
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-72 h-screen bg-white border-r border-[#dbe5e6] flex flex-col flex-shrink-0">
      {/* Top Section - Fixed */}
      <div className="p-6 border-b border-[#dbe5e6]">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-xl p-2 size-12">
            <Image
              src="/MediVendLogo.png"
              alt="MediVend Logo"
              width={70}
              height={70}
              className="object-contain"
            ></Image>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-[#111718]">
              MediVend
            </h1>
            <p className="text-xs font-medium text-[#618689] uppercase tracking-wider">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Navigation Links */}
        <nav className="flex flex-col gap-3 p-6">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-4 rounded-xl px-4 py-4 transition-all ${
                isActive(item.href)
                  ? "bg-[#13daec]/10 ring-1 ring-[#13daec]/20"
                  : "hover:bg-gray-100"
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  isActive(item.href)
                    ? "text-[#0eaebd]"
                    : "text-[#618689] group-hover:text-[#111718]"
                }`}
                style={{
                  fontSize: "28px",
                  fontVariationSettings: isActive(item.href)
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span
                className={`text-base ${
                  isActive(item.href)
                    ? "font-bold text-[#111718]"
                    : "font-medium text-[#111718]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="p-6 border-t border-[#dbe5e6] flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#618689]">
              System Status
            </p>
            <p className="font-bold text-green-600">Online</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#13daec] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#13daec]/30 transition-transform active:scale-95 hover:bg-[#0eaebd]"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
