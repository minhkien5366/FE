"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Ticket, Star, CalendarDays, Info } from "lucide-react";
import { getImageUrl } from "@/app/lib/api";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: number | string | null;
  reviewCount?: number;
  ageRating?: string;
  genreNames?: string[];
  status?: string;
}

export default function MovieCard({
  id,
  title,
  image,
  rating,
  reviewCount = 0,
  ageRating = "P",
  genreNames = [],
  status,
}: MovieCardProps) {
  const isShowing = status === "SHOWING";

  const finalImageUrl = useMemo(() => {
    if (!image) {
      return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return getImageUrl(image);
  }, [image]);

  const hasRating =
    rating !== undefined && rating !== null && Number(rating) > 0;

  const displayRating = hasRating ? Number(rating).toFixed(1) : "0.0";

  const formatReviewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#0d1222] rounded-lg overflow-hidden border border-[#182038] shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_20px_42px_rgba(34,211,238,0.12)]">
      {/* IMAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0b1020]">
        <img
          src={finalImageUrl}
          alt={title}
          className={`absolute -inset-[10px] w-[calc(100%+20px)] h-[calc(100%+20px)] object-cover object-center transition-transform duration-700 group-hover:scale-[1.04] opacity-95 group-hover:opacity-100 transform-gpu ${
            !isShowing ? "grayscale-[0.2] group-hover:grayscale-0" : ""
          }`}
          onError={handleImageError}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17]/86 via-[#0b0e17]/10 to-transparent opacity-85 pointer-events-none" />

        {/* AGE */}
        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded bg-[#070a12]/85 backdrop-blur-md border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
          <span className="text-yellow-200 text-[10px] font-black tracking-widest uppercase">
            {ageRating}
          </span>
        </div>

        {/* HOVER ACTIONS */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-[#050914]/24 backdrop-blur-[1px]">
          <Link
            href={`/movies/${id}`}
            className={`w-full h-11 flex items-center justify-center gap-2 rounded-md font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
              isShowing
                ? "bg-yellow-300 text-[#111827] hover:bg-yellow-200"
                : "bg-cyan-300 text-[#061018] hover:bg-cyan-200"
            }`}
          >
            {isShowing ? (
              <>
                <Ticket size={16} fill="currentColor" />
                Mua vé
              </>
            ) : (
              <>
                <CalendarDays size={16} />
                Thông tin
              </>
            )}
          </Link>

          <Link
            href={`/movies/${id}`}
            className="w-full h-10 bg-[#070a12]/78 backdrop-blur-md border border-white/15 text-white rounded-md font-black uppercase text-[10px] tracking-[0.14em] flex items-center justify-center gap-2 hover:border-cyan-300/40 hover:text-cyan-200 transition-all"
          >
            <Info size={14} />
            Chi tiết
          </Link>
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 md:p-3.5 flex flex-col flex-1 bg-[#0d1222]">
        <div className="flex items-center gap-1.5 mb-2 min-h-[18px]">
          <Star
            size={12}
            className="fill-yellow-300 text-yellow-300 drop-shadow-[0_0_5px_rgba(244,212,25,0.65)]"
          />

          <span className="text-white text-[11px] font-black">
            {displayRating}
            <span className="text-slate-400 font-medium text-[9px]">/5</span>
          </span>

          {reviewCount > 0 ? (
            <span className="text-slate-500 text-[9px] font-medium truncate">
              ({formatReviewCount(reviewCount)} đánh giá)
            </span>
          ) : (
            <span className="text-slate-600 text-[9px] font-medium truncate">
              Chưa có đánh giá
            </span>
          )}
        </div>

        <h3 className="font-black text-slate-100 text-[14px] md:text-[15px] line-clamp-2 tracking-tight leading-snug group-hover:text-yellow-200 transition-colors duration-200 min-h-[36px]">
          {title}
        </h3>

        <div className="mt-2.5 pt-2 border-t border-[#202941]/70 flex items-center justify-between gap-2">
          <span className="text-slate-500 text-[10px] font-medium line-clamp-1 max-w-[72%]">
            {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
          </span>

          <span
            className={`text-[8px] font-black px-1.5 py-0.5 rounded font-mono tracking-wide shrink-0 border ${
              isShowing
                ? "text-cyan-200 bg-cyan-400/10 border-cyan-400/20"
                : "text-yellow-200 bg-yellow-300/10 border-yellow-300/20"
            }`}
          >
            {isShowing ? "LIVE" : "SẮP"}
          </span>
        </div>

        <div
          className={`mt-2.5 h-[2px] w-0 transition-all duration-500 group-hover:w-full rounded-full ${
            isShowing ? "bg-yellow-300" : "bg-cyan-300"
          }`}
        />
      </div>
    </div>
  );
}