"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Minus,
  Loader2,
  Utensils,
  Sparkles,
  ShoppingCart,
  Ticket,
  Armchair,
  ArrowRight,
} from "lucide-react";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function ComboPage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = use(params);
  const router = useRouter();

  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const showToastError = (message: string) => {
    toast.error(message, {
      icon: <Utensils size={18} className="text-rose-300" />,
    });
  };

  const fetchCombos = useCallback(async (id: number | string) => {
    try {
      const res = await apiRequest(`/api/v1/cinema-combos/${id}/combos`);

      if (res.ok) {
        const result = await res.json();
        setCombos(Array.isArray(result.data) ? result.data : []);
      } else {
        showToastError("Không thể tải thực đơn!");
      }
    } catch {
      showToastError("Không thể tải thực đơn!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("booking_data");

    if (!saved) {
      router.push(`/booking/${showtimeId}`);
      return;
    }

    const parsedData = JSON.parse(saved);

    setBookingData(parsedData);

    if (parsedData.selectedCombos) {
      setSelectedCombos(parsedData.selectedCombos);
    }

    if (parsedData.cinemaItemId) {
      fetchCombos(parsedData.cinemaItemId);
    } else {
      setLoading(false);
    }
  }, [showtimeId, router, fetchCombos]);

  const getComboImage = (imageUrl: string) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=900&auto=format&fit=cover";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return getImageUrl(imageUrl);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=900&auto=format&fit=cover";
  };

  const updateQuantity = (combo: any, delta: number) => {
    setSelectedCombos((prev) => {
      const existing = prev.find((item) => item.id === combo.id);
      const currentQuantity = existing?.quantity || 0;
      const newQuantity = currentQuantity + delta;

      if (newQuantity > combo.stock) {
        showToastError(`Chỉ còn ${combo.stock} phần trong kho!`);
        return prev;
      }

      if (newQuantity <= 0) {
        return prev.filter((item) => item.id !== combo.id);
      }

      if (existing) {
        return prev.map((item) =>
          item.id === combo.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prev, { ...combo, quantity: 1 }];
    });
  };

  const syncBookingStorage = (nextCombos = selectedCombos) => {
    const totalComboPrice = nextCombos.reduce(
      (sum, combo) => sum + Number(combo.price || 0) * Number(combo.quantity || 0),
      0
    );

    const saved = JSON.parse(sessionStorage.getItem("booking_data") || "{}");

    sessionStorage.setItem(
      "booking_data",
      JSON.stringify({
        ...saved,
        selectedCombos: nextCombos,
        comboPrice: totalComboPrice,
      })
    );
  };

  const handleBack = () => {
    syncBookingStorage();
    sessionStorage.setItem("is_back_from_combos", "true");
    router.push(`/booking/${showtimeId}`);
  };

  const handleNext = () => {
    syncBookingStorage();
    router.push("/booking/payment");
  };

  const totalComboPrice = selectedCombos.reduce(
    (sum, combo) => sum + Number(combo.price || 0) * Number(combo.quantity || 0),
    0
  );

  const selectedComboCount = selectedCombos.reduce(
    (sum, combo) => sum + Number(combo.quantity || 0),
    0
  );

  const seatPrice = Number(bookingData?.seatPrice || 0);
  const finalTotal = seatPrice + totalComboPrice;

  const selectedSeatNames =
    bookingData?.selectedSeats
      ?.map((seat: any) => seat.name || `${seat.seatRow}${seat.seatNumber}`)
      .join(", ") || "...";

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            Đang tải menu bắp nước
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans relative overflow-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3200,
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
          error: {
            style: {
              border: "1px solid rgba(244, 63, 94, 0.5)",
            },
          },
          success: {
            style: {
              border: "1px solid rgba(34, 211, 238, 0.45)",
            },
          },
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[920px] h-[360px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute top-[300px] right-[-170px] w-[540px] h-[540px] bg-cyan-400/[0.025] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[120px] left-[-180px] w-[540px] h-[540px] bg-yellow-300/[0.018] blur-[160px] rounded-full" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#080b14]/82 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 py-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-200 uppercase text-[10px] md:text-xs font-black tracking-[0.14em] transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
              Quay lại
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Combo bắp nước
                </span>
              </div>

              <h1
                className="text-2xl md:text-4xl font-black uppercase text-white tracking-[-0.045em]"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CHỌN COMBO
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ShoppingCart size={15} className="text-yellow-300" />
              {selectedComboCount} món
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
              <Armchair size={17} className="text-yellow-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                  Ghế đã chọn
                </p>
                <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                  {selectedSeatNames}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
              <Ticket size={17} className="text-cyan-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                  Tiền vé
                </p>
                <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                  {seatPrice.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
              <Utensils size={17} className="text-rose-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                  Combo
                </p>
                <p className="text-xs md:text-sm font-bold text-slate-100 truncate">
                  {selectedComboCount > 0
                    ? `${selectedComboCount} món - ${totalComboPrice.toLocaleString(
                        "vi-VN"
                      )}đ`
                    : "Chưa chọn combo"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 py-8 md:py-10 pb-44">
        {combos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {combos.map((combo) => {
              const quantity =
                selectedCombos.find((item) => item.id === combo.id)?.quantity || 0;

              const isOutOfStock = Number(combo.stock || 0) <= 0;
              const isSelected = quantity > 0;

              return (
                <div
                  key={combo.id}
                  className={`group relative flex flex-col bg-[#0d1222] border rounded-xl overflow-hidden transition-all duration-300 shadow-[0_16px_34px_rgba(0,0,0,0.25)] ${
                    isOutOfStock
                      ? "opacity-45 grayscale border-[#182038]"
                      : isSelected
                        ? "border-yellow-300/45 shadow-[0_20px_42px_rgba(244,212,25,0.12)]"
                        : "border-[#182038] hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_20px_42px_rgba(34,211,238,0.12)]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 left-3 z-20 rounded-md bg-yellow-300 text-[#111827] border border-yellow-200 px-2.5 py-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        x{quantity}
                      </span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050914]/45 backdrop-blur-[1px]">
                      <span className="px-4 py-2 rounded-lg bg-[#070a12]/90 border border-rose-400/35 text-rose-200 text-[10px] font-black uppercase tracking-[0.2em]">
                        Hết hàng
                      </span>
                    </div>
                  )}

                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070b16]">
                    <img
                      src={getComboImage(combo.imageUrl)}
                      alt={combo.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.055] opacity-95 group-hover:opacity-100"
                      onError={handleImageError}
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17]/88 via-[#0b0e17]/8 to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3 z-20 rounded-md bg-[#070a12]/85 backdrop-blur-md border border-white/10 px-2.5 py-1">
                      <span className="text-yellow-200 text-[9px] font-black uppercase tracking-widest">
                        Còn {combo.stock || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col bg-[#0d1222]">
                    <h3 className="font-black text-slate-100 text-sm md:text-[15px] line-clamp-2 leading-snug tracking-tight group-hover:text-yellow-200 transition-colors min-h-[38px]">
                      {combo.name}
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-2 mb-4 line-clamp-2 leading-relaxed min-h-[32px]">
                      {combo.description || "Combo bắp nước hấp dẫn tại KN Cinema."}
                    </p>

                    <div className="mt-auto pt-3 border-t border-[#202941]/70 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                          Giá
                        </p>

                        <span className="text-yellow-300 font-black text-sm md:text-base tracking-tight">
                          {Number(combo.price || 0).toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      {!isOutOfStock ? (
                        <div className="flex items-center gap-1.5 rounded-lg bg-[#070a12]/75 border border-white/10 p-1">
                          <button
                            onClick={() => updateQuantity(combo, -1)}
                            disabled={quantity <= 0}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95"
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="w-7 text-center text-xs font-black text-white">
                            {quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(combo, 1)}
                            disabled={quantity >= Number(combo.stock || 0)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-yellow-300 text-[#111827] hover:bg-yellow-200 disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_16px_rgba(244,212,25,0.22)]"
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-rose-300">
                          Hết
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-28 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
              <Utensils size={26} className="text-yellow-300" />
            </div>

            <p className="text-slate-500 font-black uppercase tracking-[0.22em] text-xs md:text-sm">
              Rạp hiện chưa có combo khả dụng
            </p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-10 lg:px-12 py-4 bg-[#080b14]/92 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.38)]">
        <div className="max-w-[1440px] mx-auto rounded-2xl bg-[#0b1020]/92 border border-white/10 px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-3 gap-3 md:gap-5 flex-1">
            <div>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.18em]">
                Vé
              </p>
              <p className="text-xs md:text-sm text-slate-100 font-black truncate">
                {seatPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.18em]">
                Combo
              </p>
              <p className="text-xs md:text-sm text-slate-100 font-black truncate">
                {totalComboPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.18em]">
                Tổng tiền
              </p>
              <p className="text-xl md:text-3xl text-yellow-300 font-black tracking-tight truncate">
                {finalTotal.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="h-12 md:h-14 px-7 md:px-10 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase tracking-[0.12em] text-xs transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)]"
          >
            Thanh toán
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}