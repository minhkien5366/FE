"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiSuperAdminRequest } from "@/app/lib/api";
import {
  Loader2,
  Film,
  ChevronRight,
  X,
  Building2,
  ShieldCheck,
  Calendar as CalendarIcon,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Clock3,
  AlertTriangle,
  ListChecks,
  Monitor,
  MapPin,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import dayjs from "dayjs";
import "dayjs/locale/vi";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
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

export default function CinemaManagementPage() {
  const router = useRouter();

  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "UPCOMING" | "PAST" | "PENDING_CANCEL"
  >("ALL");

  const [timeView, setTimeView] = useState<"WEEK" | "MONTH" | "ALL">("MONTH");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);

      const res = await apiSuperAdminRequest("/api/v1/showtimes");
      const responseData = await res.json();

      setShowtimes(responseData.data || []);
    } catch (err) {
      toast.error("Lỗi đồng bộ dữ liệu hệ thống!", adminToast);
    } finally {
      setLoading(false);
    }
  };

  const filteredShowtimes = useMemo(() => {
    const now = dayjs();

    return showtimes.filter((show) => {
      const showTime = dayjs(show.startTime);

      if (filterStatus === "PENDING_CANCEL") {
        return show.status === "PENDING_CANCEL";
      }

      if (
        filterStatus === "UPCOMING" &&
        (!showTime.isAfter(now) || show.status === "CANCELLED")
      ) {
        return false;
      }

      if (
        filterStatus === "PAST" &&
        showTime.isAfter(now) &&
        show.status !== "CANCELLED"
      ) {
        return false;
      }

      if (timeView === "WEEK") return showTime.isSame(now, "week");

      if (timeView === "MONTH") {
        return showTime.month() === selectedMonth && showTime.isSame(now, "year");
      }

      return true;
    });
  }, [showtimes, filterStatus, timeView, selectedMonth]);

  const cinemaMap = useMemo(() => {
    return filteredShowtimes.reduce((acc: any, curr: any) => {
      const cinemaName = curr.cinemaItem?.cinema?.name || "Hệ thống rạp";
      const branchId = curr.cinemaItem?.id || "unknown";

      if (!acc[cinemaName]) acc[cinemaName] = {};

      if (!acc[cinemaName][branchId]) {
        acc[cinemaName][branchId] = {
          info: curr.cinemaItem,
          shows: [],
        };
      }

      acc[cinemaName][branchId].shows.push(curr);
      return acc;
    }, {});
  }, [filteredShowtimes]);

  const handleApproveCancel = async (event: any, id: number) => {
    event.stopPropagation();

    const toastId = toast.loading("Đang xử lý duyệt hủy...", adminToast);

    try {
      const res = await apiSuperAdminRequest(
        `/api/v1/showtimes/${id}/approve-cancel`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        toast.success("Đã duyệt hủy và vô hiệu hóa các vé liên quan!", {
          id: toastId,
          ...adminToast,
        });

        fetchShowtimes();
      } else {
        toast.error("Lỗi duyệt hủy!", {
          id: toastId,
          ...adminToast,
        });
      }
    } catch (err) {
      toast.error("Lỗi kết nối!", {
        id: toastId,
        ...adminToast,
      });
    }
  };

  const handleRejectCancel = async (event: any, id: number) => {
    event.stopPropagation();

    const toastId = toast.loading("Đang từ chối yêu cầu...", adminToast);

    try {
      const res = await apiSuperAdminRequest(
        `/api/v1/showtimes/${id}/reject-cancel`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        toast.success("Đã từ chối, suất chiếu hoạt động bình thường!", {
          id: toastId,
          ...adminToast,
        });

        fetchShowtimes();
      } else {
        toast.error("Lỗi xử lý!", {
          id: toastId,
          ...adminToast,
        });
      }
    } catch (err) {
      toast.error("Lỗi kết nối!", {
        id: toastId,
        ...adminToast,
      });
    }
  };

  const totalPendingCancel = useMemo(() => {
    return showtimes.filter((show) => show.status === "PENDING_CANCEL").length;
  }, [showtimes]);

  const totalUpcoming = useMemo(() => {
    const now = dayjs();

    return showtimes.filter(
      (show) => dayjs(show.startTime).isAfter(now) && show.status !== "CANCELLED"
    ).length;
  }, [showtimes]);

  const totalCancelled = useMemo(() => {
    return showtimes.filter((show) => show.status === "CANCELLED").length;
  }, [showtimes]);

  if (loading) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={30} />
          </div>

          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.22em] animate-pulse">
            Đang đồng bộ trục thời gian
          </p>
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
        <header className="space-y-6 border-b border-white/10 pb-7">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
                <CalendarIcon size={26} className="text-yellow-300 relative z-10" />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles size={11} className="text-yellow-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                    Phân hệ quản trị cao cấp
                  </span>
                </div>

                <h1
                  className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  TỔNG LỊCH{" "}
                  <span className="text-yellow-300">CHIẾU PHIM</span>
                </h1>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-cyan-300" />
                  Quản lý lịch chiếu toàn chuỗi KN Cinema
                </p>
              </div>
            </div>

            <button
              onClick={fetchShowtimes}
              disabled={loading}
              className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-yellow-300" : ""}
              />
              Đồng bộ
            </button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={<Film size={18} />}
              title="Tổng suất chiếu"
              value={`${showtimes.length.toLocaleString("vi-VN")} suất`}
              theme="yellow"
            />

            <SummaryCard
              icon={<Clock3 size={18} />}
              title="Sắp chiếu"
              value={`${totalUpcoming.toLocaleString("vi-VN")} suất`}
              theme="cyan"
            />

            <SummaryCard
              icon={<AlertTriangle size={18} />}
              title="Yêu cầu hủy"
              value={`${totalPendingCancel.toLocaleString("vi-VN")} yêu cầu`}
              theme="amber"
            />

            <SummaryCard
              icon={<XCircle size={18} />}
              title="Đã hủy"
              value={`${totalCancelled.toLocaleString("vi-VN")} suất`}
              theme="rose"
            />
          </section>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex bg-[#080c1b] p-1.5 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar">
                {(["ALL", "UPCOMING", "PAST", "PENDING_CANCEL"] as const).map(
                  (status) => {
                    const labels: any = {
                      ALL: "Tất cả",
                      UPCOMING: "Sắp chiếu",
                      PAST: "Lịch sử",
                      PENDING_CANCEL: "Yêu cầu hủy",
                    };

                    const isActive = filterStatus === status;

                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`relative flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 whitespace-nowrap border ${
                          isActive
                            ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                            : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827] border-transparent"
                        }`}
                      >
                        {labels[status]}

                        {status === "PENDING_CANCEL" &&
                          totalPendingCancel > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md flex items-center justify-center text-[9px] font-black leading-none ${
                                isActive
                                  ? "bg-[#111827] text-yellow-300"
                                  : "bg-orange-500/15 text-orange-300 border border-orange-300/25"
                              }`}
                            >
                              {totalPendingCancel}
                            </span>
                          )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="flex items-center gap-2 bg-[#080c1b] p-1.5 rounded-xl border border-white/10">
                {(["WEEK", "MONTH", "ALL"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setTimeView(view)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.12em] transition-all ${
                      timeView === view
                        ? "bg-cyan-300 text-[#111827]"
                        : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827]"
                    }`}
                  >
                    {view === "WEEK" ? "Tuần" : view === "MONTH" ? "Tháng" : "Tất cả"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {Array.from({ length: 12 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedMonth(index);
                    setTimeView("MONTH");
                  }}
                  className={`min-w-[46px] h-[46px] rounded-xl flex flex-col items-center justify-center transition-all border ${
                    selectedMonth === index && timeView === "MONTH"
                      ? "bg-yellow-300 border-yellow-200 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                      : "border-white/10 bg-[#080c1b] text-slate-500 hover:border-cyan-300/35 hover:text-cyan-200 hover:bg-[#111827]"
                  }`}
                >
                  <span className="text-[7px] font-black uppercase opacity-60 leading-none mb-0.5">
                    Thg
                  </span>

                  <span className="text-xs font-black leading-none">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-10">
          {Object.keys(cinemaMap).map((cinemaName) => (
            <div key={cinemaName} className="space-y-5">
              <div className="flex items-center gap-4">
                <h2 className="text-base font-black uppercase tracking-[0.08em] text-white">
                  {cinemaName}
                </h2>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {Object.values(cinemaMap[cinemaName]).map((branch: any) => {
                  const pendingCount = branch.shows.filter(
                    (show: any) => show.status === "PENDING_CANCEL"
                  ).length;

                  return (
                    <div
                      key={branch.info?.id}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsModalOpen(true);
                      }}
                      className="relative group/card bg-[#0d1222] border border-[#182038] rounded-2xl p-6 hover:border-cyan-300/35 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1"
                    >
                      <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                      {pendingCount > 0 && (
                        <div className="absolute -top-2 -right-2 min-w-7 h-7 px-2 bg-orange-500 rounded-full flex items-center justify-center border-2 border-[#0b1020] text-white text-[10px] font-black shadow-lg animate-bounce">
                          {pendingCount}
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 group-hover/card:bg-cyan-300/10 group-hover/card:text-cyan-300 group-hover/card:border-cyan-300/30 transition-all shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                            <Building2 size={20} />
                          </div>

                          <div className="text-right">
                            <span className="block text-3xl font-black text-white/[0.08] group-hover/card:text-yellow-300/25 transition-colors leading-none tracking-tight">
                              {String(branch.shows.length).padStart(2, "0")}
                            </span>

                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.16em]">
                              Suất chiếu
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-black uppercase text-white group-hover/card:text-yellow-200 transition-colors mb-2 truncate tracking-[0.06em]">
                          {branch.info?.name || "Chi nhánh chưa xác định"}
                        </h3>

                        <p className="text-[10px] text-slate-500 border-l border-white/10 pl-2.5 truncate mb-6 font-semibold flex items-center gap-1.5">
                          <MapPin size={11} className="text-cyan-300 shrink-0" />
                          {branch.info?.address || "Địa chỉ chưa cập nhật"}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em] group-hover/card:text-slate-300 transition-colors flex items-center gap-1">
                            Xem chi tiết danh sách
                            <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(cinemaMap).length === 0 && (
            <div className="py-24 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
              <Monitor className="mx-auto text-slate-600 mb-4" size={42} />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Không tìm thấy dữ liệu nào
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedBranch && (
        <ShowtimeBranchModal
          branch={selectedBranch}
          onClose={() => setIsModalOpen(false)}
          onOpenDetail={(id: number) => router.push(`/super-admin/showtime/${id}`)}
          onApproveCancel={handleApproveCancel}
          onRejectCancel={handleRejectCancel}
        />
      )}

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

function ShowtimeBranchModal({
  branch,
  onClose,
  onOpenDetail,
  onApproveCancel,
  onRejectCancel,
}: {
  branch: any;
  onClose: () => void;
  onOpenDetail: (id: number) => void;
  onApproveCancel: (event: any, id: number) => void;
  onRejectCancel: (event: any, id: number) => void;
}) {
  const sortedShows = [...branch.shows].sort(
    (a: any, b: any) => dayjs(b.startTime).unix() - dayjs(a.startTime).unix()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-[#0b1020] border border-white/10 w-full max-w-4xl max-h-[86vh] rounded-2xl overflow-hidden flex flex-col shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

        <div className="p-5 md:p-6 border-b border-white/10 flex justify-between items-center bg-[#0d1222] relative overflow-hidden">
          <div className="pointer-events-none absolute top-[-120px] right-[-100px] w-72 h-72 bg-yellow-300/[0.05] blur-3xl rounded-full" />

          <div className="space-y-1 relative z-10 min-w-0">
            <h2 className="text-lg font-black uppercase tracking-[0.04em] text-white truncate">
              {branch.info?.name || "Chi nhánh"}
            </h2>

            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.16em]">
              Danh sách suất chiếu đang lọc
            </p>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center bg-[#111827] border border-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 md:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {sortedShows.map((show: any) => {
            const isPending = show.status === "PENDING_CANCEL";
            const isCancelled = show.status === "CANCELLED";

            return (
              <div
                key={show.id}
                onClick={() => onOpenDetail(show.id)}
                className={`group/item flex flex-col p-4 border rounded-2xl transition-all cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.18)] ${
                  isPending
                    ? "border-orange-300/30 bg-orange-300/10"
                    : isCancelled
                      ? "border-rose-400/20 bg-rose-500/5 opacity-70"
                      : "border-white/10 bg-[#0d1222] hover:bg-[#111827] hover:border-cyan-300/35"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isCancelled
                          ? "bg-rose-500/10 border-rose-400/25 text-rose-300"
                          : isPending
                            ? "bg-orange-300/10 border-orange-300/25 text-orange-300"
                            : "bg-[#080c1b] border-white/10 text-yellow-300 group-hover/item:text-cyan-300 group-hover/item:border-cyan-300/35"
                      }`}
                    >
                      <Film size={17} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-[#080c1b] border border-white/10 text-[8px] font-black text-slate-500 rounded-lg uppercase tracking-[0.12em]">
                          Phòng {show.room?.name}
                        </span>

                        {isCancelled && (
                          <span className="text-[9px] font-black text-rose-300 uppercase tracking-[0.14em]">
                            Đã hủy
                          </span>
                        )}

                        {isPending && (
                          <span className="text-[9px] font-black text-orange-300 uppercase tracking-[0.14em]">
                            Chờ duyệt hủy
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-black uppercase transition-colors truncate tracking-[0.04em] ${
                          isCancelled
                            ? "text-slate-500 line-through"
                            : "text-white group-hover/item:text-yellow-200"
                        }`}
                      >
                        {show.movie?.title || "Phim chưa cập nhật"}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-xl font-black text-yellow-300 tracking-tight leading-none block">
                        {dayjs(show.startTime).format("HH:mm")}
                      </span>

                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.13em]">
                        {dayjs(show.startTime).format("DD/MM/YYYY")}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-slate-500 group-hover/item:bg-yellow-300 group-hover/item:text-[#111827] group-hover/item:border-yellow-200 transition-all">
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="mt-4 pt-4 border-t border-orange-300/20">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-orange-300 uppercase tracking-[0.16em] block mb-1.5 flex items-center gap-1.5">
                          <AlertTriangle size={12} />
                          Lý do xin hủy từ cơ sở
                        </span>

                        <p className="text-xs text-slate-300 italic border-l-2 border-orange-300/50 pl-3 leading-relaxed">
                          {show.cancelReason || "Không có lý do cụ thể"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(event) => onRejectCancel(event, show.id)}
                          className="px-3 py-2 bg-[#111827] border border-white/10 text-slate-300 text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
                        >
                          <XCircle size={14} />
                          Từ chối
                        </button>

                        <button
                          onClick={(event) => onApproveCancel(event, show.id)}
                          className="px-3 py-2 bg-yellow-300 hover:bg-yellow-200 text-[#111827] text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-[0_16px_34px_rgba(244,212,25,0.22)] active:scale-95"
                        >
                          <CheckCircle2 size={14} />
                          Duyệt hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sortedShows.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 bg-[#080c1b] rounded-2xl">
              <ListChecks className="mx-auto text-slate-600 mb-4" size={40} />

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Không có suất chiếu trong bộ lọc này
              </p>
            </div>
          )}
        </div>
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
  theme: "yellow" | "cyan" | "amber" | "rose";
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
    amber: {
      border: "hover:border-amber-300/35",
      icon: "bg-amber-300/10 text-amber-300 border-amber-300/25",
      text: "text-amber-200",
    },
    rose: {
      border: "hover:border-rose-400/35",
      icon: "bg-rose-500/10 text-rose-300 border-rose-400/25",
      text: "text-rose-300",
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