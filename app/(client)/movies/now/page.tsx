"use client";

import React, { useState, useEffect } from "react";
import MovieCard from "../MovieCard";
import { apiRequest } from "../../../lib/api";
import { ArrowUp, Loader2, Trophy } from "lucide-react";

export default function PhimDangChieu() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (payload: any): any[] => {
    const data = payload?.data ?? payload;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(payload?.content)) return payload.content;

    return [];
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movieResponse = await apiRequest(
          "/api/v1/movies?status=SHOWING",
          { method: "GET" }
        );

        const topResponse = await apiRequest("/api/v1/movies/top-tickets", {
          method: "GET",
        });

        let showingMovies: any[] = [];
        let topMovies: any[] = [];

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          showingMovies = normalizeList(movieData);
        }

        if (topResponse.ok) {
          const topData = await topResponse.json();
          topMovies = normalizeList(topData);
        }

        const mergedMovies = showingMovies.map((movie) => {
          const matchedMovie = topMovies.find(
            (top) => top.movieId === movie.id || top.id === movie.id
          );

          return {
            ...movie,
            totalTickets: matchedMovie?.totalTickets || 0,
          };
        });

        mergedMovies.sort((a, b) => b.totalTickets - a.totalTickets);

        setMovies(mergedMovies);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans px-5 md:px-10 lg:px-12 pt-8 md:pt-10 pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute top-[260px] right-[-180px] w-[520px] h-[520px] bg-cyan-400/[0.025] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute top-[620px] left-[-180px] w-[520px] h-[520px] bg-yellow-300/[0.018] blur-[160px] rounded-full" />

      {/* HEADER */}
      <div className="max-w-[1440px] mx-auto relative z-10 mb-10 md:mb-14">
        <div className="flex items-center justify-center text-center">
          <h1
            className="text-[40px] sm:text-[54px] md:text-[66px] lg:text-[72px] leading-[0.9] font-black uppercase text-white tracking-[-0.055em] drop-shadow-[0_10px_30px_rgba(255,255,255,0.14)]"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            }}
          >
            PHIM ĐANG CHIẾU
          </h1>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex items-center justify-center gap-2 mb-10 text-slate-400 text-xs font-black uppercase tracking-widest">
            <Loader2 size={16} className="animate-spin text-yellow-300" />
            Đang tải danh sách phim
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-x-8 md:gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full max-w-[310px] mx-auto">
                <div className="aspect-[4/5] w-full bg-[#1c233d]/40 border border-white/10 animate-pulse rounded-lg" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded-lg" />
                  <div className="h-3 w-1/2 bg-white/10 animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto relative z-10">
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-x-8 md:gap-y-12">
              {movies.map((movie, index) => {
                const rank = index + 1;
                const shouldShowTopBadge = rank <= 3;

                return (
                  <div
                    key={movie.id}
                    className="relative group/card w-full max-w-[310px] mx-auto"
                  >
                    {/* TOP 1 / 2 / 3 */}
                    {shouldShowTopBadge && (
                      <div className="absolute top-3 left-3 z-30 pointer-events-none">
                        <div
                          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 border backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.35)] ${
                            rank === 1
                              ? "bg-yellow-300 text-[#111827] border-yellow-200"
                              : rank === 2
                                ? "bg-white text-[#111827] border-white/80"
                                : "bg-cyan-300 text-[#061018] border-cyan-200"
                          }`}
                        >
                          <Trophy size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Top {rank}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 transition-all duration-300 group-hover/card:-translate-y-1">
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        image={movie.posterUrl}
                        rating={movie.rating}
                        reviewCount={movie.reviewCount || 0}
                        ageRating={movie.ageRating}
                        genreNames={
                          movie.genreNames ||
                          movie.genres?.map((g: any) => g.name) ||
                          []
                        }
                        status={movie.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-28 border border-dashed border-white/10 rounded-lg bg-white/[0.02]">
              <p className="text-slate-500 font-black uppercase tracking-[0.24em] text-xs md:text-sm">
                Hệ thống đang cập nhật danh sách phim...
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="max-w-[1440px] mx-auto relative z-10 mt-20 md:mt-24 text-center border-t border-white/10 pt-12">
          <p className="text-slate-500 font-black tracking-[0.22em] text-[10px] uppercase mb-6">
            Hết danh sách phim đang chiếu
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 md:px-10 h-12 rounded-lg border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-[#111827] transition-all duration-300 font-black uppercase tracking-[0.12em] text-xs active:scale-95"
          >
            <ArrowUp size={15} />
            Quay lại đầu trang
          </button>
        </div>
      )}
    </div>
  );
}