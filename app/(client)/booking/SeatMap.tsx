"use client";

import React, { useRef, useMemo, useCallback } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { Heart, Armchair, Move, Sparkles } from "lucide-react";

export interface SeatType {
  id: number | string;
  seatRow: string;
  seatNumber: string;
  status: string;
  seatType: string;
  name?: string;
  price?: number;
  userAvatar?: string;
}

interface SeatMapProps {
  dbSeats: any[];
  selectedSeats: SeatType[];
  onToggleSeat: (seat: SeatType) => void;
}

const SeatMap = ({
  dbSeats = [],
  selectedSeats = [],
  onToggleSeat,
}: SeatMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedSeats = useMemo(() => {
    if (!Array.isArray(dbSeats)) return [];

    return dbSeats.map((s) => ({
      id: s.id,
      seatRow: s.seatRow || s.seat_row || "",
      seatNumber: String(
        s.seatNumber || s.seat_with_number || s.seat_number || ""
      ),
      status: s.status || "AVAILABLE",
      seatType: s.seatType || s.seat_type || "NORMAL",
      name: s.name || "",
      price: s.price || 0,
      userAvatar: s.userAvatar || s.user_avatar || null,
    }));
  }, [dbSeats]);

  const uniqueRows = useMemo(() => {
    const rows = normalizedSeats.map((s) => s.seatRow).filter((row) => row !== "");
    return Array.from(new Set(rows)).sort();
  }, [normalizedSeats]);

  const maxSeatsInRow = useMemo(() => {
    const numbers = normalizedSeats.map((s) => parseInt(s.seatNumber) || 0);
    return numbers.length > 0 ? Math.max(...numbers, 0) : 0;
  }, [normalizedSeats]);

  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty("transform", value);
    }
  }, []);

  const getSeatLetter = (name: string) => {
    if (!name) return "A";

    let sum = 0;

    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    return sum % 2 === 0 ? "A" : "K";
  };

  const legendItems = [
    {
      label: "Còn trống",
      className: "bg-[#101829] border border-[#263452]",
    },
    {
      label: "Đang chọn",
      className: "bg-yellow-300 border border-yellow-200 shadow-[0_0_14px_rgba(244,212,25,0.5)]",
    },
    {
      label: "VIP",
      className: "bg-yellow-300/10 border border-yellow-300/45",
    },
    {
      label: "Ghế đôi",
      className: "bg-pink-400/10 border border-pink-300/45",
    },
    {
      label: "Đã bán",
      className: "bg-[#070a12] border border-[#263452] opacity-60",
    },
  ];

  return (
    <div className="w-full min-h-[660px] relative bg-transparent overflow-hidden">
      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[780px] h-[320px] bg-cyan-300/[0.035] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[760px] h-[300px] bg-yellow-300/[0.025] blur-[160px] rounded-full" />

      {/* TOP NOTE */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 md:px-7 pt-5 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles size={11} className="text-yellow-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
              Seat map
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500 font-medium">
            Chạm để chọn ghế. Có thể kéo hoặc cuộn để phóng to sơ đồ.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
          <Move size={14} className="text-cyan-300" />
          Kéo / zoom
        </div>
      </div>

      {/* LEGEND */}
      <div className="relative z-10 px-5 md:px-7 py-4 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400"
            >
              <span className={`w-5 h-5 rounded-md shrink-0 ${item.className}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <QuickPinchZoom
        onUpdate={onUpdate}
        wheelScaleFactor={0.05}
        draggableUnZoomed={true}
        inertia={true}
        tapZoomFactor={1.5}
      >
        <div
          ref={containerRef}
          className="inline-block origin-[0_0] will-change-transform px-5 md:px-8 pt-10 pb-24 min-w-full text-center"
        >
          {/* SCREEN */}
          <div className="max-w-[560px] mx-auto mb-16 relative">
            <div className="relative h-12">
              <div className="absolute left-0 right-0 top-5 h-[6px] rounded-full bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_34px_rgba(244,212,25,0.55)]" />
              <div className="absolute left-8 right-8 top-0 h-16 bg-gradient-to-b from-yellow-300/18 to-transparent blur-2xl opacity-80" />
            </div>

            <p className="text-[10px] text-yellow-200/70 font-black uppercase mt-1 tracking-[1.2em] text-center ml-[1.2em]">
              Màn hình
            </p>
          </div>

          {/* SEATS */}
          <div className="flex flex-col gap-3.5 items-center justify-center">
            {uniqueRows.map((rowName) => (
              <div key={rowName} className="flex gap-4 md:gap-5 items-center">
                <span className="text-[10px] w-7 text-slate-600 font-black uppercase text-right select-none">
                  {rowName}
                </span>

                <div className="flex gap-2 md:gap-2.5">
                  {Array.from({ length: maxSeatsInRow }, (_, i) => {
                    const currentNum = i + 1;

                    const seatData = normalizedSeats.find(
                      (s) =>
                        s.seatRow === rowName &&
                        parseInt(s.seatNumber) === currentNum
                    );

                    if (!seatData) {
                      return <div key={i} className="w-10 h-10 opacity-0" />;
                    }

                    const statusStr = String(seatData.status).toUpperCase();

                    const isOccupied =
                      statusStr === "OCCUPIED" || statusStr === "SOLD";

                    const isSelected = selectedSeats.some(
                      (s) => s.id === seatData.id
                    );

                    const type = seatData.seatType?.toUpperCase();

                    const isSweet = type === "SWEETBOX" || type === "COUPLE";
                    const isVip = type === "VIP";

                    const label = seatData.name || `${rowName}${currentNum}`;
                    const seatLetter = getSeatLetter(label);

                    let baseColors = "";

                    if (isSelected) {
                      baseColors =
                        "bg-yellow-300 border-yellow-200 text-[#111827] shadow-[0_0_22px_rgba(244,212,25,0.58)] scale-110 z-10";
                    } else if (isOccupied) {
                      if (isVip) {
                        baseColors =
                          "bg-[#070a12] border-2 border-yellow-300/45 text-slate-600 opacity-70";
                      } else if (isSweet) {
                        baseColors =
                          "bg-[#070a12] border border-pink-300/35 text-slate-600 opacity-70";
                      } else {
                        baseColors =
                          "bg-[#070a12] border border-[#263452] text-slate-600 opacity-70";
                      }
                    } else if (isSweet) {
                      baseColors =
                        "bg-pink-400/10 border border-pink-300/45 text-pink-200";
                    } else if (isVip) {
                      baseColors =
                        "bg-yellow-300/10 border border-yellow-300/45 text-yellow-200";
                    } else {
                      baseColors =
                        "bg-[#101829] border border-[#263452] text-slate-400";
                    }

                    const stateEffects = isOccupied
                      ? "cursor-not-allowed pointer-events-none"
                      : !isSelected
                        ? isSweet
                          ? "hover:-translate-y-1 hover:border-pink-200 hover:bg-pink-300/16 hover:text-pink-100 cursor-pointer"
                          : isVip
                            ? "hover:-translate-y-1 hover:border-yellow-200 hover:bg-yellow-300/16 hover:text-yellow-100 cursor-pointer"
                            : "hover:-translate-y-1 hover:border-cyan-300/55 hover:bg-cyan-300/10 hover:text-cyan-100 cursor-pointer"
                        : "cursor-pointer";

                    return (
                      <button
                        key={seatData.id}
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seatData)}
                        className={`
                          relative overflow-hidden
                          transition-all duration-300 ease-out
                          flex items-center justify-center
                          shrink-0 rounded-xl
                          active:scale-95
                          ${
                            isSweet
                              ? "w-[82px] h-10 md:w-[88px] md:h-[42px]"
                              : "w-10 h-10 md:w-[42px] md:h-[42px]"
                          }
                          ${baseColors}
                          ${stateEffects}
                        `}
                        title={`${label} - ${Number(seatData.price || 0).toLocaleString("vi-VN")}đ`}
                      >
                        {isOccupied ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {isSweet ? (
                              <div className="w-full h-full flex items-center justify-center ak-font select-none">
                                <span className="text-[11px] tracking-tight leading-none mt-1">
                                  <span className="text-yellow-300">A</span>
                                  <span className="text-slate-200 px-[1px]">&</span>
                                  <span className="text-yellow-300">K</span>
                                  <span className="text-slate-200">CINEMA</span>
                                </span>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center ak-font select-none overflow-hidden">
                                <span className="text-[32px] leading-none text-yellow-300/80 mt-2">
                                  {seatLetter}
                                </span>
                              </div>
                            )}

                            {seatData.userAvatar && (
                              <img
                                src={seatData.userAvatar}
                                alt="Character"
                                className="absolute inset-0 w-full h-full object-cover opacity-90 z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}

                            <div className="absolute inset-0 bg-[#020617]/20 z-20" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5 relative z-10">
                            {isSweet ? (
                              <Heart
                                size={14}
                                className={
                                  isSelected
                                    ? "fill-[#111827] text-[#111827]"
                                    : "fill-pink-300/45 text-pink-200"
                                }
                              />
                            ) : (
                              <Armchair
                                size={13}
                                className={`${
                                  isSelected
                                    ? "text-[#111827]"
                                    : isVip
                                      ? "text-yellow-200"
                                      : "text-slate-400"
                                }`}
                              />
                            )}

                            <span
                              className={`font-black tracking-tighter leading-none ${
                                isSweet ? "text-[8px]" : "text-[9px]"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        )}

                        {isSelected && (
                          <>
                            <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse pointer-events-none z-20" />
                            <div className="absolute -inset-1 rounded-xl border border-yellow-100/80 pointer-events-none z-30" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[10px] w-7 text-slate-600 font-black uppercase text-left select-none">
                  {rowName}
                </span>
              </div>
            ))}
          </div>

          <div className="h-28" />
        </div>
      </QuickPinchZoom>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap");

        .ak-font {
          font-family: "Fredoka One", "Varela Round", "Nunito", cursive,
            sans-serif;
        }
      `}</style>
    </div>
  );
};

export default SeatMap;