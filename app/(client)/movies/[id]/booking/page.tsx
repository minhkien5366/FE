"use client";

import React, { useState, useEffect, use, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Loader2,
  Calendar,
  ChevronDown,
  Monitor,
  MapPin,
  Ticket,
  Clock3,
  Building2,
  Sparkles,
  Film,
  AlertCircle,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import { getTokenByRole } from "@/app/lib/auth";
import toast, { Toaster } from "react-hot-toast";

const userToast: any = {
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
};

const resolveMovieImg = (url?: string | null) => {
  if (!url) {
    return "https://placehold.co/900x1350/0b1020/f4d419?text=KN+Cinema";
  }

  return url.startsWith("http") ? url : getImageUrl(url);
};

const formatMoney = (value: number) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
};

export default function MovieBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(today));
  const [showPicker, setShowPicker] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  useEffect(() => {
    if (selectedDate) {
      fetchShowtimes();
    }
  }, [selectedDate, movieId]);

  const fetchMovieDetail = async () => {
    try {
      const res = await apiRequest(`/api/v1/movies/${movieId}`);
      const data = await res.json();

      if (res.ok) {
        setMovie(data.data || data);
      }
    } catch (error) {
      console.error("Lỗi lấy phim:", error);
      toast.error("Không thể tải thông tin phim", userToast);
    }
  };

  const fetchShowtimes = async () => {
    setLoading(true);

    try {
      const res = await apiRequest(
        `/api/v1/showtimes/movie/${movieId}?date=${selectedDate}`
      );
      const data = await res.json();

      const fetchedShowtimes = res.ok ? data.data || [] : [];
      const now = new Date();

      const futureShowtimes = fetchedShowtimes.filter((showtime: any) => {
        try {
          const start = new Date(showtime.startTime);
          const isFuture = start.getTime() > now.getTime();
          const isLiveStatus =
            showtime.status !== "CANCELLED" &&
            showtime.status !== "PENDING_CANCEL";

          return isFuture && isLiveStatus;
        } catch {
          return false;
        }
      });

      futureShowtimes.sort((a: any, b: any) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      setShowtimes(futureShowtimes);

      const parentCinemas = [
        ...new Set(
          futureShowtimes.map(
            (showtime: any) =>
              showtime.cinemaItem?.cinema?.name || "Khu vực khác"
          )
        ),
      ] as string[];

      if (parentCinemas.length > 0) {
        setSelectedParent((prev) =>
          prev && parentCinemas.includes(prev) ? prev : parentCinemas[0]
        );
      } else {
        setSelectedParent(null);
      }
    } catch (error) {
      console.error("Lỗi lấy suất chiếu:", error);
      toast.error("Không thể tải suất chiếu", userToast);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (showtimeId: string) => {
    const userToken = getTokenByRole("USER");

    if (!userToken) {
      toast.error("Vui lòng đăng nhập để đặt vé", userToast);
      router.push("/auth");
      return;
    }

    router.push(`/booking/${showtimeId}`);
  };

  const groupedShowtimes = useMemo(() => {
    return showtimes.reduce((acc: any, showtime: any) => {
      const parentName = showtime.cinemaItem?.cinema?.name || "Khu vực khác";
      const branchName =
        showtime.cinemaItem?.name ||
        showtime.cinemaItem?.address ||
        "Rạp KN Cinema";

      if (!acc[parentName]) {
        acc[parentName] = {};
      }

      if (!acc[parentName][branchName]) {
        acc[parentName][branchName] = [];
      }

      acc[parentName][branchName].push(showtime);

      return acc;
    }, {});
  }, [showtimes]);

  const parentList = Object.keys(groupedShowtimes);

  const getWeeklyDays = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    for (let index = 0; index < 14; index++) {
      const date = new Date();
      date.setDate(today.getDate() + index);

      days.push({
        full: formatLocalDate(date),
        date: date.getDate(),
        month: date.getMonth() + 1,
        name: index === 0 ? "Nay" : weekdays[date.getDay()],
        weekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }

    return days;
  };

  const selectedDateLabel = new Date(selectedDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  const selectedShowtimeCount = selectedParent
    ? Object.values(groupedShowtimes[selectedParent] || {}).flat().length
    : showtimes.length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans pb-16 selection:bg-yellow-300 selection:text-[#111827] relative overflow-hidden">
      <Toaster position="top-right" toastOptions={userToast} />

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      <section className="relative z-10">
        <div className="relative min-h-[260px] overflow-hidden border-b border-white/10 bg-[#0b1020]">
          <div className="absolute inset-0">
            <img
              src={resolveMovieImg(movie?.posterUrl)}
              alt={movie?.title || "KN Cinema"}
              className="w-full h-full object-cover opacity-25 blur-md scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/86 to-[#070b14]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-10">
            <div className="flex items-center justify-between gap-4 mb-10">
              <Link
                href={`/movies/${movieId}`}
                className="group flex items-center gap-3 no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0d1222] border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-all">
                  <ChevronLeft size={18} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Quay lại chi tiết phim
                  </p>

                  <h1 className="text-sm md:text-lg font-black uppercase tracking-[0.05em] text-white line-clamp-1 max-w-[520px] group-hover:text-yellow-200 transition-colors">
                    {movie?.title || "Đang tải phim"}
                  </h1>
                </div>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="flex items-center gap-2.5 px-4 h-11 bg-[#0d1222] rounded-xl border border-white/10 hover:border-cyan-300/35 transition-all shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                >
                  <Calendar size={14} className="text-yellow-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    {new Date(selectedDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>

                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      showPicker ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showPicker && (
                  <div className="absolute right-0 mt-3 z-30 bg-[#080c1b] border border-white/10 rounded-2xl p-3 w-52 shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
                    <input
                      type="date"
                      value={selectedDate}
                      min={formatLocalDate(today)}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setShowPicker(false);
                      }}
                      className="w-full bg-[#0d1222] border border-white/10 rounded-xl text-xs p-3 outline-none text-white color-scheme-dark focus:border-yellow-300/45"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-6 items-end">
              <div className="hidden lg:block relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#0d1222] shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
                <img
                  src={resolveMovieImg(movie?.posterUrl)}
                  className="w-full h-full object-cover"
                  alt={movie?.title || "poster"}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-transparent to-transparent" />
              </div>

              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-yellow-300/10 border border-yellow-300/25">
                    <Sparkles size={11} className="text-yellow-300" />

                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-200">
                      Lịch chiếu chính thức
                    </span>
                  </div>

                  <h2
                    className="text-[34px] md:text-[56px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                    style={{
                      fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                      WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                    }}
                  >
                    CHỌN <span className="text-yellow-300">SUẤT CHIẾU</span>
                  </h2>

                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mt-3">
                    {selectedDateLabel} • {selectedShowtimeCount} suất khả dụng
                  </p>
                </div>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                >
                  {getWeeklyDays().map((day) => {
                    const active = selectedDate === day.full;

                    return (
                      <button
                        key={day.full}
                        onClick={() => setSelectedDate(day.full)}
                        className={`flex flex-col items-center justify-center min-w-[58px] h-[66px] rounded-2xl border transition-all active:scale-95 ${
                          active
                            ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_36px_rgba(244,212,25,0.22)]"
                            : day.weekend
                              ? "bg-yellow-300/10 border-yellow-300/25 text-yellow-300 hover:bg-yellow-300/15"
                              : "bg-[#0d1222] border-white/10 text-slate-400 hover:border-cyan-300/35 hover:text-cyan-200 hover:bg-[#111827]"
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase opacity-75">
                          {day.name}
                        </span>

                        <span className="text-lg font-black leading-none mt-1">
                          {day.date}
                        </span>

                        <span className="text-[8px] font-bold opacity-60">
                          Th{day.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {!loading && parentList.length > 0 && (
              <div className="mt-8 pt-5 border-t border-white/10 flex gap-3 overflow-x-auto scrollbar-hide">
                {parentList.map((parent) => {
                  const active = selectedParent === parent;
                  const count = Object.values(groupedShowtimes[parent] || {}).flat()
                    .length;

                  return (
                    <button
                      key={parent}
                      onClick={() => setSelectedParent(parent)}
                      className={`whitespace-nowrap px-4 h-11 rounded-xl border text-[10px] font-black uppercase transition-all tracking-[0.12em] flex items-center gap-2 ${
                        active
                          ? "bg-cyan-300 text-[#111827] border-cyan-200 shadow-[0_16px_34px_rgba(103,232,249,0.16)]"
                          : "bg-[#0d1222] border-white/10 text-slate-500 hover:text-cyan-200 hover:border-cyan-300/35"
                      }`}
                    >
                      <Building2 size={13} />
                      {parent}
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                          active ? "bg-[#111827]/15" : "bg-white/[0.06]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 mt-8 space-y-6">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={30} />
            </div>

            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.22em] animate-pulse">
              Đang đồng bộ suất chiếu
            </p>
          </div>
        ) : selectedParent && groupedShowtimes[selectedParent] ? (
          Object.entries(groupedShowtimes[selectedParent]).map(
            ([branchName, times]: any) => {
              const firstShowtime = times?.[0];
              const cinemaItem = firstShowtime?.cinemaItem;

              return (
                <section
                  key={branchName}
                  className="relative bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.32)] hover:border-cyan-300/25 transition-all"
                >
                  <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-300/[0.035] blur-3xl" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-5 pb-5 border-b border-white/10 mb-5">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300 shrink-0">
                        <MapPin size={20} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base md:text-lg font-black uppercase tracking-[0.04em] text-white">
                            {branchName}
                          </h3>

                          <span className="px-2.5 py-1 rounded-lg bg-cyan-300/10 border border-cyan-300/25 text-cyan-300 text-[8px] font-black uppercase tracking-[0.12em]">
                            {times.length} suất
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed flex items-center gap-1.5">
                          <Building2 size={12} className="text-cyan-300 shrink-0" />
                          {cinemaItem?.address || cinemaItem?.city || "KN Cinema"}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/10 border border-emerald-300/25 px-3 py-1.5 w-fit">
                      <ShieldCheck size={12} className="text-emerald-300" />

                      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                        Đang mở bán
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                    {times.map((showtime: any) => {
                      const startDate = new Date(showtime.startTime);
                      const endDate = showtime.endTime
                        ? new Date(showtime.endTime)
                        : null;

                      const format = showtime.format || "2D Phụ Đề";
                      const price =
                        showtime.basePrice ||
                        showtime.price ||
                        showtime.ticketPrice ||
                        null;

                      return (
                        <button
                          key={showtime.id}
                          onClick={() => handleBookingClick(showtime.id)}
                          className="group relative min-h-[88px] rounded-2xl bg-[#080c1b] border border-white/10 hover:border-yellow-300/45 hover:bg-[#111827] transition-all active:scale-[0.98] overflow-hidden p-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
                        >
                          <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-yellow-300/[0.055] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="relative z-10 flex items-start justify-between gap-2">
                            <div>
                              <span className="block text-xl font-black text-white group-hover:text-yellow-200 leading-none">
                                {startDate.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {endDate && (
                                <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-600">
                                  <Clock3 size={10} />
                                  đến{" "}
                                  {endDate.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>

                            <Ticket
                              size={15}
                              className="text-slate-700 group-hover:text-yellow-300 shrink-0 transition-colors"
                            />
                          </div>

                          <div className="relative z-10 mt-4 flex items-center justify-between gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.12em] px-2 py-1 rounded-lg bg-cyan-300/10 border border-cyan-300/25 text-cyan-300">
                              {format}
                            </span>

                            {price && (
                              <span className="text-[9px] font-black text-yellow-300">
                                {formatMoney(price)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            }
          )
        ) : (
          <div className="py-28 text-center flex flex-col items-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
              <Monitor size={32} className="text-slate-600" />
            </div>

            <p className="text-[11px] uppercase font-black tracking-[0.18em] text-slate-500">
              Không có suất chiếu
            </p>

            <p className="text-[10px] mt-2 font-bold text-slate-600">
              Vui lòng chọn ngày khác hoặc khu vực khác
            </p>

            <button
              onClick={() => setSelectedDate(formatLocalDate(today))}
              className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95 flex items-center gap-2"
            >
              <CalendarDays size={14} />
              Quay về hôm nay
            </button>
          </div>
        )}
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        .color-scheme-dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}