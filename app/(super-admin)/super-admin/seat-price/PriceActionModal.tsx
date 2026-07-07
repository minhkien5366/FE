"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Armchair,
  Calendar,
  Banknote,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<any> | any;
  initialData?: any;
}

const DAYS = [
  { value: 2, label: "Thứ Hai", short: "T2" },
  { value: 3, label: "Thứ Ba", short: "T3" },
  { value: 4, label: "Thứ Tư", short: "T4" },
  { value: 5, label: "Thứ Năm", short: "T5" },
  { value: 6, label: "Thứ Sáu", short: "T6" },
  { value: 7, label: "Thứ Bảy", short: "T7" },
  { value: 8, label: "Chủ Nhật", short: "CN" },
];

const SEAT_TYPES = [
  {
    value: "NORMAL",
    label: "Ghế thường",
    note: "Standard",
  },
  {
    value: "VIP",
    label: "Ghế VIP",
    note: "Premium",
  },
  {
    value: "COUPLE",
    label: "Ghế đôi",
    note: "Couple",
  },
];

const formatMoney = (value: number) => {
  return Number(value || 0).toLocaleString("vi-VN");
};

export function PriceActionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModalProps) {
  const [formData, setFormData] = useState({
    seatType: "NORMAL",
    dayOfWeek: 2,
    price: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSubmitting(false);
      return;
    }

    if (initialData) {
      setFormData({
        seatType: initialData.seatType || "NORMAL",
        dayOfWeek: Number(initialData.dayOfWeek) || 2,
        price: Number(initialData.price) || 0,
      });
    } else {
      setFormData({
        seatType: "NORMAL",
        dayOfWeek: 2,
        price: 0,
      });
    }

    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.price <= 0) {
      setError("Giá vé phải lớn hơn 0 VNĐ");
      return;
    }

    if (formData.price > 2000000) {
      setError("Giá vé không được vượt quá 2.000.000 VNĐ");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await onSave(formData);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedDay = DAYS.find((day) => day.value === formData.dayOfWeek);
  const isEdit = !!initialData?.id;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 rounded-full bg-yellow-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 rounded-full bg-cyan-300/[0.035] blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
          aria-label="Đóng modal"
        >
          <X size={18} />
        </button>

        <header className="relative z-10 p-6 md:p-7 border-b border-white/10 bg-[#0d1222]">
          <div className="flex items-center gap-4 pr-12">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${
                isEdit
                  ? "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                  : "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
              }`}
            >
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles
                  size={11}
                  className={isEdit ? "text-cyan-300" : "text-yellow-300"}
                />

                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Seat Price Configuration
                </span>
              </div>

              <h2
                className="text-2xl md:text-3xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {isEdit ? "CẬP NHẬT GIÁ VÉ" : "THIẾT LẬP GIÁ VÉ"}
              </h2>

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mt-2">
                Cấu hình theo loại ghế và ngày trong tuần
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="p-6 md:p-7 space-y-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
            <section className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.18em] flex items-center gap-2 ml-1">
                <Armchair size={12} className="text-yellow-300" />
                Loại ghế áp dụng
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SEAT_TYPES.map((seatType) => {
                  const active = formData.seatType === seatType.value;

                  return (
                    <button
                      key={seatType.value}
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          seatType: seatType.value,
                        })
                      }
                      className={`rounded-2xl border p-4 text-left transition-all active:scale-[0.98] disabled:opacity-50 ${
                        active
                          ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_34px_rgba(244,212,25,0.2)]"
                          : "bg-[#0d1222] border-white/10 text-slate-500 hover:text-cyan-200 hover:border-cyan-300/35 hover:bg-[#111827]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Armchair size={15} />

                        {active && <CheckCircle2 size={15} />}
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.14em] mt-3">
                        {seatType.label}
                      </p>

                      <p
                        className={`text-[9px] font-bold mt-1 ${
                          active ? "text-[#111827]/65" : "text-slate-600"
                        }`}
                      >
                        {seatType.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.18em] flex items-center gap-2 ml-1">
                <Calendar size={12} className="text-cyan-300" />
                Ngày áp dụng
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const active = Number(formData.dayOfWeek) === day.value;
                  const weekend = day.value === 7 || day.value === 8;

                  return (
                    <button
                      key={day.value}
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          dayOfWeek: day.value,
                        })
                      }
                      className={`h-[58px] rounded-xl border transition-all active:scale-95 disabled:opacity-50 ${
                        active
                          ? "bg-cyan-300 text-[#111827] border-cyan-200 shadow-[0_16px_34px_rgba(103,232,249,0.16)]"
                          : weekend
                            ? "bg-yellow-300/10 border-yellow-300/25 text-yellow-300 hover:bg-yellow-300/15"
                            : "bg-[#0d1222] border-white/10 text-slate-500 hover:text-cyan-200 hover:border-cyan-300/35 hover:bg-[#111827]"
                      }`}
                    >
                      <span className="block text-xs font-black leading-none">
                        {day.short}
                      </span>

                      <span className="block text-[8px] font-black uppercase tracking-[0.08em] mt-1 opacity-70">
                        {day.label.replace("Thứ ", "Thứ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2.5">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.18em] flex items-center gap-2 ml-1">
                <Banknote size={13} className="text-yellow-300" />
                Giá vé áp dụng
              </label>

              <div className="relative group">
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setFormData({
                      ...formData,
                      price: value,
                    });

                    if (value > 0) setError(null);
                  }}
                  className={`w-full bg-[#0d1222] border rounded-2xl px-5 py-5 pr-20 text-3xl font-black font-mono outline-none transition-all placeholder:text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    error
                      ? "border-rose-400/60 text-rose-200 animate-shake"
                      : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827] text-white"
                  }`}
                  placeholder="0"
                  onFocus={(event) => event.target.select()}
                  disabled={submitting}
                />

                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-yellow-300 uppercase tracking-[0.16em]">
                  VND
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-[10px] text-slate-600 font-bold ml-1">
                  Hiển thị:{" "}
                  <span className="text-yellow-300 font-black">
                    {formatMoney(formData.price)}đ
                  </span>
                </p>

                <p className="text-[10px] text-slate-600 font-bold ml-1">
                  {selectedDay?.label || "Chưa chọn ngày"} • {formData.seatType}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-300 text-[10px] font-bold mt-2 animate-in slide-in-from-top-1">
                  <ShieldAlert size={14} />
                  {error}
                </div>
              )}
            </section>

            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 flex items-start gap-3">
              <ChevronDown
                size={15}
                className="text-cyan-300 shrink-0 mt-0.5 rotate-[-90deg]"
              />

              <p className="text-[10px] text-cyan-100/85 leading-relaxed font-bold">
                Giá vé được áp dụng theo loại ghế và ngày trong tuần. Mỗi loại ghế
                nên có đủ cấu hình cho 7 ngày để hệ thống tính tiền chính xác.
              </p>
            </div>
          </div>

          <footer className="p-6 md:p-7 border-t border-white/10 bg-[#0d1222] flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 h-12 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.14em] transition-colors disabled:opacity-40"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || formData.price <= 0}
              className="flex-1 h-12 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:bg-[#111827] disabled:text-slate-600 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}

              {submitting
                ? "Đang xử lý"
                : isEdit
                  ? "Cập nhật cấu hình"
                  : "Áp dụng giá vé"}
            </button>
          </footer>
        </form>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #0b1020;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 999px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #334155;
          }

          .animate-shake {
            animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          }

          @keyframes shake {
            10%,
            90% {
              transform: translate3d(-1px, 0, 0);
            }

            20%,
            80% {
              transform: translate3d(2px, 0, 0);
            }

            30%,
            50%,
            70% {
              transform: translate3d(-3px, 0, 0);
            }

            40%,
            60% {
              transform: translate3d(3px, 0, 0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}