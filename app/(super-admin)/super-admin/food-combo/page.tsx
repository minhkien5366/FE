"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  UtensilsCrossed,
  Sparkles,
  Loader2,
  Edit3,
  Package,
  CircleDollarSign,
  CheckCircle2,
  Image as ImageIcon,
  X,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { apiSuperAdminRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import ComboForm from "./ComboForm";

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

const formatMoney = (value: number) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
};

const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "https://placehold.co/600x600/0b1020/f4d419?text=KN+Combo";
  }

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

export default function FoodManagement() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCombos = useCallback(async () => {
    try {
      setLoading(true);

      const res = await apiSuperAdminRequest("/api/v1/combos");
      const result = await res.json().catch(() => ({}));

      const rawData = result.data || result || [];

      if (Array.isArray(rawData)) {
        setCombos([...rawData].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)));
      } else {
        setCombos([]);
      }
    } catch (error) {
      toast.error("Không thể kết nối máy chủ", adminToast);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  const handleFormSubmit = async (data: FormData) => {
    const isUpdate = !!editingItem;

    const endpoint = isUpdate
      ? `/api/v1/combos/${editingItem.id}`
      : "/api/v1/combos";

    setIsSubmitting(true);

    const toastId = toast.loading(
      isUpdate ? "Đang cập nhật combo..." : "Đang tạo combo...",
      adminToast
    );

    try {
      const res = await apiSuperAdminRequest(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        body: data,
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);

        toast.error(result?.message || "Dữ liệu không hợp lệ", {
          id: toastId,
          ...adminToast,
        });

        return {
          ok: false,
          json: async () => result,
        };
      }

      toast.success(isUpdate ? "Cập nhật combo thành công" : "Tạo combo thành công", {
        id: toastId,
        ...adminToast,
      });

      setIsModalOpen(false);
      setEditingItem(null);
      fetchCombos();

      return {
        ok: true,
      };
    } catch (error) {
      toast.error("Lỗi hệ thống", {
        id: toastId,
        ...adminToast,
      });

      return {
        ok: false,
        json: async () => ({
          message: "Không thể kết nối máy chủ",
        }),
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;

    const toastId = toast.loading("Đang xóa combo...", adminToast);

    try {
      setIsDeleting(true);

      const res = await apiSuperAdminRequest(`/api/v1/combos/${itemToDelete.id}`, {
        method: "DELETE",
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(result?.message || "Không thể xóa combo", {
          id: toastId,
          ...adminToast,
        });

        return;
      }

      toast.success("Đã xóa combo thành công", {
        id: toastId,
        ...adminToast,
      });

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchCombos();
    } catch {
      toast.error("Không thể xóa combo", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return combos.filter((combo) => {
      const text = `${combo.name || ""} ${combo.description || ""}`.toLowerCase();

      return text.includes(keyword);
    });
  }, [combos, searchTerm]);

  const totalValue = useMemo(() => {
    return combos.reduce((sum, combo) => sum + Number(combo.price || 0), 0);
  }, [combos]);

  const averagePrice = useMemo(() => {
    if (!combos.length) return 0;

    return Math.round(totalValue / combos.length);
  }, [combos, totalValue]);

  const highestPrice = useMemo(() => {
    return combos.reduce(
      (max, combo) => Math.max(max, Number(combo.price || 0)),
      0
    );
  }, [combos]);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" reverseOrder={false} toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <UtensilsCrossed size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Food & Combo Hub
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                MENU COMBO{" "}
                <span className="text-yellow-300">BẮP NƯỚC</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Quản lý thực đơn combo bán kèm khi đặt vé tại KN Cinema
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <button
              onClick={fetchCombos}
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
              onClick={openCreateModal}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<ShoppingBag size={18} />}
            title="Tổng combo"
            value={`${combos.length.toLocaleString("vi-VN")} món`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Package size={18} />}
            title="Đang hiển thị"
            value={`${filteredItems.length.toLocaleString("vi-VN")} món`}
            theme="cyan"
          />

          <SummaryCard
            icon={<CircleDollarSign size={18} />}
            title="Giá trung bình"
            value={formatMoney(averagePrice)}
            theme="emerald"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Giá cao nhất"
            value={formatMoney(highestPrice)}
            theme="amber"
          />
        </section>

        <section className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
              size={15}
            />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm combo theo tên hoặc mô tả..."
              className="w-full h-12 bg-[#080c1b] border border-white/10 rounded-xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600"
            />
          </div>
        </section>

        <main>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={30} />
              </div>

              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.22em] animate-pulse">
                Đang đồng bộ thực đơn
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 md:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl overflow-hidden hover:border-cyan-300/35 transition-all duration-300 shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1 flex flex-col"
                >
                  <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative aspect-square overflow-hidden bg-[#080c1b] border-b border-white/10">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/600x600/0b1020/f4d419?text=KN+Combo";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#080c1b]/90 backdrop-blur rounded-lg border border-white/10">
                      <span className="text-[9px] font-black text-yellow-300 tracking-[0.12em]">
                        ID-{item.id}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-[#080c1b]/90 backdrop-blur text-slate-400 rounded-xl flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-400/35 transition-all z-10 border border-white/10 active:scale-90"
                      aria-label="Xóa combo"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.24)] opacity-0 group-hover:opacity-100 transition-all">
                      <Sparkles size={15} />
                    </div>
                  </div>

                  <div className="relative z-10 p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-black uppercase text-white line-clamp-1 group-hover:text-yellow-200 transition-colors tracking-[0.04em]">
                          {item.name}
                        </h3>

                        <span className="text-[10px] font-black text-slate-600 shrink-0">
                          #{item.id}
                        </span>
                      </div>

                      <p className="text-slate-500 text-[11px] font-medium line-clamp-2 leading-relaxed">
                        {item.description ||
                          "Chưa thiết lập dữ liệu mô tả cụ thể cho gói combo này"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-yellow-300 font-black text-lg tracking-tight">
                        {formatMoney(item.price || 0)}
                      </p>

                      <button
                        onClick={() => openEditModal(item)}
                        className="w-full h-10 bg-[#080c1b] text-slate-400 text-[10px] font-black uppercase tracking-[0.12em] rounded-xl border border-white/10 hover:border-yellow-300/35 hover:text-yellow-300 hover:bg-[#111827] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Edit3 size={13} />
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
              <AlertCircle size={38} className="text-slate-600 mb-4" />

              <p className="font-black uppercase tracking-[0.18em] text-slate-500 text-[10px]">
                Danh sách thực đơn đang trống
              </p>

              <button
                onClick={openCreateModal}
                className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
              >
                Tạo combo đầu tiên
              </button>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <ComboForm
          initialData={editingItem}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={isDeleting ? undefined : () => setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-[#0b1020] border border-white/10 p-7 rounded-2xl max-w-sm w-full text-center shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all disabled:opacity-40"
              aria-label="Đóng modal"
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
                Xóa combo?
              </h3>

              <p className="text-[11px] text-slate-500 mt-2 font-semibold leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn combo{" "}
                <span className="text-yellow-300 font-black">
                  “{itemToDelete.name}”
                </span>{" "}
                khỏi thực đơn hệ thống.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="h-11 bg-[#111827] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-40"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="h-11 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(244,63,94,0.22)]"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Xác nhận
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

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <p className={`text-sm font-black truncate ${currentTheme.text}`}>
          {value}
        </p>
      </div>
    </div>
  );
}