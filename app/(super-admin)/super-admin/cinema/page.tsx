"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Building2,
  ChevronRight,
  Fingerprint,
  Edit3,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  XCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Layers,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

import { apiSuperAdminRequest } from "@/app/lib/api";
import AddCinemaModal from "./AddCinemaModal";

const adminToast: any = {
  duration: 3600,
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
    icon: <XCircle size={18} />,
    style: {
      border: "1px solid rgba(244,63,94,0.5)",
    },
  },
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  loading?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

        <div className="relative z-10 p-7 text-center">
          <div className="mx-auto mb-5 w-16 h-16 bg-rose-500/10 border border-rose-400/25 rounded-2xl flex items-center justify-center text-rose-300 shadow-[0_18px_45px_rgba(244,63,94,0.12)]">
            <AlertTriangle size={30} />
          </div>

          <h2
            className="text-2xl font-black text-white uppercase tracking-[-0.04em] mb-2"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
            }}
          >
            Xóa cụm rạp?
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed font-semibold px-2">
            Bạn đang chuẩn bị xóa cụm rạp{" "}
            <span className="text-yellow-300 font-black">"{title}"</span>.
            Hành động này không thể hoàn tác nếu hệ thống cho phép xóa.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-7">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-11 rounded-xl border border-white/10 bg-[#111827] text-slate-300 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white/[0.08] hover:text-white transition-all active:scale-95 disabled:opacity-40"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="h-11 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.14em] hover:bg-rose-400 transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,63,94,0.22)] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CinemaPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [modalItem, setModalItem] = useState<any>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchCinemas = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/cinemas");
      const result = await res.json();

      setItems(Array.isArray(result.data || result) ? result.data || result : []);
    } catch (err) {
      toast.error("Không thể kết nối tới máy chủ", adminToast);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const loadingToast = toast.loading("Đang kiểm tra dữ liệu...", adminToast);

    try {
      setDeleting(true);

      const res = await apiSuperAdminRequest(`/api/v1/cinemas/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(data?.message || "Đã xóa cụm rạp thành công", {
          id: loadingToast,
          ...adminToast,
        });

        setDeleteTarget(null);
        fetchCinemas();
        return;
      }

      toast.error(data?.message || data?.error || "Không thể xóa cụm rạp", {
        id: loadingToast,
        ...adminToast,
      });
    } catch (err) {
      toast.error("Hệ thống đang bận, vui lòng thử lại", {
        id: loadingToast,
        ...adminToast,
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalCinemas = items.length;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [items]);

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" gutter={12} toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <AddCinemaModal
        isOpen={modalItem !== undefined}
        onClose={() => setModalItem(undefined)}
        onSuccess={fetchCinemas}
        initialData={modalItem}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.name}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Building2 size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Cinema Infrastructure
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CHI NHÁNH <span className="text-yellow-300">CINEMA</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                <LayoutGrid size={11} className="text-cyan-300" />
                Phân hệ quản lý cụm rạp KN Cinema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button
              onClick={fetchCinemas}
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
              onClick={() => setModalItem(null)}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] text-[10px] font-black uppercase tracking-[0.13em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
            >
              <Plus size={16} />
              Thêm cơ sở
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard
            icon={<Building2 size={18} />}
            title="Tổng cụm rạp"
            value={`${totalCinemas.toLocaleString("vi-VN")} cụm`}
            theme="yellow"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Trạng thái"
            value={loading ? "Đang tải" : "Sẵn sàng"}
            theme="cyan"
          />

          <SummaryCard
            icon={<Fingerprint size={18} />}
            title="Root Access"
            value="Super Admin"
            theme="emerald"
          />
        </section>

        <main>
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={28} />
              </div>

              <span className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase animate-pulse">
                Đang tải dữ liệu cụm rạp
              </span>
            </div>
          ) : sortedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/super-admin/cinema/${item.id}`)}
                  className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl p-6 hover:border-cyan-300/35 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.025] group-hover:text-yellow-300/[0.07] transition">
                    {String(item.id).padStart(2, "0")}
                  </span>

                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 group-hover:bg-cyan-300/10 group-hover:text-cyan-300 group-hover:border-cyan-300/30 transition-all shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                      <Building2 size={22} />
                    </div>

                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setModalItem(item);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 hover:text-yellow-300 transition-all active:scale-90"
                        aria-label="Sửa cụm rạp"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#080c1b] border border-white/10 hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-300 transition-all active:scale-90"
                        aria-label="Xóa cụm rạp"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-black uppercase text-white group-hover:text-yellow-200 transition truncate tracking-[0.04em]">
                        {item.name}
                      </h3>

                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] mt-1">
                        CINEMA_ID #{item.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />

                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 group-hover:text-emerald-300 transition-colors">
                        Đang hoạt động
                      </span>

                      <ChevronRight
                        size={15}
                        className="ml-auto text-slate-600 group-hover:text-yellow-300 group-hover:opacity-100 group-hover:translate-x-1 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-28 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
              <Fingerprint className="mx-auto mb-4 text-slate-600" size={42} />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Chưa có cụm rạp nào
              </p>

              <button
                onClick={() => setModalItem(null)}
                className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
              >
                Tạo cụm rạp đầu tiên
              </button>
            </div>
          )}
        </main>
      </div>
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
  theme: "yellow" | "cyan" | "emerald";
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