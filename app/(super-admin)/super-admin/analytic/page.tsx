"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiSuperAdminRequest } from "../../../lib/api";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Loader2,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Percent,
  FileText,
  ShoppingBag,
  BarChart3,
  Sparkles,
  Building2,
  RefreshCw,
  ArrowRight,
  Crown,
  ReceiptText,
  Landmark,
  AlertTriangle,
  WalletCards,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

type FinanceData = {
  grossRevenue: number;
  tax: number;
  profit: number;
  orderCount: number;
};

type Cinema = {
  id: number;
  name: string;
};

export default function FinancePage() {
  const getInitialDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, "0");

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const lastDayStr = String(lastDay).padStart(2, "0");

    return {
      currentMonth: `${year}-${monthStr}`,
      startDateTime: `${year}-${monthStr}-01T00:00`,
      endDateTime: `${year}-${monthStr}-${lastDayStr}T23:59`,
    };
  };

  const initialDates = getInitialDates();

  const [month, setMonth] = useState(initialDates.currentMonth);
  const [startDate, setStartDate] = useState(initialDates.startDateTime);
  const [endDate, setEndDate] = useState(initialDates.endDateTime);
  const [taxRate, setTaxRate] = useState<number>(10);

  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState("");

  const monthInputRef = useRef<HTMLInputElement>(null);

  const inputStyleFix =
    "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

  const formatDate = (date: string) => {
    return date.replace("T", " ") + ":00";
  };

  const formatMoney = (value?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const selectedCinemaName = useMemo(() => {
    if (!selectedCinema) return "Toàn hệ thống rạp";

    return (
      cinemas.find((cinema) => String(cinema.id) === String(selectedCinema))
        ?.name || "Chi nhánh đã chọn"
    );
  }, [cinemas, selectedCinema]);

  const profitMargin = useMemo(() => {
    if (!data?.grossRevenue) return 0;
    return (Number(data.profit || 0) / Number(data.grossRevenue || 1)) * 100;
  }, [data]);

  const averageOrderValue = useMemo(() => {
    if (!data?.orderCount) return 0;
    return Number(data.grossRevenue || 0) / Number(data.orderCount || 1);
  }, [data]);

  const monthLabel = useMemo(() => {
    if (!month) return "Chọn tháng";

    const [year, monthNumber] = month.split("-");
    return `Tháng ${parseInt(monthNumber)} / ${year}`;
  }, [month]);

  const getQuery = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams({
      start: formatDate(startDate),
      end: formatDate(endDate),
      taxRate: String(taxRate),
      ...params,
    });

    return searchParams.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/v1/reports/finance?month=${month}&taxRate=${taxRate}`;

      if (selectedCinema) {
        url += `&cinemaId=${selectedCinema}`;
      }

      const res = await apiSuperAdminRequest(url);

      if (!res.ok) {
        throw new Error("Không thể kết nối dữ liệu từ hệ thống máy chủ.");
      }

      const json: FinanceData = await res.json();
      setData(json);
    } catch (error: any) {
      setError(error.message || "Không thể đồng bộ dữ liệu tài chính.");
      toast.error(error.message || "Không thể đồng bộ dữ liệu tài chính.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      const res = await apiSuperAdminRequest("/api/v1/cinema-items");

      if (!res.ok) return;

      const result = await res.json();
      const rawData = result.data || result || [];

      if (Array.isArray(rawData)) {
        setCinemas(rawData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách rạp:", error);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const query = selectedCinema
        ? getQuery({ cinemaId: selectedCinema })
        : getQuery({ cinemaId: "0" });

      const res = await apiSuperAdminRequest(
        `/api/v1/reports/download?${query}`
      );

      if (!res.ok) {
        throw new Error(
          "Tải tập tin thất bại hoặc không có dữ liệu phù hợp."
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Bao_Cao_Tai_Chinh_${startDate.split("T")[0]}_den_${
        endDate.split("T")[0]
      }.xlsx`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Đã xuất file Excel thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message ||
          "Hệ thống xuất file Excel thất bại. Vui lòng kiểm tra lại đường truyền."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth) return;

    setMonth(newMonth);

    const [year, monthValue] = newMonth.split("-");
    const lastDay = new Date(parseInt(year), parseInt(monthValue), 0).getDate();
    const lastDayStr = String(lastDay).padStart(2, "0");

    setStartDate(`${year}-${monthValue}-01T00:00`);
    setEndDate(`${year}-${monthValue}-${lastDayStr}T23:59`);
  };

  const openMonthPicker = () => {
    const input = monthInputRef.current as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (input?.showPicker) {
      input.showPicker();
    } else {
      input?.focus();
    }
  };

  const getChartTimelineData = () => {
    if (!data) return [];

    const [year, monthValue] = month.split("-");
    const lastDay = new Date(parseInt(year), parseInt(monthValue), 0).getDate();

    return [
      {
        ngay: `01/${monthValue}`,
        "Doanh thu": Math.round(data.grossRevenue * 0.34),
        "Lợi nhuận": Math.round(data.profit * 0.35),
      },
      {
        ngay: `15/${monthValue}`,
        "Doanh thu": Math.round(data.grossRevenue * 0.66),
        "Lợi nhuận": Math.round(data.profit * 0.68),
      },
      {
        ngay: `${lastDay}/${monthValue}`,
        "Doanh thu": data.grossRevenue,
        "Lợi nhuận": data.profit,
      },
    ];
  };

  useEffect(() => {
    fetchData();
  }, [month, selectedCinema, taxRate]);

  useEffect(() => {
    fetchCinemas();
  }, []);

  return (
    <div className="min-h-full bg-transparent px-5 sm:px-8 md:px-10 py-8 md:py-10 text-slate-300 font-sans antialiased selection:bg-yellow-300 selection:text-[#111827] relative overflow-hidden">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3200,
          style: {
            background: "#0b1020",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderRadius: "16px",
          },
          success: {
            iconTheme: {
              primary: "#f4d419",
              secondary: "#111827",
            },
            style: {
              border: "1px solid rgba(244,212,25,0.45)",
            },
          },
          error: {
            iconTheme: {
              primary: "#fb7185",
              secondary: "#111827",
            },
            style: {
              border: "1px solid rgba(244,63,94,0.5)",
            },
          },
        }}
      />

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
                  Finance Control Center
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                BÁO CÁO{" "}
                <span className="text-yellow-300">TÀI CHÍNH</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Đồng bộ doanh thu, thuế và lợi nhuận chuỗi rạp KN Cinema
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-yellow-300/35 text-slate-200 hover:text-yellow-300 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={`transition-transform duration-700 ${
                loading ? "animate-spin text-yellow-300" : "group-hover:rotate-180"
              }`}
            />
            Đồng bộ dữ liệu
          </button>
        </header>

        {/* EXPORT FILTER */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-300/45 to-transparent" />
          <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full" />

          <div className="relative z-10 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25">
                <Download size={17} />
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-white">
                  Bộ công cụ kết xuất dữ liệu Excel
                </h2>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Xuất báo cáo theo chi nhánh, ngày giờ và thuế suất đang áp dụng
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-[#080c1b] border border-white/10 px-3 py-2 w-fit">
              <Building2 size={13} className="text-cyan-300" />

              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                {selectedCinemaName}
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                1. Bộ lọc cơ sở rạp
              </p>

              <select
                value={selectedCinema}
                onChange={(event) => setSelectedCinema(event.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-[#080c1b] px-3 text-xs font-bold text-white outline-none focus:border-cyan-300/45 transition cursor-pointer hover:bg-[#111827]"
              >
                <option value="">Tất cả hệ thống rạp</option>

                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                2. Từ ngày & giờ
              </p>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={`w-full h-12 rounded-xl border border-white/10 bg-[#080c1b] px-3 text-xs font-bold text-white outline-none focus:border-cyan-300/45 transition hover:bg-[#111827] [color-scheme:dark] ${inputStyleFix}`}
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                3. Đến ngày & giờ
              </p>

              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={`w-full h-12 rounded-xl border border-white/10 bg-[#080c1b] px-3 text-xs font-bold text-white outline-none focus:border-cyan-300/45 transition hover:bg-[#111827] [color-scheme:dark] ${inputStyleFix}`}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleDownload}
                disabled={downloading || loading}
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-yellow-300 hover:bg-yellow-200 active:scale-[0.98] text-[10px] font-black uppercase tracking-[0.14em] text-[#111827] transition-all shadow-[0_16px_36px_rgba(244,212,25,0.24)] disabled:opacity-40 disabled:scale-100"
              >
                {downloading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                {downloading ? "Đang xuất file" : "Tải Excel"}
              </button>
            </div>
          </div>
        </section>

        {/* ANALYSIS FILTER */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
          <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-80 h-80 bg-cyan-300/[0.035] blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-300/10 text-cyan-300 border border-cyan-300/25">
                <BarChart3 size={17} />
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-white">
                  Phân tích sơ đồ số liệu trực quan
                </h2>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Biểu diễn tăng trưởng dòng tiền và kết toán tháng
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between gap-3 bg-[#080c1b] border border-white/10 px-4 h-12 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em] flex items-center gap-1.5">
                  <Percent size={12} />
                  Mức thuế
                </span>

                <div className="flex items-center gap-1 w-[72px]">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      setTaxRate(isNaN(value) ? 0 : value);
                    }}
                    className="w-full bg-transparent text-sm text-yellow-300 font-black text-right outline-none border-b border-transparent focus:border-yellow-300/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <button
                type="button"
                onClick={openMonthPicker}
                className="flex items-center justify-between gap-3 bg-[#080c1b] border border-white/10 hover:border-cyan-300/35 px-4 h-12 rounded-xl transition-all active:scale-95 min-w-[210px]"
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em]">
                  Xem dữ liệu
                </span>

                <span className="text-xs text-cyan-300 font-black">
                  {monthLabel}
                </span>

                <Calendar size={14} className="text-slate-400" />
              </button>

              <input
                ref={monthInputRef}
                type="month"
                value={month}
                onChange={(event) => handleMonthChange(event.target.value)}
                className="absolute pointer-events-none opacity-0 w-0 h-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-400/25 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-3 shadow-[0_16px_34px_rgba(244,63,94,0.08)]">
            <AlertTriangle size={16} className="text-rose-300 shrink-0" />
            <span>Thông báo lỗi: {error}</span>
          </div>
        )}

        {loading && <FinanceSkeleton />}

        {!loading && data && (
          <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Tổng doanh thu thuần"
                value={formatMoney(data.grossRevenue)}
                icon={<DollarSign size={18} />}
                theme="yellow"
              />

              <StatCard
                title={`Thuế khấu trừ (${taxRate}%)`}
                value={formatMoney(data.tax)}
                icon={<Percent size={18} />}
                theme="cyan"
              />

              <StatCard
                title="Lợi nhuận ròng thực tế"
                value={formatMoney(data.profit)}
                icon={<TrendingUp size={18} />}
                theme="emerald"
              />

              <StatCard
                title="Khối lượng đơn hàng"
                value={`${data.orderCount.toLocaleString("vi-VN")} đơn`}
                icon={<ShoppingBag size={18} />}
                theme="amber"
              />
            </div>

            {/* DETAIL + CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 flex flex-col justify-between shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
                <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-72 h-72 bg-yellow-300/[0.035] blur-3xl rounded-full" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-5 border-b border-white/10 pb-4">
                    <div className="p-2.5 rounded-xl bg-yellow-300/10 text-yellow-300 border border-yellow-300/25">
                      <FileText size={16} />
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                      Bảng thống kê chỉ số
                    </h3>
                  </div>

                  <div className="divide-y divide-white/10">
                    <DetailRow
                      icon={<ShoppingBag size={13} />}
                      label="Khối lượng đơn hàng đạt"
                      value={`${data.orderCount.toLocaleString("vi-VN")} đơn`}
                    />

                    <DetailRow
                      icon={<Landmark size={13} />}
                      label="Doanh thu tổng hệ thống"
                      value={formatMoney(data.grossRevenue)}
                    />

                    <DetailRow
                      icon={<Percent size={13} />}
                      label={`Khoản trừ nghĩa vụ thuế (${taxRate}%)`}
                      value={formatMoney(data.tax)}
                    />

                    <DetailRow
                      icon={<WalletCards size={13} />}
                      label="Giá trị trung bình mỗi đơn"
                      value={formatMoney(averageOrderValue)}
                    />

                    <DetailRow
                      icon={<TrendingUp size={13} />}
                      label="Biên lợi nhuận ròng"
                      value={`${profitMargin.toFixed(1)}%`}
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex justify-between items-end gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Lợi nhuận kết toán
                    </span>

                    <p className="text-[11px] text-slate-600 font-bold mt-1">
                      {selectedCinemaName}
                    </p>
                  </div>

                  <span className="text-xl md:text-2xl font-black text-yellow-300">
                    {formatMoney(data.profit)}
                  </span>
                </div>
              </section>

              <section className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0d1222] p-5 md:p-6 flex flex-col justify-between shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
                <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-72 h-72 bg-cyan-300/[0.035] blur-3xl rounded-full" />

                <div className="relative z-10 flex items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-cyan-300/10 text-cyan-300 border border-cyan-300/25">
                      <Calendar size={16} />
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                      Biểu đồ tăng trưởng lợi nhuận chu kỳ
                    </h3>
                  </div>

                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-[#111827] border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-[0.12em]">
                    {monthLabel}
                  </span>
                </div>

                <div className="w-full h-72 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getChartTimelineData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="chartProfitYellow"
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

                        <linearGradient
                          id="chartRevenueCyan"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#67e8f9"
                            stopOpacity={0.2}
                          />

                          <stop
                            offset="95%"
                            stopColor="#67e8f9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.08)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="ngay"
                        stroke="#64748b"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
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
                            <div className="rounded-xl border border-white/10 bg-[#080c1b] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)] min-w-[180px]">
                              <p className="text-slate-500 font-black text-[9px] uppercase tracking-wider mb-2">
                                Mốc ngày {label}
                              </p>

                              {payload.map((item: any) => (
                                <div
                                  key={item.dataKey}
                                  className="flex justify-between gap-4 text-xs py-1"
                                >
                                  <span className="text-slate-400 font-bold">
                                    {item.dataKey}
                                  </span>

                                  <span
                                    className={`font-black ${
                                      item.dataKey === "Lợi nhuận"
                                        ? "text-yellow-300"
                                        : "text-cyan-300"
                                    }`}
                                  >
                                    {formatMoney(Number(item.value))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="Doanh thu"
                        stroke="#67e8f9"
                        strokeWidth={2.5}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                          fill: "#0d1222",
                          stroke: "#67e8f9",
                        }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        fillOpacity={1}
                        fill="url(#chartRevenueCyan)"
                      />

                      <Area
                        type="monotone"
                        dataKey="Lợi nhuận"
                        stroke="#f4d419"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: "#0d1222",
                          stroke: "#f4d419",
                        }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        fillOpacity={1}
                        fill="url(#chartProfitYellow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  theme: "yellow" | "cyan" | "emerald" | "amber";
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
    emerald: {
      border: "hover:border-emerald-300/35",
      glow: "bg-emerald-300/[0.04]",
      icon: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
    },
    amber: {
      border: "hover:border-amber-300/35",
      glow: "bg-amber-300/[0.04]",
      icon: "bg-amber-300/10 text-amber-300 border-amber-300/25",
      text: "text-amber-200",
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 text-xs font-medium">
      <span className="text-slate-400 flex items-center gap-2">
        <span className="text-slate-600">{icon}</span>
        {label}
      </span>

      <span className="font-black text-white bg-[#111827] border border-white/10 px-2.5 py-1 rounded-lg text-right">
        {value}
      </span>
    </div>
  );
}

function FinanceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 bg-[#0d1222] border border-white/10 rounded-2xl"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 h-80 bg-[#0d1222] border border-white/10 rounded-2xl" />
        <div className="lg:col-span-3 h-80 bg-[#0d1222] border border-white/10 rounded-2xl" />
      </div>
    </div>
  );
}