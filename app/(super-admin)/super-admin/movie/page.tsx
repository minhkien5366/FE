"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  MessageSquare,
  Star,
  Film,
  Sparkles,
  RefreshCw,
  Tags,
  Clapperboard,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest, getImageUrl } from "@/app/lib/api";
import ImportMovieModal from "./ImportMovieModal";
import ReviewManagementModal from "./ReviewManagementModal";

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    movieId: number | null;
    movieTitle: string;
  }>({
    isOpen: false,
    movieId: null,
    movieTitle: "",
  });

  const fetchMovies = useCallback(async (search = "", pageNum = 0) => {
    setLoading(true);

    try {
      const url = `/api/v1/movies?search=${encodeURIComponent(
        search
      )}&page=${pageNum}&size=10`;

      const response = await apiSuperAdminRequest(url);
      const result = await response.json();

      if (response.ok) {
        setMovies(result.data?.content || []);
        setTotalPages(result.data?.totalPages || 0);
        setTotalElements(result.data?.totalElements || 0);
      } else {
        toast.error("Không có quyền truy cập dữ liệu lõi!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ nguồn!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMovies(searchTerm, page);
    }, searchTerm ? 450 : 0);

    return () => clearTimeout(delay);
  }, [searchTerm, page, fetchMovies]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    toast(
      (toastItem) => (
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/25 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-rose-300" />
            </div>

            <div>
              <p className="text-xs font-black text-white uppercase tracking-[0.08em]">
                Xác nhận xóa phim?
              </p>

              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">
                Phim sẽ bị xóa khỏi kho dữ liệu nếu không bị ràng buộc lịch chiếu.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(toastItem.id)}
              className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              onClick={async () => {
                toast.dismiss(toastItem.id);

                const loadingToast = toast.loading("Đang xóa phim...");

                try {
                  setDeletingId(id);

                  const res = await apiSuperAdminRequest(`/api/v1/movies/${id}`, {
                    method: "DELETE",
                  });

                  if (res.ok) {
                    toast.success("Đã xóa phim thành công!", {
                      id: loadingToast,
                    });

                    fetchMovies(searchTerm, page);
                  } else {
                    const data = await res.json().catch(() => ({}));

                    toast.error(data?.message || "Không thể xóa phim này!", {
                      id: loadingToast,
                    });
                  }
                } catch (error) {
                  toast.error("Không thể kết nối máy chủ!", {
                    id: loadingToast,
                  });
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.12em] rounded-xl hover:bg-rose-400 transition-all shadow-[0_12px_28px_rgba(244,63,94,0.18)] active:scale-95"
            >
              Xóa phim
            </button>
          </div>
        </div>
      ),
      {
        duration: 5200,
        style: {
          background: "#0b1020",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
          padding: "14px",
          borderRadius: "16px",
        },
      }
    );
  };

  const showingCount = useMemo(() => {
    return movies.filter((movie) => movie.status === "SHOWING").length;
  }, [movies]);

  const upcomingCount = useMemo(() => {
    return movies.filter((movie) => movie.status !== "SHOWING").length;
  }, [movies]);

  return (
    <div className="min-h-full bg-transparent px-5 sm:px-8 md:px-10 py-8 md:py-10 text-slate-300 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
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

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Film size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Movie Content Hub
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                KHO <span className="text-yellow-300">PHIM</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Hệ thống quản lý nội dung phim KN Cinema
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative group flex-1 xl:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
                size={15}
              />

              <input
                type="text"
                value={searchTerm}
                placeholder="Tìm kiếm danh mục phim..."
                className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </div>

            <button
              onClick={() => setIsImportOpen(true)}
              className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={15} className="text-cyan-300" />
              Import Excel
            </button>

            <Link
              href="/super-admin/movie/create"
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Thêm phim
            </Link>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MovieSummaryCard
            icon={<Clapperboard size={18} />}
            title="Tổng dữ liệu"
            value={`${totalElements || movies.length} phim`}
            theme="yellow"
          />

          <MovieSummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Đang chiếu"
            value={`${showingCount} phim`}
            theme="cyan"
          />

          <MovieSummaryCard
            icon={<Clock size={18} />}
            title="Sắp chiếu"
            value={`${upcomingCount} phim`}
            theme="amber"
          />

          <MovieSummaryCard
            icon={<RefreshCw size={18} />}
            title="Trang hiện tại"
            value={`${totalPages === 0 ? 0 : page + 1}/${totalPages || 0}`}
            theme="emerald"
          />
        </section>

        {/* TABLE */}
        <section className="bg-[#0d1222] border border-white/10 rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,0.32)] min-h-[560px] flex flex-col justify-between overflow-hidden">
          <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                <Film size={15} className="text-yellow-300" />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Bảng dữ liệu phim
                </h3>

                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Quản lý phim, đánh giá, phân loại và trạng thái phát hành
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchMovies(searchTerm, page)}
              disabled={loading}
              className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 text-slate-500 hover:text-yellow-300 hover:border-yellow-300/35 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin text-yellow-300" : ""}
              />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-[#111827] text-[10px] font-black uppercase text-slate-500 tracking-[0.13em] border-b border-white/10">
                  <th className="px-6 py-4 w-[45%]">Thông tin phim</th>
                  <th className="px-6 py-4 w-[25%]">Phân loại / thời lượng</th>
                  <th className="px-6 py-4 w-[15%]">Trạng thái</th>
                  <th className="px-6 py-4 w-[15%] text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-40 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                          <Loader2
                            className="animate-spin text-yellow-300"
                            size={28}
                          />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">
                          Đang đồng bộ kho phim
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : movies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-40 text-center">
                      <Film className="mx-auto text-slate-600 mb-4" size={40} />

                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">
                        Không tìm thấy dữ liệu phim
                      </p>
                    </td>
                  </tr>
                ) : (
                  movies.map((movie: any) => {
                    const isShowing = movie.status === "SHOWING";

                    return (
                      <tr
                        key={movie.id}
                        className="group hover:bg-[#111827] transition-all"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-12 h-16 shrink-0 bg-[#080c1b] border border-white/10 rounded-xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.28)] group-hover:border-cyan-300/30 transition-all">
                              <img
                                src={
                                  movie.posterUrl &&
                                  movie.posterUrl.startsWith("http")
                                    ? movie.posterUrl
                                    : getImageUrl(movie.posterUrl)
                                }
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(event) =>
                                  (event.currentTarget.src =
                                    "https://placehold.co/100x150?text=No+Poster")
                                }
                                alt={movie.title}
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/45 via-transparent to-transparent" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <Link
                                href={`/super-admin/movie/${movie.id}`}
                                className="text-slate-100 font-black uppercase tracking-[0.04em] text-sm block truncate group-hover:text-yellow-200 transition-colors"
                                title={movie.title}
                              >
                                {movie.title}
                              </Link>

                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[9px] text-slate-600 font-mono font-black uppercase tracking-wider leading-none shrink-0">
                                  ID: {movie.id}
                                </p>

                                <span className="text-slate-700 text-[8px] shrink-0">
                                  •
                                </span>

                                {movie.rating && movie.rating > 0 ? (
                                  <p className="text-[10px] font-black text-yellow-300 flex items-center gap-1 shrink-0">
                                    <Star
                                      size={10}
                                      className="fill-yellow-300"
                                    />
                                    {Number(movie.rating).toFixed(1)}
                                  </p>
                                ) : (
                                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                                    Chưa có đánh giá
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap gap-1.5 w-full">
                              {movie.genreNames &&
                              Array.isArray(movie.genreNames) &&
                              movie.genreNames.length > 0 ? (
                                movie.genreNames.map(
                                  (genreName: string, index: number) => (
                                    <span
                                      key={index}
                                      className="text-[8px] font-black text-cyan-200 bg-cyan-300/10 border border-cyan-300/25 px-2 py-1 rounded-lg uppercase tracking-[0.1em] transition-all hover:bg-cyan-300/15 whitespace-nowrap"
                                    >
                                      {genreName}
                                    </span>
                                  )
                                )
                              ) : (
                                <span className="text-[8px] font-black text-slate-500 bg-[#080c1b] border border-white/10 px-2 py-1 rounded-lg uppercase tracking-[0.1em] whitespace-nowrap">
                                  Chưa phân loại
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-wide shrink-0">
                              <Clock size={11} className="text-yellow-300" />
                              {movie.duration} phút
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em] ${
                              isShowing
                                ? "text-emerald-300 bg-emerald-300/10 border-emerald-300/25"
                                : "text-yellow-300 bg-yellow-300/10 border-yellow-300/25"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isShowing
                                  ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.7)]"
                                  : "bg-yellow-300 shadow-[0_0_8px_rgba(244,212,25,0.7)]"
                              }`}
                            />

                            <span className="truncate">
                              {isShowing ? "Đang chiếu" : "Sắp chiếu"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 shrink-0">
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  isOpen: true,
                                  movieId: movie.id,
                                  movieTitle: movie.title,
                                })
                              }
                              className="w-9 h-9 bg-[#080c1b] border border-white/10 hover:border-cyan-300/35 rounded-xl text-slate-500 hover:text-cyan-300 transition-all flex items-center justify-center shadow-sm active:scale-90"
                              title="Quản lý đánh giá"
                            >
                              <MessageSquare size={14} />
                            </button>

                            <Link
                              href={`/super-admin/movie/edit/${movie.id}`}
                              className="w-9 h-9 bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 rounded-xl text-slate-500 hover:text-yellow-300 transition-all flex items-center justify-center shadow-sm active:scale-90"
                              title="Chỉnh sửa phim"
                            >
                              <Edit3 size={14} />
                            </Link>

                            <button
                              onClick={() => handleDelete(movie.id)}
                              disabled={deletingId === movie.id}
                              className="w-9 h-9 bg-[#080c1b] border border-white/10 hover:border-rose-400/35 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-300 transition-all flex items-center justify-center shadow-sm active:scale-90 disabled:opacity-50"
                              title="Xóa phim"
                            >
                              {deletingId === movie.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-5 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080c1b] border-t border-white/10">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em]">
              Hiển thị trang{" "}
              <span className="text-yellow-300">
                {totalPages === 0 ? 0 : page + 1}
              </span>{" "}
              / <span className="text-yellow-300">{totalPages}</span>
            </div>

            <div className="flex gap-2">
              <button
                disabled={page === 0 || loading}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="px-4 h-9 rounded-xl bg-[#0d1222] text-slate-400 border border-white/10 disabled:opacity-30 hover:text-yellow-300 hover:border-yellow-300/35 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] active:scale-95"
              >
                <ChevronLeft size={13} />
                Trước
              </button>

              <button
                disabled={page >= totalPages - 1 || loading || totalPages === 0}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                className="px-4 h-9 rounded-xl bg-[#0d1222] text-slate-400 border border-white/10 disabled:opacity-30 hover:text-yellow-300 hover:border-yellow-300/35 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] active:scale-95"
              >
                Sau
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <ImportMovieModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onRefreshData={() => fetchMovies(searchTerm, page)}
      />

      <ReviewManagementModal
        isOpen={reviewModalData.isOpen}
        movieId={reviewModalData.movieId}
        movieTitle={reviewModalData.movieTitle}
        onClose={() =>
          setReviewModalData({
            isOpen: false,
            movieId: null,
            movieTitle: "",
          })
        }
      />

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

function MovieSummaryCard({
  icon,
  title,
  value,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  theme: "yellow" | "cyan" | "amber" | "emerald";
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