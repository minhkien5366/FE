"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { apiRequest, getImageUrl } from "@/app/lib/api";

export default function LiveSearchBar() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchMovies = async () => {
      setIsLoading(true);

      try {
        const res = await apiRequest(
          `/api/v1/movies?search=${encodeURIComponent(
            searchTerm
          )}&size=5&status=SHOWING`,
          {},
          "USER"
        );

        if (!res.ok) {
          setResults([]);
          setIsOpen(true);
          return;
        }

        const data = await res.json();

        if (data.status === 200 && data.data?.content) {
          setResults(data.data.content);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm phim:", error);
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectMovie = (movieId: number) => {
    setIsOpen(false);
    setSearchTerm("");
    router.push(`/movies/${movieId}`);
  };

  return (
    <div
      className="relative z-[120] w-[150px] md:w-[190px] lg:w-[220px] xl:w-[260px] h-9 md:h-10 shrink-0"
      ref={dropdownRef}
    >
      <div className="absolute right-0 top-0 group/search w-[150px] focus-within:w-[210px] md:w-[190px] md:focus-within:w-[250px] lg:w-[220px] lg:focus-within:w-[280px] xl:w-[260px] xl:focus-within:w-[320px] transition-all duration-500 ease-out z-10">
        <div className="relative flex items-center w-full h-9 md:h-10 rounded-full bg-white border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.22)] focus-within:border-cyan-200 focus-within:shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition-all duration-500 px-3 md:px-4">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700 group-focus-within/search:text-slate-900 transition-all duration-300 shrink-0" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (results.length > 0 || searchTerm.trim()) setIsOpen(true);
            }}
            placeholder="Tìm phim, rạp"
            className="w-full bg-transparent text-[11px] md:text-[13px] text-slate-900 placeholder-slate-500 border-none outline-none focus:outline-none focus:ring-0 ml-1.5 md:ml-2 tracking-wide font-semibold"
          />

          {isLoading ? (
            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin text-slate-700 shrink-0" />
          ) : searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setIsOpen(false);
              }}
              className="text-slate-500 hover:text-slate-900 shrink-0 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[210px] md:w-[250px] lg:w-[280px] xl:w-[320px] bg-[#080c1b]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
          {results.map((movie) => {
            const releaseYear = movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : "2026";

            const displayGenres =
              movie.genreNames?.length > 0
                ? movie.genreNames.join(", ")
                : "Đang cập nhật";

            return (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie.id)}
                className="flex gap-2.5 md:gap-3 p-2.5 hover:bg-white/[0.06] cursor-pointer transition-colors items-center group/item"
              >
                <div className="w-9 h-12 md:w-11 md:h-14 shrink-0 rounded-lg overflow-hidden bg-[#111936] border border-white/10 group-hover/item:border-yellow-300/60 group-hover/item:shadow-[0_0_12px_rgba(244,212,25,0.22)] transition-all">
                  <img
                    src={getImageUrl(movie.posterUrl)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] md:text-[13px] font-black text-slate-100 truncate leading-tight mb-0.5 group-hover/item:text-yellow-200 transition-colors">
                    {movie.title}
                  </h4>

                  <p className="text-[8px] md:text-[9px] text-slate-400 truncate mb-1">
                    {movie.director || "The Movie"}
                  </p>

                  <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] text-slate-400 font-medium">
                    <span>{releaseYear}</span>

                    <span className="px-1 py-0.5 bg-yellow-300/12 text-yellow-200 border border-yellow-300/25 rounded text-[7px] font-black uppercase shrink-0">
                      {movie.ageRating || "P"}
                    </span>

                    <span className="truncate max-w-[70px] sm:max-w-[90px] md:max-w-[120px] text-slate-500 hidden sm:inline-block">
                      {displayGenres}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && results.length === 0 && searchTerm && !isLoading && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[210px] md:w-[250px] lg:w-[280px] xl:w-[320px] bg-[#080c1b]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.55)] z-50 p-4 md:p-5 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-[11px] md:text-xs text-slate-300 font-medium">
            Không tìm thấy{" "}
            <span className="font-black text-yellow-200">"{searchTerm}"</span>
          </p>
        </div>
      )}
    </div>
  );
}