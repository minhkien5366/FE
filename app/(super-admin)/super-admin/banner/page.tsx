"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Edit3,
  Link as LinkIcon,
  CheckCircle2,
  Eye,
  MonitorPlay,
} from "lucide-react";
import { apiSuperAdminRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import FormBanner from "./FormBanner";

const adminToast: any = {
  duration: 3400,
  style: {
    background: "#0b1020",
    color: "#f8fafc",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderRadius: "16px",
  },
  success: {
    iconTheme: {
      primary: "#f4d419",
      secondary: "#111827",
    },
    style: {
      border: "1px solid rgba(244,212,25,0.45)",
    },
  },
  error: {
    iconTheme: {
      primary: "#fb7185",
      secondary: "#111827",
    },
    style: {
      border: "1px solid rgba(244,63,94,0.5)",
    },
  },
};

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [dangSua, setDangSua] = useState(false);
  const [idHienTai, setIdHienTai] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerCanXoa, setBannerCanXoa] = useState<any>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const emptyForm = {
    title: "",
    linkUrl: "",
    imageUrl: "",
    status: "ACTIVE",
  };

  const [duLieuForm, setDuLieuForm] = useState(emptyForm);

  const xuLyAnhBanner = (path: string | null | undefined) => {
    if (!path) {
      return "https://placehold.co/1920x800/0b1020/f4d419?text=KN+Cinema+Banner";
    }

    if (path.startsWith("http") || path.startsWith("blob:")) return path;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    return `${BASE_URL}/uploads/banners/${cleanPath}`;
  };

  const fetchBanners = async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/banners");

      if (!res.ok) throw new Error();

      const json = await res.json();
      setBanners(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error("Lỗi tải danh sách banner", adminToast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleLuu = async (formData: FormData) => {
    const method = dangSua ? "PUT" : "POST";
    const url = dangSua ? `/api/v1/banners/${idHienTai}` : "/api/v1/banners";

    const toastId = toast.loading("Đang xử lý banner...", adminToast);

    try {
      const res = await apiSuperAdminRequest(url, {
        method,
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || data?.error || "Dữ liệu không hợp lệ";

        toast.error(msg, {
          id: toastId,
          ...adminToast,
        });

        return;
      }

      toast.success(dangSua ? "Đã cập nhật banner" : "Đã tạo banner mới", {
        id: toastId,
        ...adminToast,
      });

      setShowForm(false);
      setDangSua(false);
      setIdHienTai(null);
      setDuLieuForm(emptyForm);

      fetchBanners();
    } catch (err: any) {
      toast.error("Lỗi kết nối server", {
        id: toastId,
        ...adminToast,
      });
    }
  };

  const yeuCauXoa = (banner: any) => {
    setBannerCanXoa(banner);
    setIsDeleteModalOpen(true);
  };

  const handleXacNhanXoa = async () => {
    if (!bannerCanXoa?.id) return;

    setDangXoa(true);

    const toastId = toast.loading("Đang tiến hành xóa...", adminToast);

    try {
      const res = await apiSuperAdminRequest(`/api/v1/banners/${bannerCanXoa.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Đã gỡ bỏ banner thành công", {
        id: toastId,
        ...adminToast,
      });

      setBanners((prev) => prev.filter((banner) => banner.id !== bannerCanXoa.id));
      setIsDeleteModalOpen(false);
      setBannerCanXoa(null);
    } catch {
      toast.error("Xóa banner thất bại", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setDangXoa(false);
    }
  };

  const handleEdit = (banner: any) => {
    setDangSua(true);
    setIdHienTai(banner.id);

    setDuLieuForm({
      title: banner.title || "",
      linkUrl: banner.linkUrl || "",
      imageUrl: banner.imageUrl || "",
      status: banner.status || "ACTIVE",
    });

    setShowForm(true);
  };

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      String(banner.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [banners, searchTerm]);

  const activeCount = useMemo(() => {
    return banners.filter((banner) => banner.status === "ACTIVE").length;
  }, [banners]);

  const inactiveCount = useMemo(() => {
    return banners.filter((banner) => banner.status !== "ACTIVE").length;
  }, [banners]);

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      {showForm && (
        <FormBanner
          dangSua={dangSua}
          idHienTai={idHienTai}
          duLieu={duLieuForm}
          setDuLieu={setDuLieuForm}
          onLuu={handleLuu}
          onDong={() => setShowForm(false)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <MonitorPlay size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Media Component Registry
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                QUẢN LÝ <span className="text-yellow-300">BANNERS</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Quản lý media truyền thông chính của hệ thống KN Cinema
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96 group">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
              />

              <input
                placeholder="Tìm kiếm tiêu đề banner..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
              />
            </div>

            <button
              onClick={fetchBanners}
              disabled={loading}
              className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-yellow-300" : ""}
              />
              Đồng bộ
            </button>

            <button
              onClick={() => {
                setDangSua(false);
                setIdHienTai(null);
                setDuLieuForm(emptyForm);
                setShowForm(true);
              }}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Thêm mới
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<ImageIcon size={18} />}
            title="Tổng banner"
            value={`${banners.length.toLocaleString("vi-VN")} mục`}
            theme="yellow"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Đang hoạt động"
            value={`${activeCount.toLocaleString("vi-VN")} mục`}
            theme="cyan"
          />

          <SummaryCard
            icon={<Eye size={18} />}
            title="Đang hiển thị"
            value={`${filteredBanners.length.toLocaleString("vi-VN")} mục`}
            theme="emerald"
          />

          <SummaryCard
            icon={<AlertTriangle size={18} />}
            title="Không hoạt động"
            value={`${inactiveCount.toLocaleString("vi-VN")} mục`}
            theme="amber"
          />
        </section>

        <main>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-36 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={30} />
              </div>

              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.22em] animate-pulse">
                Đang nạp dữ liệu media
              </p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
              <ImageIcon size={42} className="text-slate-600 mb-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Hệ thống chưa ghi nhận dữ liệu banner phù hợp
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {filteredBanners.map((banner) => {
                const active = banner.status === "ACTIVE";

                return (
                  <div
                    key={banner.id}
                    className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl p-4 hover:border-cyan-300/35 transition-all duration-300 flex flex-col overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1"
                  >
                    <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-[#080c1b] border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
                      <img
                        src={xuLyAnhBanner(banner.imageUrl)}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        alt={banner.title}
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://placehold.co/1920x800/0b1020/f4d419?text=KN+Cinema+Banner";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#080c1b]/90 rounded-lg border border-white/10">
                        <span className="text-[9px] font-black text-yellow-300 tracking-[0.12em]">
                          ID-{banner.id}
                        </span>
                      </div>

                      <div
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.12em] ${
                          active
                            ? "bg-emerald-300/10 border-emerald-300/25 text-emerald-300"
                            : "bg-slate-500/10 border-slate-500/25 text-slate-400"
                        }`}
                      >
                        {active ? "Active" : banner.status || "Inactive"}
                      </div>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="font-black uppercase text-white text-sm mb-2 truncate group-hover:text-yellow-200 transition-colors tracking-[0.04em]">
                        {banner.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 font-semibold mb-5 truncate flex items-center gap-1.5">
                        <LinkIcon size={11} className="text-cyan-300 shrink-0" />
                        {banner.linkUrl || "Không có đường dẫn liên kết"}
                      </p>

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="flex-1 h-10 bg-[#080c1b] border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-yellow-300/35 hover:text-yellow-300 transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Edit3 size={13} />
                          Chỉnh sửa
                        </button>

                        <button
                          onClick={() => yeuCauXoa(banner)}
                          className="w-10 h-10 bg-[#080c1b] border border-white/10 rounded-xl text-slate-500 hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-300 transition active:scale-95 flex items-center justify-center"
                          aria-label="Xóa banner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {isDeleteModalOpen && bannerCanXoa && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => !dangXoa && setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-[#0b1020] border border-white/10 w-full max-w-[390px] rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden p-7 text-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

            <button
              disabled={dangXoa}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all disabled:opacity-40"
              aria-label="Đóng modal"
            >
              <X size={15} />
            </button>

            <div className="relative z-10 space-y-5">
              <div className="mx-auto w-14 h-14 bg-rose-500/10 border border-rose-400/25 rounded-2xl flex items-center justify-center text-rose-300">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h2
                  className="text-2xl font-black uppercase text-white tracking-[-0.04em]"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  }}
                >
                  Xóa banner?
                </h2>

                <p className="text-[11px] text-slate-500 font-semibold px-2 leading-relaxed mt-2">
                  Hành động này sẽ xóa vĩnh viễn banner{" "}
                  <span className="text-yellow-300 font-black">
                    “{bannerCanXoa.title}”
                  </span>{" "}
                  khỏi hệ thống hiển thị.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  disabled={dangXoa}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="h-11 bg-[#111827] border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/[0.08] transition disabled:opacity-40 active:scale-95"
                >
                  Hủy bỏ
                </button>

                <button
                  disabled={dangXoa}
                  onClick={handleXacNhanXoa}
                  className="h-11 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-400 transition disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 shadow-[0_16px_36px_rgba(244,63,94,0.22)]"
                >
                  {dangXoa ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {dangXoa ? "Đang xóa" : "Đồng ý xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  );
}

function SummaryCard({
  icon,
  title,
  value,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  theme: "yellow" | "cyan" | "emerald" | "amber";
}) {
  const themeMap = {
    yellow: {
      border: "hover:border-yellow-300/35",
      icon: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
      text: "text-yellow-300",
    },
    cyan: {
      border: "hover:border-cyan-300/35",
      icon: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
      text: "text-cyan-300",
    },
    emerald: {
      border: "hover:border-emerald-300/35",
      icon: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
    },
    amber: {
      border: "hover:border-amber-300/35",
      icon: "bg-amber-300/10 text-amber-300 border-amber-300/25",
      text: "text-amber-200",
    },
  };

  const currentTheme = themeMap[theme];

  return (
    <div
      className={`rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 ${currentTheme.border}`}
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${currentTheme.icon}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <p className={`text-sm font-black ${currentTheme.text}`}>{value}</p>
      </div>
    </div>
  );
}