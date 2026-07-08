"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  Film,
  Sparkles,
  CalendarDays,
  Ticket,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { apiRequest } from "@/app/lib/api";
import { getTokenByRole } from "@/app/lib/auth";

import CinemaGroup from "./components/CinemaGroup";
import MovieCard from "./components/MovieCard";

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

const getLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Cinema() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingShowtimes, setFetchingShowtimes] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(getLocalISODate(new Date()));
  }, []);

  const handleBooking = (showtimeId: number) => {
    const userToken = getTokenByRole("USER");

    if (!userToken) {
      toast.error("Vui lòng đăng nhập để đặt vé", userToast);
      router.push("/auth");
      return;
    }

    router.push(`/booking/${showtimeId}`);
  };

  const fetchCinemas = async () => {
    try {
      setLoading(true);

      const res = await apiRequest("/api/v1/cinema-items");
      const result = await res.json().catch(() => ({}));

      const rawList = result?.data?.content || result?.data || result || [];
      const list = Array.isArray(rawList) ? rawList : [];

      setCinemas(list);

      if (list.length > 0) {
        const firstParent = list[0].cinema?.name || "Khu vực khác";

        setExpandedParent(firstParent);
        setSelectedId(list[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách rạp", userToast);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (!selectedId || !selectedDate) return;

    const fetchShowtimes = async () => {
      setFetchingShowtimes(true);

      try {
        const res = await apiRequest(`/api/v1/showtimes/cinema-item/${selectedId}`);
        const result = await res.json().catch(() => ({}));

        const rawShowtimes = result?.data || [];
        const list = Array.isArray(rawShowtimes) ? rawShowtimes : [];

        const now = new Date();

        const filtered = list.filter((item: any) => {
          const startTime = new Date(item.startTime);
          const isSameDate = String(item.startTime || "").startsWith(selectedDate);
          const isFuture = startTime > now;
          const isLiveStatus =
            item.status !== "CANCELLED" && item.status !== "PENDING_CANCEL";

          return isSameDate && isFuture && isLiveStatus;
        });

        filtered.sort((a: any, b: any) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        const grouped = filtered.reduce((acc: any, current: any) => {
          const movie = current.movie;

          if (!movie) return acc;

          const genreDisplay =
            movie.genreNames?.length > 0
              ? movie.genreNames.join(" • ")
              : movie.genres?.length > 0
                ? movie.genres.map((genre: any) => genre.name).join(" • ")
                : movie.genre?.name || "Phim";

          if (!acc[movie.id]) {
            acc[movie.id] = {
              id: movie.id,
              title: movie.title,
              image: movie.posterUrl || movie.imageUrl || movie.image,
              duration: movie.duration,
              genre: genreDisplay,
              tag: movie.ageRating || "P",
              formats: {},
            };
          }

          const roomName = current.room?.name || "";
          const type =
            current.format ||
            current.room?.typeRoom ||
            (roomName.toUpperCase().includes("IMAX") ? "IMAX 3D" : "2D DIGITAL");

          if (!acc[movie.id].formats[type]) {
            acc[movie.id].formats[type] = [];
          }

          acc[movie.id].formats[type].push({
            id: current.id,
            time: new Date(current.startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            roomId: current.room?.id,
            status: current.status,
          });

          return acc;
        }, {});

        setMovies(
          Object.values(grouped).map((movie: any) => ({
            ...movie,
            formats: Object.entries(movie.formats).map(([type, times]) => ({
              type,
              times,
            })),
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải suất chiếu", userToast);
        setMovies([]);
      } finally {
        setFetchingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedId, selectedDate]);

  const groupedCinemas = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = cinemas.filter((cinema) => {
      const text = `${cinema?.name || ""} ${cinema?.address || ""} ${
        cinema?.city || ""
      } ${cinema?.cinema?.name || ""}`.toLowerCase();

      return text.includes(keyword);
    });

    return filtered.reduce((acc: any, current: any) => {
      const parentName = current.cinema?.name || "Khu vực khác";

      if (!acc[parentName]) acc[parentName] = [];
      acc[parentName].push(current);

      return acc;
    }, {});
  }, [cinemas, searchTerm]);

  const dateTabs = useMemo(() => {
    const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    return [...Array(7)].map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      return {
        id: getLocalISODate(date),
        dayName: index === 0 ? "Hôm nay" : VI_DAYS[date.getDay()],
        dateNum: date.getDate(),
        month: date.getMonth() + 1,
        weekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });
  }, []);

  const selectedCinema = useMemo(() => {
    return cinemas.find((cinema) => Number(cinema.id) === Number(selectedId));
  }, [cinemas, selectedId]);

  const totalCinemaCount = cinemas.length;
  const totalAreaCount = Object.keys(groupedCinemas).length;
  const selectedDateIsQuickTab = dateTabs.some((date) => date.id === selectedDate);

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  const openNativeDatePicker = () => {
    const input = dateInputRef.current as
      | (HTMLInputElement & { showPicker?: () => void })
      | null;

    if (input?.showPicker) {
      input.showPicker();
    } else {
      input?.click();
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="h-screen bg-[#070b14] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-300" size={30} />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 animate-pulse">
          Đang tải hệ thống rạp
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans pt-24 pb-14 px-4 relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={userToast} />

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-7">
        <header className="relative overflow-hidden rounded-3xl bg-[#0d1222] border border-white/10 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/[0.045] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-300/[0.035] rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  KN Cinema Location Hub
                </span>
              </div>

              <h1
                className="text-[34px] md:text-[56px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                RẠP & <span className="text-yellow-300">LỊCH CHIẾU</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-3">
                Chọn cụm rạp, ngày chiếu và suất phim phù hợp với bạn
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[420px]">
              <MiniStat
                icon={<Building2 size={15} />}
                label="Cụm rạp"
                value={totalCinemaCount}
                theme="yellow"
              />

              <MiniStat
                icon={<MapPin size={15} />}
                label="Khu vực"
                value={totalAreaCount}
                theme="cyan"
              />

              <MiniStat
                icon={<Ticket size={15} />}
                label="Suất chiếu"
                value={movies.reduce(
                  (sum, movie: any) =>
                    sum +
                    movie.formats.reduce(
                      (total: number, format: any) =>
                        total + Number(format.times?.length || 0),
                      0
                    ),
                  0
                )}
                theme="emerald"
              />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7">
          <aside className="lg:col-span-4 space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
                  size={15}
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm tên rạp, địa chỉ, khu vực..."
                  className="w-full h-12 bg-[#0d1222] border border-white/10 pl-11 pr-4 rounded-2xl text-[11px] font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all text-white placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
                />
              </div>

              <section className="bg-[#0d1222] border border-white/10 rounded-3xl p-3 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
                <div className="px-2 py-2 flex items-center justify-between border-b border-white/10 mb-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-300">
                      Danh sách rạp
                    </p>

                    <p className="text-[10px] text-slate-600 font-bold mt-1">
                      {totalCinemaCount} cụm rạp khả dụng
                    </p>
                  </div>

                  <button
                    onClick={fetchCinemas}
                    className="w-9 h-9 rounded-xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-slate-500 hover:text-yellow-300 hover:border-yellow-300/35 transition-all active:scale-95"
                    title="Làm mới danh sách rạp"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar pr-1 pb-2">
                  {Object.keys(groupedCinemas).length > 0 ? (
                    Object.keys(groupedCinemas).map((parentName) => (
                      <CinemaGroup
                        key={parentName}
                        parentName={parentName}
                        childrenCinemas={groupedCinemas[parentName]}
                        isExpanded={expandedParent === parentName || searchTerm !== ""}
                        onToggle={() =>
                          setExpandedParent(
                            expandedParent === parentName ? null : parentName
                          )
                        }
                        activeChildId={selectedId}
                        onChildSelect={(id: number) => setSelectedId(id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-[10px] uppercase font-black tracking-[0.16em] border border-dashed border-white/10 rounded-2xl text-slate-600">
                      <AlertCircle size={28} className="mx-auto mb-3" />
                      Không tìm thấy rạp
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-5">
            <div className="relative overflow-hidden bg-[#0d1222] border border-white/10 rounded-3xl p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-cyan-300/[0.035] rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300 mb-2">
                    Cụm rạp đang chọn
                  </p>

                  <h2 className="text-lg md:text-xl font-black uppercase text-white truncate">
                    {selectedCinema?.name || "Chưa chọn rạp"}
                  </h2>

                  <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1.5 truncate">
                    <MapPin size={12} className="text-yellow-300 shrink-0" />
                    {selectedCinema?.address || "Vui lòng chọn cụm rạp bên trái"}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 w-fit rounded-xl bg-yellow-300/10 border border-yellow-300/25 px-3 py-2">
                  <CalendarDays size={14} className="text-yellow-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-yellow-200">
                    {selectedDateLabel}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                {dateTabs.map((date) => (
                  <button
                    key={date.id}
                    onClick={() => setSelectedDate(date.id)}
                    className={`min-w-[66px] h-[68px] flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 ${
                      selectedDate === date.id
                        ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_34px_rgba(244,212,25,0.2)]"
                        : date.weekend
                          ? "bg-yellow-300/10 text-yellow-300 border-yellow-300/25 hover:bg-yellow-300/15"
                          : "bg-[#080c1b] text-slate-500 border-white/10 hover:border-cyan-300/35 hover:text-cyan-200 hover:bg-[#111827]"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase mb-1 opacity-80">
                      {date.dayName}
                    </span>

                    <span className="text-lg font-black leading-none">
                      {date.dateNum}
                    </span>

                    <span className="text-[8px] font-bold opacity-60 mt-1">
                      Th{date.month}
                    </span>
                  </button>
                ))}

                <div className="relative shrink-0">
                  <input
                    type="date"
                    ref={dateInputRef}
                    value={selectedDate}
                    min={getLocalISODate(new Date())}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="absolute opacity-0 pointer-events-none w-px h-px"
                  />

                  <button
                    type="button"
                    onClick={openNativeDatePicker}
                    className={`min-w-[66px] h-[68px] flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 ${
                      !selectedDateIsQuickTab
                        ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_34px_rgba(244,212,25,0.2)]"
                        : "bg-[#080c1b] text-slate-500 border-white/10 hover:border-cyan-300/35 hover:text-cyan-200 hover:bg-[#111827]"
                    }`}
                  >
                    <CalendarIcon size={15} className="mb-1 opacity-90" />

                    <span className="text-[8px] font-black uppercase">Khác</span>
                  </button>
                </div>
              </div>

              {!selectedDateIsQuickTab && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-cyan-300/10 border border-cyan-300/20 rounded-xl w-fit">
                  <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">
                    Đang xem:
                  </span>

                  <span className="text-[10px] font-black text-white uppercase">
                    {new Date(selectedDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#0d1222] rounded-3xl border border-white/10 p-3 md:p-4 min-h-[460px] shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
              {fetchingShowtimes ? (
                <div className="h-[440px] flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-yellow-300" size={26} />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Đang tải suất chiếu
                  </p>
                </div>
              ) : movies.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onSelect={handleBooking} />
                  ))}
                </div>
              ) : (
                <div className="h-[440px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                    <Clock size={32} className="text-slate-600" />
                  </div>

                  <div className="font-black uppercase text-[10px] tracking-[0.18em] text-slate-500">
                    Không có suất chiếu
                  </div>

                  <p className="text-[10px] text-slate-600 font-bold mt-2 max-w-xs">
                    Rạp này chưa có suất chiếu phù hợp trong ngày đã chọn.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedDate(getLocalISODate(new Date()))}
                    className="mt-6 h-11 px-5 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95 flex items-center gap-2"
                  >
                    <CalendarDays size={14} />
                    Quay về hôm nay
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
  };

  return (
    <div className="rounded-2xl bg-[#080c1b] border border-white/10 p-3 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 truncate">
          {label}
        </p>

        <p className="text-sm font-black text-white">
          {Number(value || 0).toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}