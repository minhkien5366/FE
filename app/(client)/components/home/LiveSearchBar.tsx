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

        const content =
          data?.data?.content ||
          data?.data ||
          data?.content ||
          [];

        if (Array.isArray(content)) {
          setResults(content);
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      className="relative z-[120] w-[150px] md:w-[190px] lg:w-[220px] xl:w-[260px] h-9 md:h-10 shrink-0"
      ref={dropdownRef}
    >
      <div className="absolute right-0 top-0 group/search w-[150px] focus-within:w-[210px] md:w-[190px] md:focus-within:w-[250px] lg:w-[220px] lg:focus-within:w-[280px] xl:w-[260px] xl:focus-within:w-[320px] transition-all duration-500 ease-out z-10">
        <div className="relative flex items-center w-full h-9 md:h-10 rounded-full bg-white border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.22)] focus-within:border-cyan-200 focus-within:shadow-[0_16px_36px_rgba(0,0,0,0.32)] transition-all duration-500 px-3 md:px-4">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700 group-focus-within/search:text-slate-900 transition-all duration-300 shrink-0" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (results.length > 0 || searchTerm.trim()) setIsOpen(true);
            }}
            placeholder="Tìm phim, rạp"
            className="w-full bg-transparent text-[10px] md:text-xs text-slate-900 placeholder-slate-500 border-none outline-none focus:outline-none focus:ring-0 ml-1.5 md:ml-2 tracking-wide font-bold"
          />

          {isLoading ? (
            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin text-slate-700 shrink-0" />
          ) : searchTerm ? (
            <button
              onClick={handleClearSearch}
              className="text-slate-500 hover:text-slate-900 shrink-0 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[210px] md:w-[250px] lg:w-[280px] xl:w-[320px] bg-[#080c1b] border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.68)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          {isLoading ? (
            <div className="p-5 flex items-center justify-center gap-2 bg-[#080c1b]">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Đang tìm
              </span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1.5 bg-[#080c1b]">
              {results.map((movie) => {
                const releaseYear = movie.releaseDate
                  ? new Date(movie.releaseDate).getFullYear()
                  : "2026";

                const displayGenres =
                  movie.genreNames?.length > 0
                    ? movie.genreNames.join(", ")
                    : "Đang cập nhật";

                return (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    className="w-full flex gap-2.5 md:gap-3 p-2.5 text-left bg-[#080c1b] hover:bg-[#111827] cursor-pointer transition-all duration-300 items-center group/item border-b border-white/[0.04] last:border-b-0"
                  >
                    <div className="w-9 h-12 md:w-10 md:h-[54px] shrink-0 rounded-lg overflow-hidden bg-[#111827] border border-white/10 group-hover/item:border-yellow-300/60 group-hover/item:shadow-[0_0_12px_rgba(244,212,25,0.22)] transition-all">
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
                      <h4 className="text-[10px] md:text-xs font-black text-slate-100 truncate leading-tight mb-0.5 group-hover/item:text-yellow-200 transition-colors">
                        {movie.title}
                      </h4>

                      <p className="text-[8px] text-slate-500 truncate mb-1 font-bold">
                        {movie.director || "KN Cinema"}
                      </p>

                      <div className="flex items-center gap-1.5 md:gap-2 text-[8px] text-slate-400 font-bold min-w-0">
                        <span className="shrink-0">{releaseYear}</span>

                        <span className="px-1 py-0.5 bg-yellow-300/12 text-yellow-200 border border-yellow-300/25 rounded text-[7px] font-black uppercase shrink-0">
                          {movie.ageRating || "P"}
                        </span>

                        <span className="truncate max-w-[70px] sm:max-w-[90px] md:max-w-[120px] text-slate-500 hidden sm:inline-block">
                          {displayGenres}
                        </span>
                      </div>
                    </div>

                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 scale-0 group-hover/item:scale-100 transition-transform shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : searchTerm ? (
            <div className="bg-[#080c1b] p-4 md:p-5 text-center">
              <p className="text-[10px] md:text-xs text-slate-300 font-bold">
                Không tìm thấy{" "}
                <span className="font-black text-yellow-200">
                  "{searchTerm}"
                </span>
              </p>

              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                Thử nhập tên phim khác
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}