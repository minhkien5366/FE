"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Plus,
  Edit3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar as CalendarIcon,
  Sparkles,
  Clock3,
  Film,
  Monitor,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ShowtimeModal from "./ShowtimeModal";
import ImportExcelModal from "./ImportExcelModal";
import { apiAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

const VIETNAMESE_DAYS = [
  "Chủ Nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export default function AdminShowtimePage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);

    return target < today;
  }, [selectedDate]);

  const isPastShowtime = (startTime: string) => {
    return new Date(startTime) < new Date();
  };

  const selectedDateLabel = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [selectedDate]);

  const weekTabs = useMemo(() => {
    const current = new Date(selectedDate);
    const monday = new Date(current);

    monday.setDate(current.getDate() - (current.getDay() || 7) + 1);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const iso = date.toISOString().split("T")[0];
      const isOld =
        new Date(iso).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0);

      return {
        full: iso,
        label: VIETNAMESE_DAYS[date.getDay()],
        dayNum: date.getDate(),
        isOld,
      };
    });
  }, [selectedDate]);

  const selectedDayShowtimes = useMemo(() => {
    return showtimes.filter((showtime) =>
      showtime.startTime?.startsWith(selectedDate)
    );
  }, [showtimes, selectedDate]);

  const changeWeek = (dir: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + dir * 7);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const resUser = await apiAdminRequest("/api/v1/users/me");
      const user = await resUser.json();
      const idRap = user.data?.managedCinemaItemId;

      if (!idRap) return;

      setCinemaId(idRap);

      const [cinemaRes, showtimeRes, roomRes, movieRes] = await Promise.all([
        apiAdminRequest(`/api/v1/cinema-items/${idRap}`),
        apiAdminRequest(`/api/v1/showtimes/cinema-item/${idRap}`),
        apiAdminRequest(`/api/v1/rooms/cinema-item/${idRap}`),
        apiAdminRequest(`/api/v1/movies?status=SHOWING`),
      ]);

      const [cinema, showtime, room, movie] = await Promise.all([
        cinemaRes.json(),
        showtimeRes.json(),
        roomRes.json(),
        movieRes.json(),
      ]);

      setCinemaName(cinema.data?.name || "Chi nhánh KN");
      setShowtimes(showtime.data || []);
      setRooms(room.data || []);
      setMovies(movie.data?.content || movie.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch chiếu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: any) => {
    const toastId = toast.loading("Đang xử lý lịch chiếu...");

    try {
      const res = await apiAdminRequest(
        data.id ? `/api/v1/showtimes/${data.id}` : "/api/v1/showtimes",
        {
          method: data.id ? "PUT" : "POST",
          body: JSON.stringify({
            ...data,
            cinemaItemId: cinemaId,
            price: 75000,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        const errorMessage =
          result.message || result.error || "Lỗi không xác định";
        throw new Error(errorMessage);
      }

      toast.success("Thành công!", { id: toastId });
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Lỗi xử lý lịch chiếu!", { id: toastId });
    }
  };

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
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

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-7 relative z-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <CalendarIcon size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Lịch vận hành rạp
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                LỊCH CHIẾU{" "}
                <span className="text-yellow-300">
                  {cinemaName || "CHI NHÁNH"}
                </span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                KN Cinema Management • {selectedDateLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            >
              <Upload size={15} />
              Import Excel
            </button>

            {!isPastDate && (
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setIsModalOpen(true);
                }}
                className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)] flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Tạo suất
              </button>
            )}
          </div>
        </header>

        {/* HIDDEN DATE INPUT */}
        <input
          type="date"
          ref={dateInputRef}
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
        />

        {/* WEEK NAV */}
        <section className="rounded-2xl bg-[#0d1222] border border-white/10 p-3 md:p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className="w-11 h-11 flex items-center justify-center bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl transition-all active:scale-95 shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                title="Chọn ngày từ lịch"
              >
                <CalendarIcon size={18} />
              </button>

              <button
                onClick={() => changeWeek(-1)}
                className="w-11 h-11 flex items-center justify-center bg-[#111827] border border-white/10 rounded-xl hover:border-cyan-300/35 hover:text-cyan-200 transition-all text-slate-300 active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-2 overflow-x-auto no-scrollbar">
              {weekTabs.map((day) => {
                const active = selectedDate === day.full;

                return (
                  <button
                    key={day.full}
                    onClick={() => setSelectedDate(day.full)}
                    className={`min-w-[72px] flex flex-col items-center justify-center py-2.5 rounded-xl transition-all border ${
                      active
                        ? "bg-yellow-300 border-yellow-200 text-[#111827] font-black shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                        : day.isOld
                          ? "bg-[#080c1b] border-white/5 text-slate-600 hover:bg-[#111827] hover:text-slate-400"
                          : "bg-[#111827] border-white/10 text-slate-400 hover:border-cyan-300/35 hover:text-cyan-200"
                    }`}
                  >
                    <span
                      className={`text-[8px] font-black uppercase tracking-[0.14em] ${
                        active
                          ? "text-[#111827]/70"
                          : day.isOld
                            ? "text-slate-700"
                            : "text-slate-500"
                      }`}
                    >
                      {day.label}
                    </span>

                    <span className="text-base font-black mt-1">
                      {day.dayNum}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => changeWeek(1)}
              className="w-11 h-11 flex items-center justify-center bg-[#111827] border border-white/10 rounded-xl hover:border-cyan-300/35 hover:text-cyan-200 transition-all text-slate-300 active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* SUMMARY BAR */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
              <Monitor size={18} className="text-yellow-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Phòng chiếu
              </p>
              <p className="text-sm font-black text-white">
                {rooms.length.toLocaleString("vi-VN")} phòng
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center">
              <Clock3 size={18} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Suất trong ngày
              </p>
              <p className="text-sm font-black text-white">
                {selectedDayShowtimes.length.toLocaleString("vi-VN")} suất
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                isPastDate
                  ? "bg-slate-500/10 border-slate-500/25"
                  : "bg-emerald-300/10 border-emerald-300/25"
              }`}
            >
              {isPastDate ? (
                <AlertTriangle size={18} className="text-slate-400" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-300" />
              )}
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Trạng thái ngày
              </p>
              <p
                className={`text-sm font-black ${
                  isPastDate ? "text-slate-400" : "text-emerald-300"
                }`}
              >
                {isPastDate ? "Ngày đã qua" : "Có thể tạo lịch"}
              </p>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          {loading ? (
            <div className="py-28 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={28} />
              </div>

              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Đang tải lịch chiếu
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="py-28 text-center border border-dashed border-white/10 rounded-2xl m-5 bg-[#080c1b]">
              <Monitor className="mx-auto text-slate-600 mb-4" size={38} />

              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.18em]">
                Chưa có phòng chiếu
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {rooms.map((room) => {
                const currentShowtimes = showtimes.filter(
                  (showtime) =>
                    showtime.startTime?.startsWith(selectedDate) &&
                    showtime.room?.id === room.id
                );

                return (
                  <div
                    key={room.id}
                    className="p-5 md:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-5 hover:bg-[#111827]/50 transition-colors"
                  >
                    <div className="w-full lg:w-44 shrink-0">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 border text-xs font-black uppercase rounded-xl tracking-wide ${
                          isPastDate
                            ? "bg-[#080c1b] border-white/5 text-slate-600"
                            : "bg-[#111827] border-white/10 text-white"
                        }`}
                      >
                        <Monitor
                          size={14}
                          className={isPastDate ? "text-slate-600" : "text-yellow-300"}
                        />
                        {room.name}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2.5 w-full">
                      {currentShowtimes.length === 0 && (
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 px-2">
                          Chưa có suất chiếu
                        </div>
                      )}

                      {currentShowtimes.map((showtime) => {
                        const isPast = isPastShowtime(showtime.startTime);
                        const isCancelled = showtime.status === "CANCELLED";
                        const isPending = showtime.status === "PENDING_CANCEL";
                        const canEditQuickly =
                          !isPast && !isCancelled && !isPending;

                        const timeText =
                          showtime.startTime?.split("T")[1]?.substring(0, 5) ||
                          "--:--";

                        const movieTitle =
                          showtime.movie?.title ||
                          showtime.movie?.name ||
                          "Phim chưa cập nhật";

                        return (
                          <div
                            key={showtime.id}
                            onClick={() =>
                              router.push(`/admin/showtimes/${showtime.id}`)
                            }
                            className={`group relative inline-flex items-center gap-3 border px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${
                              isCancelled
                                ? "bg-[#080c1b] border-white/5 opacity-50 grayscale hover:opacity-75"
                                : isPending
                                  ? "bg-amber-300/10 border-amber-300/30 text-amber-200"
                                  : isPast
                                    ? "bg-[#080c1b] border-white/5 text-slate-500 opacity-80 hover:opacity-100 hover:bg-[#111827]"
                                    : "bg-[#111827] border-white/10 text-white hover:border-cyan-300/35 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(34,211,238,0.08)]"
                            }`}
                            title={
                              isCancelled
                                ? "Suất chiếu đã bị hủy"
                                : isPending
                                  ? "Suất chiếu đang chờ duyệt hủy"
                                  : isPast
                                    ? "Nhấp để xem lịch sử vé"
                                    : "Nhấp để xem chi tiết"
                            }
                          >
                            <div className="flex items-center gap-1.5">
                              <Clock3
                                size={12}
                                className={
                                  isCancelled
                                    ? "text-slate-600"
                                    : isPending
                                      ? "text-amber-300"
                                      : isPast
                                        ? "text-slate-600"
                                        : "text-yellow-300"
                                }
                              />

                              <span
                                className={`text-xs font-black tracking-tight transition-colors ${
                                  isCancelled
                                    ? "text-slate-500 line-through"
                                    : isPending
                                      ? "text-amber-200"
                                      : isPast
                                        ? "text-slate-500"
                                        : "text-white group-hover:text-yellow-200"
                                }`}
                              >
                                {timeText}
                              </span>
                            </div>

                            <div className="w-px h-4 bg-white/10" />

                            <span
                              className={`text-[11px] font-bold max-w-[150px] truncate ${
                                isCancelled
                                  ? "text-slate-600 line-through"
                                  : isPending
                                    ? "text-amber-200/80"
                                    : isPast
                                      ? "text-slate-600"
                                      : "text-slate-400 group-hover:text-cyan-200"
                              }`}
                            >
                              {movieTitle}
                            </span>

                            {canEditQuickly && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedItem(showtime);
                                  setIsModalOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg bg-[#0d1222] border border-white/10 flex items-center justify-center text-slate-500 hover:text-yellow-300 hover:border-yellow-300/35 transition-all active:scale-95"
                                aria-label="Sửa nhanh suất chiếu"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {!isPastDate && (
                        <button
                          onClick={() => {
                            setSelectedItem({
                              roomId: room.id,
                              startTime: selectedDate,
                            });
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center w-10 h-10 border border-dashed border-white/15 text-slate-500 hover:text-yellow-300 hover:border-yellow-300/45 rounded-xl transition-all bg-[#080c1b] hover:bg-[#111827] active:scale-95"
                          title="Thêm suất chiếu cho phòng này"
                        >
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ShowtimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editData={selectedItem}
        movies={movies}
        rooms={rooms}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRefreshData={loadData}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}