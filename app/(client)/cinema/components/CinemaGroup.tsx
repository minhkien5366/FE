import React from "react";
import { ChevronDown, MapPin, Building2 } from "lucide-react";
import CinemaCard from "./CinemaCard";

export default function CinemaGroup({
  parentName,
  childrenCinemas,
  activeChildId,
  onChildSelect,
  isExpanded,
  onToggle,
}: any) {
  const totalCinemas = childrenCinemas?.length || 0;

  return (
    <div className="mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full group relative overflow-hidden flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border active:scale-[0.99] ${
          isExpanded
            ? "bg-[#111827] border-cyan-300/25 shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
            : "bg-[#0d1222] border-white/10 hover:bg-[#111827] hover:border-yellow-300/25"
        }`}
      >
        <div className="pointer-events-none absolute -top-14 -left-14 w-32 h-32 bg-yellow-300/[0.035] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              isExpanded
                ? "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                : "bg-white/[0.03] border-white/10 text-slate-500 group-hover:text-yellow-300 group-hover:border-yellow-300/25"
            }`}
          >
            <MapPin size={14} />
          </div>

          <div className="min-w-0 text-left">
            <h2
              className={`text-[10px] font-black uppercase tracking-[0.14em] truncate ${
                isExpanded ? "text-white" : "text-slate-400 group-hover:text-slate-100"
              }`}
            >
              {parentName}
            </h2>

            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-600 mt-1 flex items-center gap-1">
              <Building2 size={9} />
              {totalCinemas} cụm rạp
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span
            className={`hidden sm:inline-flex text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
              isExpanded
                ? "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                : "bg-white/[0.03] border-white/10 text-slate-600"
            }`}
          >
            {totalCinemas}
          </span>

          <ChevronDown
            size={15}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-cyan-300" : "text-slate-600 group-hover:text-yellow-300"
            }`}
          />
        </div>
      </button>

      <div
        className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? "max-h-[900px] opacity-100 mt-2 mb-3" : "max-h-0 opacity-0 mt-0 mb-0"
        }`}
      >
        <div className="pl-3 border-l border-white/10 ml-4 mt-1 flex flex-col gap-2">
          {childrenCinemas.map((cinema: any) => (
            <CinemaCard
              key={cinema.id}
              cinema={cinema}
              isActive={activeChildId === cinema.id}
              onClick={() => onChildSelect(cinema.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}