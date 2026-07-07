"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  Home,
  Ticket,
  RefreshCcw,
  ReceiptText,
  Wallet,
  Clock3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [count, setCount] = useState(5);

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef") || "N/A";
  const amount = Number(searchParams.get("vnp_Amount") || 0) / 100;

  const isSuccess = responseCode === "00";
  const isCancelled = responseCode === "24";
  const isFailed = !isSuccess;

  useEffect(() => {
    if (isSuccess) {
      toast.success("Thanh toán thành công");
    } else if (isCancelled) {
      toast.error("Đã hủy thanh toán");
    } else if (responseCode) {
      toast.error("Giao dịch thất bại");
    }
  }, [isSuccess, isCancelled, responseCode]);

  useEffect(() => {
    if (!isSuccess) return;

    if (count === 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isSuccess, router]);

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
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
      <div className="pointer-events-none absolute top-[38%] right-[-170px] w-[540px] h-[540px] bg-cyan-400/[0.03] blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-180px] w-[540px] h-[540px] bg-yellow-300/[0.025] blur-[160px] rounded-full" />

      <div
        className={`relative z-10 w-full max-w-[520px] rounded-[1.5rem] bg-[#0b1020]/88 backdrop-blur-2xl border border-white/10 p-6 md:p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.48)] overflow-hidden animate-result-card ${
          isSuccess ? "success-card" : "failed-card"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            isSuccess
              ? "bg-gradient-to-r from-transparent via-yellow-300 to-transparent"
              : "bg-gradient-to-r from-transparent via-rose-400 to-transparent"
          }`}
        />

        <div
          className={`pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full blur-[80px] ${
            isSuccess ? "bg-yellow-300/12" : "bg-rose-400/12"
          }`}
        />

        <div className="relative z-10 space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles
              size={12}
              className={isSuccess ? "text-yellow-300" : "text-rose-300"}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
              KN Cinema Payment
            </span>
          </div>

          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full animate-result-ping ${
                isSuccess ? "bg-yellow-300/15" : "bg-rose-400/15"
              }`}
            />

            <div
              className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-[0_18px_42px_rgba(0,0,0,0.35)] animate-icon-pop ${
                isSuccess
                  ? "bg-yellow-300 text-[#111827] border-yellow-200"
                  : "bg-rose-500 text-white border-rose-300"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={42} strokeWidth={2.4} />
              ) : (
                <XCircle size={42} strokeWidth={2.4} />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h1
              className={`text-[34px] md:text-[44px] font-black uppercase tracking-[-0.045em] leading-none ${
                isSuccess ? "text-white" : "text-rose-100"
              }`}
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              }}
            >
              {isSuccess ? "THÀNH CÔNG" : isCancelled ? "ĐÃ HỦY" : "THẤT BẠI"}
            </h1>

            <p className="max-w-sm mx-auto text-[11px] md:text-xs text-slate-400 uppercase tracking-[0.12em] font-bold leading-relaxed">
              {isSuccess
                ? "KN Cinema đã xác nhận giao dịch của bạn."
                : isCancelled
                  ? "Bạn đã hủy luồng thanh toán trước khi hoàn tất."
                  : "Giao dịch không được ngân hàng chấp nhận hoặc đã xảy ra lỗi."}
            </p>
          </div>

          <div className="rounded-2xl bg-[#070a12]/70 border border-white/10 p-5 text-left space-y-4">
            <div className="flex justify-between items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ReceiptText size={15} />
                <span className="text-[10px] uppercase tracking-widest font-black">
                  {isSuccess ? "Mã vé" : "Mã đơn"}
                </span>
              </div>

              <span className="text-xs font-mono font-black text-slate-100 px-2 py-1 bg-white/[0.04] border border-white/10 rounded-md truncate max-w-[190px]">
                #{txnRef}
              </span>
            </div>

            <div className="flex justify-between items-end gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Wallet size={15} />
                <span className="text-[10px] uppercase tracking-widest font-black">
                  Tổng cộng
                </span>
              </div>

              <span
                className={`text-2xl md:text-3xl font-black leading-none ${
                  isSuccess ? "text-yellow-300" : "text-slate-100"
                }`}
              >
                {amount.toLocaleString("vi-VN")}
                <span className="text-base font-bold ml-1">đ</span>
              </span>
            </div>
          </div>

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <Clock3 size={14} className="text-yellow-300" />
              Về trang chủ sau
              <span className="text-[#111827] font-black px-2 py-0.5 bg-yellow-300 rounded-md border border-yellow-200">
                {count}s
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push("/")}
              className="h-12 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-300/35 active:scale-95 text-xs font-black uppercase tracking-[0.12em] text-slate-200 hover:text-cyan-200 transition-all"
            >
              <Home size={15} />
              Trang chủ
            </button>

            {isSuccess ? (
              <button
                onClick={() => router.push("/ticket")}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-yellow-300 hover:bg-yellow-200 active:scale-95 text-xs font-black uppercase tracking-[0.12em] text-[#111827] transition-all shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
              >
                <Ticket size={15} />
                Xem vé
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-xs font-black uppercase tracking-[0.12em] text-white transition-all shadow-[0_16px_36px_rgba(244,63,94,0.22)]"
              >
                <RefreshCcw size={15} />
                Thử lại
              </button>
            )}
          </div>

          {isFailed && (
            <button
              onClick={() => router.push("/movies/now")}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:text-yellow-200 transition-colors"
            >
              Chọn suất chiếu khác
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes resultCardIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes iconPop {
          0% {
            transform: scale(0.55) rotate(-10deg);
            opacity: 0;
          }

          65% {
            transform: scale(1.08) rotate(2deg);
            opacity: 1;
          }

          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }

        @keyframes resultPing {
          0% {
            transform: scale(0.75);
            opacity: 0.7;
          }

          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }

        .animate-result-card {
          animation: resultCardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-icon-pop {
          animation: iconPop 0.62s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }

        .animate-result-ping {
          animation: resultPing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}