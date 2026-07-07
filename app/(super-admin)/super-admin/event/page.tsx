"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  MapPin,
  Film,
  Sparkles,
  Loader2,
  AlertCircle,
  Calendar,
  RefreshCw,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Globe2,
} from "lucide-react";
import { apiSuperAdminRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import PromotionModal from "./EventModal";

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

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<any>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/promotions");
      const json = await res.json();

      const rawData = json.data?.content || json.data || json || [];

      if (Array.isArray(rawData)) {
        const sortedData = [...rawData].sort(
          (a, b) => Number(b.id || 0) - Number(a.id || 0)
        );

        setPromotions(sortedData);
      } else {
        setPromotions([]);
      }
    } catch (error) {
      toast.error("Không thể kết nối trực tiếp với máy chủ nguồn", adminToast);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const executeDelete = async () => {
    if (!promoToDelete) return;

    const toastId = toast.loading("Đang xóa sự kiện...", adminToast);

    try {
      setDeleting(true);

      const res = await apiSuperAdminRequest(
        `/api/v1/promotions/${promoToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Đã xóa bản ghi sự kiện thành công", {
          id: toastId,
          ...adminToast,
        });

        fetchPromotions();
      } else {
        toast.error("Không thể xóa sự kiện này khỏi hệ thống", {
          id: toastId,
          ...adminToast,
        });
      }
    } catch (error) {
      toast.error("Lỗi đồng bộ hệ thống khi thực hiện xóa", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setPromoToDelete(null);
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) =>
      String(promotion.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  const globalCount = useMemo(() => {
    return promotions.filter((promotion) => !promotion.cinemaItem).length;
  }, [promotions]);

  const movieLinkedCount = useMemo(() => {
    return promotions.filter((promotion) => promotion.movie).length;
  }, [promotions]);

  const stripHtml = (html: string) => {
    if (!html) {
      return "Chương trình chưa cập nhật mô tả chi tiết từ quản trị viên.";
    }

    return html.replace(/<[^>]*>?/gm, "");
  };

  const getThumbnailUrl = (thumbnail?: string) => {
    if (!thumbnail) {
      return "https://placehold.co/900x420/0b1020/f4d419?text=KN+Cinema+Event";
    }

    if (thumbnail.startsWith("http")) return thumbnail;

    if (thumbnail.startsWith("/")) {
      return `${BASE_URL}${thumbnail}`;
    }

    return thumbnail;
  };

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <PromotionModal
        isOpen={isModalOpen}
        mode={modalMode}
        data={selectedPromo}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchPromotions}
      />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Sparkles size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Globe2 size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Promotion Hub Registry
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                QUẢN LÝ{" "}
                <span className="text-yellow-300">SỰ KIỆN</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Quản lý ưu đãi, sự kiện và chiến dịch truyền thông KN Cinema
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
                size={15}
              />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm sự kiện, ưu đãi..."
                className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
              />
            </div>

            <button
              onClick={fetchPromotions}
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
                setModalMode("create");
                setSelectedPromo(null);
                setIsModalOpen(true);
              }}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<Sparkles size={18} />}
            title="Tổng sự kiện"
            value={`${promotions.length.toLocaleString("vi-VN")} mục`}
            theme="yellow"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Đang hiển thị"
            value={`${filteredPromotions.length.toLocaleString("vi-VN")} mục`}
            theme="cyan"
          />

          <SummaryCard
            icon={<MapPin size={18} />}
            title="Toàn hệ thống"
            value={`${globalCount.toLocaleString("vi-VN")} mục`}
            theme="emerald"
          />

          <SummaryCard
            icon={<Film size={18} />}
            title="Liên kết phim"
            value={`${movieLinkedCount.toLocaleString("vi-VN")} mục`}
            theme="amber"
          />
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={30} />
            </div>

            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.22em] animate-pulse">
              Đang đồng bộ sự kiện
            </p>
          </div>
        ) : filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="bg-[#0d1222] border border-[#182038] rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row items-center gap-5 group hover:border-cyan-300/35 hover:bg-[#111827]/70 transition-all duration-300 shadow-[0_18px_50px_rgba(0,0,0,0.24)] hover:-translate-y-0.5"
              >
                <div className="w-full lg:w-64 aspect-video lg:aspect-[16/10] rounded-2xl overflow-hidden bg-[#080c1b] relative shrink-0 border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
                  <img
                    src={getThumbnailUrl(promotion.thumbnail)}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    alt={promotion.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/900x420/0b1020/f4d419?text=KN+Cinema+Event";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#080c1b]/90 rounded-lg border border-white/10">
                    <span className="text-[9px] font-black text-yellow-300 tracking-[0.12em]">
                      ID-{promotion.id}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-yellow-300 text-[#111827] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ImageIcon size={15} />
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-300/10 border border-emerald-300/25 text-emerald-300 rounded-lg text-[9px] font-black uppercase tracking-[0.12em]">
                      Hoạt động
                    </span>

                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.12em] flex items-center gap-1.5">
                      <Calendar size={12} className="text-cyan-300" />
                      {promotion.createdAt
                        ? new Date(promotion.createdAt).toLocaleDateString("vi-VN")
                        : "Mới"}
                    </span>
                  </div>

                  <h4 className="text-base md:text-lg font-black uppercase tracking-[0.04em] text-white group-hover:text-yellow-200 transition-colors leading-snug truncate">
                    {promotion.title}
                  </h4>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed max-w-4xl group-hover:text-slate-400 transition-colors">
                    {stripHtml(promotion.content)}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#080c1b] border border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-[0.12em]">
                      <MapPin size={11} className="text-cyan-300" />
                      {promotion.cinemaItem?.name || "Toàn hệ thống"}
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#080c1b] border border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-[0.12em]">
                      <Film size={11} className="text-yellow-300" />
                      {promotion.movie?.title || "Tất cả các phim"}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-3 shrink-0 justify-center items-center border-t lg:border-t-0 lg:border-l border-white/10 w-full lg:w-auto pt-4 lg:pt-0 lg:pl-5">
                  <button
                    onClick={() => {
                      setSelectedPromo(promotion);
                      setModalMode("edit");
                      setIsModalOpen(true);
                    }}
                    className="w-10 h-10 bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 hover:text-yellow-300 rounded-xl transition-all flex items-center justify-center active:scale-90"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => {
                      setPromoToDelete(promotion);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-10 h-10 bg-[#080c1b] border border-white/10 hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all flex items-center justify-center text-slate-500 active:scale-90"
                    title="Xóa sự kiện"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <AlertCircle size={34} className="text-slate-600 mb-4" />

            <p className="font-black uppercase tracking-[0.18em] text-slate-500 text-[10px]">
              Không tìm thấy dữ liệu sự kiện tương thích
            </p>
          </div>
        )}
      </div>

      {isDeleteModalOpen && promoToDelete && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={deleting ? undefined : () => setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-[#0b1020] border border-white/10 p-7 rounded-2xl max-w-sm w-full text-center shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all disabled:opacity-40"
            >
              <X size={15} />
            </button>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-400/25 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-300">
                <Trash2 size={24} />
              </div>

              <h3
                className="text-2xl font-black uppercase tracking-[-0.04em] text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                }}
              >
                Xóa sự kiện?
              </h3>

              <p className="text-[11px] text-slate-500 mt-2 font-semibold leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn cấu hình ưu đãi{" "}
                <span className="text-yellow-300 font-black">
                  “{promoToDelete.title}”
                </span>{" "}
                khỏi cơ sở dữ liệu hệ thống.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="h-11 bg-[#111827] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-40"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="h-11 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(244,63,94,0.22)]"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Đồng ý xóa
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