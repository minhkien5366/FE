"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import {
  Loader2,
  ChevronLeft,
  TicketPercent,
  CreditCard,
  Wallet,
  User,
  Calendar,
  Clock,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  Armchair,
  Sparkles,
  Film,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [bookingData, setBookingData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(true);

  const showToastError = (message: string) => {
    toast.error(message);
  };

  const showToastSuccess = (message: string) => {
    toast.success(message);
  };

  const normalizeImage = (image?: string) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return getImageUrl(image);
  };

  useEffect(() => {
    const initPage = async () => {
      const savedBookingData = sessionStorage.getItem("booking_data");

      if (!savedBookingData) {
        showToastError("Phiên làm việc đã kết thúc!");
        router.push("/");
        return;
      }

      const parsedData = JSON.parse(savedBookingData);
      setBookingData(parsedData);

      try {
        const [userRes, voucherRes] = await Promise.all([
          apiRequest("/api/v1/users/me", {}, "USER"),
          apiRequest("/api/v1/vouchers/my-vouchers", {}, "USER"),
        ]);

        if (userRes.ok) {
          const userResult = await userRes.json();
          setUserData(userResult.data?.user || userResult.data || userResult);
        }

        if (voucherRes.ok) {
          const voucherResult = await voucherRes.json();
          setVouchers(Array.isArray(voucherResult.data) ? voucherResult.data : []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thanh toán:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  const calculateTotals = () => {
    const seatPrice = Number(bookingData?.seatPrice) || 0;
    const comboPrice = Number(bookingData?.comboPrice) || 0;
    const subTotal = seatPrice + comboPrice;

    const discount = selectedVoucher ? Number(selectedVoucher.discountValue) : 0;
    const finalTotal = Math.round(Math.max(0, subTotal - discount));

    return { seatPrice, comboPrice, subTotal, discount, finalTotal };
  };

  const { seatPrice, comboPrice, subTotal, discount, finalTotal } =
    calculateTotals();

  const validVouchers = vouchers.filter((voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);

    const isMinAmountMet = subTotal >= (voucher.minOrderAmount || 0);
    const isWithinTime = now >= start && now <= end;
    const hasUsageLeft = (voucher.usageLimit || 0) > (voucher.usedCount || 0);

    return isMinAmountMet && isWithinTime && hasUsageLeft;
  });

  const selectedSeatNames =
    bookingData?.selectedSeats
      ?.map((seat: any) => seat.name || `${seat.seatRow}${seat.seatNumber}`)
      .join(", ") || "...";

  const handleFinalCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const payload = {
        showtimeId: Number(bookingData.showtimeId),
        seatIds: bookingData.selectedSeats.map((seat: any) => Number(seat.id)),
        combos: (bookingData.selectedCombos || []).map((combo: any) => ({
          comboId: Number(combo.id),
          quantity: Number(combo.quantity),
        })),
        totalAmount: finalTotal,
        paymentMethod,
        voucherCode: selectedVoucher?.code || "",
      };

      const res = await apiRequest(
        "/api/v1/orders",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        "USER"
      );

      const resData = await res.json();

      if (res.ok) {
        sessionStorage.removeItem("booking_data");

        if (resData.data?.paymentUrl) {
          showToastSuccess("Đang chuyển hướng thanh toán...");

          setTimeout(() => {
            window.location.href = resData.data.paymentUrl;
          }, 1200);
        } else {
          showToastSuccess("Thanh toán thành công!");

          setTimeout(() => {
            router.push("/");
          }, 1600);
        }
      } else {
        const errorMessage = resData.message || resData.error || "Lỗi đặt vé!";
        showToastError(errorMessage);
      }
    } catch (err) {
      showToastError("Lỗi kết nối hệ thống!");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            Đang tải thông tin thanh toán
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
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
          success: {
            iconTheme: {
              primary: "#f4d419",
              secondary: "#111827",
            },
            style: {
              border: "1px solid rgba(244,212,25,0.45)",
            },
          },
          error: {
            iconTheme: {
              primary: "#fb7185",
              secondary: "#111827",
            },
            style: {
              border: "1px solid rgba(244,63,94,0.5)",
            },
          },
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[920px] h-[360px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute top-[320px] right-[-170px] w-[540px] h-[540px] bg-cyan-400/[0.025] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[120px] left-[-180px] w-[540px] h-[540px] bg-yellow-300/[0.018] blur-[160px] rounded-full" />

      <header className="sticky top-0 z-40 bg-[#080b14]/82 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 py-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-200 uppercase text-[10px] md:text-xs font-black tracking-[0.14em] transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
              Quay lại
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Xác nhận thanh toán
                </span>
              </div>

              <h1
                className="text-2xl md:text-4xl font-black uppercase text-white tracking-[-0.045em]"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                THANH TOÁN
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ShieldCheck size={15} className="text-yellow-300" />
              Bảo mật
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 py-8 md:py-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl bg-[#0d1222] border border-[#182038] shadow-[0_18px_50px_rgba(0,0,0,0.26)] overflow-hidden">
              <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-36 h-[210px] md:h-52 rounded-xl overflow-hidden border border-white/10 bg-[#070b16] shrink-0">
                  <img
                    src={normalizeImage(bookingData.movieImage)}
                    alt={bookingData.movieTitle || "Poster"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-yellow-300/10 border border-yellow-300/20">
                    <Film size={11} className="text-yellow-300" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-200">
                      Thông tin vé
                    </span>
                  </div>

                  <h2
                    className="text-2xl md:text-4xl font-black uppercase text-white tracking-[-0.04em] leading-tight mb-5"
                    style={{
                      fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    }}
                  >
                    {bookingData.movieTitle}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
                      <Calendar size={16} className="text-yellow-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                          Ngày
                        </p>
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {bookingData.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
                      <Clock size={16} className="text-cyan-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                          Giờ
                        </p>
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {bookingData.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] border border-white/10 px-4 py-3">
                      <Monitor size={16} className="text-rose-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                          Chi nhánh rạp
                        </p>
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {bookingData.roomName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#0d1222] border border-[#182038] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/20 flex items-center justify-center">
                    <Armchair size={19} className="text-yellow-300" />
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.18em]">
                      Ghế đã chọn
                    </p>
                    <p className="text-sm font-black text-white">
                      {selectedSeatNames}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {bookingData.cinemaName}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0d1222] border border-[#182038] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/20 flex items-center justify-center">
                    <User size={19} className="text-cyan-300" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.18em]">
                      Người đặt
                    </p>
                    <p className="text-sm font-black text-white uppercase truncate">
                      {userData?.fullName ||
                        `${userData?.lastName || ""} ${userData?.firstName || ""}` ||
                        "Khách hàng"}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-bold truncate">
                  {userData?.email || "Chưa cập nhật email"}
                </p>
              </div>
            </section>

            <section className="rounded-2xl bg-[#0d1222] border border-[#182038] p-5 md:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="text-xs md:text-sm font-black uppercase text-yellow-300 flex items-center gap-2 tracking-[0.14em]">
                  <TicketPercent size={16} />
                  Ưu đãi dành cho bạn
                </h3>

                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.18em]">
                  {validVouchers.length} mã khả dụng
                </span>
              </div>

              {validVouchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validVouchers.map((voucher) => {
                    const isSelected = selectedVoucher?.id === voucher.id;

                    return (
                      <button
                        key={voucher.id}
                        onClick={() =>
                          setSelectedVoucher(isSelected ? null : voucher)
                        }
                        className={`relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 group ${
                          isSelected
                            ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_18px_38px_rgba(244,212,25,0.18)]"
                            : "bg-[#070a12]/60 border-white/10 hover:border-cyan-300/35 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="relative z-10 flex justify-between items-start gap-4">
                          <div className="space-y-1 min-w-0">
                            <span
                              className={`text-sm font-black uppercase block leading-none ${
                                isSelected ? "text-[#111827]" : "text-white"
                              }`}
                            >
                              {voucher.code}
                            </span>

                            <p
                              className={`text-[10px] font-bold line-clamp-1 ${
                                isSelected
                                  ? "text-[#111827]/70"
                                  : "text-slate-500"
                              }`}
                            >
                              {voucher.title}
                            </p>

                            <p
                              className={`text-[8px] font-black uppercase tracking-widest ${
                                isSelected
                                  ? "text-[#111827]/60"
                                  : "text-slate-600"
                              }`}
                            >
                              Hạn:{" "}
                              {new Date(voucher.endDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>

                          <div
                            className={`text-xs font-black shrink-0 ${
                              isSelected ? "text-[#111827]" : "text-yellow-300"
                            }`}
                          >
                            -
                            {Number(voucher.discountValue || 0).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2
                            className="absolute -right-3 -bottom-3 text-[#111827]/10"
                            size={72}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Không có voucher phù hợp
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl bg-[#0b1020]/92 border border-white/10 p-5 md:p-6 sticky top-28 space-y-6 shadow-[0_22px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              <h2
                className="text-2xl font-black uppercase tracking-[-0.04em] border-b border-white/10 pb-4 text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                }}
              >
                TÓM TẮT ĐƠN
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                  <span>Tiền vé</span>
                  <span className="text-slate-100">
                    {seatPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                  <span>Combo</span>
                  <span className="text-slate-100">
                    {comboPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                  <span>Tạm tính</span>
                  <span className="text-slate-100">
                    {subTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {selectedVoucher && (
                  <div className="flex justify-between text-[10px] font-black uppercase text-cyan-200 bg-cyan-300/10 p-3 rounded-xl border border-cyan-300/20">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span>-{discount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-4">
                <p className="text-[9px] font-black uppercase text-slate-500 text-center tracking-[0.18em]">
                  Phương thức thanh toán
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {["VNPAY", "MOMO"].map((method) => {
                    const isSelected = paymentMethod === method;

                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all active:scale-95 ${
                          isSelected
                            ? "bg-yellow-300 border-yellow-200 text-[#111827] shadow-[0_16px_32px_rgba(244,212,25,0.18)]"
                            : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-cyan-300/35 hover:text-cyan-200"
                        }`}
                      >
                        {method === "VNPAY" ? (
                          <Wallet size={17} />
                        ) : (
                          <CreditCard size={17} />
                        )}

                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {method}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-5 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-[0.14em]">
                  Tổng thanh toán
                </span>

                <span className="text-3xl md:text-4xl font-black text-yellow-300 tracking-tight leading-none">
                  {finalTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                onClick={handleFinalCheckout}
                disabled={isProcessing}
                className="w-full h-14 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase tracking-[0.14em] text-xs transition-all active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Xác nhận ngay
                  </>
                )}
              </button>

              <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-[0.12em] leading-relaxed">
                Bằng việc xác nhận, bạn đồng ý với các điều khoản của KN Cinema
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}