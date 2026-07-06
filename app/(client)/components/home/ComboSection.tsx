"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function ComboSection() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 4;

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await apiRequest("/api/v1/combos", { method: "GET" });

        if (response.ok) {
          const resData = await response.json();

          if (Array.isArray(resData.data)) {
            setCombos(resData.data);
          } else if (Array.isArray(resData)) {
            setCombos(resData);
          } else {
            setCombos([]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải danh sách combo bắp nước:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const totalPages = Math.ceil(combos.length / itemsPerPage);

  const visibleCombos = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return combos.slice(startIndex, startIndex + itemsPerPage);
  }, [combos, currentPage]);

  const handlePrev = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-14 md:py-16 bg-transparent relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="h-12 w-[300px] bg-white/10 animate-pulse rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] w-full max-w-[250px] sm:max-w-[260px] md:max-w-[270px] mx-auto bg-[#1c233d]/40 border border-white/10 animate-pulse rounded-[1rem]"
              />
            ))}
          </div>

          <div className="flex justify-center mt-10 md:mt-12">
            <div className="h-12 md:h-14 w-[220px] md:w-[280px] bg-white/10 animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (combos.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-14 md:py-16 bg-transparent relative overflow-hidden">
      {/* Glow rất nhẹ để section hòa vào nền chung, không bị ngăn mảng màu */}
      <div className="pointer-events-none absolute top-[-160px] left-1/2 -translate-x-1/2 w-[820px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="relative flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles size={12} className="text-yellow-300" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
              Combo ưu đãi
            </span>
          </div>

          <h2
            className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[40px] leading-[0.92] font-black uppercase text-white tracking-[-0.045em] drop-shadow-[0_8px_28px_rgba(255,255,255,0.14)]"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            }}
          >
            MENU BẮP NƯỚC
          </h2>
        </div>

        <div className="relative">
          {totalPages > 1 && (
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
              aria-label="Combo trước"
            >
              <ChevronLeft size={52} strokeWidth={2.4} />
            </button>
          )}

          {totalPages > 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
              aria-label="Combo tiếp theo"
            >
              <ChevronRight size={52} strokeWidth={2.4} />
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8 transition-all duration-500">
            {visibleCombos.map((item: any) => (
              <div
                key={item.id}
                className="group w-full max-w-[250px] sm:max-w-[260px] md:max-w-[270px] mx-auto bg-[#0d1222] backdrop-blur-sm border border-[#141c30] rounded-[0.9rem] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_10px_28px_rgba(34,211,238,0.12)]"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0b1020]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="absolute -inset-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] object-cover scale-[1.025] transition-transform duration-700 group-hover:scale-[1.075] opacity-90 group-hover:opacity-100 transform-gpu"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black tracking-widest text-slate-600 uppercase italic">
                      KN Cinema
                    </div>
                  )}

                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_4px_#0b1020]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/16 to-transparent opacity-85 pointer-events-none" />

                  <div className="absolute top-2 right-2 bg-[#070a12]/88 backdrop-blur-md border border-[#1f2a44] px-2 py-0.5 rounded uppercase z-10 shadow-[0_0_10px_rgba(0,0,0,0.35)]">
                    <span className="text-yellow-200 text-[10px] font-black tracking-widest">
                      Combo
                    </span>
                  </div>
                </div>

                <div className="p-2.5 md:p-3 space-y-1.5 flex-1 flex flex-col justify-between bg-[#0d1222]">
                  <div className="space-y-1.5">
                    <h3 className="font-black text-slate-100 text-[13px] md:text-sm line-clamp-1 tracking-tight group-hover:text-yellow-200 transition-colors duration-200 uppercase">
                      {item.name}
                    </h3>

                    <p className="text-slate-500 text-[10px] font-medium leading-relaxed line-clamp-2 min-h-[30px]">
                      {item.description || "Combo bắp nước hấp dẫn tại KN Cinema."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10px] pt-2 mt-auto border-t border-[#202941]">
                    <span className="text-yellow-300 font-black text-[12px] tracking-wide">
                      {formatPrice(item.price)}
                    </span>

                    <span className="text-cyan-200 bg-cyan-400/10 border border-cyan-400/20 text-[8px] font-black px-1.5 py-0.5 rounded font-mono tracking-wide shrink-0">
                      MENU
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center gap-5 mt-8">
              <button
                onClick={handlePrev}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                aria-label="Combo trước"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={handleNext}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                aria-label="Combo tiếp theo"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          )}

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
                  aria-label={`Chuyển đến nhóm combo ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10 md:mt-12">
            <Link
              href="/combos"
              className="min-w-[220px] md:min-w-[280px] h-12 md:h-14 px-10 inline-flex items-center justify-center rounded-lg border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-[#111827] transition-all duration-300 font-black uppercase tracking-[0.08em] text-sm md:text-base"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              }}
            >
              Xem menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}