"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Armchair,
  Monitor,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface PropsForm {
  dangSuaId: number | null;
  duLieuForm: { name: string; totalSeats: number };
  setDuLieuForm: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDong: () => void;

  errors?: {
    name?: string;
    totalSeats?: string;
    message?: string;
  };

  loading?: boolean;
}

export default function FormPhongChieu({
  dangSuaId,
  duLieuForm,
  setDuLieuForm,
  onSubmit,
  onDong,
  errors,
  loading = false,
}: PropsForm) {
  const [localError, setLocalError] = useState<any>({});

  const getError = (field: string) => {
    return errors?.[field as keyof typeof errors] || localError[field];
  };

  const handleChange = (field: string, value: any) => {
    setDuLieuForm({ ...duLieuForm, [field]: value });

    setLocalError((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    const nextError: any = {};

    if (!String(duLieuForm.name || "").trim()) {
      nextError.name = "Vui lòng nhập tên phòng chiếu";
    }

    if (!duLieuForm.totalSeats || Number(duLieuForm.totalSeats) <= 0) {
      nextError.totalSeats = "Sức chứa phải lớn hơn 0";
    }

    if (Object.keys(nextError).length > 0) {
      e.preventDefault();
      setLocalError(nextError);
      return;
    }

    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onDong}
      />

      <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

        <div className="pointer-events-none absolute top-[-120px] right-[-90px] w-72 h-72 rounded-full bg-yellow-300/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-90px] w-72 h-72 rounded-full bg-cyan-300/[0.045] blur-3xl" />

        <div className="relative z-10 p-6 md:p-7">
          <div className="flex justify-between items-start gap-4 mb-7">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Hệ thống phòng
                </span>
              </div>

              <h2
                className="text-2xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {dangSuaId ? "CẬP NHẬT" : "THÊM MỚI"}
              </h2>

              <p className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.16em] mt-2">
                Phòng chiếu KN Cinema
              </p>
            </div>

            <button
              type="button"
              onClick={onDong}
              className="w-9 h-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95"
              aria-label="Đóng form"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Định danh phòng
              </label>

              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    getError("name")
                      ? "text-rose-300"
                      : "text-slate-600 group-focus-within:text-cyan-300"
                  }`}
                >
                  <Monitor size={14} />
                </div>

                <input
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-white placeholder:text-slate-600 transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                    getError("name")
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                  value={duLieuForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Phòng chiếu 01..."
                  disabled={loading}
                />
              </div>

              {getError("name") && (
                <p className="text-[10px] text-rose-300 font-bold ml-1 flex items-center gap-1.5">
                  <AlertTriangle size={11} />
                  {getError("name")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Sức chứa ghế
              </label>

              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    getError("totalSeats")
                      ? "text-rose-300"
                      : "text-slate-600 group-focus-within:text-yellow-300"
                  }`}
                >
                  <Armchair size={14} />
                </div>

                <input
                  type="number"
                  min={0}
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-white placeholder:text-slate-600 transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    getError("totalSeats")
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                  }`}
                  value={duLieuForm.totalSeats}
                  onChange={(e) =>
                    handleChange("totalSeats", parseInt(e.target.value) || 0)
                  }
                  placeholder="VD: 120"
                  disabled={loading}
                />
              </div>

              {getError("totalSeats") && (
                <p className="text-[10px] text-rose-300 font-bold ml-1 flex items-center gap-1.5">
                  <AlertTriangle size={11} />
                  {getError("totalSeats")}
                </p>
              )}
            </div>

            {errors?.message && (
              <div className="bg-rose-500/10 border border-rose-400/25 rounded-xl p-3.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-rose-300 shrink-0 mt-0.5"
                  />

                  <p className="text-[10px] text-rose-200 font-bold leading-relaxed">
                    {errors.message}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#111827] border border-white/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Trạng thái
                </span>

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-300">
                  {dangSuaId ? "Đang chỉnh sửa" : "Tạo phòng mới"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black uppercase text-[10px] tracking-[0.16em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)]"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang xử lý
                </>
              ) : (
                <>
                  Lưu dữ liệu
                  <Check size={14} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}