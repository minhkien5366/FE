"use client";

import React from "react";
import {
  Calendar,
  Check,
  Clock,
  Coffee,
  ChevronRight,
  AlertTriangle,
  XCircle,
  Tv,
} from "lucide-react";

const checkIsExpired = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr || dateStr === "N/A") return false;

  try {
    let year, month, day;

    if (dateStr.includes("-")) {
      const parts = dateStr.split("T")[0].split("-");
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    } else {
      return false;
    }

    const startTime = timeStr.split("-")[0].trim();
    const [hours, minutes] = startTime.split(":").map(Number);

    const movieTime = new Date(year, month - 1, day, hours, minutes);
    return movieTime < new Date();
  } catch (error) {
    return false;
  }
};

interface OrderTicketItemProps {
  order: any;
  onOpenDetail: (order: any) => void;
}

export default function OrderTicketItem({
  order,
  onOpenDetail,
}: OrderTicketItemProps) {
  const isCancelled =
    order.status === "CANCELLED" || order.status === "CANCELED";
  const isExpired =
    order.status === "PAID" && checkIsExpired(order.date, order.time);
  const isUsed = order.status === "USED";
  const isInvalid = isCancelled || isUsed || isExpired;

  const tickets =
    order.orderDetails?.filter((detail: any) => detail.itemType === "TICKET") ||
    [];
  const combos =
    order.orderDetails?.filter((detail: any) => detail.itemType === "COMBO") ||
    [];

  const seatNames = tickets
    .map((ticket: any) => {
      const match = ticket.itemName?.match(/Ghế\s+([A-Z0-9]+)/i);
      return match ? match[1] : ticket.itemName;
    })
    .filter(Boolean)
    .sort()
    .join(", ");

  return (
    <div
      onClick={() => onOpenDetail(order)}
      className={`relative group flex items-stretch transition-all duration-300 h-[104px] mb-3 rounded-xl border overflow-hidden select-none cursor-pointer shadow-[0_16px_34px_rgba(0,0,0,0.24)] ${
        isCancelled
          ? "bg-[#0a0f1c] border-rose-500/15 opacity-70 grayscale hover:opacity-90"
          : isUsed || isExpired
            ? "bg-[#0d1222] border-[#263452] opacity-85 hover:opacity-100 hover:border-slate-500/50"
            : "bg-[#0d1222] border-[#182038] hover:bg-[#10182a] hover:border-cyan-300/35 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(34,211,238,0.1)]"
      }`}
    >
      {isInvalid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none rotate-[-12deg] scale-105">
          <div
            className={`border-2 px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)] ${
              isCancelled
                ? "border-rose-400/70 bg-[#190b12] text-rose-300"
                : isExpired
                  ? "border-yellow-300/70 bg-[#1f1a0b] text-yellow-300"
                  : "border-cyan-300/70 bg-[#071a1f] text-cyan-200"
            }`}
          >
            {isCancelled ? (
              <XCircle size={13} className="stroke-[3]" />
            ) : isExpired ? (
              <AlertTriangle size={13} className="stroke-[3]" />
            ) : (
              <Check size={13} className="stroke-[3]" />
            )}

            <span className="text-[9px] font-black uppercase tracking-[0.22em]">
              {isCancelled ? "ĐÃ HỦY VÉ" : isExpired ? "HẾT HẠN" : "ĐÃ SOÁT VÉ"}
            </span>
          </div>
        </div>
      )}

      <div
        className={`w-2 shrink-0 transition-colors duration-300 ${
          isCancelled
            ? "bg-rose-500/55"
            : isUsed
              ? "bg-cyan-300/55"
              : isExpired
                ? "bg-yellow-300/55"
                : "bg-yellow-300 group-hover:bg-cyan-300"
        }`}
      />

      <div
        className={`flex-1 flex flex-col justify-center px-4 min-w-0 transition-all duration-300 ${
          isInvalid ? "blur-[0.3px] group-hover:blur-0" : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[7px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#070a12] border border-white/10 ${
              isInvalid ? "text-slate-500" : "text-yellow-300"
            }`}
          >
            ĐƠN #{order.id}
          </span>

          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold">
            <Clock size={9} />
            {order.time || "N/A"}
          </div>
        </div>

        <h4
          className={`text-[13px] font-black truncate uppercase tracking-tight transition-colors ${
            isCancelled
              ? "text-slate-500 line-through"
              : isUsed || isExpired
                ? "text-slate-400 group-hover:text-white"
                : "text-white group-hover:text-yellow-200"
          }`}
        >
          {order.movieTitle || "Vé Xem Phim"}
        </h4>

        <div className="flex items-center gap-3 mt-1.5 h-5">
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 shrink-0">
            <Calendar size={10} className="text-slate-600" />
            {order.date || "Hôm nay"}
          </div>

          {order.roomName && (
            <div className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-slate-500 shrink-0">
              <Tv size={10} className="text-slate-600" />
              {order.roomName}
            </div>
          )}

          {combos.length > 0 && (
            <div
              className={`flex items-center gap-1 text-[8px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded-md border ${
                isCancelled
                  ? "text-slate-600 border-slate-800 bg-[#101829]"
                  : "text-cyan-200 bg-cyan-300/10 border-cyan-300/20"
              }`}
            >
              <Coffee size={9} />
              <span>+{combos.length} Combo</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-5 flex flex-col justify-between py-3 opacity-25 pointer-events-none">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="w-1 h-1 rounded-full bg-[#020617] -mx-0.5" />
        ))}
      </div>

      <div
        className={`w-28 shrink-0 flex flex-col items-center justify-center border-l border-white/10 relative transition-all ${
          isCancelled
            ? "bg-[#0a0f1c]"
            : isUsed || isExpired
              ? "bg-[#0b1020]"
              : "bg-[#0b1020] group-hover:bg-[#111827]"
        }`}
      >
        <span className="text-[7px] font-black text-slate-600 uppercase mb-0.5 tracking-widest">
          Vị trí ghế
        </span>

        <div className="px-2 w-full text-center truncate">
          <p
            className={`text-[11px] font-black tracking-tight uppercase transition-colors ${
              isCancelled
                ? "text-slate-600 line-through"
                : isUsed || isExpired
                  ? "text-slate-500 group-hover:text-slate-300"
                  : "text-white group-hover:text-yellow-200"
            }`}
          >
            {seatNames || "Combo"}
          </p>
        </div>

        {!isCancelled && (
          <ChevronRight
            size={13}
            className={`transition-colors mt-1 ${
              isUsed || isExpired
                ? "text-slate-600 group-hover:text-slate-400"
                : "text-slate-600 group-hover:text-yellow-300"
            }`}
          />
        )}
      </div>
    </div>
  );
}