"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  Gift,
  Coins,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  FileText,
  Hash,
  Ticket,
  Sparkles,
  Save,
  AlertTriangle,
} from "lucide-react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import toast from "react-hot-toast";

export default function VoucherModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: any) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 1,
    startDate: "",
    endDate: "",
    promotionId: "",
    voucherType: "EVENT",
    costPoints: 0,
  });

  const toDateTimeLocal = (value: string) => {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);

    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});

    apiSuperAdminRequest("/api/v1/promotions")
      .then(async (response) => {
        if (response && response.ok) return response.json();

        return {
          data: [],
        };
      })
      .then((data) => {
        const raw = data?.data?.content || data?.data || [];

        setPromotions(Array.isArray(raw) ? raw : []);
      })
      .catch(() => console.error("Không thể tải danh sách sự kiện"));

    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate
          ? toDateTimeLocal(initialData.startDate)
          : "",
        endDate: initialData.endDate ? toDateTimeLocal(initialData.endDate) : "",
        promotionId:
          initialData.promotionId || initialData.promotion?.id || "",
        title: initialData.title || "",
        description: initialData.description || "",
        usageLimit: initialData.usageLimit ?? 1,
        costPoints: initialData.costPoints ?? 0,
        voucherType: initialData.voucherType || "EVENT",
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        discountValue: 0,
        minOrderAmount: 0,
        usageLimit: 1,
        startDate: "",
        endDate: "",
        promotionId: "",
        voucherType: "EVENT",
        costPoints: 0,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (event: any) => {
    const { name, value, type } = event.target;

    let finalValue: any = type === "number" ? Number(value) : value;

    if (name === "code") {
      finalValue = value.toUpperCase().replace(/\s+/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = {
          ...prev,
        };

        delete newErrors[name];

        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Mã voucher không được để trống";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề voucher không được để trống";
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    }

    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Đơn hàng tối thiểu không được âm";
    }

    if (formData.usageLimit <= 0) {
      newErrors.usageLimit = "Số lượng voucher phải lớn hơn 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.discountValue >= formData.minOrderAmount && formData.minOrderAmount > 0) {
      newErrors.discountValue = "Giá trị giảm phải nhỏ hơn đơn hàng tối thiểu";
    }

    if (formData.voucherType === "REDEEM" && formData.costPoints <= 0) {
      newErrors.costPoints = "Điểm đổi thưởng phải lớn hơn 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại dữ liệu voucher");
      return;
    }

    setErrors({});

    const payload = {
      ...formData,
      promotionId:
        formData.voucherType === "EVENT" && formData.promotionId
          ? Number(formData.promotionId)
          : null,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      usageLimit: Number(formData.usageLimit),
      costPoints:
        formData.voucherType === "EVENT" ? null : Number(formData.costPoints),
    };

    try {
      const res = await onSubmit(payload);

      if (!res) {
        toast.error("Không nhận được phản hồi từ Server.");
        return;
      }

      const contentType = res.headers?.get("content-type");

      let result: any = {};

      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      } else {
        await res.text();
        toast.error("Hệ thống phản hồi không đúng định dạng JSON.");
        return;
      }

      if (!res.ok) {
        const backendErrors = result?.data || result;

        if (backendErrors && typeof backendErrors === "object") {
          setErrors(backendErrors);
          return;
        }

        toast.error(result?.message || "Có lỗi xảy ra khi lưu voucher");
        return;
      }

      toast.success("Lưu voucher thành công");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi kết nối mạng");
    }
  };

  if (!isOpen) return null;

  const isRedeem = formData.voucherType === "REDEEM";
  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative bg-[#0b1020] border border-white/10 rounded-2xl w-full max-w-3xl shadow-[0_28px_80px_rgba(0,0,0,0.58)] flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 bg-yellow-300/[0.045] blur-3xl rounded-full" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 bg-cyan-300/[0.035] blur-3xl rounded-full" />

        <div className="relative z-10 flex items-center justify-between p-6 md:p-7 border-b border-white/10 bg-[#0d1222]">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${
                isRedeem
                  ? "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
                  : "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
              }`}
            >
              {isRedeem ? <Gift size={20} /> : <Ticket size={20} />}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Voucher Factory
                </span>
              </div>

              <h2
                className="text-2xl font-black text-white uppercase tracking-[-0.045em] leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {isEdit ? "CẬP NHẬT VOUCHER" : "THIẾT LẬP VOUCHER"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 p-6 md:p-7 overflow-y-auto flex-1 custom-scrollbar">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4 border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-[0.16em]">
                  <FileText size={12} />
                  Tiêu đề voucher
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề hiển thị..."
                  className={`w-full bg-[#0d1222] border p-3.5 rounded-xl text-white text-xs font-bold outline-none transition-all placeholder:text-slate-600 ${
                    errors.title
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                />

                {errors.title && <ErrorText message={errors.title} />}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">
                  Mô tả điều kiện
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả ngắn gọn..."
                  rows={3}
                  className="w-full bg-[#0d1222] border border-white/10 p-3.5 rounded-xl text-slate-300 text-xs font-semibold resize-none outline-none focus:border-yellow-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">
                  Mã code
                </label>

                <div className="relative">
                  <Hash
                    size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-300"
                  />

                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="VD: SALE2026"
                    className={`w-full bg-[#0d1222] border p-3.5 pl-10 rounded-xl text-white font-black text-xs uppercase outline-none transition-all placeholder:text-slate-600 ${
                      errors.code
                        ? "border-rose-400/50 focus:border-rose-300"
                        : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                    }`}
                  />
                </div>

                {errors.code && <ErrorText message={errors.code} />}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">
                  Hình thức
                </label>

                <select
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleChange}
                  className="w-full bg-[#0d1222] border border-white/10 p-3.5 rounded-xl text-white font-black text-xs outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all [color-scheme:dark]"
                >
                  <option value="EVENT">Voucher sự kiện</option>
                  <option value="REDEEM">Voucher đổi điểm</option>
                </select>
              </div>
            </section>

            {isRedeem ? (
              <section className="space-y-1.5">
                <label className="text-[9px] font-black text-yellow-300 uppercase flex items-center gap-1.5 tracking-[0.16em]">
                  <Coins size={12} />
                  Điểm đổi thưởng
                </label>

                <input
                  name="costPoints"
                  type="number"
                  value={formData.costPoints}
                  onChange={handleChange}
                  className={`w-full bg-[#0d1222] border p-3.5 rounded-xl text-yellow-300 font-black text-xs outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    errors.costPoints
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-yellow-300/25 focus:border-yellow-300/55"
                  }`}
                />

                {errors.costPoints && <ErrorText message={errors.costPoints} />}
              </section>
            ) : (
              <section className="space-y-1.5">
                <label className="text-[9px] font-black text-cyan-300 uppercase flex items-center gap-1.5 tracking-[0.16em]">
                  <Gift size={12} />
                  Sự kiện áp dụng
                </label>

                <select
                  name="promotionId"
                  value={formData.promotionId}
                  onChange={handleChange}
                  className="w-full bg-[#0d1222] border border-white/10 p-3.5 rounded-xl text-white font-bold text-xs outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all [color-scheme:dark]"
                >
                  <option value="">Chọn sự kiện...</option>

                  {promotions.map((promotion) => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.title}
                    </option>
                  ))}
                </select>
              </section>
            )}

            <section className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.16em]">
                <Tag size={12} />
                Giá trị & giới hạn
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FieldNumber
                  name="discountValue"
                  label="Giá trị giảm"
                  value={formData.discountValue}
                  onChange={handleChange}
                  error={errors.discountValue}
                  icon={<Percent size={12} />}
                />

                <FieldNumber
                  name="minOrderAmount"
                  label="Đơn tối thiểu"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  error={errors.minOrderAmount}
                  icon={<DollarSign size={12} />}
                />

                <FieldNumber
                  name="usageLimit"
                  label="Số lượng mã"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  error={errors.usageLimit}
                  icon={<Hash size={12} />}
                />
              </div>
            </section>

            <section className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.16em]">
                <Calendar size={12} />
                Thời gian chạy chương trình
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateInput
                  name="startDate"
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                />

                <DateInput
                  name="endDate"
                  label="Ngày kết thúc"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                />
              </div>
            </section>

            <div className="rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-4 flex items-start gap-3">
              <AlertTriangle
                size={15}
                className="text-yellow-300 shrink-0 mt-0.5"
              />

              <p className="text-[10px] text-yellow-100/85 leading-relaxed font-bold">
                Với voucher sự kiện, hệ thống sẽ gắn mã với chương trình ưu đãi
                đã chọn. Với voucher đổi điểm, người dùng cần đủ điểm để quy đổi.
              </p>
            </div>
          </form>
        </div>

        <div className="relative z-10 p-6 md:p-7 border-t border-white/10 bg-[#0d1222]">
          <button
            type="submit"
            form="voucher-form"
            disabled={isSubmitting}
            className="w-full h-12 bg-yellow-300 hover:bg-yellow-200 rounded-xl text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}

            {isSubmitting ? "Đang lưu cấu hình" : "Lưu cấu hình"}
          </button>
        </div>

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
        `}</style>
      </div>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <p className="text-[10px] text-rose-300 font-bold flex items-center gap-1.5">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

function FieldNumber({
  name,
  label,
  value,
  onChange,
  error,
  icon,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (event: any) => void;
  error?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] text-slate-500 font-bold">{label}</p>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
          {icon}
        </span>

        <input
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          className={`w-full bg-[#0d1222] border p-3.5 pl-10 rounded-xl text-white font-black text-xs outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            error
              ? "border-rose-400/50 focus:border-rose-300"
              : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
          }`}
        />
      </div>

      {error && <ErrorText message={error} />}
    </div>
  );
}

function DateInput({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (event: any) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] text-slate-500 font-bold">{label}</p>

      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#0d1222] border p-3.5 rounded-xl text-white text-xs font-bold outline-none transition-all [color-scheme:dark] ${
          error
            ? "border-rose-400/50 focus:border-rose-300"
            : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
        }`}
      />

      {error && <ErrorText message={error} />}
    </div>
  );
}