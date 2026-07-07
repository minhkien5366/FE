"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import {
  Loader2,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  Disc,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  Armchair,
  Monitor,
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

export default function SuperAdminRoomViewPage() {
  const params = useParams();
  const router = useRouter();
  const cinemaItemId = params?.id;

  const [rooms, setRooms] = useState<any[]>([]);
  const [cinemaItem, setCinemaItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!cinemaItemId) return;

    try {
      setLoading(true);

      const [resItem, resRooms] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/cinema-items/${cinemaItemId}`),
        apiSuperAdminRequest(`/api/v1/rooms/cinema-item/${cinemaItemId}`),
      ]);

      const dataItem = await resItem.json();
      const dataRooms = await resRooms.json();

      setCinemaItem(dataItem.data || dataItem);
      setRooms(dataRooms.data || dataRooms || []);
    } catch (err) {
      toast.error("Lỗi kết nối dữ liệu hệ thống", adminToast);
    } finally {
      setLoading(false);
    }
  }, [cinemaItemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSeats = useMemo(() => {
    return rooms.reduce((sum, room) => sum + Number(room.totalSeats || 0), 0);
  }, [rooms]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [rooms]);

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
            Đang truy xuất dữ liệu phòng
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
                  Room Layout Registry
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                DANH SÁCH{" "}
                <span className="text-yellow-300">PHÒNG CHIẾU</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                <ShieldCheck size={12} className="text-cyan-300" />
                Giám sát nút:{" "}
                <span className="text-slate-300">
                  {cinemaItem?.name || "Cinema"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
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

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard
            icon={<LayoutGrid size={18} />}
            title="Tổng phòng chiếu"
            value={`${rooms.length.toLocaleString("vi-VN")} phòng`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Armchair size={18} />}
            title="Tổng sức chứa"
            value={`${totalSeats.toLocaleString("vi-VN")} ghế`}
            theme="cyan"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Trạng thái dữ liệu"
            value="Đang hoạt động"
            theme="emerald"
          />
        </section>

        {/* ROOM GRID LIST */}
        {sortedRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {sortedRooms.map((room) => (
              <div
                key={room.id}
                className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl p-6 transition-all duration-300 hover:border-cyan-300/35 overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)] cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
                onClick={() => router.push(`/super-admin/seat/${room.id}`)}
              >
                <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.025] group-hover:text-yellow-300/[0.07] transition-colors tracking-tighter pointer-events-none">
                  {String(room.id).padStart(2, "0")}
                </span>

                <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 group-hover:text-cyan-300 group-hover:bg-cyan-300/10 group-hover:border-cyan-300/30 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.22)] mb-8 relative z-10">
                  <LayoutGrid size={21} />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-base font-black uppercase text-white group-hover:text-yellow-200 transition-colors duration-200 tracking-[0.04em] truncate">
                      {room.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-fit px-2.5 py-1 bg-[#080c1b] border border-white/10 rounded-lg text-[9px] font-black uppercase text-cyan-300 tracking-[0.12em]">
                        {room.typeRoom || "Laser"}
                      </div>

                      <div className="w-fit px-2.5 py-1 bg-yellow-300/10 border border-yellow-300/25 rounded-lg text-[9px] font-black uppercase text-yellow-300 tracking-[0.12em]">
                        {room.totalSeats || 0} ghế
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between group-hover:border-cyan-300/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Disc
                        className="text-yellow-300 opacity-70 group-hover:opacity-100 group-hover:animate-spin transition-all"
                        size={13}
                      />

                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 group-hover:text-slate-300 transition-colors">
                        Cấu hình sơ đồ ghế
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Monitor className="mx-auto mb-4 text-slate-600" size={42} />

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              Phân hệ chưa có dữ liệu phòng chiếu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: {
      border: "hover:border-yellow-300/35",
      icon: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
      text: "text-yellow-300",
    },
    cyan: {
      border: "hover:border-cyan-300/35",
      icon: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
      text: "text-cyan-300",
    },
    emerald: {
      border: "hover:border-emerald-300/35",
      icon: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
    },
  };

  const currentTheme = themeMap[theme];

  return (
    <div
      className={`rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 ${currentTheme.border}`}
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${currentTheme.icon}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <p className={`text-sm font-black ${currentTheme.text}`}>{value}</p>
      </div>
    </div>
  );
}