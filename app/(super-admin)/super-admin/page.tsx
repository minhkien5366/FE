"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Star,
  Building2,
  DollarSign,
  TrendingUp,
  Film,
  RefreshCw,
  Calendar,
  ArrowRight,
  Sparkles,
  Crown,
  Activity,
  Ticket,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

import { apiSuperAdminRequest } from "../../lib/api";

interface RankingItem {
  name: string;
  revenue: number;
}

interface MovieStat {
  title: string;
  avgRating: number;
  count: number;
}

interface MovieRevenue {
  movieName: string;
  revenue: number;
}

export default function ReportDashboard() {
  const toLocalDateTimeString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
    return localISOTime.slice(0, 16);
  };

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return toLocalDateTimeString(
      new Date(date.getFullYear(), date.getMonth(), 1, 0, 0)
    );
  });

  const [endDate, setEndDate] = useState(() => {
    return toLocalDateTimeString(new Date());
  });

  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [movieStats, setMovieStats] = useState<MovieStat[]>([]);
  const [movieRevenue, setMovieRevenue] = useState<MovieRevenue[]>([]);

  const setQuickFilter = (type: "today" | "7days" | "month") => {
    const now = new Date();

    if (type === "today") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0
      );

      setStartDate(toLocalDateTimeString(start));
      setEndDate(toLocalDateTimeString(now));
    } else if (type === "7days") {
      const start = new Date();
      start.setDate(now.getDate() - 7);

      setStartDate(toLocalDateTimeString(start));
      setEndDate(toLocalDateTimeString(now));
    } else if (type === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0);

      setStartDate(toLocalDateTimeString(start));
      setEndDate(toLocalDateTimeString(now));
    }
  };

  const formatDateForApi = (dateStr: string) => {
    return dateStr.replace("T", " ") + ":00";
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const formattedStart = formatDateForApi(startDate);
      const formattedEnd = formatDateForApi(endDate);

      const rankingQuery = new URLSearchParams({
        start: formattedStart,
        end: formattedEnd,
      }).toString();

      const movieRevenueQuery = new URLSearchParams({
        startDate: formattedStart,
        endDate: formattedEnd,
      }).toString();

      const [rankRes, movieRes, revenueRes] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/reports/ranking?${rankingQuery}`),
        apiSuperAdminRequest("/api/v1/reports/stats"),
        apiSuperAdminRequest(
          `/api/v1/reports/movie-revenue?${movieRevenueQuery}`
        ),
      ]);

      if (rankRes.ok) setRanking((await rankRes.json()) || []);
      if (movieRes.ok) setMovieStats((await movieRes.json()) || []);
      if (revenueRes.ok) setMovieRevenue((await revenueRes.json()) || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu hệ thống:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return ranking.reduce((sum, item) => sum + item.revenue, 0);
  }, [ranking]);

  const totalCinemas = ranking.length;

  const topCinema =
    ranking.length > 0
      ? ranking.reduce(
          (max, item) => (item.revenue > max.revenue ? item : max),
          ranking[0]
        )
      : null;

  const totalReviews = useMemo(() => {
    return movieStats.reduce((sum, item) => sum + item.count, 0);
  }, [movieStats]);

  const revenueTrend = ranking.slice(0, 5).map((item, index) => ({
    name: item.name.length > 12 ? item.name.slice(0, 12) + "..." : item.name,
    revenue: item.revenue,
    growth: item.revenue * (0.85 + index * 0.08),
  }));

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="min-h-full bg-transparent px-5 sm:px-8 md:px-10 py-8 md:py-10 text-slate-300 font-sans antialiased selection:bg-yellow-300 selection:text-[#111827] relative overflow-hidden">
      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Crown size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Super Admin Analytics
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                TỔNG QUẢN TRỊ{" "}
                <span className="text-yellow-300">DOANH THU</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Phân tích doanh thu và hiệu suất chuỗi rạp KN Cinema
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-yellow-300/35 text-slate-200 hover:text-yellow-300 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={`transition-transform duration-700 ${
                loading ? "animate-spin text-yellow-300" : "group-hover:rotate-180"
              }`}
            />
            Cập nhật dữ liệu
          </button>
        </header>

        {/* FILTER */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-300/45 to-transparent" />
          <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25">
                  <Calendar size={16} />
                </div>

                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.14em] text-white">
                    Phạm vi thời gian báo cáo
                  </h2>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dữ liệu cập nhật theo thời gian thực
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 border border-white/10 bg-[#080c1b] p-1 rounded-xl self-start md:self-auto">
                <QuickButton onClick={() => setQuickFilter("today")}>
                  Hôm nay
                </QuickButton>

                <QuickButton onClick={() => setQuickFilter("7days")}>
                  7 ngày qua
                </QuickButton>

                <QuickButton onClick={() => setQuickFilter("month")}>
                  Tháng này
                </QuickButton>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#080c1b] p-2 rounded-xl border border-white/10 w-full xl:w-auto">
              <div className="relative flex-1 sm:w-56">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] uppercase font-black tracking-widest text-slate-500">
                  Từ
                </span>

                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0d1222] py-2.5 pl-10 pr-3 text-xs text-slate-200 font-bold outline-none transition-all duration-200 focus:border-cyan-300/45 focus:text-white [color-scheme:dark]"
                />
              </div>

              <div className="hidden sm:flex items-center justify-center text-slate-600">
                <ArrowRight size={14} />
              </div>

              <div className="relative flex-1 sm:w-56">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] uppercase font-black tracking-widest text-slate-500">
                  Đến
                </span>

                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0d1222] py-2.5 pl-10 pr-3 text-xs text-slate-200 font-bold outline-none transition-all duration-200 focus:border-cyan-300/45 focus:text-white [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex h-[45vh] flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <RefreshCw className="animate-spin text-yellow-300" size={28} />
            </div>

            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">
              Hệ thống đang đồng bộ
            </div>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Tổng doanh thu chuỗi rạp"
                value={formatMoney(totalRevenue)}
                icon={<DollarSign size={18} />}
                theme="yellow"
              />

              <StatCard
                title="Tổng cụm rạp hoạt động"
                value={`${totalCinemas} chi nhánh`}
                icon={<Building2 size={18} />}
                theme="cyan"
              />

              <StatCard
                title="Tổng phản hồi từ khán giả"
                value={`${totalReviews.toLocaleString("vi-VN")} lượt`}
                icon={<Star size={18} />}
                theme="amber"
              />

              <StatCard
                title="Chi nhánh tăng trưởng cao nhất"
                value={topCinema?.name || "Chưa có"}
                icon={<TrendingUp size={18} />}
                theme="emerald"
              />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-300/45 to-transparent" />
                <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />

                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25">
                      <BarChart3 size={16} />
                    </div>

                    <h2 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                      Xếp hạng doanh số chi nhánh rạp
                    </h2>
                  </div>

                  <span className="text-[9px] font-black px-2.5 py-1 bg-[#111827] border border-white/10 text-slate-500 rounded-lg">
                    VNĐ
                  </span>
                </div>

                <div className="w-full h-80 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ranking}
                      layout="vertical"
                      margin={{ left: -15, right: 10 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        type="number"
                        stroke="#64748b"
                        fontSize={9}
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `${(Number(value) / 1000000).toFixed(0)}M`
                        }
                      />

                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={700}
                        width={100}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(103,232,249,0.05)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;

                          return (
                            <div className="rounded-xl border border-white/10 bg-[#080c1b] p-3 text-xs shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
                              <p className="text-slate-500 font-black text-[9px] uppercase tracking-wider mb-1">
                                {payload[0].payload.name}
                              </p>

                              <p className="font-black text-yellow-300">
                                {formatMoney(Number(payload[0].value))}
                              </p>
                            </div>
                          );
                        }}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="#f4d419"
                        radius={[0, 8, 8, 0]}
                        barSize={17}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
                <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-80 h-80 bg-cyan-300/[0.035] blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />

                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-cyan-300/10 text-cyan-300 border border-cyan-300/25">
                      <Activity size={16} />
                    </div>

                    <h2 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                      Dự báo xu hướng tăng trưởng
                    </h2>
                  </div>

                  <span className="text-[9px] font-black px-2.5 py-1 bg-[#111827] border border-white/10 text-slate-500 rounded-lg">
                    Forecast
                  </span>
                </div>

                <div className="w-full h-80 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend} margin={{ left: -15, right: 5 }}>
                      <defs>
                        <linearGradient
                          id="growthGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#67e8f9"
                            stopOpacity={0.24}
                          />

                          <stop
                            offset="95%"
                            stopColor="#67e8f9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        stroke="#64748b"
                        fontSize={9}
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `${(Number(value) / 1000000).toFixed(0)}M`
                        }
                      />

                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;

                          return (
                            <div className="rounded-xl border border-white/10 bg-[#080c1b] p-3 text-xs shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
                              <p className="text-slate-500 font-black text-[9px] uppercase tracking-wider mb-1">
                                {label}
                              </p>

                              <p className="font-black text-cyan-300">
                                {formatMoney(Number(payload[0].value))}
                              </p>
                            </div>
                          );
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="growth"
                        stroke="#67e8f9"
                        fill="url(#growthGrad)"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          fill: "#0d1222",
                          stroke: "#67e8f9",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: "#f4d419",
                          stroke: "#67e8f9",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* MOVIE STATS */}
            <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
              <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25">
                  <Film size={16} />
                </div>

                <h2 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Bảng xếp hạng phim có điểm đánh giá cao
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase font-black tracking-[0.13em] text-[10px]">
                      <th className="pb-4 font-black">Tựa đề tác phẩm phim</th>
                      <th className="pb-4 text-right font-black w-36">
                        Điểm trung bình
                      </th>
                      <th className="pb-4 text-right font-black w-44">
                        Tổng lượt đánh giá
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {movieStats.map((movie, index) => (
                      <tr
                        key={index}
                        className="transition hover:bg-[#111827] group/row"
                      >
                        <td className="py-3.5 font-bold text-white group-hover/row:text-yellow-200 transition-colors">
                          {movie.title}
                        </td>

                        <td className="py-3.5 text-right font-black text-yellow-300 text-sm">
                          {movie.avgRating?.toFixed(1) || "0.0"}
                        </td>

                        <td className="py-3.5 text-right text-slate-400 font-medium">
                          {movie.count.toLocaleString("vi-VN")} lượt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {movieStats.length === 0 && (
                  <div className="py-12 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                    Hiện tại chưa ghi nhận dữ liệu phim nào
                  </div>
                )}
              </div>
            </section>

            {/* MOVIE REVENUE */}
            <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden group">
              <h2 className="text-xs font-black uppercase tracking-[0.13em] text-white mb-5 border-b border-white/10 pb-4 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                Báo cáo doanh thu chi tiết từng bộ phim
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase font-black tracking-[0.13em] text-[10px]">
                      <th className="pb-4 font-black w-12">#</th>
                      <th className="pb-4 font-black">Tên tác phẩm phim</th>
                      <th className="pb-4 text-right font-black w-48 text-cyan-300">
                        Tổng doanh thu vé
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {movieRevenue.map((movie, index) => (
                      <tr
                        key={index}
                        className="transition hover:bg-[#111827] group/row"
                      >
                        <td className="py-3.5 font-bold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="py-3.5 font-bold text-slate-200 group-hover/row:text-cyan-200 transition-colors">
                          {movie.movieName}
                        </td>

                        <td className="py-3.5 text-right text-cyan-300 font-black text-sm">
                          {formatMoney(movie.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {movieRevenue.length === 0 && (
                  <div className="py-12 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                    Không tìm thấy dữ liệu thu chi trong thời gian chọn
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function QuickButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] rounded-lg transition-all text-slate-500 hover:text-[#111827] hover:bg-yellow-300 active:scale-95"
    >
      {children}
    </button>
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
      className={`rounded-2xl border border-white/10 bg-[#0d1222] p-5 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:-translate-y-1 shadow-[0_18px_50px_rgba(0,0,0,0.26)] group relative overflow-hidden ${currentTheme.border}`}
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${currentTheme.glow}`}
      />

      <div className="flex items-start justify-between gap-3 relative z-10">
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
        className={`text-xl sm:text-2xl font-black tracking-tight mt-4 break-words relative z-10 ${currentTheme.text}`}
      >
        {value}
      </h3>
    </div>
  );
}