"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Save,
  Sparkles,
  Upload,
  ChevronDown,
  Check,
  Film,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon,
  Globe2,
} from "lucide-react";
import { apiSuperAdminRequest, BASE_URL } from "@/app/lib/api";
import toast from "react-hot-toast";

export const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = useMemo(() => {
    return options.find((option: any) => Number(option.id) === Number(value));
  }, [options, value]);

  return (
    <div className="space-y-2 relative text-left w-full" ref={dropdownRef}>
      <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.16em]">
        {label}
      </label>

      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#0d1222] border p-4 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-300 shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
          isOpen
            ? "border-cyan-300/45 bg-[#111827]"
            : "border-white/10 hover:border-cyan-300/25 hover:bg-[#111827]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <Icon
              size={15}
              className={
                value !== 0
                  ? "text-yellow-300 shrink-0"
                  : "text-slate-600 shrink-0"
              }
            />
          )}

          <span
            className={`text-xs font-bold truncate ${
              value !== 0 ? "text-white" : "text-slate-600"
            }`}
          >
            {selectedOption
              ? selectedOption.title || selectedOption.name
              : placeholder}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-500 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-cyan-300" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[220] top-[105%] left-0 right-0 bg-[#080c1b] border border-white/10 rounded-xl shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-52 overflow-y-auto custom-scrollbar">
          {options.map((option: any) => {
            const active = Number(value) === Number(option.id);

            return (
              <div
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-all duration-200 group ${
                  active
                    ? "bg-yellow-300/10"
                    : "hover:bg-[#111827] hover:text-cyan-200"
                }`}
              >
                <span
                  className={`text-xs font-bold truncate ${
                    active
                      ? "text-yellow-300"
                      : "text-slate-400 group-hover:text-cyan-200"
                  }`}
                >
                  {option.title || option.name}
                </span>

                {active && <Check size={14} className="text-yellow-300 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function PromotionModal({
  isOpen,
  mode,
  data,
  onClose,
  onRefresh,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    movieId: 0,
    cinemaItemId: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;

    setFieldErrors({});
    loadOptions();

    if (data) {
      setForm({
        title: data.title || "",
        content: data.content || "",
        movieId: data.movie?.id || 0,
        cinemaItemId: data.cinemaItem?.id || 0,
      });

      const thumbnail = data.thumbnail;
      setPreviewUrl(
        thumbnail?.startsWith("/") ? `${BASE_URL}${thumbnail}` : thumbnail || ""
      );
      setSelectedFile(null);
    } else {
      setForm({
        title: "",
        content: "",
        movieId: 0,
        cinemaItemId: 0,
      });

      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [isOpen, data]);

  const loadOptions = async () => {
    try {
      const [movieRes, cinemaRes] = await Promise.all([
        apiSuperAdminRequest("/api/v1/movies"),
        apiSuperAdminRequest("/api/v1/cinema-items"),
      ]);

      const movieJson = await movieRes.json();
      const cinemaJson = await cinemaRes.json();

      setMovies([
        {
          id: 0,
          title: "Tất cả phim",
        },
        ...(movieJson.data?.content || movieJson.data || []),
      ]);

      setCinemas([
        {
          id: 0,
          name: "Toàn hệ thống",
        },
        ...(cinemaJson.data || []),
      ]);
    } catch (error) {
      console.error("Lỗi tải tùy chọn", error);
      toast.error("Không thể tải dữ liệu phim hoặc rạp");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSave = async () => {
    setFieldErrors({});

    if (!form.title.trim()) {
      setFieldErrors({
        title: "Vui lòng nhập tên chương trình",
      });

      toast.error("Vui lòng nhập tên chương trình");
      return;
    }

    if (!form.content.trim()) {
      setFieldErrors({
        content: "Vui lòng nhập nội dung chương trình",
      });

      toast.error("Vui lòng nhập nội dung chương trình");
      return;
    }

    const loadingToast = toast.loading(
      isEdit ? "Đang cập nhật sự kiện..." : "Đang tạo sự kiện..."
    );

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("content", form.content.trim());

      if (form.movieId && form.movieId !== 0) {
        formData.append("movieId", form.movieId.toString());
      }

      if (form.cinemaItemId && form.cinemaItemId !== 0) {
        formData.append("cinemaItemId", form.cinemaItemId.toString());
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const url = isEdit
        ? `/api/v1/promotions/${data.id}`
        : "/api/v1/promotions";

      const res = await apiSuperAdminRequest(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errors = result?.data;

        if (errors && typeof errors === "object") {
          setFieldErrors(errors);

          const firstError = Object.values(errors)[0];

          toast.error(String(firstError), {
            id: loadingToast,
          });

          return;
        }

        toast.error(result?.message || "Có lỗi xảy ra", {
          id: loadingToast,
        });

        return;
      }

      toast.success(isEdit ? "Cập nhật thành công" : "Tạo sự kiện thành công", {
        id: loadingToast,
      });

      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Thao tác thất bại", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0b1020] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-160px] right-[-120px] w-96 h-96 bg-yellow-300/[0.04] blur-3xl rounded-full" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[-120px] w-96 h-96 bg-cyan-300/[0.035] blur-3xl rounded-full" />

        <div className="relative z-10 p-6 md:p-7 flex justify-between items-center border-b border-white/10 bg-[#0d1222] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-300/10 border border-yellow-300/25 rounded-2xl flex items-center justify-center text-yellow-300 shadow-[0_18px_45px_rgba(244,212,25,0.12)]">
              <Sparkles size={20} />
            </div>

            <div>
              <h2
                className="text-2xl font-black uppercase tracking-[-0.045em] text-white leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {isEdit ? "CẬP NHẬT SỰ KIỆN" : "TẠO SỰ KIỆN MỚI"}
              </h2>

              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
                Promotions Factory • KN Cinema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-7 space-y-6 custom-scrollbar">
          <div className="space-y-2.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] ml-1">
              Hình ảnh đại diện
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative aspect-[21/9] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex items-center justify-center bg-[#080c1b] shadow-inner ${
                previewUrl
                  ? "border-white/10 hover:border-cyan-300/35"
                  : "border-white/10 hover:border-yellow-300/35"
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Xem trước sự kiện"
                  />

                  <div className="absolute inset-0 bg-[#020617]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.24)]">
                      <Upload size={20} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center group-hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Upload
                      size={20}
                      className="text-slate-500 group-hover:text-yellow-300 transition-colors"
                    />
                  </div>

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.16em]">
                    Nhấn để tải lên ảnh
                  </p>

                  <p className="text-[9px] text-slate-700 font-bold mt-1">
                    Khuyến nghị tỷ lệ 21:9
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] ml-1">
                Tên chương trình
              </label>

              <input
                value={form.title}
                onChange={(event) => {
                  clearFieldError("title");
                  setForm({
                    ...form,
                    title: event.target.value,
                  });
                }}
                className={`w-full bg-[#0d1222] border p-4 rounded-xl outline-none transition-all duration-300 font-bold text-white text-xs placeholder:text-slate-600 shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                  fieldErrors.title
                    ? "border-rose-400/50 focus:border-rose-300"
                    : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                }`}
                placeholder="Nhập tên sự kiện..."
              />

              {fieldErrors.title && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] ml-1">
                Mô tả nội dung
              </label>

              <textarea
                value={form.content}
                onChange={(event) => {
                  clearFieldError("content");
                  setForm({
                    ...form,
                    content: event.target.value,
                  });
                }}
                rows={4}
                className={`w-full bg-[#0d1222] border p-4 rounded-xl outline-none transition-all duration-300 text-xs font-semibold text-slate-300 placeholder:text-slate-600 leading-relaxed resize-none shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                  fieldErrors.content
                    ? "border-rose-400/50 focus:border-rose-300"
                    : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                }`}
                placeholder="Viết nội dung chương trình khuyến mãi chi tiết..."
              />

              {fieldErrors.content && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {fieldErrors.content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <CustomSelect
                label="Phim áp dụng"
                options={movies}
                value={form.movieId}
                onChange={(movieId: any) =>
                  setForm({
                    ...form,
                    movieId,
                  })
                }
                placeholder="Tất cả phim"
                icon={Film}
              />

              <CustomSelect
                label="Cơ sở rạp"
                options={cinemas}
                value={form.cinemaItemId}
                onChange={(cinemaItemId: any) =>
                  setForm({
                    ...form,
                    cinemaItemId,
                  })
                }
                placeholder="Toàn hệ thống"
                icon={MapPin}
              />
            </div>

            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 flex items-start gap-3">
              <Globe2 size={15} className="text-cyan-300 shrink-0 mt-0.5" />

              <p className="text-[10px] text-cyan-100/85 leading-relaxed font-bold">
                Chọn “Tất cả phim” hoặc “Toàn hệ thống” nếu chương trình áp dụng
                rộng cho toàn bộ hệ thống KN Cinema.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-7 flex gap-4 bg-[#0d1222] border-t border-white/10 shrink-0 items-center">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 h-12 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.14em] transition-colors disabled:opacity-40"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-yellow-300 hover:bg-yellow-200 text-[#111827] h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.14em] flex justify-center items-center gap-2 shadow-[0_16px_36px_rgba(244,212,25,0.24)] transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Đang đồng bộ</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isEdit ? "Cập nhật ngay" : "Xác nhận tạo"}</span>
              </>
            )}
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