"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  severity: string;
  time: string;
  resolved?: boolean;
}

export default function TemperatureMonitor() {
  const router = useRouter();
  const [currentTemp] = useState(4.2);
  const [targetMin] = useState(2.0);
  const [targetMax] = useState(8.0);
  const [sensorHealth] = useState({
    status: "Optimal",
    latency: "12ms",
    calibration: "3 days ago",
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("day");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const alerts: Alert[] = [
    {
      id: "1",
      type: "warning",
      title: "Door Open > 2 mins",
      message: "Check physical security",
      severity: "Warning",
      time: "10:45 AM",
    },
    {
      id: "2",
      type: "info",
      title: "System Auto-Calibrated",
      message: "Routine maintenance",
      severity: "Info",
      time: "Yesterday",
    },
    {
      id: "3",
      type: "error",
      title: "Temp Spike Detected",
      message: "Resolved by System",
      severity: "Resolved",
      time: "Yesterday",
      resolved: true,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin");
      return;
    }

    // Set current date and time
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
    setCurrentTime(
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );

    // Update time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  // Calculate temperature position in range (for visual indicator)
  const tempPosition =
    ((currentTemp - targetMin) / (targetMax - targetMin)) * 100;

  return (
    <div className="flex h-screen bg-[#f6f8f8] font-['Inter']">
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#111718]">
              Temperature Monitor
            </h2>
            <p className="mt-2 text-lg text-[#618689]">
              Real-time internal climate control status • Unit #402
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 border border-gray-200 shadow-sm">
              <span className="material-symbols-outlined text-[#618689]">
                calendar_today
              </span>
              <span className="text-sm font-medium text-[#111718]">
                {currentDate}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 border border-gray-200 shadow-sm">
              <span className="material-symbols-outlined text-[#618689]">
                schedule
              </span>
              <span className="text-sm font-medium text-[#111718]">
                {currentTime}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {/* Hero Temp Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] transition-all hover:shadow-lg border border-transparent">
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#618689]">
                  Current Temp
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter text-[#111718]">
                    {currentTemp.toFixed(1)}
                  </span>
                  <span className="text-2xl font-bold text-[#618689]">°C</span>
                </div>
              </div>
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-conic from-[#13daec] via-[#13daec] to-slate-200"
                style={{
                  background: `conic-gradient(#13daec 0% 65%, #e2e8f0 65% 100%)`,
                }}
              >
                <div className="absolute h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13daec] text-3xl">
                    thermostat
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 w-fit">
              <span className="material-symbols-outlined text-sm text-green-600">
                trending_up
              </span>
              <span className="text-sm font-bold text-green-600">
                +0.1% vs last hour
              </span>
            </div>
            {/* Decor bg */}
            <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-[#13daec]/5 blur-2xl"></div>
          </div>

          {/* Target Range Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-transparent">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#618689]">
                Target Range
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-medium text-[#618689] mb-1">
                    <span>{targetMin}°C</span>
                    <span>{targetMax}°C</span>
                  </div>
                  <div className="relative h-4 w-full rounded-full bg-gray-100">
                    {/* Range Indicator */}
                    <div className="absolute left-[20%] right-[20%] h-full rounded-full bg-[#13daec]/20"></div>
                    {/* Current Indicator */}
                    <div
                      className="absolute top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-[#13daec] shadow-sm transition-all"
                      style={{
                        left: `${Math.min(Math.max(tempPosition, 0), 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-[#111718]">
                {targetMin}°C - {targetMax}°C
              </p>
            </div>
            <p className="text-sm text-[#618689] mt-2">
              Optimal range for vaccines & insulin.
            </p>
          </div>

          {/* Sensor Health Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-transparent">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold uppercase tracking-wider text-[#618689]">
                Sensor Health
              </p>
              <span
                className="material-symbols-outlined text-green-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                health_and_safety
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {sensorHealth.status}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#618689]">Latency</span>
                  <span className="font-medium text-[#111718]">
                    {sensorHealth.latency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#618689]">Calibration</span>
                  <span className="font-medium text-[#111718]">
                    {sensorHealth.calibration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8 flex flex-col rounded-2xl bg-white p-6 lg:p-8 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-transparent">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#111718]">
                24-Hour Temperature History
              </h3>
              <p className="text-sm text-[#618689]">Average: 4.1°C</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod("day")}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  selectedPeriod === "day"
                    ? "bg-gray-100 text-[#618689]"
                    : "bg-white border border-gray-200 text-[#618689] hover:bg-gray-50"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setSelectedPeriod("week")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedPeriod === "week"
                    ? "bg-gray-100 text-[#618689]"
                    : "bg-white border border-gray-200 text-[#618689] hover:bg-gray-50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod("month")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedPeriod === "month"
                    ? "bg-gray-100 text-[#618689]"
                    : "bg-white border border-gray-200 text-[#618689] hover:bg-gray-50"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Chart SVG */}
          <div className="relative h-64 w-full">
            <svg
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 1200 300"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#13daec"
                    stopOpacity="0.3"
                  ></stop>
                  <stop
                    offset="100%"
                    stopColor="#13daec"
                    stopOpacity="0.0"
                  ></stop>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="1200"
                y1="75"
                y2="75"
              ></line>
              <line
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="1200"
                y1="150"
                y2="150"
              ></line>
              <line
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="1200"
                y1="225"
                y2="225"
              ></line>
              {/* Area */}
              <path
                d="M0,180 C100,170 150,200 250,190 C350,180 400,120 500,130 C600,140 650,160 750,150 C850,140 900,100 1000,110 C1100,120 1150,140 1200,130 V300 H0 Z"
                fill="url(#chartGradient)"
              ></path>
              {/* Line */}
              <path
                d="M0,180 C100,170 150,200 250,190 C350,180 400,120 500,130 C600,140 650,160 750,150 C850,140 900,100 1000,110 C1100,120 1150,140 1200,130"
                fill="none"
                stroke="#13daec"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              ></path>
              {/* Points */}
              <circle
                cx="500"
                cy="130"
                fill="#fff"
                r="6"
                stroke="#13daec"
                strokeWidth="3"
              ></circle>
              <circle
                cx="1000"
                cy="110"
                fill="#fff"
                r="6"
                stroke="#13daec"
                strokeWidth="3"
              ></circle>
            </svg>
            {/* X Axis Labels */}
            <div className="flex justify-between mt-4 text-xs font-medium text-[#618689]">
              <span>12 PM</span>
              <span>4 PM</span>
              <span>8 PM</span>
              <span>12 AM</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Alerts & Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Alerts */}
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-transparent">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#111718]">
                Recent Alerts
              </h3>
              <a
                className="text-sm font-bold text-[#13daec] hover:text-[#0eaebd]"
                href="#"
              >
                View All
              </a>
            </div>
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 ${
                    alert.type === "warning"
                      ? "border-orange-100 bg-orange-50/50"
                      : alert.type === "error"
                      ? "border-gray-100 bg-white opacity-75"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      alert.type === "warning"
                        ? "bg-orange-100 text-orange-600"
                        : alert.type === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {alert.type === "warning"
                        ? "warning"
                        : alert.type === "error"
                        ? "error"
                        : "info"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold text-[#111718] ${
                        alert.resolved
                          ? "line-through decoration-[#618689] decoration-2"
                          : ""
                      }`}
                    >
                      {alert.title}
                    </p>
                    <p className="text-sm text-[#618689]">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        alert.severity === "Warning"
                          ? "text-orange-600"
                          : alert.severity === "Resolved"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {alert.severity}
                    </p>
                    <p className="text-xs text-[#618689]">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-1 flex-col justify-center rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(19,218,236,0.1),0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-transparent">
            <h3 className="mb-5 text-xl font-bold text-[#111718]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[#f6f8f8] p-6 text-center transition-colors hover:bg-[#13daec]/5 hover:ring-2 hover:ring-[#13daec]/20">
                <span className="material-symbols-outlined text-3xl text-[#13daec]">
                  tune
                </span>
                <span className="text-sm font-bold text-[#111718]">
                  Calibrate Sensor
                </span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[#f6f8f8] p-6 text-center transition-colors hover:bg-[#13daec]/5 hover:ring-2 hover:ring-[#13daec]/20">
                <span className="material-symbols-outlined text-3xl text-[#13daec]">
                  download
                </span>
                <span className="text-sm font-bold text-[#111718]">
                  Export Logs
                </span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[#f6f8f8] p-6 text-center transition-colors hover:bg-[#13daec]/5 hover:ring-2 hover:ring-[#13daec]/20">
                <span className="material-symbols-outlined text-3xl text-[#13daec]">
                  refresh
                </span>
                <span className="text-sm font-bold text-[#111718]">
                  Refresh Data
                </span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[#f6f8f8] p-6 text-center transition-colors hover:bg-[#13daec]/5 hover:ring-2 hover:ring-[#13daec]/20">
                <span className="material-symbols-outlined text-3xl text-[#13daec]">
                  lock_open
                </span>
                <span className="text-sm font-bold text-[#111718]">
                  Remote Unlock
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
