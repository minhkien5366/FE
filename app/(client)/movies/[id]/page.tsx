"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import {
  Play,
  Star,
  Award,
  Calendar,
  Globe,
  Film,
  Ticket,
  Loader2,
  X,
  ArrowLeft,
  Shield,
  Users,
  Sparkles,
  Clock3,
  MessageSquareText,
  Clapperboard,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import ReviewModal from "../ReviewModal";
import ReviewList from "../ReviewList";

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

const resolveMovieImg = (url: string) => {
  if (!url) {
    return "https://placehold.co/900x1350/0b1020/f4d419?text=KN+Cinema";
  }

  return url.startsWith("http") ? url : getImageUrl(url);
};

const formatReviewCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;

  return count.toString();
};

function MovieHorizontalList({
  title,
  subTitle,
  movies,
  loading,
}: {
  title: string;
  subTitle: string;
  movies: any[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-300" size={26} />
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="space-y-6 mt-16">
      <div className="flex items-end justify-between border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles size={11} className="text-cyan-300" />

            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {subTitle}
            </span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase text-white tracking-[-0.045em]"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
        {movies.map((movie) => {
          const hasListRating =
            movie.rating !== undefined &&
            movie.rating !== null &&
            Number(movie.rating) > 0;

          const displayGenres =
            movie.genreNames || movie.genres?.map((genre: any) => genre.name) || [];

          return (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group block no-underline"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.30)] bg-[#0d1222]">
                <img
                  src={resolveMovieImg(movie.posterUrl)}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  alt={movie.title}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/90 via-transparent to-transparent" />

                <div className="absolute inset-0 bg-[#020617]/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.24)] scale-90 group-hover:scale-100 transition-transform">
                    <Play size={20} className="fill-[#111827]" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-[11px] font-black text-white uppercase line-clamp-2 group-hover:text-yellow-200 transition-colors leading-snug">
                    {movie.title}
                  </h4>

                  <div className="flex items-center justify-between mt-2 gap-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase line-clamp-1 min-w-0">
                      {displayGenres.length > 0 ? displayGenres.join(" • ") : "Phim"}
                    </p>

                    {hasListRating ? (
                      <span className="text-[10px] font-black text-yellow-300 flex items-center gap-0.5 shrink-0">
                        ★ {Number(movie.rating).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-cyan-300 bg-cyan-300/10 border border-cyan-300/25 px-1.5 py-0.5 rounded uppercase shrink-0">
                        Mới
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState<any>(null);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      try {
        const resShowing = await apiRequest(`/api/v1/movies?status=SHOWING&size=5`);
        const resUpcoming = await apiRequest(
          `/api/v1/movies?status=COMING_SOON&size=5`
        );

        if (resShowing.ok) {
          const data = await resShowing.json();
          setShowingMovies(
            (data.data?.content || []).filter(
              (item: any) => item.id.toString() !== movieId
            )
          );
        }

        if (resUpcoming.ok) {
          const data = await resUpcoming.json();
          setUpcomingMovies(data.data?.content || []);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách gợi ý", err);
      } finally {
        setRelLoading(false);
      }
    };

    const fetchMovieDetail = async () => {
      try {
        const response = await apiRequest(`/api/v1/movies/${movieId}`);

        if (response.ok) {
          const resData = await response.json();
          const movieData = resData.data || resData;

          setMovie(movieData);
          fetchRelatedContent();
        }
      } catch (error) {
        toast.error("Không thể tải thông tin phim", userToast);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchMovieDetail();
  }, [movieId]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    const match = url.match(regExp);

    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  };

  const formatCast = (castStr: string) => {
    if (!castStr) return "Đang cập nhật...";

    const castList = castStr.split(",").map((actor) => actor.trim());

    return `${castList.join(", ")},...`;
  };

  const movieGenresList = useMemo(() => {
    return movie?.genreNames || movie?.genres?.map((genre: any) => genre.name) || [];
  }, [movie]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-yellow-300 animate-spin" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Đang tải dữ liệu phim
        </p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#070b14] text-center pt-24 text-slate-500 font-bold">
        Không tìm thấy thông tin phim hoặc máy chủ lỗi!
      </div>
    );
  }

  const hasRating =
    movie.rating !== undefined && movie.rating !== null && Number(movie.rating) > 0;

  const movieGenresString =
    movieGenresList.length > 0 ? movieGenresList.join(" • ") : "Đang cập nhật";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans pb-20 selection:bg-yellow-300 selection:text-[#111827] relative overflow-hidden">
      <Toaster position="top-center" toastOptions={userToast} />

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      {showTrailer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-[#020617]/92 backdrop-blur-md"
            onClick={() => setShowTrailer(false)}
          />

          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.68)]">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-5 right-5 z-10 w-11 h-11 bg-[#111827] border border-white/10 hover:bg-rose-600 hover:border-rose-500 rounded-xl transition-colors flex items-center justify-center"
            >
              <X size={20} className="text-white" />
            </button>

            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        movieTitle={movie.title}
        movieId={movieId}
      />

      <section className="relative min-h-[760px] md:min-h-[720px] w-full overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={resolveMovieImg(movie.posterUrl)}
            className="w-full h-full object-cover opacity-28 blur-md scale-110"
            alt="nền"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/82 to-[#070b14]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/25 to-transparent" />
        </div>

        <div className="absolute top-8 left-6 md:left-10 z-[50]">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-3 transition-all duration-300"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-[#0d1222]/80 backdrop-blur-md group-hover:bg-yellow-300 group-hover:text-[#111827] group-hover:border-yellow-200 transition-all duration-300">
              <ArrowLeft size={20} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Về trang chủ
            </span>
          </button>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-32 md:pt-40 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-end">
            <div
              className="relative w-56 md:w-[260px] mx-auto md:mx-0 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.55)] border border-white/10 shrink-0 cursor-pointer group bg-[#0d1222]"
              onClick={() => setShowTrailer(true)}
            >
              <img
                src={resolveMovieImg(movie.posterUrl)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="poster"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/85 via-transparent to-transparent" />

              <div className="absolute inset-0 bg-[#020617]/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-yellow-300 text-[#111827] rounded-2xl flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-[0_18px_45px_rgba(244,212,25,0.25)]">
                  <Play size={30} className="fill-[#111827]" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#080c1b]/86 border border-white/10 backdrop-blur px-3 py-2">
                  <Clapperboard size={13} className="text-yellow-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white">
                    Xem trailer
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-yellow-300 text-[#111827] font-black px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest">
                  {movie.status === "SHOWING" ? "Đang chiếu" : "Sắp chiếu"}
                </span>

                <span className="bg-cyan-300/10 text-cyan-300 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-cyan-300/25 flex items-center gap-1.5">
                  <Clock3 size={11} />
                  {movie.duration} phút
                </span>

                <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border border-white/10">
                  {movie.ageRating || "P"}
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles size={11} className="text-cyan-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    KN Cinema Movie Profile
                  </span>
                </div>

                <h1
                  className="text-[42px] md:text-[72px] font-black uppercase tracking-[-0.065em] text-white leading-[0.92] drop-shadow-2xl"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  {movie.title}
                </h1>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-5">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                    <Star
                      size={22}
                      fill={hasRating ? "#f4d419" : "none"}
                      className={hasRating ? "text-yellow-300" : "text-slate-600"}
                    />
                  </div>

                  <div className="text-left">
                    <p
                      className={
                        hasRating
                          ? "text-2xl font-black text-white leading-none"
                          : "text-[10px] font-black uppercase tracking-wider text-slate-500"
                      }
                    >
                      {hasRating
                        ? Number(movie.rating).toFixed(1)
                        : "Chưa có đánh giá"}
                    </p>

                    {hasRating && (
                      <p className="text-[10px] font-bold text-slate-500 mt-1">
                        {formatReviewCount(movie.reviewCount || 0)} đánh giá
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden md:block h-10 w-px bg-white/10" />

                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.16em] line-clamp-2 max-w-md">
                  {movieGenresString}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                {movie.status === "SHOWING" && (
                  <Link
                    href={`/movies/${movieId}/booking/`}
                    className="flex items-center gap-3 px-7 py-4 bg-yellow-300 text-[#111827] rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-yellow-200 transition-all shadow-[0_18px_45px_rgba(244,212,25,0.24)] active:scale-95 no-underline"
                  >
                    <Ticket size={18} />
                    Đặt vé ngay
                  </Link>
                )}

                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-7 py-4 bg-[#0d1222]/80 backdrop-blur-md border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#111827] hover:border-cyan-300/35 hover:text-cyan-200 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Play size={16} />
                  Xem trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 space-y-8">
            <section className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="w-12 h-[2px] bg-yellow-300" />

                <h3 className="text-[10px] font-black uppercase tracking-[0.34em] text-yellow-300">
                  Tóm tắt nội dung
                </h3>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-[#0d1222] border border-white/10 p-6 md:p-8 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
                <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-cyan-300/[0.035] blur-3xl rounded-full" />

                <p className="relative z-10 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                  {movie.description || "Nội dung phim đang được cập nhật."}
                </p>
              </div>
            </section>

            <section className="p-6 md:p-8 bg-[#0d1222] rounded-3xl border border-white/10 backdrop-blur-sm space-y-8 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoBox
                  icon={<Film size={18} />}
                  label="Đạo diễn"
                  value={movie.director}
                  truncate={false}
                  theme="yellow"
                />

                <InfoBox
                  icon={<Award size={18} />}
                  label="Quốc gia"
                  value={movie.country}
                  truncate={true}
                  theme="cyan"
                />

                <InfoBox
                  icon={<Globe size={18} />}
                  label="Năm"
                  value={
                    movie.releaseDate
                      ? new Date(movie.releaseDate).getFullYear().toString()
                      : "2026"
                  }
                  truncate={true}
                  theme="emerald"
                />

                <InfoBox
                  icon={<Shield size={18} />}
                  label="Độ tuổi"
                  value={movie.ageRating || "P"}
                  truncate={true}
                  theme="amber"
                />
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-center gap-2 shrink-0 rounded-xl bg-cyan-300/10 border border-cyan-300/25 px-3 py-2">
                    <Users size={15} className="text-cyan-300" />

                    <span className="text-[9px] font-black uppercase text-cyan-300 tracking-widest">
                      Diễn viên
                    </span>
                  </div>

                  <span className="text-sm font-bold text-white italic line-clamp-3 leading-relaxed">
                    {formatCast(movie.cast)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="p-6 md:p-7 bg-[#0d1222] border border-white/10 rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.32)] space-y-6 sticky top-24 overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-yellow-300/[0.04] blur-3xl rounded-full" />

              <div className="relative z-10 space-y-3 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300">
                  <MessageSquareText size={24} />
                </div>

                <p className="text-[10px] font-black tracking-[0.22em] text-yellow-300 uppercase">
                  Cộng đồng đánh giá
                </p>

                <p className="text-sm text-slate-500 font-bold px-4 leading-relaxed">
                  Chia sẻ cảm nhận của bạn về bộ phim này và giúp cộng đồng chọn
                  suất chiếu phù hợp hơn.
                </p>
              </div>

              <button
                onClick={() => setIsReviewOpen(true)}
                className="relative z-10 w-full py-4 bg-yellow-300 text-[#111827] rounded-2xl text-[10px] font-black uppercase tracking-[0.16em] hover:bg-yellow-200 transition-all shadow-[0_18px_45px_rgba(244,212,25,0.24)] active:scale-95 flex items-center justify-center gap-2"
              >
                <Heart size={15} />
                Gửi đánh giá
              </button>

              <Link
                href={`/movies/${movieId}/booking/`}
                className="relative z-10 w-full py-4 bg-[#080c1b] border border-white/10 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.16em] hover:border-cyan-300/35 hover:text-cyan-200 hover:bg-[#111827] transition-all active:scale-95 flex items-center justify-center gap-2 no-underline"
              >
                <Ticket size={15} />
                Xem lịch chiếu
                <ChevronRight size={13} />
              </Link>
            </div>
          </aside>
        </div>

        <MovieHorizontalList
          title="Phim Đang Chiếu"
          subTitle="Cùng thể loại"
          movies={showingMovies}
          loading={relLoading}
        />

        <MovieHorizontalList
          title="Phim Sắp Chiếu"
          subTitle="Sắp ra mắt"
          movies={upcomingMovies}
          loading={relLoading}
        />

        <section className="border-t border-white/10 pt-16 mt-16">
          <ReviewList movieId={movieId} />
        </section>
      </main>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  truncate,
  theme,
}: {
  icon: any;
  label: string;
  value: string;
  truncate: boolean;
  theme: "yellow" | "cyan" | "emerald" | "amber";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
    amber: "bg-amber-300/10 border-amber-300/25 text-amber-200",
  };

  return (
    <div className="rounded-2xl bg-[#080c1b] border border-white/10 p-4 text-center hover:border-cyan-300/25 transition-all">
      <div
        className={`w-10 h-10 mx-auto rounded-xl border flex items-center justify-center mb-3 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
        {label}
      </p>

      <p
        className={`text-sm font-black text-white uppercase mt-2 ${
          truncate ? "truncate" : "line-clamp-2 leading-tight"
        }`}
      >
        {value || "Đang cập nhật"}
      </p>
    </div>
  );
}