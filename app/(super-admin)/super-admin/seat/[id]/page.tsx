"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import {
  Loader2,
  ArrowLeft,
  Armchair,
  ShieldCheck,
  Zap,
  Monitor,
  TrendingUp,
  MapPin,
  Heart,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  LayoutGrid,
  CircleDot,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const adminToast: any = {
  duration: 3400,
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
};

const LegendItem = ({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) => (
  <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10 last:border-none">
    <div className={`w-2 h-2 rounded-full ${colorClass}`} />

    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.14em] whitespace-nowrap">
      {label}
    </span>
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
  subIcon,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subIcon?: React.ReactNode;
  theme: "yellow" | "cyan" | "pink" | "emerald";
}) => {
  const themeMap = {
    yellow: {
      border: "hover:border-yellow-300/35",
      iconBox: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
      text: "text-yellow-300",
      glow: "bg-yellow-300/[0.045]",
    },
    cyan: {
      border: "hover:border-cyan-300/35",
      iconBox: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
      text: "text-cyan-300",
      glow: "bg-cyan-300/[0.045]",
    },
    pink: {
      border: "hover:border-pink-300/35",
      iconBox: "bg-pink-300/10 text-pink-300 border-pink-300/25",
      text: "text-pink-300",
      glow: "bg-pink-300/[0.045]",
    },
    emerald: {
      border: "hover:border-emerald-300/35",
      iconBox: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
      glow: "bg-emerald-300/[0.04]",
    },
  };

  const currentTheme = themeMap[theme];

  return (
    <div
      className={`relative overflow-hidden p-5 bg-[#0d1222] border border-white/10 rounded-2xl group transition-all duration-300 hover:-translate-y-1 shadow-[0_18px_50px_rgba(0,0,0,0.26)] ${currentTheme.border}`}
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${currentTheme.glow}`}
      />

      <div className="relative z-10">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${currentTheme.iconBox}`}
        >
          {icon}
        </div>

        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.16em]">
          {label}
        </p>

        <p className={`text-xl font-black mt-1 ${currentTheme.text}`}>
          {value}
        </p>
      </div>

      {subIcon && (
        <div className="absolute -bottom-3 -right-3 opacity-[0.025] group-hover:opacity-[0.06] transition-opacity text-white pointer-events-none">
          {subIcon}
        </div>
      )}
    </div>
  );
};

function SeatContent() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    if (!roomId) return;

    try {
      setLoading(true);

      const res = await apiSuperAdminRequest(`/api/v1/seats/room/${roomId}`);

      if (!res.ok) throw new Error();

      const responseData = await res.json();
      const rawSeats = responseData.data || [];

      const sortedSeats = [...rawSeats].sort((a: any, b: any) => {
        if (a.seatRow < b.seatRow) return -1;
        if (a.seatRow > b.seatRow) return 1;
        return parseInt(a.seatNumber) - parseInt(b.seatNumber);
      });

      setSeats(sortedSeats);
    } catch (err) {
      toast.error("Lỗi đồng bộ sơ đồ ghế", adminToast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [roomId]);

  const totalSeats = seats.length;

  const normalSeats = seats.filter(
    (seat) => seat.seatType?.toUpperCase() === "NORMAL"
  ).length;

  const vipSeats = seats.filter(
    (seat) => seat.seatType?.toUpperCase() === "VIP"
  ).length;

  const sweetboxSeats = seats.filter(
    (seat) => seat.seatType?.toUpperCase() === "SWEETBOX"
  ).length;

  const soldSeats = seats.filter(
    (seat) => seat.status?.toUpperCase() === "SOLD" || seat.status === false
  ).length;

  const roomData = seats[0]?.room || {};
  const cinemaData = roomData?.cinemaItem || {};
  const fillRate = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0;

  const groupedRows = useMemo(() => {
    const rows: { [key: string]: any[] } = {};

    seats.forEach((seat) => {
      const rowName = seat.seatRow || "A";

      if (!rows[rowName]) rows[rowName] = [];
      rows[rowName].push(seat);
    });

    Object.keys(rows).forEach((row) => {
      rows[row] = rows[row].sort(
        (a, b) => Number(a.seatNumber) - Number(b.seatNumber)
      );
    });

    return rows;
  }, [seats]);

  const sortedRowNames = useMemo(() => {
    return Object.keys(groupedRows).sort();
  }, [groupedRows]);

  const renderSeatGrid = () => {
    if (sortedRowNames.length === 0) {
      return (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#080c1b] min-w-[520px]">
          <Armchair className="mx-auto text-slate-600 mb-4" size={40} />

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Phòng này chưa có dữ liệu ghế
          </p>
        </div>
      );
    }

    return sortedRowNames.map((row) => (
      <div
        key={row}
        className="flex gap-4 justify-center items-center mb-2.5 last:mb-0"
      >
        <div className="w-7 text-[11px] font-black text-slate-700 uppercase text-center">
          {row}
        </div>

        <div className="flex gap-2">
          {groupedRows[row].map((seat: any) => {
            const type = seat.seatType?.toUpperCase();
            const isSold =
              seat.status?.toUpperCase() === "SOLD" || seat.status === false;
            const isSweet = type === "SWEETBOX";
            const isVip = type === "VIP";

            let seatStyle =
              "bg-[#111827] border-white/10 text-slate-400 hover:border-cyan-300/45 hover:text-cyan-200 hover:bg-cyan-300/10";
            let widthClass = "w-8";

            if (isSold) {
              seatStyle =
                "bg-[#080c1b] border-white/5 opacity-25 cursor-not-allowed text-slate-700";
            } else if (isVip) {
              seatStyle =
                "bg-yellow-300/10 border-yellow-300/35 text-yellow-200 hover:bg-yellow-300/16 hover:border-yellow-300/55 shadow-[0_0_16px_rgba(244,212,25,0.08)]";
            } else if (isSweet) {
              seatStyle =
                "bg-pink-300/10 border-pink-300/35 text-pink-200 hover:bg-pink-300/16 hover:border-pink-300/55 shadow-[0_0_16px_rgba(249,168,212,0.08)]";
              widthClass = "w-[66px]";
            }

            return (
              <div
                key={seat.id}
                title={`${seat.name || `${seat.seatRow}${seat.seatNumber}`} (${type})`}
                className={`h-8 rounded-lg border shrink-0 flex flex-col items-center justify-center transition-all duration-200 group/seat hover:-translate-y-0.5 active:scale-95 ${widthClass} ${seatStyle}`}
              >
                {isSweet ? (
                  <Heart
                    size={9}
                    className="mb-0.5 opacity-80 group-hover/seat:scale-110 transition-transform"
                    fill="currentColor"
                  />
                ) : (
                  <Armchair
                    size={9}
                    className="mb-0.5 opacity-55 group-hover/seat:opacity-90 transition-opacity"
                  />
                )}

                <span className="text-[7px] font-black leading-none tracking-tight">
                  {seat.seatRow}
                  {seat.seatNumber}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-7 text-[11px] font-black text-slate-700 uppercase text-center">
          {row}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <span className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase animate-pulse">
            Đang đồng bộ sơ đồ ghế
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* TOP */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-yellow-300 transition-all text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Quay lại
          </button>

          <div className="flex bg-[#0d1222] border border-white/10 rounded-2xl p-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.22)] overflow-x-auto custom-scrollbar">
            <LegendItem
              colorClass="bg-slate-500"
              label={`Thường (${normalSeats})`}
            />
            <LegendItem
              colorClass="bg-yellow-300"
              label={`VIP (${vipSeats})`}
            />
            <LegendItem
              colorClass="bg-pink-300"
              label={`Sweetbox (${sweetboxSeats})`}
            />
            <LegendItem
              colorClass="bg-[#080c1b] border border-white/10"
              label={`Đã bán (${soldSeats})`}
            />
          </div>
        </div>

        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <LayoutGrid size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Seat Layout Monitor
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                SƠ ĐỒ PHÒNG{" "}
                <span className="text-yellow-300">
                  {roomData.name || "SEAT LAYOUT"}
                </span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                <ShieldCheck size={12} className="text-cyan-300" />
                Giám sát nút:{" "}
                <span className="text-slate-300">
                  {cinemaData.name || "Cinema System"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchSeats}
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ
          </button>
        </header>

        {/* SCREEN */}
        <section className="rounded-2xl bg-[#0d1222] border border-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.32)] overflow-hidden">
          <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                <Monitor size={15} className="text-yellow-300" />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Màn hình & sơ đồ ghế
                </h3>

                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Tổng {totalSeats.toLocaleString("vi-VN")} vị trí ghế được ghi nhận
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-300/10 border border-emerald-300/25 px-3 py-1.5">
              <CheckCircle2 size={12} className="text-emerald-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                Online
              </span>
            </div>
          </div>

          <div className="px-5 md:px-8 py-8 md:py-10">
            <div className="w-full pt-4 pb-12 text-center relative">
              <div className="w-[70%] max-w-2xl h-[5px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent mx-auto rounded-full shadow-[0_0_34px_rgba(244,212,25,0.45)]" />
              <div className="w-[35%] h-14 bg-yellow-300/12 mx-auto blur-2xl absolute top-1 left-1/2 -translate-x-1/2" />

              <p className="text-[8px] font-black tracking-[1.4em] text-yellow-200/70 uppercase mt-5 ml-[1.4em]">
                Màn hình hiển thị chính
              </p>
            </div>

            <div className="overflow-x-auto pb-3 custom-scrollbar flex justify-start xl:justify-center">
              <div className="min-w-max px-8 md:px-10 py-8 bg-[#080c1b] border border-white/10 rounded-2xl shadow-inner">
                {renderSeatGrid()}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<Zap size={18} />}
            label="Quy mô phòng"
            value={`${totalSeats} chỗ ngồi`}
            theme="yellow"
            subIcon={<Monitor size={72} />}
          />

          <StatCard
            icon={<TrendingUp size={18} />}
            label="Hạng ghế VIP"
            value={`${vipSeats} ghế`}
            theme="cyan"
          />

          <StatCard
            icon={<Heart size={18} />}
            label="Hạng đôi tình nhân"
            value={`${sweetboxSeats} cặp`}
            theme="pink"
          />

          <StatCard
            icon={<MapPin size={18} />}
            label="Tỷ lệ lấp đầy"
            value={`${fillRate}%`}
            theme="emerald"
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b1020;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

export default function SuperAdminSeatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-transparent flex items-center justify-center font-black text-slate-500 text-[10px] uppercase tracking-[0.22em]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
            Đang khởi tạo phân hệ
          </div>
        </div>
      }
    >
      <SeatContent />
    </Suspense>
  );
}