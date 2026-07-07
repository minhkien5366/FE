"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ArrowRight,
  Loader2,
  Armchair,
  CalendarDays,
  Clock,
  MapPin,
  Film,
  Sparkles,
  Ticket,
} from "lucide-react";
import { apiRequest } from "@/app/lib/api";
import SeatMap from "../SeatMap";
import toast, { Toaster } from "react-hot-toast";
import { getImageUrl } from "@/app/lib/api";

export default function BookingPage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = use(params);
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [dbSeats, setDbSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [showtimeInfo, setShowtimeInfo] = useState<any>(null);

  const selectedSeatNames =
    selectedSeats.map((s) => s.name || `${s.seatRow}${s.seatNumber}`).join(", ") ||
    "...";

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + Number(seat.price || 0),
    0
  );

  const showSeatError = (message: string) => {
    toast.error(message, {
      icon: <Armchair size={18} className="text-rose-300" />,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resSeats, resInfo] = await Promise.all([
          apiRequest(`/api/v1/seats/showtime/${showtimeId}`),
          apiRequest(`/api/v1/showtimes/${showtimeId}`),
        ]);

        if (resSeats.ok && resInfo.ok) {
          const seatsData = await resSeats.json();
          const infoData = await resInfo.json();

          setDbSeats(seatsData.data || []);
          setShowtimeInfo(infoData.data || null);

          const saved = sessionStorage.getItem("booking_data");
          const isBack = sessionStorage.getItem("is_back_from_combos");

          if (saved && isBack === "true") {
            const parsed = JSON.parse(saved);

            if (
              String(parsed.showtimeId) === String(showtimeId) &&
              parsed.selectedSeats
            ) {
              setSelectedSeats(parsed.selectedSeats);
            }

            sessionStorage.removeItem("is_back_from_combos");
          } else {
            sessionStorage.removeItem("booking_data");
            setSelectedSeats([]);
          }
        } else {
          showSeatError("Không thể tải dữ liệu suất chiếu!");
        }
      } catch (err) {
        showSeatError("Lỗi tải dữ liệu chọn ghế!");
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [showtimeId]);

  useEffect(() => {
    if (fetching) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiRequest(`/api/v1/seats/showtime/${showtimeId}`);

        if (res.ok) {
          const newSeats = (await res.json()).data || [];
          setDbSeats(newSeats);

          setSelectedSeats((prev) => {
            if (prev.length === 0) return prev;

            let hasConflict = false;

            const validSeats = prev.filter((selectedSeat) => {
              const dbMatch = newSeats.find((s: any) => s.id === selectedSeat.id);
              const status = String(dbMatch?.status || "").toUpperCase();

              if (dbMatch && (status === "OCCUPIED" || status === "SOLD")) {
                hasConflict = true;
                return false;
              }

              return true;
            });

            if (hasConflict) {
              showSeatError(
                "Ghế bạn đang chọn vừa bị người khác mua hoặc giữ chỗ!"
              );
              return validSeats;
            }

            return prev;
          });
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [showtimeId, fetching]);

  const handleToggleSeat = async (seat: any) => {
    const status = String(seat.status || "").toUpperCase();

    if (status === "OCCUPIED" || status === "SOLD") {
      showSeatError("Ghế này đã có người chọn!");
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);

    if (isAlreadySelected) {
      try {
        await apiRequest(
          `/api/v1/seats/release?showtimeId=${showtimeId}&seatId=${seat.id}`,
          { method: "POST" }
        );

        setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      } catch (error) {
        showSeatError("Lỗi khi hủy giữ ghế!");
      }

      return;
    }

    if (selectedSeats.length >= 6) {
      showSeatError("Mỗi giao dịch chỉ được đặt tối đa 6 ghế!");
      return;
    }

    try {
      const res = await apiRequest(
        `/api/v1/seats/hold?showtimeId=${showtimeId}&seatId=${seat.id}`,
        { method: "POST" }
      );

      if (res.ok) {
        setSelectedSeats((prev) => [...prev, seat]);
      } else {
        const errorData = await res.json();

        showSeatError(
          errorData.message || "Ghế này vừa bị người khác chọn mất!"
        );

        const refreshRes = await apiRequest(
          `/api/v1/seats/showtime/${showtimeId}`
        );

        if (refreshRes.ok) {
          setDbSeats((await refreshRes.json()).data || []);
        }
      }
    } catch (error) {
      showSeatError("Lỗi kết nối khi giữ ghế!");
    }
  };

  const validateCGVSeatRules = (): boolean => {
    const uniqueRows = Array.from(new Set(dbSeats.map((s) => s.seatRow)));

    for (const rowName of uniqueRows) {
      const rowSeats = dbSeats.filter((s) => s.seatRow === rowName);
      const seatMapByNum = new Map(
        rowSeats.map((s) => [parseInt(s.seatNumber), s])
      );

      for (const currentSeat of rowSeats) {
        const seatType = currentSeat.seatType
          ? String(currentSeat.seatType).toUpperCase()
          : "NORMAL";

        if (seatType === "SWEETBOX" || seatType === "COUPLE") continue;

        const statusStr = String(currentSeat.status).toUpperCase();
        const isOccupied = statusStr === "OCCUPIED" || statusStr === "SOLD";
        const isSelected = selectedSeats.some((s) => s.id === currentSeat.id);

        if (!isOccupied && !isSelected) {
          const currentNum = parseInt(currentSeat.seatNumber);

          const leftSeat = seatMapByNum.get(currentNum - 1);
          const leftIsWallOrWalkway = !leftSeat;
          let leftBlockedBySelectionOrOrder = false;
          let leftSelectedByMe = false;

          if (!leftIsWallOrWalkway) {
            const leftOccupied =
              String(leftSeat.status).toUpperCase() === "OCCUPIED" ||
              String(leftSeat.status).toUpperCase() === "SOLD";
            const leftSimSelected = selectedSeats.some(
              (s) => s.id === leftSeat.id
            );

            if (leftOccupied || leftSimSelected) {
              leftBlockedBySelectionOrOrder = true;
              if (leftSimSelected) leftSelectedByMe = true;
            }
          }

          const rightSeat = seatMapByNum.get(currentNum + 1);
          const rightIsWallOrWalkway = !rightSeat;
          let rightBlockedBySelectionOrOrder = false;
          let rightSelectedByMe = false;

          if (!rightIsWallOrWalkway) {
            const rightOccupied =
              String(rightSeat.status).toUpperCase() === "OCCUPIED" ||
              String(rightSeat.status).toUpperCase() === "SOLD";
            const rightSimSelected = selectedSeats.some(
              (s) => s.id === rightSeat.id
            );

            if (rightOccupied || rightSimSelected) {
              rightBlockedBySelectionOrOrder = true;
              if (rightSimSelected) rightSelectedByMe = true;
            }
          }

          let isSingleSeatError = false;

          if (
            !leftIsWallOrWalkway &&
            !rightIsWallOrWalkway &&
            leftBlockedBySelectionOrOrder &&
            rightBlockedBySelectionOrOrder
          ) {
            if (leftSelectedByMe || rightSelectedByMe) isSingleSeatError = true;
          } else if (
            leftIsWallOrWalkway &&
            rightBlockedBySelectionOrOrder &&
            rightSelectedByMe
          ) {
            isSingleSeatError = true;
          } else if (
            rightIsWallOrWalkway &&
            leftBlockedBySelectionOrOrder &&
            leftSelectedByMe
          ) {
            isSingleSeatError = true;
          }

          if (isSingleSeatError) {
            const label =
              currentSeat.name || `${currentSeat.seatRow}${currentSeat.seatNumber}`;

            showSeatError(
              `Không được để lại ghế trống đơn lẻ (${label}) ở giữa hoặc đầu/cuối hàng ghế!`
            );

            return false;
          }
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (selectedSeats.length === 0) {
      showSeatError("Vui lòng chọn ghế để tiếp tục!");
      return;
    }

    if (!validateCGVSeatRules()) return;

    const saved = sessionStorage.getItem("booking_data");
    const existingData = saved ? JSON.parse(saved) : {};

    const bookingData = {
      ...existingData,
      showtimeId,
      movieTitle: showtimeInfo?.movie?.title,
      movieImage: getImageUrl(showtimeInfo?.movie?.posterUrl),
      cinemaItemId: showtimeInfo?.cinemaItem?.id,
      cinemaName: showtimeInfo?.cinemaItem?.cinema?.name,
      roomName: showtimeInfo?.cinemaItem?.name,
      date: new Date(showtimeInfo?.startTime).toLocaleDateString("vi-VN"),
      time: new Date(showtimeInfo?.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      selectedSeats,
      seatPrice: totalPrice,
    };

    sessionStorage.setItem("booking_data", JSON.stringify(bookingData));
    router.push(`/booking/${showtimeId}/combos`);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            Đang tải sơ đồ ghế
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans relative overflow-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "16px",
            background: "#0b1020",
            color: "#f8fafc",
            border: "1px solid rgba(244, 63, 94, 0.45)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
          success: {
            style: {
              border: "1px solid rgba(34, 211, 238, 0.4)",
            },
          },
          error: {
            style: {
              border: "1px solid rgba(244, 63, 94, 0.5)",
            },
          },
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[920px] h-[360px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute top-[320px] right-[-160px] w-[520px] h-[520px] bg-cyan-400/[0.025] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[120px] left-[-180px] w-[520px] h-[520px] bg-yellow-300/[0.018] blur-[160px] rounded-full" />

      {/* HEADER */}
      <div className="relative z-20 px-5 md:px-10 lg:px-12 py-5 border-b border-white/10 bg-[#080b14]/72 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-200 uppercase text-[10px] md:text-xs font-black tracking-[0.14em] transition-all active:scale-95"
          >
            <ChevronLeft size={18} />
            Quay lại
          </button>

          <div className="text-center min-w-0">
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
              <Sparkles size={11} className="text-yellow-300" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                Chọn ghế
              </span>
            </div>

            <h1
              className="max-w-[520px] truncate text-lg md:text-2xl font-black uppercase text-white tracking-[-0.035em]"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              }}
            >
              {showtimeInfo?.movie?.title}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Ticket size={15} className="text-yellow-300" />
            Tối đa 6 ghế
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
            <CalendarDays size={17} className="text-yellow-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                Ngày chiếu
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                {showtimeInfo?.startTime
                  ? new Date(showtimeInfo.startTime).toLocaleDateString("vi-VN")
                  : "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
            <Clock size={17} className="text-cyan-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                Giờ chiếu
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                {showtimeInfo?.startTime
                  ? new Date(showtimeInfo.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
            <MapPin size={17} className="text-rose-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                Rạp / Phòng
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                {showtimeInfo?.cinemaItem?.cinema?.name || "KN Cinema"} -{" "}
                {showtimeInfo?.cinemaItem?.name || "Phòng chiếu"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative z-10 flex-1 px-3 md:px-8 lg:px-12 py-6 md:py-8 pb-40">
        <div className="max-w-[1440px] mx-auto rounded-2xl border border-white/10 bg-[#0b1020]/52 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.32)] overflow-hidden">
          <SeatMap
            dbSeats={dbSeats}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-10 lg:px-12 py-4 bg-[#080b14]/92 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.38)]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center shrink-0">
              <Armchair size={23} className="text-yellow-300" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                Ghế đã chọn
              </p>

              <p className="text-sm md:text-base text-white font-black truncate max-w-[320px] md:max-w-[520px]">
                {selectedSeatNames}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5">
            <div className="text-right">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                Tổng tiền
              </p>

              <div className="text-2xl md:text-3xl font-black text-yellow-300 tracking-tight">
                {totalPrice.toLocaleString("vi-VN")}đ
              </div>
            </div>

            <button
              onClick={handleNext}
              className="h-12 md:h-14 px-6 md:px-9 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase tracking-[0.12em] text-xs transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)]"
            >
              Chọn combo
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}