"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function NewMovieSection() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const moviesPerPage = 4;

  useEffect(() => {
    const fetchNewMovies = async () => {
      try {
        // Lấy nhiều phim hơn để có thể bấm qua trái/phải,
        // nhưng mỗi lượt chỉ hiển thị tối đa 4 phim.
        const response = await apiRequest(
          "/api/v1/movies?status=SHOWING&page=0&size=12&sort=id,desc",
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const targetData = resData.data;

          if (targetData) {
            const movieList =
              targetData.content || (Array.isArray(targetData) ? targetData : []);
            setMovies(movieList);
          } else {
            const movieList = Array.isArray(resData)
              ? resData
              : resData.content || [];
            setMovies(movieList);
          }
        }
      } catch (error) {
        console.error("Lỗi tải phim mới nhất tại trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewMovies();
  }, []);

  const totalPages = Math.ceil(movies.length / moviesPerPage);

  const visibleMovies = useMemo(() => {
    const startIndex = currentPage * moviesPerPage;
    return movies.slice(startIndex, startIndex + moviesPerPage);
  }, [movies, currentPage]);

  const handlePrev = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-16 bg-transparent relative overflow-hidden mt-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-center mb-14">
            <div className="h-12 w-[300px] bg-white/10 animate-pulse rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-full bg-[#1c233d]/40 border border-white/10 animate-pulse rounded-[1rem]"
              />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <div className="h-12 w-[220px] bg-white/10 animate-pulse rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-14 md:py-18 bg-transparent relative overflow-hidden mt-8">
      {/* Vệt sáng nền nhẹ phía sau section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[360px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[420px] h-[420px] bg-cyan-400/5 blur-[140px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Tiêu đề giữa */}
        <div className="relative flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <h2
            className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[40px] leading-[0.92] font-black uppercase text-white tracking-[-0.045em] drop-shadow-[0_8px_28px_rgba(255,255,255,0.14)]"
            style={{
              fontFamily: '"Anton", "Impact", "Arial Narrow", sans-serif',
              WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            }}
          >
            PHIM ĐANG CHIẾU
          </h2>
        </div>

        {/* Khu vực phim + nút trái/phải */}
        <div className="relative">
          {totalPages > 1 && (
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
              aria-label="Phim trước"
            >
              <ChevronLeft size={52} strokeWidth={2.4} />
            </button>
          )}

          {totalPages > 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
              aria-label="Phim tiếp theo"
            >
              <ChevronRight size={52} strokeWidth={2.4} />
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8 transition-all duration-500">
            {visibleMovies.map((movie: any) => (
              <div
                key={movie.id}
                className="transition-transform duration-300 hover:-translate-y-1 h-full"
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  image={movie.posterUrl}
                  status={movie.status}
                  rating={movie.rating}
                  genreNames={
                    movie.genreNames ||
                    movie.genres?.map((g: any) => g.name) ||
                    []
                  }
                  ageRating={movie.ageRating}
                  reviewCount={movie.reviewCount || 0}
                />
              </div>
            ))}
          </div>

          {/* Nút trái/phải cho mobile */}
          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center gap-5 mt-8">
              <button
                onClick={handlePrev}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                aria-label="Phim trước"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={handleNext}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                aria-label="Phim tiếp theo"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          )}

          {/* Chấm pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentPage === index
                      ? "bg-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.65)]"
                      : "bg-slate-400/45 hover:bg-slate-200/75"
                  }`}
                  aria-label={`Chuyển đến nhóm phim ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Nút Xem thêm dưới cùng */}
          <div className="flex justify-center mt-10 md:mt-12">
            <Link
              href="/movies/now"
              className="min-w-[220px] md:min-w-[280px] h-12 md:h-14 px-10 inline-flex items-center justify-center rounded-lg border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-[#111827] transition-all duration-300 font-black uppercase tracking-[0.08em] text-sm md:text-base"
              style={{
                fontFamily: '"Anton", "Impact", "Arial Narrow", sans-serif',
              }}
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}