"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "MAINTENANCE" | "PROMOTION";
  priority: number;
  is_active: boolean;
  show_on_web: boolean;
  show_on_mobile: boolean;
  icon?: string;
  bg_color?: string;
  text_color?: string;
  start_date?: string;
  end_date?: string;
  view_count: number;
  click_count: number;
  dismiss_count: number;
  created_at: string;
  created_by: string;
  has_action_button?: boolean;
  action_button_text?: string;
  action_button_url?: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "INFO",
    priority: "0", // String to prevent NaN error
    icon: "info", // Default icon for INFO type
    bg_color: "#FFFFFF", // White background
    text_color: "#0D1C1C", // Dark text
    show_on_web: true,
    show_on_mobile: true,
    has_action_button: false,
    action_button_text: "",
    action_button_url: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Helper function to get default icon by type
  const getDefaultIconByType = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'MAINTENANCE':
        return 'build';
      case 'PROMOTION':
        return 'celebration';
      case 'INFO':
      default:
        return 'info';
    }
  };

  // Helper function to get default colors by type
  const getDefaultColorsByType = (type: string) => {
    switch (type) {
      case 'ERROR':
        return {
          bg_color: '#FFFFFF',    // White background
          text_color: '#0D1C1C',  // Dark text
          accent_color: '#EF4444' // Red-500
        };
      case 'WARNING':
        return {
          bg_color: '#FFFFFF',    // White background
          text_color: '#0D1C1C',  // Dark text
          accent_color: '#F59E0B' // Amber-500
        };
      case 'MAINTENANCE':
        return {
          bg_color: '#FFFFFF',    // White background
          text_color: '#0D1C1C',  // Dark text
          accent_color: '#F59E0B' // Amber-500
        };
      case 'PROMOTION':
        return {
          bg_color: '#FFFFFF',    // White background
          text_color: '#0D1C1C',  // Dark text
          accent_color: '#A855F7' // Purple-500
        };
      case 'INFO':
      default:
        return {
          bg_color: '#FFFFFF',    // White background
          text_color: '#0D1C1C',  // Dark text
          accent_color: '#13DAEC' // Cyan
        };
    }
  };

  // Handle type change - auto-fill icon and colors
  const handleTypeChange = (newType: string) => {
    const defaultIcon = getDefaultIconByType(newType);
    const defaultColors = getDefaultColorsByType(newType);
    
    setFormData({
      ...formData,
      type: newType as "INFO" | "WARNING" | "ERROR" | "MAINTENANCE" | "PROMOTION",
      icon: defaultIcon,
      bg_color: defaultColors.bg_color,
      text_color: defaultColors.text_color,
    });
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.replace("/admin");
        return;
      }

      const data = await response.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      
      // Convert priority to number before sending
      const submitData = {
        ...formData,
        priority: parseInt(formData.priority) || 0,
      };
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        fetchAnnouncements();
        // Reset form
        setFormData({
          title: "",
          message: "",
          type: "INFO",
          priority: "0",
          icon: "info", // Default icon for INFO type
          bg_color: "#FFFFFF", // White background
          text_color: "#0D1C1C", // Dark text
          show_on_web: true,
          show_on_mobile: true,
          has_action_button: false,
          action_button_text: "",
          action_button_url: "",
        });
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/announcements/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: !currentStatus }),
        }
      );
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling announcement:", error);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ERROR":
        return "bg-red-100 text-red-700";
      case "WARNING":
        return "bg-yellow-100 text-yellow-700";
      case "MAINTENANCE":
        return "bg-orange-100 text-orange-700";
      case "PROMOTION":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ERROR":
        return "error";
      case "WARNING":
        return "warning";
      case "MAINTENANCE":
        return "engineering";
      case "PROMOTION":
        return "local_offer";
      default:
        return "info";
    }
  };

  return (
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Page Heading & Main Action */}
        <div className="flex flex-wrap justify-between items-end gap-6 pb-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-[#111718] text-4xl font-black leading-tight tracking-[-0.033em]">
              Announcement Management
            </h1>
            <p className="text-[#618689] text-lg font-normal leading-normal">
              Manage public-facing messages, health alerts, and maintenance notices for the system.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-6 bg-[#13daec] hover:bg-[#0ebac9] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="truncate">Create Announcement</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#13daec] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Announcements List */}
            <div className="flex flex-col gap-4">
              {/* Table Header (Hidden on small screens) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                <div className="col-span-5">Announcement Detail</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Analytics</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {announcements.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-[#f0f4f4] shadow-sm">
                  <span className="material-symbols-outlined text-6xl text-[#618689] mb-4">
                    campaign
                  </span>
                  <p className="text-[#618689] text-lg">
                    No announcements yet. Create your first one!
                  </p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f4f4] hover:shadow-md hover:border-[#13daec]/30 transition-all group"
                  >
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center">
                      {/* Title & Meta */}
                      <div className="col-span-5 w-full flex items-start gap-4">
                        <div
                          className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${
                            announcement.type === "ERROR"
                              ? "bg-red-50 text-red-500"
                              : announcement.type === "WARNING"
                              ? "bg-orange-50 text-orange-500"
                              : announcement.type === "MAINTENANCE"
                              ? "bg-orange-50 text-orange-500"
                              : announcement.type === "PROMOTION"
                              ? "bg-purple-50 text-purple-500"
                              : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {announcement.icon || getTypeIcon(announcement.type)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-lg font-bold text-[#111718] group-hover:text-[#13daec] transition-colors">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-[#618689]">
                            Created by {announcement.created_by} •{" "}
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </p>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTypeColor(announcement.type)}`}>
                              {announcement.type}
                            </span>
                            
                            {announcement.show_on_web && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                                🌐 Web
                              </span>
                            )}
                            
                            {announcement.show_on_mobile && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600">
                                📱 Mobile
                              </span>
                            )}
                            
                            {announcement.priority > 0 && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                                Priority: {announcement.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 w-full flex items-center">
                        {announcement.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="size-2 rounded-full bg-gray-500"></span>
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Analytics */}
                      <div className="col-span-3 w-full flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-[#618689]">visibility</span>
                          <span className="text-[#111718] font-medium">{announcement.view_count} views</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-[#618689]">touch_app</span>
                          <span className="text-[#111718] font-medium">{announcement.click_count} clicks</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-[#618689]">close</span>
                          <span className="text-[#111718] font-medium">{announcement.dismiss_count} dismissed</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 w-full flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(announcement.id, announcement.is_active)}
                          className="size-10 flex items-center justify-center rounded-lg hover:bg-[#f6f8f8] text-[#618689] hover:text-primary transition-colors"
                          title={announcement.is_active ? "Deactivate" : "Activate"}
                        >
                          <span className="material-symbols-outlined">
                            {announcement.is_active ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className="size-10 flex items-center justify-center rounded-lg hover:bg-rose-50 text-[#618689] hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Create Modal - Premium Design */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102022]/60 backdrop-blur-[2px] p-4 transition-all duration-300">
            {/* Modal Container */}
            <div className="relative w-full max-w-[800px] flex flex-col max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-[#111718] text-[28px] font-bold leading-tight tracking-[-0.015em]">
                    Create Announcement
                  </h2>
                  <p className="text-gray-500 text-sm font-normal mt-1">
                    Broadcast messages to users across all platforms
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-[#111718] transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>close</span>
                </button>
              </div>

              {/* Modal Content (Scrollable Form) */}
              <div className="flex-1 overflow-y-auto p-8 bg-white no-scrollbar">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-[960px] mx-auto">
                  
                  {/* Title Field */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[#111718] text-lg font-semibold leading-normal">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input w-full h-16 px-6 rounded-2xl bg-[#f0f4f4] border-none text-[#111718] text-lg placeholder:text-[#618689] focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      placeholder="e.g., Scheduled Maintenance"
                      required
                    />
                  </div>

                  {/* Message Body Field */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[#111718] text-lg font-semibold leading-normal">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-input w-full min-h-[180px] px-6 py-5 resize-none rounded-2xl bg-[#f0f4f4] border-none text-[#111718] text-lg placeholder:text-[#618689] focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      placeholder="Type the content of your announcement here. It will be displayed on the user screens."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Type & Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[#111718] text-lg font-semibold leading-normal">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="form-input w-full h-16 px-6 rounded-2xl bg-[#f0f4f4] border-none text-[#111718] text-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      >
                        <option value="INFO">📘 Info</option>
                        <option value="WARNING">⚠️ Warning</option>
                        <option value="ERROR">🚨 Error</option>
                        <option value="MAINTENANCE">🔧 Maintenance</option>
                        <option value="PROMOTION">🎉 Promotion</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[#111718] text-lg font-semibold leading-normal">
                        Priority
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="form-input w-full h-16 px-6 rounded-2xl bg-[#f0f4f4] border-none text-[#111718] text-lg placeholder:text-[#618689] focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        min="0"
                        placeholder="0-10 (Higher = More Important)"
                      />
                    </div>
                  </div>

                  {/* Icon & Background Color Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[#111718] text-lg font-semibold leading-normal">
                        Icon (Material Symbol)
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="form-input w-full h-16 pl-6 pr-14 rounded-2xl bg-[#f0f4f4] border-none text-[#111718] text-lg placeholder:text-[#618689] focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          placeholder="e.g. info, warning, campaign"
                        />
                        {formData.icon && (
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#618689] group-focus-within:text-primary transition-colors pointer-events-none">
                            <span className="material-symbols-outlined text-[28px]">{formData.icon}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[#111718] text-lg font-semibold leading-normal">
                        Background Color
                      </label>
                      <div className="relative">
                        <input
                          type="color"
                          value={formData.bg_color}
                          onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                          className="w-full h-16 rounded-2xl bg-[#f0f4f4] border-none cursor-pointer"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#618689] pointer-events-none">
                          <span className="material-symbols-outlined text-[28px]">palette</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[#111718] text-lg font-semibold leading-normal">
                      Text Color
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-full h-16 rounded-2xl bg-[#f0f4f4] border-none cursor-pointer"
                      />
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#618689] pointer-events-none">
                        <span className="material-symbols-outlined text-[28px]">format_color_text</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Toggles */}
                  <div className="flex flex-col gap-4">
                    <label className="text-[#111718] text-lg font-semibold leading-normal">
                      Display Platforms
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Show on Web Toggle */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-[#e1e6e6] bg-white hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600">
                            <span className="material-symbols-outlined text-[28px]">public</span>
                          </div>
                          <div>
                            <p className="text-[#111718] font-medium">Web</p>
                            <p className="text-[#618689] text-sm">Show on website</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.show_on_web}
                            onChange={(e) => setFormData({ ...formData, show_on_web: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-[68px] h-[38px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[30px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] after:transition-all after:shadow-sm peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {/* Show on Mobile Toggle */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-[#e1e6e6] bg-white hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600">
                            <span className="material-symbols-outlined text-[28px]">smartphone</span>
                          </div>
                          <div>
                            <p className="text-[#111718] font-medium">Mobile</p>
                            <p className="text-[#618689] text-sm">Show on mobile app</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.show_on_mobile}
                            onChange={(e) => setFormData({ ...formData, show_on_mobile: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-[68px] h-[38px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[30px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] after:transition-all after:shadow-sm peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Button Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-[#e1e6e6] bg-white hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[32px]">touch_app</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[#111718] text-lg font-medium leading-tight">
                            Add Action Button
                          </p>
                          <p className="text-[#618689] text-sm mt-1">
                            Include a clickable button with URL
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.has_action_button}
                          onChange={(e) => setFormData({ ...formData, has_action_button: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-[68px] h-[38px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[30px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] after:transition-all after:shadow-sm peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {formData.has_action_button && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-20">
                        <div className="flex flex-col gap-3">
                          <label className="text-[#111718] font-medium">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={formData.action_button_text}
                            onChange={(e) => setFormData({ ...formData, action_button_text: e.target.value })}
                            className="form-input w-full h-14 px-5 rounded-xl bg-[#f0f4f4] border-none text-[#111718] placeholder:text-[#618689] focus:ring-2 focus:ring-primary transition-all"
                            placeholder="e.g. Learn More"
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="text-[#111718] font-medium">
                            Button URL
                          </label>
                          <input
                            type="url"
                            value={formData.action_button_url}
                            onChange={(e) => setFormData({ ...formData, action_button_url: e.target.value })}
                            className="form-input w-full h-14 px-5 rounded-xl bg-[#f0f4f4] border-none text-[#111718] placeholder:text-[#618689] focus:ring-2 focus:ring-primary transition-all"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Modal Footer (Actions) */}
              <div className="p-8 border-t border-gray-100 bg-[#fbfcfc] flex justify-end gap-5 shrink-0 rounded-b-[32px]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 h-16 rounded-xl text-lg font-medium text-[#618689] hover:bg-gray-200 hover:text-[#111718] transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-10 h-16 rounded-xl text-lg font-bold text-[#102022] bg-primary hover:bg-[#0bcad8] hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95 active:shadow-none"
                >
                  <span className="material-symbols-outlined">send</span>
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
