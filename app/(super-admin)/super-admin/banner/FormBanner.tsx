"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Save,
  Plus,
  Pencil,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { BASE_URL } from "@/app/lib/api";
import toast from "react-hot-toast";

interface FormProps {
  dangSua: boolean;
  idHienTai: number | null;
  duLieu: any;
  setDuLieu: (data: any) => void;
  onLuu: (formData: FormData) => Promise<any>;
  onDong: () => void;
}

export default function FormBanner({
  dangSua,
  idHienTai,
  duLieu,
  setDuLieu,
  onLuu,
  onDong,
}: FormProps) {
  const [anhXemTruoc, setAnhXemTruoc] = useState<string | null>(null);
  const [fileAnh, setFileAnh] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (duLieu.imageUrl) {
      if (
        duLieu.imageUrl.startsWith("http") ||
        duLieu.imageUrl.startsWith("blob:")
      ) {
        setAnhXemTruoc(duLieu.imageUrl);
      } else {
        const cleanPath = duLieu.imageUrl.startsWith("/")
          ? duLieu.imageUrl.slice(1)
          : duLieu.imageUrl;

        setAnhXemTruoc(`${BASE_URL}/uploads/banners/${cleanPath}`);
      }
    } else {
      setAnhXemTruoc(null);
    }

    setFileAnh(null);
    setFieldErrors({});
  }, [duLieu.imageUrl]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const thayDoiFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    setFileAnh(file);
    setAnhXemTruoc(URL.createObjectURL(file));
  };

  const guiForm = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors: any = {};

    if (!duLieu.title?.trim() || duLieu.title.trim().length < 5) {
      errors.title = "Tiêu đề phải từ 5 ký tự trở lên";
    }

    if (!duLieu.linkUrl?.trim()) {
      errors.linkUrl = "Link điều hướng không được để trống";
    }

    if (!dangSua && !fileAnh) {
      errors.image = "Vui lòng tải ảnh banner";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0] as string);
      return;
    }

    const data = new FormData();

    data.append(
      "banner",
      new Blob(
        [
          JSON.stringify({
            title: duLieu.title.trim(),
            linkUrl: duLieu.linkUrl.trim(),
            status: duLieu.status || "ACTIVE",
          }),
        ],
        {
          type: "application/json",
        }
      )
    );

    if (fileAnh) {
      data.append("file", fileAnh);
    }

    try {
      setLoading(true);
      await onLuu(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={loading ? undefined : onDong}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 rounded-full bg-yellow-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 rounded-full bg-cyan-300/[0.035] blur-3xl" />

        <button
          type="button"
          onClick={onDong}
          disabled={loading}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
          aria-label="Đóng form"
        >
          <X size={18} />
        </button>

        <form onSubmit={guiForm} className="relative z-10" noValidate>
          <header className="p-6 md:p-7 border-b border-white/10 bg-[#0d1222]">
            <div className="flex items-center gap-4 pr-12">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${
                  dangSua
                    ? "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                    : "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
                }`}
              >
                {dangSua ? <Pencil size={20} /> : <Plus size={20} />}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles
                    size={11}
                    className={dangSua ? "text-cyan-300" : "text-yellow-300"}
                  />

                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Banner Campaign Factory
                  </span>
                </div>

                <h2
                  className="text-2xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  {dangSua ? `CẬP NHẬT BANNER #${idHienTai}` : "TẠO BANNER MỚI"}
                </h2>

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mt-2">
                  Media Component • Super Admin Interface
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-7 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] flex items-center justify-between ml-1">
                Hình ảnh banner

                <span className="text-slate-700">1920x800 • Max 2MB</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative group aspect-video rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col items-center justify-center bg-[#080c1b] shadow-inner ${
                  fieldErrors.image
                    ? "border-rose-400/50"
                    : anhXemTruoc
                      ? "border-white/10 hover:border-cyan-300/35"
                      : "border-dashed border-white/10 hover:border-yellow-300/40"
                }`}
              >
                {anhXemTruoc ? (
                  <>
                    <img
                      src={anhXemTruoc}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Preview banner"
                    />

                    <div className="absolute inset-0 bg-[#020617]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.24)]">
                        <Upload size={20} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center group-hover:scale-[1.02] transition-all duration-300">
                    <div className="w-14 h-14 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ImageIcon
                        size={24}
                        className="text-slate-500 group-hover:text-yellow-300 transition-colors"
                      />
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Click hoặc kéo thả ảnh vào đây
                    </p>

                    <p className="text-[9px] text-slate-700 font-bold mt-1">
                      JPG, PNG hoặc WEBP
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={thayDoiFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {fieldErrors.image && (
                <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                  <AlertTriangle size={11} />
                  {fieldErrors.image}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 ml-1">
                  Tiêu đề banner
                </label>

                <input
                  type="text"
                  value={duLieu.title || ""}
                  onChange={(event) => {
                    clearFieldError("title");
                    setDuLieu({
                      ...duLieu,
                      title: event.target.value,
                    });
                  }}
                  placeholder="Nhập tiêu đề banner..."
                  className={`w-full bg-[#0d1222] border rounded-xl py-3.5 px-4 text-xs text-white font-bold outline-none transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] placeholder:text-slate-600 ${
                    fieldErrors.title
                      ? "border-rose-400/50 focus:border-rose-300"
                      : "border-white/10 focus:border-cyan-300/45 focus:bg-[#111827]"
                  }`}
                />

                {fieldErrors.title && (
                  <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                    <AlertTriangle size={11} />
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 ml-1">
                  Đường dẫn điều hướng
                </label>

                <div className="relative group">
                  <LinkIcon
                    size={14}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      fieldErrors.linkUrl
                        ? "text-rose-300"
                        : "text-slate-600 group-focus-within:text-yellow-300"
                    }`}
                  />

                  <input
                    type="text"
                    value={duLieu.linkUrl || ""}
                    onChange={(event) => {
                      clearFieldError("linkUrl");
                      setDuLieu({
                        ...duLieu,
                        linkUrl: event.target.value,
                      });
                    }}
                    placeholder="VD: /movies hoặc https://..."
                    className={`w-full bg-[#0d1222] border rounded-xl py-3.5 pl-11 pr-4 text-xs text-white font-bold outline-none transition-all shadow-[0_12px_28px_rgba(0,0,0,0.18)] placeholder:text-slate-600 ${
                      fieldErrors.linkUrl
                        ? "border-rose-400/50 focus:border-rose-300"
                        : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                    }`}
                  />
                </div>

                {fieldErrors.linkUrl && (
                  <p className="text-rose-300 text-[10px] font-bold flex items-center gap-1.5 ml-1">
                    <AlertTriangle size={11} />
                    {fieldErrors.linkUrl}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 ml-1">
                  Trạng thái hiển thị
                </label>

                <select
                  value={duLieu.status || "ACTIVE"}
                  onChange={(event) =>
                    setDuLieu({
                      ...duLieu,
                      status: event.target.value,
                    })
                  }
                  className="w-full bg-[#0d1222] border border-white/10 rounded-xl py-3.5 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white outline-none focus:border-cyan-300/45 focus:bg-[#111827] cursor-pointer transition-all [color-scheme:dark]"
                >
                  <option value="ACTIVE">Trạng thái: Hoạt động</option>
                  <option value="INACTIVE">Trạng thái: Không hoạt động</option>
                  <option value="PENDING">Trạng thái: Chờ duyệt</option>
                </select>
              </div>

              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 flex items-start gap-3">
                <CheckCircle2
                  size={15}
                  className="text-emerald-300 shrink-0 mt-0.5"
                />

                <p className="text-[10px] text-emerald-100/85 leading-relaxed font-bold">
                  Banner hoạt động sẽ xuất hiện ở khu vực truyền thông chính của
                  giao diện người dùng KN Cinema.
                </p>
              </div>
            </div>
          </div>

          <footer className="p-6 md:p-7 border-t border-white/10 bg-[#0d1222] flex gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={onDong}
              className="px-6 h-12 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.14em] transition-colors disabled:opacity-40"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}

              {loading
                ? "Đang xử lý"
                : dangSua
                  ? "Lưu thay đổi"
                  : "Kích hoạt banner"}
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