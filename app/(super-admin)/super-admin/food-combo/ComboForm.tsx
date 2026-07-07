"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Save,
  UploadCloud,
  Loader2,
  Package,
  CircleDollarSign,
  Info,
  Sparkles,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { BASE_URL } from "@/app/lib/api";

interface ComboFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<any>;
  onClose: () => void;
  isSubmitting: boolean;
}

const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return null;

  if (
    imageUrl.startsWith("http") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${BASE_URL}${imageUrl}`;
  }

  return `${BASE_URL}/uploads/combos/${imageUrl}`;
};

export default function ComboForm({
  initialData,
  onSubmit,
  onClose,
  isSubmitting,
}: ComboFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(
    getImageUrl(initialData?.imageUrl)
  );

  const [fieldErrors, setFieldErrors] = useState<any>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateLocal = () => {
    const errors: any = {};

    if (!formData.name.trim()) {
      errors.name = "Tên combo không được để trống";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Tên combo tối thiểu 3 ký tự";
    }

    if (!formData.description.trim()) {
      errors.description = "Mô tả combo không được để trống";
    }

    if (!Number(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Giá bán phải lớn hơn 0";
    }

    if (Number(formData.price) > 2000000) {
      errors.price = "Giá bán không được vượt quá 2.000.000đ";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setFieldErrors({});

    if (!validateLocal()) {
      toast.error("Vui lòng kiểm tra lại dữ liệu combo");
      return;
    }

    const data = new FormData();

    data.append(
      "combo",
      new Blob(
        [
          JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
          }),
        ],
        {
          type: "application/json",
        }
      )
    );

    if (imageFile) {
      data.append("file", imageFile);
    }

    try {
      const res = await onSubmit(data);

      if (res && !res.ok) {
        const result = await res.json();

        const errors = result?.data;

        if (errors && typeof errors === "object") {
          setFieldErrors(errors);
          return;
        }

        toast.error(result?.message || "Dữ liệu combo không hợp lệ");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 rounded-full bg-yellow-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 rounded-full bg-cyan-300/[0.035] blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
          aria-label="Đóng form"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="relative z-10" noValidate>
          <header className="p-6 md:p-7 border-b border-white/10 bg-[#0d1222]">
            <div className="flex items-center gap-4 pr-12">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${
                  initialData
                    ? "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                    : "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
                }`}
              >
                <Package size={21} />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles
                    size={11}
                    className={initialData ? "text-cyan-300" : "text-yellow-300"}
                  />

                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Combo Menu Factory
                  </span>
                </div>

                <h2
                  className="text-2xl md:text-3xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  {initialData ? "CHỈNH SỬA" : "THÊM MỚI"}{" "}
                  <span className="text-yellow-300">COMBO</span>
                </h2>

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mt-2">
                  Cập nhật thực đơn bắp nước KN Cinema
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-7 space-y-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
            <section className="rounded-2xl bg-[#080c1b] border border-white/10 p-4 flex flex-col sm:flex-row items-center gap-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative group w-full sm:w-36 aspect-square rounded-2xl border overflow-hidden bg-[#0d1222] flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-inner ${
                  preview
                    ? "border-white/10 hover:border-cyan-300/35"
                    : "border-dashed border-white/10 hover:border-yellow-300/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="preview"
                    />

                    <div className="absolute inset-0 bg-[#020617]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="w-11 h-11 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.24)]">
                        <UploadCloud size={20} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      className="mx-auto text-slate-600 group-hover:text-yellow-300 transition-colors mb-2"
                      size={28}
                    />

                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">
                      Tải ảnh
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <h4 className="font-black text-sm text-white uppercase tracking-[0.08em]">
                  Ảnh minh họa combo
                </h4>

                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-2">
                  Hỗ trợ PNG, JPG hoặc WEBP. Kích thước tối đa 2MB. Ảnh đẹp sẽ
                  giúp combo nổi bật hơn trên giao diện người dùng.
                </p>

                <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-cyan-300 shrink-0 mt-0.5"
                  />

                  <p className="text-[10px] text-cyan-100/85 font-bold leading-relaxed">
                    Có thể giữ ảnh cũ khi chỉnh sửa nếu không chọn ảnh mới.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.16em] flex items-center gap-1.5 ml-1">
                  <Package size={12} className="text-yellow-300" />
                  Tên combo
                </label>

                <input
                  value={formData.name}
                  onChange={(event) => {
                    clearFieldError("name");
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    });
                  }}
                  className={`w-full bg-[#0d1222] border rounded-xl p-4 text-xs font-bold outline-none transition-all text-white placeholder:text-slate-600 shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                    fieldErrors.name
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                  placeholder="Ví dụ: Combo Bắp Nước"
                  disabled={isSubmitting}
                />

                {fieldErrors.name && <ErrorText message={fieldErrors.name} />}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.16em] flex items-center gap-1.5 ml-1">
                  <CircleDollarSign size={12} className="text-cyan-300" />
                  Giá bán
                </label>

                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(event) => {
                      clearFieldError("price");
                      setFormData({
                        ...formData,
                        price: event.target.value,
                      });
                    }}
                    className={`w-full bg-[#0d1222] border rounded-xl p-4 pr-14 text-xs font-black outline-none transition-all text-white placeholder:text-slate-600 shadow-[0_12px_28px_rgba(0,0,0,0.18)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      fieldErrors.price
                        ? "border-rose-400/50 focus:border-rose-300"
                        : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                    }`}
                    placeholder="0"
                    disabled={isSubmitting}
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-yellow-300 uppercase tracking-[0.12em]">
                    VND
                  </span>
                </div>

                {fieldErrors.price && <ErrorText message={fieldErrors.price} />}
              </div>
            </section>

            <section className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.16em] flex items-center gap-1.5 ml-1">
                <Info size={12} className="text-yellow-300" />
                Mô tả sản phẩm
              </label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) => {
                  clearFieldError("description");
                  setFormData({
                    ...formData,
                    description: event.target.value,
                  });
                }}
                className={`w-full bg-[#0d1222] border rounded-xl p-4 text-xs font-semibold outline-none transition-all resize-none text-slate-300 placeholder:text-slate-600 leading-relaxed shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                  fieldErrors.description
                    ? "border-rose-400/50 focus:border-rose-300"
                    : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                }`}
                placeholder="Chi tiết combo gồm những gì..."
                disabled={isSubmitting}
              />

              {fieldErrors.description && (
                <ErrorText message={fieldErrors.description} />
              )}
            </section>

            <div className="rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-4 flex items-start gap-3">
              <AlertTriangle
                size={15}
                className="text-yellow-300 shrink-0 mt-0.5"
              />

              <p className="text-[10px] text-yellow-100/85 leading-relaxed font-bold">
                Giá combo sẽ được hiển thị trực tiếp cho khách hàng khi đặt vé.
                Hãy kiểm tra kỹ tên, mô tả và giá bán trước khi lưu.
              </p>
            </div>
          </div>

          <footer className="p-6 md:p-7 border-t border-white/10 bg-[#0d1222] flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 h-12 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.14em] transition-colors disabled:opacity-40"
            >
              Hủy bỏ
            </button>

            <button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 h-12 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Save size={15} />
              )}

              {isSubmitting ? "Đang xử lý" : "Lưu thực đơn"}
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
        `}</style>
      </div>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
      <AlertTriangle size={11} />
      {message}
    </p>
  );
}