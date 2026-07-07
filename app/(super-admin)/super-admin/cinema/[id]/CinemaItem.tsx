"use client";

import { useEffect, useState } from "react";

import {
  X,
  Loader2,
  Save,
  PlusCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Clock3,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

import { apiSuperAdminRequest } from "@/app/lib/api";

import toast from "react-hot-toast";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinemaId: number;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddCinemaItemModal({
  isOpen,
  onClose,
  cinemaId,
  onSuccess,
  initialData,
}: AddModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "TP.HCM",
    hoursPerRoom: 1,
    cinemaId: cinemaId,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        city: "TP.HCM",
        hoursPerRoom: initialData.hoursPerRoom || 1,
        cinemaId: cinemaId,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "TP.HCM",
        hoursPerRoom: 1,
        cinemaId: cinemaId,
      });
    }

    setErrors({});
  }, [initialData, isOpen, cinemaId]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  const clearFieldError = (field: string) => {
    setErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên chi nhánh không được để trống";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên chi nhánh tối thiểu 3 ký tự";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống";
    }

    if (!formData.hoursPerRoom || formData.hoursPerRoom <= 0) {
      newErrors.hoursPerRoom = "Giờ hoạt động phải lớn hơn 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại dữ liệu");
      return;
    }

    let loadingToast: string | undefined;

    try {
      setIsSubmitting(true);

      loadingToast = toast.loading(
        isEdit ? "Đang cập nhật chi nhánh..." : "Đang tạo chi nhánh..."
      );

      const url = isEdit
        ? `/api/v1/cinema-items/${initialData.id}`
        : "/api/v1/cinema-items";

      const method = isEdit ? "PUT" : "POST";

      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: "TP.HCM",
          cinemaId,
        }),
      });

      const result = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(
          result?.message ||
            (isEdit ? "Cập nhật thành công" : "Tạo chi nhánh thành công"),
          {
            id: loadingToast,
          }
        );

        onSuccess();
        onClose();
        return;
      }

      if (result?.data && typeof result.data === "object") {
        setErrors(result.data);

        const firstError = Object.values(result.data)[0];

        toast.error(String(firstError), {
          id: loadingToast,
        });

        return;
      }

      toast.error(result?.message || result?.error || "Có lỗi xảy ra từ máy chủ", {
        id: loadingToast,
      });
    } catch (err) {
      toast.error("Không thể kết nối tới máy chủ", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent ${
            isEdit ? "via-cyan-300" : "via-yellow-300"
          } to-transparent`}
        />

        <div className="pointer-events-none absolute top-[-120px] right-[-90px] w-72 h-72 rounded-full bg-yellow-300/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-90px] w-72 h-72 rounded-full bg-cyan-300/[0.045] blur-3xl" />

        <div className="relative z-10 p-6 md:p-7">
          <div className="flex justify-between items-start gap-4 mb-7">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles
                  size={11}
                  className={isEdit ? "text-cyan-300" : "text-yellow-300"}
                />

                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {isEdit ? "Chỉnh sửa chi nhánh" : "Khởi tạo chi nhánh"}
                </span>
              </div>

              <h2
                className="text-2xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {isEdit ? "CẬP NHẬT" : "TẠO MỚI"}
              </h2>

              <p
                className={`text-[10px] font-black uppercase tracking-[0.16em] mt-2 ${
                  isEdit ? "text-cyan-300" : "text-yellow-300"
                }`}
              >
                Đơn vị cơ sở KN Cinema
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
              aria-label="Đóng form"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Tên chi nhánh
              </label>

              <div className="relative group">
                <Building2
                  size={14}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.name
                      ? "text-rose-300"
                      : "text-slate-600 group-focus-within:text-cyan-300"
                  }`}
                />

                <input
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-white placeholder:text-slate-600 transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                    errors.name
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                  placeholder="VD: KN Cinema Quận 1"
                  value={formData.name}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    clearFieldError("name");
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    });
                  }}
                />
              </div>

              {errors.name && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Địa chỉ chi tiết
              </label>

              <div className="relative group">
                <MapPin
                  size={14}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.address
                      ? "text-rose-300"
                      : "text-slate-600 group-focus-within:text-yellow-300"
                  }`}
                />

                <input
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-white placeholder:text-slate-600 transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                    errors.address
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                  }`}
                  placeholder="Số nhà, tên đường..."
                  value={formData.address}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    clearFieldError("address");
                    setFormData({
                      ...formData,
                      address: event.target.value,
                    });
                  }}
                />
              </div>

              {errors.address && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Thành phố
              </label>

              <input
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-400 outline-none cursor-not-allowed"
                value="TP.HCM"
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-[0.18em]">
                Giờ hoạt động
              </label>

              <div className="relative group">
                <Clock3
                  size={14}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.hoursPerRoom
                      ? "text-rose-300"
                      : "text-slate-600 group-focus-within:text-cyan-300"
                  }`}
                />

                <input
                  type="number"
                  min={1}
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-white transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    errors.hoursPerRoom
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                  value={formData.hoursPerRoom}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    clearFieldError("hoursPerRoom");
                    setFormData({
                      ...formData,
                      hoursPerRoom: Number(event.target.value),
                    });
                  }}
                />
              </div>

              {errors.hoursPerRoom && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {errors.hoursPerRoom}
                </p>
              )}
            </div>

            <div className="col-span-2 mt-1 rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-4 flex items-start gap-3">
              <ShieldAlert
                size={15}
                className="text-yellow-300 shrink-0 mt-0.5"
              />

              <p className="text-[10px] text-yellow-100/85 leading-relaxed font-bold">
                Không thể xoá chi nhánh nếu vẫn còn suất chiếu đang hoạt động
                trong hệ thống.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`col-span-2 mt-2 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed shadow-[0_16px_36px_rgba(244,212,25,0.22)] ${
                isEdit
                  ? "bg-cyan-300 hover:bg-cyan-200 text-[#111827]"
                  : "bg-yellow-300 hover:bg-yellow-200 text-[#111827]"
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isEdit ? (
                <Save size={15} />
              ) : (
                <PlusCircle size={15} />
              )}

              {isSubmitting
                ? "Đang xử lý"
                : isEdit
                  ? "Cập nhật dữ liệu"
                  : "Tạo chi nhánh"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}