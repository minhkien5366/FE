"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  RefreshCw,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Armchair,
  Coffee,
  FlipHorizontal,
  MapPin,
  Keyboard,
  Send,
  Clapperboard,
  Tv,
  Sparkles,
  ShieldCheck,
  ReceiptText,
  CircleDollarSign,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiAdminRequest } from "@/app/lib/api";

export default function StaffScannerPage() {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isMirrored, setIsMirrored] = useState(false);

  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerEnabled) return;

    let isMounted = true;

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (!isMounted) return;

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode("reader");
        }

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            },
          },
          async (decodedText) => {
            if (html5QrCodeRef.current?.isScanning) {
              await html5QrCodeRef.current.stop();
            }

            setScannerEnabled(false);
            await fetchOrderDetails(decodedText.trim());
          },
          () => {}
        );
      } catch (err) {
        console.error("Lỗi khởi động camera:", err);
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch((err) => console.error("Lỗi giải phóng camera:", err));
      }
    };
  }, [scannerEnabled]);

  const fetchOrderDetails = async (bookingCode: string) => {
    if (!bookingCode.trim()) {
      toast.error("Vui lòng nhập mã vé trước!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiAdminRequest(
        `/api/v1/orders/scan?bookingCode=${encodeURIComponent(
          bookingCode.toUpperCase()
        )}`,
        {
          method: "GET",
        }
      );

      const result = await res.json();

      if (res.ok && result.status === 200) {
        setOrderData(result.data);
        toast.success("Xác thực thành công! Vui lòng đối chiếu.");
      } else {
        setError(result.message || "Mã vé không tồn tại hoặc đã hết hiệu lực!");
      }
    } catch (err) {
      setError("Mất kết nối tới máy chủ Backend Spring Boot!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!orderData) return;

    setConfirmLoading(true);

    try {
      const res = await apiAdminRequest(
        `/api/v1/orders/${orderData.id}/confirm-checkin`,
        {
          method: "PUT",
        }
      );

      const result = await res.json();

      if (res.ok && result.status === 200) {
        toast.success("Ghi nhận bàn giao thành công!");

        setTimeout(() => {
          handleResetScanner();
        }, 1500);
      } else {
        toast.error(result.message || "Không thể xác nhận soát vé!");
      }
    } catch (err) {
      toast.error("Mất kết nối, không thể cập nhật trạng thái vé!");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleResetScanner = () => {
    setOrderData(null);
    setError(null);
    setManualCode("");
    setScannerEnabled(true);
  };

  const getSeatStringFromData = () => {
    if (!orderData || !orderData.orderDetails) return "N/A";

    const tickets = orderData.orderDetails.filter(
      (detail: any) => detail.itemType === "TICKET"
    );

    if (tickets.length === 0) return "N/A";

    const seatNames = tickets.map((ticket: any) => {
      if (!ticket.itemName) return "N/A";
      return ticket.itemName.replace(/Ghế\s+/i, "").trim();
    });

    seatNames.sort();
    return seatNames.join(", ");
  };

  return (
    <>
      <div className="min-h-screen bg-transparent text-slate-100 font-sans px-4 sm:px-8 py-8 flex flex-col items-center justify-center relative overflow-hidden select-none w-full selection:bg-yellow-300 selection:text-[#111827]">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3200,
            style: {
              background: "#0b1020",
              color: "#f8fafc",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderRadius: "16px",
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

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

        <div className="text-center mb-6 max-w-md w-full relative z-10">
          <div className="inline-flex p-4 bg-yellow-300/10 border border-yellow-300/25 rounded-2xl mb-4 text-yellow-300 shadow-[0_18px_45px_rgba(244,212,25,0.12)]">
            <Camera size={26} className="animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles size={11} className="text-yellow-300" />

            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
              Quầy soát vé KN
            </span>
          </div>

          <h1
            className="text-[30px] md:text-[42px] font-black uppercase tracking-[-0.055em] leading-none text-white"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            POS SCANNER
          </h1>

          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">
            Kiểm tra & bàn giao vé tại quầy
          </p>
        </div>

        <div className="max-w-md w-full bg-[#0b1020] border border-white/10 rounded-[2rem] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.58)] relative z-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
          <div className="pointer-events-none absolute top-[-110px] right-[-100px] w-72 h-72 bg-yellow-300/[0.05] blur-3xl rounded-full" />
          <div className="pointer-events-none absolute bottom-[-110px] left-[-100px] w-72 h-72 bg-cyan-300/[0.04] blur-3xl rounded-full" />

          <div className="relative z-10">
            {scannerEnabled && !loading && !orderData && !error && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col items-center relative">
                  <div className="w-full relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#020617] shadow-[0_24px_60px_rgba(0,0,0,0.5)] aspect-square">
                    <div
                      id="reader"
                      className={`w-full h-full transition-transform duration-300 ${
                        isMirrored ? "scale-x-[-1]" : "scale-x-1"
                      }`}
                    />

                    <div className="absolute inset-0 pointer-events-none border-[20px] border-[#020617]/55 flex items-center justify-center">
                      <div className="absolute top-3 left-3 w-9 h-9 border-t-4 border-l-4 border-yellow-300 rounded-tl-xl" />
                      <div className="absolute top-3 right-3 w-9 h-9 border-t-4 border-r-4 border-yellow-300 rounded-tr-xl" />
                      <div className="absolute bottom-3 left-3 w-9 h-9 border-b-4 border-l-4 border-yellow-300 rounded-bl-xl" />
                      <div className="absolute bottom-3 right-3 w-9 h-9 border-b-4 border-r-4 border-yellow-300 rounded-br-xl" />
                      <div className="w-[85%] h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent absolute top-0 animate-[scannerLine_2s_infinite] shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center mt-4 px-1 gap-3">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">
                      Đưa mã QR vào khung quét
                    </p>

                    <button
                      onClick={() => setIsMirrored(!isMirrored)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] border border-white/10 rounded-xl text-slate-400 hover:text-cyan-200 hover:border-cyan-300/35 transition-all text-[9px] font-black uppercase tracking-wider"
                    >
                      <FlipHorizontal size={12} />
                      <span>{isMirrored ? "Tắt đảo kính" : "Lật kính"}</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Hoặc nhập thủ công
                  </span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="w-full h-11 bg-[#111827] hover:bg-[#162034] border border-white/10 hover:border-cyan-300/35 text-slate-300 hover:text-cyan-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Keyboard size={14} />
                    <span>
                      {showManualInput
                        ? "Ẩn khung nhập chữ"
                        : "Nhập mã vé bằng tay"}
                    </span>
                  </button>

                  {showManualInput && (
                    <div className="flex gap-2 animate-in slide-in-from-top-3 duration-200">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="VÍ DỤ: KNFX29JK"
                        className="flex-1 bg-[#080c1b] border border-white/10 rounded-xl px-4 text-xs font-black tracking-widest text-center text-white focus:outline-none focus:border-yellow-300/60 uppercase transition-all"
                      />

                      <button
                        onClick={() => {
                          setScannerEnabled(false);
                          fetchOrderDetails(manualCode);
                        }}
                        className="p-3 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl transition-all shadow-[0_16px_34px_rgba(244,212,25,0.22)] flex items-center justify-center active:scale-95"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Loader2
                    className="animate-spin text-yellow-300"
                    size={34}
                    strokeWidth={3}
                  />
                </div>

                <span className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-500 animate-pulse">
                  Đang bóc tách dữ liệu
                </span>
              </div>
            )}

            {error && !loading && (
              <div className="py-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-rose-500/10 border border-rose-400/25 text-rose-300 rounded-2xl mb-4 shadow-[0_18px_45px_rgba(244,63,94,0.12)]">
                  <AlertTriangle size={36} />
                </div>

                <h2
                  className="text-2xl font-black text-white uppercase tracking-[-0.04em] mb-2"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  }}
                >
                  Xác thực thất bại
                </h2>

                <p className="text-slate-500 text-[11px] px-4 mb-6 font-semibold leading-relaxed">
                  {error}
                </p>

                <button
                  onClick={handleResetScanner}
                  className="w-full h-12 bg-[#111827] hover:bg-[#162034] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw size={12} />
                  Quay lại camera
                </button>
              </div>
            )}

            {orderData && !loading && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 p-3.5 bg-cyan-300/10 border border-cyan-300/25 rounded-2xl text-cyan-200 shadow-[0_16px_34px_rgba(34,211,238,0.08)]">
                  <ShieldCheck size={21} className="shrink-0 text-cyan-300" />

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                      Mã vé hợp lệ
                    </h4>

                    <p className="text-[9px] text-cyan-200/70 font-black uppercase leading-none">
                      Hóa đơn: #{orderData.id} • Trạng thái: {orderData.status}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0d1222] border border-white/10 rounded-3xl p-5 relative overflow-hidden space-y-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                  <div className="absolute top-0 bottom-0 left-[-6px] w-3 flex flex-col justify-between my-3 pointer-events-none">
                    {[...Array(8)].map((_, index) => (
                      <div
                        key={index}
                        className="w-2 h-2 bg-[#0b1020] rounded-full border-r border-white/10"
                      />
                    ))}
                  </div>

                  <div className="pl-3 space-y-3">
                    <div>
                      <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1">
                        <Clapperboard size={10} />
                        Tác phẩm điện ảnh
                      </span>

                      <h2 className="text-base font-black text-white uppercase tracking-tight mt-0.5 line-clamp-1">
                        {orderData.movieTitle || "N/A"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">
                          Ngày chiếu
                        </span>

                        <span className="text-xs font-bold text-slate-200">
                          {orderData.date || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">
                          Suất chiếu
                        </span>

                        <span className="text-xs font-bold text-slate-200">
                          {orderData.time || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">
                          Phòng chiếu
                        </span>

                        <span className="text-sm font-black text-yellow-300 uppercase flex items-center gap-1 mt-0.5">
                          <Tv size={11} />
                          {orderData.roomName || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">
                          Vị trí ghế
                        </span>

                        <span className="text-sm font-black text-white tracking-wide block mt-0.5">
                          {getSeatStringFromData()}
                        </span>
                      </div>
                    </div>

                    {orderData.cinemaName && (
                      <div className="flex items-start gap-2 border-t border-white/10 pt-3 text-[10px]">
                        <MapPin
                          size={12}
                          className="text-cyan-300 shrink-0 mt-0.5"
                        />

                        <div>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                            Cụm rạp tiếp nhận
                          </p>

                          <p className="font-bold text-slate-300 mt-0.5">
                            {orderData.cinemaName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-500 pl-1">
                    Danh sách dịch vụ cần bàn giao
                  </p>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {orderData.orderDetails?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-[#111827] border border-white/10 rounded-2xl transition-all hover:border-cyan-300/25"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              item.itemType === "TICKET"
                                ? "bg-yellow-300/10 text-yellow-300 border-yellow-300/25"
                                : "bg-cyan-300/10 text-cyan-300 border-cyan-300/25"
                            }`}
                          >
                            {item.itemType === "TICKET" ? (
                              <Armchair size={15} />
                            ) : (
                              <Coffee size={15} />
                            )}
                          </div>

                          <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-wide leading-tight">
                              {item.itemType === "TICKET"
                                ? item.itemName
                                    .replace(/Ghế\s+/i, "")
                                    .trim()
                                : item.itemName}
                            </p>

                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                              Loại hình: {item.itemType}
                            </p>
                          </div>
                        </div>

                        <div className="px-3 py-1 bg-yellow-300/10 border border-yellow-300/25 text-yellow-300 rounded-xl text-xs font-black">
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#111827] border border-white/10 rounded-2xl flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <ReceiptText size={12} />
                    Tổng doanh thu
                  </span>

                  <span className="text-base font-black text-yellow-300 tracking-tight flex items-center gap-1">
                    <CircleDollarSign size={15} />
                    {orderData.totalAmount?.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={handleResetScanner}
                    className="px-4 bg-[#111827] hover:bg-[#162034] border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleConfirmCheckIn}
                    disabled={confirmLoading}
                    className="flex-1 h-12 bg-yellow-300 hover:bg-yellow-200 text-[#111827] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(244,212,25,0.24)] active:scale-[0.99] disabled:opacity-50"
                  >
                    {confirmLoading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Ticket size={14} strokeWidth={3} />
                    )}

                    <span>
                      {confirmLoading
                        ? "Đang ghi nhận..."
                        : "Xác nhận bàn giao"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.5rem !important;
        }

        #reader {
          border: none !important;
        }

        @keyframes scannerLine {
          0% {
            top: 16%;
          }
          50% {
            top: 84%;
          }
          100% {
            top: 16%;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b1020;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  );
}