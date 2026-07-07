"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import {
  Loader2,
  Calendar,
  Clock,
  Film,
  MapPin,
  ChevronLeft,
  Monitor,
  Ticket,
  Star,
  Globe,
  User,
  Layers,
  Info,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Clapperboard,
  CircleDollarSign,
  BadgeCheck,
  Building2,
  Armchair,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

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

export default function ShowtimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [showtime, setShowtime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await apiSuperAdminRequest(`/api/v1/showtimes/${id}`);
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData?.message || "Không thể tải suất chiếu");
      }

      setShowtime(responseData.data || responseData);
    } catch (err: any) {
      console.error("Lỗi lấy chi tiết suất chiếu:", err);
      toast.error(err?.message || "Lỗi lấy chi tiết suất chiếu", adminToast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const startTime = useMemo(() => {
    return showtime?.startTime ? dayjs(showtime.startTime) : null;
  }, [showtime]);

  const endTime = useMemo(() => {
    return showtime?.endTime ? dayjs(showtime.endTime) : null;
  }, [showtime]);

  const isPast = useMemo(() => {
    return startTime ? startTime.isBefore(dayjs()) : false;
  }, [startTime]);

  const posterSrc =
    showtime?.movie?.posterUrl || showtime?.movie?.imageUrl || "/placeholder-movie.jpg";

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
            Đang đồng bộ chi tiết suất chiếu
          </span>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center text-center gap-4">
          <Film className="text-slate-600" size={44} />

          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Không tìm thấy suất chiếu hệ thống
          </p>

          <button
            onClick={() => router.back()}
            className="h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
          >
            Quay lại
          </button>
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
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-yellow-300 transition-all text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <ChevronLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Quay lại
          </button>

          <button
            onClick={fetchDetail}
            disabled={loading}
            className="h-11 px-4 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ
          </button>
        </div>

        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Clapperboard size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Showtime Detail
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CHI TIẾT{" "}
                <span className="text-yellow-300">SUẤT CHIẾU</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                <ShieldCheck size={12} className="text-cyan-300" />
                SHOWTIME_ID #{String(id)}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] ${
              isPast
                ? "bg-slate-500/10 border-slate-500/25 text-slate-400"
                : "bg-emerald-300/10 border-emerald-300/25 text-emerald-300"
            }`}
          >
            <BadgeCheck size={15} />

            <span className="text-[10px] font-black uppercase tracking-[0.14em]">
              {isPast ? "Đã qua thời gian chiếu" : "Đang hiệu lực"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <aside className="xl:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_28px_80px_rgba(0,0,0,0.45)] bg-[#0d1222] group">
                <img
                  src={posterSrc}
                  alt={showtime.movie?.title || "Movie poster"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder-movie.jpg";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/10 to-transparent" />

                <div className="absolute left-4 right-4 bottom-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 text-[#111827] rounded-xl text-[9px] font-black uppercase tracking-[0.13em] shadow-[0_12px_28px_rgba(244,212,25,0.24)]">
                    <Film size={12} />
                    {showtime.movie?.status || "Now Showing"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/super-admin/seat/${showtime.room?.id}`)}
                className="w-full h-12 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black text-[10px] uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
              >
                <Ticket size={15} />
                Quản lý sơ đồ ghế phòng
              </button>
            </div>
          </aside>

          <main className="xl:col-span-8 space-y-6">
            <section className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
              <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full" />

              <div className="relative z-10 space-y-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[-0.04em] leading-tight text-white">
                    {showtime.movie?.title || "Tên phim chưa cập nhật"}
                  </h2>

                  <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-3xl mt-3">
                    {showtime.movie?.description || "Phim chưa có mô tả chi tiết."}
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <InfoItem
                    icon={<Clock size={14} />}
                    label="Thời lượng"
                    value={`${showtime.movie?.duration || 0} phút`}
                    theme="yellow"
                  />

                  <InfoItem
                    icon={<Star size={14} />}
                    label="Đánh giá"
                    value={`${showtime.movie?.rating || 0} / 5`}
                    theme="cyan"
                  />

                  <InfoItem
                    icon={<Globe size={14} />}
                    label="Quốc gia"
                    value={showtime.movie?.country || "N/A"}
                    theme="emerald"
                  />

                  <InfoItem
                    icon={<Layers size={14} />}
                    label="Thể loại"
                    value={
                      showtime.movie?.genre?.name ||
                      showtime.movie?.genreNames?.join(", ") ||
                      "N/A"
                    }
                    theme="amber"
                  />
                </div>
              </div>
            </section>

            <section className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 space-y-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden">
              <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-80 h-80 bg-cyan-300/[0.035] blur-3xl rounded-full" />

              <div className="relative z-10 flex items-center gap-2.5 text-yellow-300 font-black text-[10px] uppercase tracking-[0.16em] border-b border-white/10 pb-4">
                <Info size={14} />
                <span>Cấu hình thời gian & phân bổ</span>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailBlock
                  icon={<Calendar size={17} />}
                  label="Ngày khởi chiếu"
                  value={startTime ? startTime.format("DD [Tháng] MM, YYYY") : "N/A"}
                  theme="yellow"
                />

                <DetailBlock
                  icon={<Clock size={17} />}
                  label="Khung giờ vận hành"
                  value={
                    startTime && endTime
                      ? `${startTime.format("HH:mm")} — ${endTime.format("HH:mm")}`
                      : "N/A"
                  }
                  theme="cyan"
                />

                <DetailBlock
                  icon={<Monitor size={17} />}
                  label="Hệ thống phòng"
                  value={`Phòng ${showtime.room?.name || "N/A"} (${
                    showtime.room?.totalSeats || 0
                  } ghế)`}
                  theme="emerald"
                />

                <DetailBlock
                  icon={<MapPin size={17} />}
                  label="Điểm đặt cụm rạp"
                  value={showtime.cinemaItem?.name || "N/A"}
                  theme="amber"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TalentCard
                icon={<User size={15} />}
                label="Đạo diễn sản xuất"
                value={showtime.movie?.director || "Đang cập nhật"}
              />

              <TalentCard
                icon={<Film size={15} />}
                label="Đội ngũ diễn viên chính"
                value={showtime.movie?.cast || "Đang cập nhật"}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MiniStat
                icon={<Building2 size={16} />}
                label="Cụm rạp"
                value={showtime.cinemaItem?.name || "N/A"}
              />

              <MiniStat
                icon={<Armchair size={16} />}
                label="Sức chứa phòng"
                value={`${showtime.room?.totalSeats || 0} ghế`}
              />

              <MiniStat
                icon={<CircleDollarSign size={16} />}
                label="Giá vé cơ bản"
                value={
                  showtime.price
                    ? `${Number(showtime.price).toLocaleString("vi-VN")}đ`
                    : "N/A"
                }
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  theme: "yellow" | "cyan" | "emerald" | "amber";
}) {
  const themeMap = {
    yellow: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
    cyan: "text-cyan-300 bg-cyan-300/10 border-cyan-300/25",
    emerald: "text-emerald-300 bg-emerald-300/10 border-emerald-300/25",
    amber: "text-amber-300 bg-amber-300/10 border-amber-300/25",
  };

  return (
    <div className="bg-[#080c1b] p-4 rounded-xl border border-white/10 min-w-0 hover:border-cyan-300/25 transition-all">
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.14em] mb-1">
        {label}
      </p>

      <p className="text-xs font-black text-white uppercase truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}

function DetailBlock({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: "yellow" | "cyan" | "emerald" | "amber";
}) {
  const themeMap = {
    yellow: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
    cyan: "text-cyan-300 bg-cyan-300/10 border-cyan-300/25",
    emerald: "text-emerald-300 bg-emerald-300/10 border-emerald-300/25",
    amber: "text-amber-300 bg-amber-300/10 border-amber-300/25",
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-[#080c1b] border border-white/10 rounded-xl hover:border-cyan-300/25 transition-all min-w-0">
      <div
        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.14em] mb-1">
          {label}
        </p>

        <p className="text-sm font-black text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function TalentCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#0d1222] border border-white/10 p-5 rounded-2xl shadow-[0_16px_34px_rgba(0,0,0,0.22)] hover:border-yellow-300/25 transition-all">
      <span className="text-slate-500 font-black text-[9px] uppercase tracking-[0.16em] mb-2 flex items-center gap-1.5">
        <span className="text-yellow-300">{icon}</span>
        {label}
      </span>

      <span className="text-xs font-bold text-slate-300 line-clamp-2">
        {value}
      </span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] hover:border-cyan-300/25 transition-all">
      <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center text-cyan-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <p className="text-sm font-black text-white truncate">{value}</p>
      </div>
    </div>
  );
}