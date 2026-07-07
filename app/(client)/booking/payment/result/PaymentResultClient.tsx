"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PaymentResultContent from "./PaymentResultContent";

function PaymentResultFallback() {
  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[820px] h-[340px] bg-white/[0.025] blur-[170px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-180px] w-[520px] h-[520px] bg-yellow-300/[0.02] blur-[150px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <Loader2 className="animate-spin text-yellow-300" size={28} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          Đang kiểm tra kết quả thanh toán
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
}

export default function PaymentResultClient() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}