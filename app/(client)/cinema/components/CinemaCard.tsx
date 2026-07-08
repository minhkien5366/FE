import React from "react";
import { ChevronRight, Building2, MapPin } from "lucide-react";

export default function CinemaCard({ cinema, isActive, onClick }: any) {
  const cinemaName = cinema?.name || "KN Cinema";
  const cinemaAddress = cinema?.address || cinema?.city || "Đang cập nhật địa chỉ";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full group relative overflow-hidden p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between text-left active:scale-[0.99] ${
        isActive
          ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_34px_rgba(244,212,25,0.18)]"
          : "bg-[#0d1222] border-white/10 hover:bg-[#111827] hover:border-cyan-300/35 text-slate-400"
      }`}
    >
      {!isActive && (
        <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full bg-cyan-300/[0.04] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative z-10 flex items-start gap-3 min-w-0 pr-2">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
            isActive
              ? "bg-[#111827]/10 border-[#111827]/15 text-[#111827]"
              : "bg-cyan-300/10 border-cyan-300/25 text-cyan-300 group-hover:text-yellow-300 group-hover:border-yellow-300/30"
          }`}
        >
          <Building2 size={14} />
        </div>

        <div className="min-w-0">
          <h3
            className={`text-[11px] font-black uppercase truncate transition-colors tracking-[0.06em] ${
              isActive ? "text-[#111827]" : "text-slate-200 group-hover:text-yellow-200"
            }`}
          >
            {cinemaName}
          </h3>

          <p
            className={`text-[9px] mt-1 truncate transition-colors font-semibold flex items-center gap-1 ${
              isActive ? "text-[#111827]/65" : "text-slate-500"
            }`}
          >
            <MapPin size={9} className="shrink-0" />
            {cinemaAddress}
          </p>
        </div>
      </div>

      <ChevronRight
        size={15}
        className={`relative z-10 shrink-0 transition-all ${
          isActive
            ? "text-[#111827] opacity-100"
            : "text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-cyan-300 group-hover:translate-x-0.5"
        }`}
      />
    </button>
  );
}