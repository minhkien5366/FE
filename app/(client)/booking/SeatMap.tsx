"use client";

import React, { useRef, useMemo, useCallback } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { Heart, Armchair } from "lucide-react";
import { Toaster } from "react-hot-toast";

export interface SeatType {
  id: number | string;
  seatRow: string;
  seatNumber: string;
  status: string;
  seatType: string;
  name?: string;
  price?: number;
  userAvatar?: string; // Khai báo trường ảnh nhân vật
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
      userAvatar: s.userAvatar || s.user_avatar || null, // Lấy link ảnh từ DB
    }));
  }, [dbSeats]);

  const uniqueRows = useMemo(() => {
    const rows = normalizedSeats
      .map((s) => s.seatRow)
      .filter((row) => row !== "");

    return Array.from(new Set(rows)).sort();
  }, [normalizedSeats]);

  const maxSeatsInRow = useMemo(() => {
    const numbers = normalizedSeats.map(
      (s) => parseInt(s.seatNumber) || 0
    );

    return numbers.length > 0 ? Math.max(...numbers, 0) : 0;
  }, [normalizedSeats]);

  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty("transform", value);
    }
  }, []);

  // Hàm tính toán ngẫu nhiên chữ A hoặc K cố định dựa vào tên ghế (VD: A1, B2)
  const getSeatLetter = (name: string) => {
    if (!name) return "A";
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return sum % 2 === 0 ? "A" : "K";
  };

  return (
    <div className="w-full h-full min-h-[600px] relative bg-[#010101] overflow-hidden p-4 md:p-5">
      <Toaster position="top-center" reverseOrder={false} />

      <QuickPinchZoom
        onUpdate={onUpdate}
        wheelScaleFactor={0.05}
        draggableUnZoomed={true}
        inertia={true}
        tapZoomFactor={1.5}
      >
        <div
          ref={containerRef}
          className="inline-block origin-[0_0] will-change-transform px-3 min-w-full scale-[0.95] md:scale-100 text-center"
        >
          {/* SCREEN */}
          <div className="max-w-[400px] mx-auto mb-16 relative">
            <div className="w-full h-[3px] bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)] rounded-full"></div>

            <div className="w-full h-24 bg-gradient-to-t from-transparent to-red-600/5 absolute top-0 blur-3xl opacity-40"></div>

            <p className="text-[9px] text-red-600/30 font-black uppercase mt-5 tracking-[1.5em] text-center ml-[1.5em]">
              Màn hình
            </p>
          </div>

          {/* SEATS */}
          <div className="flex flex-col gap-3 items-center justify-center">
            {uniqueRows.map((rowName) => (
              <div key={rowName} className="flex gap-5 items-center">
                <span className="text-[10px] w-6 text-white/10 font-black uppercase text-right select-none">
                  {rowName}
                </span>

                <div className="flex gap-2.5">
                  {Array.from(
                    { length: maxSeatsInRow },
                    (_, i) => {
                      const currentNum = i + 1;

                      const seatData = normalizedSeats.find(
                        (s) =>
                          s.seatRow === rowName &&
                          parseInt(s.seatNumber) === currentNum
                      );

                      if (!seatData) {
                        return (
                          <div
                            key={i}
                            className="w-9 h-9 opacity-0"
                          />
                        );
                      }

                      const statusStr = String(
                        seatData.status
                      ).toUpperCase();

                      const isOccupied =
                        statusStr === "OCCUPIED" ||
                        statusStr === "SOLD";

                      const isSelected =
                        selectedSeats.some(
                          (s) => s.id === seatData.id
                        );

                      const type =
                        seatData.seatType?.toUpperCase();

                      const isSweet =
                        type === "SWEETBOX" ||
                        type === "COUPLE";

                      const isVip = type === "VIP";

                      const label =
                        seatData.name ||
                        `${rowName}${currentNum}`;

                      const seatLetter = getSeatLetter(label);

                      // ==========================================
                      // MÀU SẮC & VIỀN CƠ BẢN
                      // ==========================================
                      let baseColors = "";
                      if (isSelected) {
                        baseColors = "bg-red-600 border-red-500 text-white shadow-[0_0_25px_red] scale-110 z-10";
                      } else if (isOccupied) {
                        if (isVip) {
                          // Ghế VIP đã bán: Nền tối, Viền màu Cam đậm
                          baseColors = "bg-[#0a0a0a] border-2 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
                        } else {
                          // Ghế thường/Đôi đã bán: Nền tối, Viền mờ
                          baseColors = "bg-[#0a0a0a] border border-zinc-800/80";
                        }
                      } else if (isSweet) {
                        baseColors = "bg-pink-500/5 border border-pink-500/30 text-pink-500";
                      } else if (isVip) {
                        baseColors = "bg-amber-600/5 border border-amber-600/30 text-amber-600";
                      } else {
                        baseColors = "bg-zinc-900 border border-zinc-800 text-zinc-500";
                      }

                      const stateEffects = isOccupied
                        ? "cursor-not-allowed pointer-events-none"
                        : !isSelected
                        ? isSweet
                          ? "hover:border-pink-500 hover:bg-pink-500/10 cursor-pointer"
                          : isVip
                          ? "hover:border-amber-600 hover:bg-amber-600/10 cursor-pointer"
                          : "hover:border-zinc-500 hover:text-white cursor-pointer"
                        : "cursor-pointer";

                      return (
                        <button
                          key={seatData.id}
                          disabled={isOccupied}
                          onClick={() =>
                            onToggleSeat(seatData)
                          }
                          className={`
                            relative overflow-hidden
                            transition-all duration-300
                            flex items-center justify-center
                            shrink-0 rounded-xl
                            ${
                              isSweet
                                ? "w-20 h-10"
                                : "w-10 h-10"
                            }
                            ${baseColors}
                            ${stateEffects}
                          `}
                        >
                          {/* ============================================== */}
                          {/* GIAO DIỆN GHẾ ĐÃ BÁN (CÓ ẢNH HOẶC CHỮ DỰ PHÒNG)*/}
                          {/* ============================================== */}
                          {isOccupied ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              
                              {/* 1. LỚP DƯỚI CÙNG: Chữ A/K béo ngậy (Luôn hiển thị như một lớp dự phòng) */}
                              {isSweet ? (
                                <div className="w-full h-full flex items-center justify-center ak-font select-none">
                                  <span className="text-[12px] tracking-tight leading-none mt-1">
                                    <span className="text-[#ff3333]">A</span>
                                    <span className="text-zinc-200 px-[1px]">&</span>
                                    <span className="text-[#ff3333]">K</span>
                                    <span className="text-zinc-200">CINEMA</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center ak-font select-none overflow-hidden">
                                  <span className="text-[34px] leading-none text-[#ff3333] mt-2">
                                    {seatLetter}
                                  </span>
                                </div>
                              )}

                              {/* 2. LỚP TRÊN CÙNG: Ảnh nhân vật (Nằm đè lên chữ nếu có) */}
                              {seatData.userAvatar && (
                                <img
                                  src={seatData.userAvatar}
                                  alt="Character"
                                  className="absolute inset-0 w-full h-full object-cover opacity-90 z-10"
                                  onError={(e) => {
                                    // BÍ QUYẾT: Nếu link ảnh bị chết (404), tự động ẩn thẻ img đi để lộ lớp chữ A/K ở dưới ra
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}

                            </div>
                          ) : (
                            /* ============================================== */
                            /* HIỂN THỊ ICON BÌNH THƯỜNG KHI GHẾ CÒN TRỐNG    */
                            /* ============================================== */
                            <div className="flex flex-col items-center gap-0.5">
                              {isSweet ? (
                                <Heart
                                  size={14}
                                  className={
                                    isSelected
                                      ? "fill-white"
                                      : "fill-pink-500/40"
                                  }
                                />
                              ) : (
                                <Armchair
                                  size={12}
                                  className={`opacity-40 ${
                                    isVip &&
                                    !isSelected
                                      ? "text-amber-600"
                                      : ""
                                  }`}
                                />
                              )}

                              <span
                                className={`font-black tracking-tighter ${
                                  isSweet
                                    ? "text-[8px]"
                                    : "text-[9px]"
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                          )}

                          {/* Hiệu ứng ghế đang chọn */}
                          {isSelected && (
                            <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none z-20" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <span className="text-[10px] w-6 text-white/10 font-black uppercase text-left select-none">
                  {rowName}
                </span>
              </div>
            ))}
          </div>

          <div className="h-40"></div>
        </div>
      </QuickPinchZoom>

      {/* TÍCH HỢP FONT CHỮ TRÒN (FREDOKA ONE) TRỰC TIẾP VÀO COMPONENT */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        
        .ak-font {
          font-family: 'Fredoka One', 'Varela Round', 'Nunito', cursive, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default SeatMap;