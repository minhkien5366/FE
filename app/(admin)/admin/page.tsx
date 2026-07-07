"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Ticket,
  Film,
  TrendingUp,
  Loader2,
  BarChart3,
  Download,
  RefreshCw,
  Sparkles,
  CalendarDays,
  Gift,
  Layers,
  Percent,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { apiAdminRequest } from "@/app/lib/api";

interface DashboardStats {
  todayRevenue: number;
  todayTickets: number;
  todayShowtimes: number;
  occupancy: number;
}

interface ChartItem {
  day: string;
  revenue: number;
}

interface ComboReport {
  comboId: number;
  comboName: string;
  totalQuantity: number;
  totalRevenue: number;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState<number>(10);

  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayTickets: 0,
    todayShowtimes: 0,
    occupancy: 0,
  });

  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [comboReport, setComboReport] = useState<ComboReport[]>([]);

  const fetchMe = async () => {
    try {
      const res = await apiAdminRequest("/api/v1/users/me");
      if (!res.ok) return;

      const json = await res.json();
      const id = json?.data?.managedCinemaItemId;

      if (id) setCinemaId(Number(id));
    } catch (err) {
      console.error("❌ Lỗi cấu hình tài khoản:", err);
    }
  };

  const fetchDashboard = async (cid: number) => {
    try {
      setLoading(true);

      const query = `?cinemaId=${cid}`;

      const [dashRes, chartRes, comboRes] = await Promise.all([
        apiAdminRequest(`/api/v1/reports/dashboard${query}`),
        apiAdminRequest(`/api/v1/reports/revenue-7days${query}`),
        apiAdminRequest(`/api/v1/reports/combo-best-selling${query}`),
      ]);

      if (dashRes.ok) setStats(await dashRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (comboRes.ok) setComboReport(await comboRes.json());
    } catch (err) {
      console.error("❌ Lỗi tải hệ thống số liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const format = (date: Date) =>
      date.toISOString().slice(0, 19).replace("T", " ");

    return { start: format(start), end: format(end) };
  };

  const exportExcel = async () => {
    if (!cinemaId) return;

    try {
      setExporting(true);

      const range = getTodayRange();

      const query = new URLSearchParams({
        cinemaId: String(cinemaId),
        start: range.start,
        end: range.end,
        taxRate: String(taxRate),
      });

      const res = await apiAdminRequest(`/api/v1/reports/download?${query}`);

      if (!res.ok) return;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `bao-cao-doanh-thu-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Lỗi xuất tệp Excel:", err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (cinemaId !== null) fetchDashboard(cinemaId);
  }, [cinemaId]);

  return (
    <div className="min-h-full bg-transparent px-5 sm:px-8 md:px-10 py-8 md:py-10 text-slate-300 font-sans antialiased relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[920px] h-[360px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute top-[280px] right-[-170px] w-[540px] h-[540px] bg-cyan-400/[0.025] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-170px] w-[540px] h-[540px] bg-yellow-300/[0.018] blur-[160px] rounded-full" />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
              <Sparkles size={11} className="text-yellow-300 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                Live Monitoring Center
              </span>
            </div>

            <h1
              className="text-[34px] md:text-[52px] font-black uppercase tracking-[-0.05em] leading-none text-white"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              }}
            >
              THỐNG KÊ & BÁO CÁO
            </h1>

            <p className="text-xs text-slate-500 mt-3 flex items-center gap-2 font-bold">
              Chi nhánh quản lý:
              <span className="px-2 py-0.5 rounded-md bg-[#111827] border border-white/10 font-mono font-black text-yellow-300">
                #{cinemaId ?? "---"}
              </span>
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1222] px-4 h-[46px] shadow-[0_14px_34px_rgba(0,0,0,0.24)] group/tax transition-all duration-300 hover:border-cyan-300/35 hover:bg-[#111827]">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Percent
                  size={13}
                  className="text-slate-500 group-hover/tax:text-cyan-300 transition-colors"
                />

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Thuế suất
                </span>
              </div>

              <div className="flex items-center gap-0.5 border-b border-white/10 focus-within:border-yellow-300/60 pb-0.5 transition-all">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) =>
                    setTaxRate(
                      Math.max(0, Math.min(100, Number(e.target.value)))
                    )
                  }
                  className="bg-transparent text-white font-mono font-black text-sm outline-none w-8 text-center border-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <span className="text-xs font-bold text-slate-600 font-mono select-none">
                  %
                </span>
              </div>
            </div>

            <button
              onClick={exportExcel}
              disabled={!cinemaId || exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-[46px] rounded-xl border border-yellow-300/25 bg-yellow-300 hover:bg-yellow-200 text-xs font-black uppercase tracking-wider text-[#111827] transition-all duration-300 active:scale-95 disabled:opacity-40 shadow-[0_16px_36px_rgba(244,212,25,0.22)]"
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {exporting ? "Đang trích xuất..." : "Xuất file Excel"}
            </button>

            <button
              onClick={() => cinemaId && fetchDashboard(cinemaId)}
              className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0d1222] hover:bg-[#111827] px-5 h-[46px] text-xs font-black uppercase tracking-wider text-slate-300 hover:text-cyan-200 transition-all duration-300 hover:border-cyan-300/35 active:scale-95 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
            >
              <RefreshCw
                size={14}
                className={`transition-transform duration-700 ${
                  loading
                    ? "animate-spin text-yellow-300"
                    : "group-hover:rotate-180"
                }`}
              />
              Làm mới dữ liệu
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex h-[55vh] flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={28} />
            </div>

            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">
              Đang đồng bộ dữ liệu rạp thời gian thực
            </span>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatCard
                title="Doanh thu ngày hôm nay"
                value={formatVND(stats.todayRevenue)}
                icon={<DollarSign size={18} />}
                theme="yellow"
              />

              <StatCard
                title="Tổng lượng vé đã bán hôm nay"
                value={`${(stats.todayTickets || 0).toLocaleString("vi-VN")} vé`}
                icon={<Ticket size={18} />}
                theme="cyan"
              />

              <StatCard
                title="Suất chiếu đang vận hành"
                value={`${stats.todayShowtimes} suất`}
                icon={<Film size={18} />}
                theme="amber"
              />

              <StatCard
                title="Tỷ lệ lấp đầy ghế rạp"
                value={`${(stats.occupancy || 0).toFixed(0)}%`}
                icon={<TrendingUp size={18} />}
                theme="emerald"
              />
            </div>

            {/* REVENUE CHART */}
            <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-7 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-300/45 to-transparent" />
              <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25 shadow-inner">
                    <BarChart3 size={16} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                      Phân tích xu hướng doanh thu
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Biến động chu kỳ lịch sử 7 ngày gần nhất
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black px-3 py-1.5 bg-[#111827] rounded-lg border border-white/10 text-slate-500 self-start sm:self-auto">
                  Đơn vị hiển thị: VNĐ
                </span>
              </div>

              <div className="w-full h-80 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ left: -20, right: 5, top: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="knChartGlow"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f4d419"
                          stopOpacity={0.24}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f4d419"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="5 5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />

                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-5}
                      tickFormatter={(value) =>
                        `${(Number(value) / 1000000).toFixed(0)}M`
                      }
                    />

                    <Tooltip
                      cursor={{
                        stroke: "rgba(103,232,249,0.28)",
                        strokeWidth: 1,
                      }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;

                        return (
                          <div className="rounded-xl border border-white/10 bg-[#080c1b] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)] min-w-[160px]">
                            <div className="mb-2 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                              <CalendarDays
                                size={11}
                                className="text-yellow-300"
                              />
                              <span>{label}</span>
                            </div>

                            <p className="font-black text-yellow-300 text-base">
                              {formatVND(Number(payload[0].value))}
                            </p>
                          </div>
                        );
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f4d419"
                      fill="url(#knChartGlow)"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#0d1222",
                        stroke: "#f4d419",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#67e8f9",
                        stroke: "#f4d419",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* COMBO REPORT */}
            <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-7 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
              <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-80 h-80 bg-cyan-300/[0.035] blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />

              <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-300/10 text-cyan-300 border border-cyan-300/25 shadow-inner">
                    <Gift size={16} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                      Bảng xếp hạng combo bán chạy hôm nay
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Thống kê dịch vụ quầy bắp nước thời gian thực
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 bg-cyan-300/10 border border-cyan-300/20 text-cyan-200 rounded-md">
                  <Layers size={10} />
                  Đang hoạt động
                </div>
              </div>

              {comboReport.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-600 gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center">
                    <Gift size={26} className="stroke-[1.5]" />
                  </div>

                  <span className="text-xs font-medium">
                    Hôm nay chưa phát sinh giao dịch quầy combo
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto w-full rounded-xl border border-white/10 bg-[#080c1b] relative z-10">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#111827] text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 border-b border-white/10">
                        <th className="text-left p-4 pl-6">
                          Tên vật phẩm combo
                        </th>

                        <th className="text-center p-4 w-32">
                          Số lượng bán
                        </th>

                        <th className="text-right p-4 pr-6 w-44">
                          Tổng doanh thu quầy
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {comboReport.map((combo, index) => (
                        <tr
                          key={combo.comboId}
                          className="hover:bg-[#111827] transition-colors group/row"
                        >
                          <td className="p-4 pl-6 font-bold text-slate-200 group-hover/row:text-yellow-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 flex items-center justify-center text-[10px] font-black bg-[#0d1222] border border-white/10 rounded-md text-slate-500 group-hover/row:border-yellow-300/35 group-hover/row:text-yellow-300">
                                {index + 1}
                              </span>

                              <span>{combo.comboName}</span>
                            </div>
                          </td>

                          <td className="p-4 text-center font-mono font-bold text-slate-300">
                            <span className="px-2.5 py-1 rounded-md bg-[#0d1222] border border-white/10 text-xs">
                              {combo.totalQuantity.toLocaleString("vi-VN")}
                            </span>
                          </td>

                          <td className="p-4 text-right font-black text-cyan-300 font-mono pr-6">
                            {formatVND(combo.totalRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  theme: "yellow" | "cyan" | "amber" | "emerald";
}

function StatCard({ title, value, icon, theme }: StatCardProps) {
  const themeMap = {
    yellow: {
      border: "hover:border-yellow-300/35",
      glow: "bg-yellow-300/[0.045]",
      icon: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
      text: "text-yellow-300",
    },
    cyan: {
      border: "hover:border-cyan-300/35",
      glow: "bg-cyan-300/[0.045]",
      icon: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
      text: "text-cyan-300",
    },
    amber: {
      border: "hover:border-amber-300/35",
      glow: "bg-amber-300/[0.04]",
      icon: "bg-amber-300/10 text-amber-300 border-amber-300/25",
      text: "text-amber-200",
    },
    emerald: {
      border: "hover:border-emerald-300/35",
      glow: "bg-emerald-300/[0.04]",
      icon: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
    },
  };

  const currentTheme = themeMap[theme];

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:-translate-y-1 shadow-[0_18px_50px_rgba(0,0,0,0.26)] group relative overflow-hidden ${currentTheme.border}`}
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${currentTheme.glow}`}
      />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
          {title}
        </p>

        <div
          className={`p-2.5 rounded-xl border transition-all duration-300 ${currentTheme.icon}`}
        >
          {icon}
        </div>
      </div>

      <h3
        className={`text-2xl font-black tracking-tight mt-4 truncate relative z-10 ${currentTheme.text}`}
      >
        {value}
      </h3>
    </div>
  );
}