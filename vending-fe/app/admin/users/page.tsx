"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { vendingAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roleColor: string;
  roleIcon: string;
  status: "active" | "locked" | "inactive";
  lastLogin: string;
  lastLoginTime: string;
  avatar?: string;
  initials?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, { label: string; color: string; icon: string }> = {
      admin: {
        label: "Super Admin",
        color: "bg-primary/10 text-primary-dark",
        icon: "admin_panel_settings",
      },
      buyer: {
        label: "Customer",
        color: "bg-blue-100 text-blue-700",
        icon: "shopping_bag",
      },
      technician: {
        label: "Technician",
        color: "bg-orange-100 text-orange-700",
        icon: "engineering",
      },
      inventory: {
        label: "Inv. Manager",
        color: "bg-purple-100 text-purple-700",
        icon: "inventory",
      },
    };

    return roleMap[role] || {
      label: role,
      color: "bg-gray-100 text-gray-700",
      icon: "person",
    };
  };

  const formatLastLogin = (lastLogin: string | null | undefined) => {
    if (!lastLogin) {
      return { date: "Never", time: "--:--" };
    }

    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInMs = now.getTime() - loginDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let dateStr = "";
    if (diffInDays === 0) {
      dateStr = "Today";
    } else if (diffInDays === 1) {
      dateStr = "Yesterday";
    } else {
      dateStr = loginDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const timeStr = loginDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateStr, time: timeStr };
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Debug: Check token
      const token = localStorage.getItem("adminToken");
      console.log("Admin token exists:", !!token);
      
      if (token) {
        try {
          // Decode JWT to see payload (without verification)
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }
      
      const response = await vendingAPI.getAllUsers();
      
      // Transform API data to match UI requirements
      const transformedUsers: User[] = response.data.map((user) => {
        const roleDisplay = getRoleDisplay(user.role);
        const lastLoginFormatted = formatLastLogin(user.lastLogin);
        
        return {
          id: user.id,
          name: user.name || "Unknown User",
          email: user.email,
          phone: user.phone,
          role: roleDisplay.label,
          roleColor: roleDisplay.color,
          roleIcon: roleDisplay.icon,
          status: user.status as "active" | "locked" | "inactive",
          lastLogin: lastLoginFormatted.date,
          lastLoginTime: lastLoginFormatted.time,
          initials: getInitials(user.name || "Unknown"),
        };
      });

      setUsers(transformedUsers);
      toast.success(`Loaded ${transformedUsers.length} users`);
    } catch (error: unknown) {
      console.error("Failed to load users:", error);
      
      // Better error messages with type guard
      const axiosError = error as { response?: { data?: { message?: string; userRole?: string } } };
      const errorMsg = axiosError?.response?.data?.message || "Failed to load users data";
      const userRole = axiosError?.response?.data?.userRole;
      
      if (userRole) {
        toast.error(`Access denied. Your role: ${userRole}. Admin role required.`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    } else {
      loadUsers();
    }
  }, [router, loadUsers]);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-[#111718]">Active</span>
          </div>
        );
      case "locked":
        return (
          <div className="flex items-center gap-2">
            <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
            <span className="text-sm font-medium text-[#111718]">
              Locked Out
            </span>
          </div>
        );
      case "inactive":
        return (
          <div className="flex items-center gap-2">
            <span className="relative inline-flex rounded-full size-3 bg-gray-400"></span>
            <span className="text-sm font-medium text-[#618689]">Inactive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "" ||
      user.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen bg-[#f6f8f8]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex flex-col w-full max-w-[1400px] mx-auto p-8 gap-8">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#618689] text-sm font-medium">
              <span className="hover:text-[#13daec] cursor-pointer transition-colors">
                Admin
              </span>
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
              <span className="text-[#111718]">User Management</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <h2 className="text-4xl font-black tracking-tight text-[#111718]">
                  User Management
                </h2>
                <p className="text-lg text-[#618689]">
                  Manage access permissions, roles, and security settings for
                  MediVend personnel.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={loadUsers}
                  disabled={isLoading}
                  className="flex items-center gap-2 h-14 px-6 rounded-xl bg-white hover:bg-gray-50 border-2 border-[#dbe5e6] text-[#111718] font-bold text-base transition-all hover:border-[#13daec] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button className="flex items-center gap-2 h-14 px-8 rounded-xl bg-[#13daec] hover:bg-[#0ea5b3] text-black font-bold text-base shadow-lg shadow-[#13daec]/20 transition-all hover:scale-105 active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                  Add New Admin
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618689] text-2xl">
                search
              </span>
              <input
                className="w-full h-16 pl-14 pr-4 rounded-xl border border-[#dbe5e6] bg-white text-lg placeholder:text-[#618689]/50 focus:border-[#13daec] focus:ring-4 focus:ring-[#13daec]/10 transition-all outline-none"
                placeholder="Search users by name, email or ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618689] text-2xl">
                filter_list
              </span>
              <select
                className="w-full h-16 pl-14 pr-10 rounded-xl border border-[#dbe5e6] bg-white text-lg text-[#111718] appearance-none focus:border-[#13daec] focus:ring-4 focus:ring-[#13daec]/10 transition-all outline-none cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Super Admin</option>
                <option value="tech">Technician</option>
                <option value="inventory">Inventory Manager</option>
                <option value="auditor">Auditor</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#618689] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Users Table */}
          <div className="flex flex-col rounded-2xl border border-[#dbe5e6] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dbe5e6] bg-[#f6f8f8]/50">
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider w-1/4">
                      User Info
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe5e6]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-5xl text-[#13daec] animate-spin">
                            progress_activity
                          </span>
                          <p className="text-lg font-medium text-[#618689]">
                            Loading users...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-5xl text-[#618689]">
                            people_outline
                          </span>
                          <p className="text-lg font-medium text-[#618689]">
                            {searchQuery || roleFilter 
                              ? "No users found matching your filters" 
                              : "No users found"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="group hover:bg-[#f6f8f8] transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            {user.avatar ? (
                              <div
                                className="size-12 rounded-full bg-cover bg-center shadow-sm border border-white"
                                style={{ backgroundImage: `url(${user.avatar})` }}
                              ></div>
                            ) : (
                              <div className="flex items-center justify-center size-12 rounded-full bg-[#13daec]/20 text-[#0ea5b3] font-black text-lg shadow-sm border border-white">
                                {user.initials}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-base font-bold text-[#111718]">
                                {user.name}
                              </span>
                              <span className="text-sm text-[#618689]">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${user.roleColor} text-sm font-bold`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {user.roleIcon}
                            </span>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-6">{getStatusIndicator(user.status)}</td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111718]">
                              {user.lastLogin}
                            </span>
                            <span className="text-xs text-[#618689]">
                              {user.lastLoginTime}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="size-10 flex items-center justify-center rounded-lg hover:bg-[#f6f8f8] text-[#618689] hover:text-[#13daec] transition-colors"
                              title="Edit User"
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                            </button>
                            <button
                              className="size-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#618689] hover:text-red-500 transition-colors"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-6 border-t border-[#dbe5e6] bg-white">
              <span className="text-sm text-[#618689]">
                Showing{" "}
                <span className="font-bold text-[#111718]">
                  1-{filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#111718]">{users.length}</span>{" "}
                users
              </span>
              <div className="flex gap-2">
                <button
                  className="flex items-center justify-center size-10 rounded-lg border border-[#dbe5e6] text-[#618689] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f8f8] transition-colors"
                  disabled
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button className="flex items-center justify-center size-10 rounded-lg border border-[#dbe5e6] text-[#618689] hover:bg-[#f6f8f8] transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
