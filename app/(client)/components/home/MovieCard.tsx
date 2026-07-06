"use client";

import React from "react";
import { Star, Play } from "lucide-react";
import { getImageUrl } from "../../../lib/api";
import Link from "next/link";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: string | number;
  status?: string;
  ageRating?: string;
  genreNames?: string[];
  reviewCount?: number;
}

export default function MovieCard({
  id,
  title,
  image,
  rating,
  status,
  ageRating = "P",
  genreNames = [],
  reviewCount = 0,
}: MovieCardProps) {
  const isShowing = status === "SHOWING";
  const hasRating = rating && Number(rating) > 0;
  const displayRating = hasRating ? Number(rating).toFixed(1) : "0.0";

  return (
    <Link
      href={`/movies/${id}`}
      className="block group relative w-full h-full overflow-hidden rounded-[0.9rem] bg-[#0d1222] backdrop-blur-sm border border-[#1c2540] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_10px_28px_rgba(34,211,238,0.12)] select-none flex flex-col"
    >
      {/* Poster: crop nhẹ để che viền trắng/thừa của ảnh */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#0b1020]">
        <img
          src={getImageUrl(image)}
          alt={title}
          className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] object-cover scale-[1.015] transition-transform duration-700 group-hover:scale-[1.06] opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/18 to-transparent opacity-85 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-20">
          <div className="p-3 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/45 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.45)] group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <Play size={17} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        <div className="absolute top-2 right-2 bg-[#070a12]/88 backdrop-blur-md border border-[#1f2a44] px-2 py-0.5 rounded uppercase z-10 shadow-[0_0_10px_rgba(0,0,0,0.35)]">
          <span className="text-yellow-200 text-[10px] font-black tracking-widest">
            {ageRating}
          </span>
        </div>
      </div>

      <div className="p-2.5 md:p-3 space-y-1.5 flex-1 flex flex-col justify-between relative z-10 bg-[#0d1222]">
        <div className="space-y-1.5">
          <h3 className="font-black text-slate-100 text-[13px] md:text-sm line-clamp-1 tracking-tight group-hover:text-yellow-200 transition-colors duration-200">
            {title}
          </h3>

          <div className="flex items-center gap-1.5">
            <Star
              size={11}
              className="fill-yellow-300 text-yellow-300 drop-shadow-[0_0_5px_rgba(244,212,25,0.65)]"
            />

            <span className="text-white text-[11px] font-bold">
              {displayRating}
              <span className="text-slate-400 font-normal text-[9px]">/5</span>
            </span>

            <span className="text-slate-500 text-[9px] font-medium ml-0.5 truncate">
              ({reviewCount} đánh giá)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 text-[10px] pt-2 mt-auto border-t border-[#202941]">
          <span className="line-clamp-1 text-slate-400 max-w-[70%]">
            {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
          </span>

          <span
            className={`text-[8px] font-black px-1.5 py-0.5 rounded font-mono tracking-wide shrink-0 ${
              isShowing
                ? "text-cyan-200 bg-cyan-400/10 border border-cyan-400/20"
                : "text-yellow-200 bg-yellow-300/10 border border-yellow-300/20"
            }`}
          >
            {isShowing ? "LIVE" : "SẮP"}
          </span>
        </div>
      </div>
    </Link>
  );
}