"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiSuperAdminRequest } from "@/app/lib/api";

import {
  Loader2,
  Clapperboard,
  ArrowLeft,
  Plus,
  ChevronRight,
  Trash2,
  Edit3,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock3,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

import AddCinemaItemModal from "./CinemaItem";

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

      <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

        <div className="relative z-10 p-7 text-center">
          <div className="mx-auto mb-5 w-16 h-16 bg-rose-500/10 border border-rose-400/25 rounded-2xl flex items-center justify-center text-rose-300">
            <AlertTriangle size={30} />
          </div>

          <h2
            className="text-2xl font-black text-white uppercase tracking-[-0.04em] mb-2"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
            }}
          >
            Xóa cơ sở?
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed font-semibold px-2">
            Dữ liệu về cơ sở{" "}
            <span className="text-yellow-300 font-black">"{title}"</span> sẽ bị
            xóa khỏi hệ thống nếu không còn ràng buộc lịch chiếu.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-7">
            <button
              disabled={loading}
              onClick={onClose}
              className="h-11 rounded-xl border border-white/10 bg-[#111827] text-slate-300 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white/[0.08] hover:text-white transition-all active:scale-95 disabled:opacity-40"
            >
              Hủy bỏ
            </button>

            <button
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

export default function CinemaDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [cinema, setCinema] = useState<any>(null);
  const [cinemaItems, setCinemaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [modalData, setModalData] = useState<any>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [resCinema, resItems] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/cinemas/${id}`),
        apiSuperAdminRequest("/api/v1/cinema-items"),
      ]);

      const dataCinema = await resCinema.json();
      const dataItems = await resItems.json();

      setCinema(dataCinema.data || dataCinema);

      const allItems = dataItems.data || dataItems;

      const filteredItems = Array.isArray(allItems)
        ? allItems.filter(
            (item: any) =>
              item.cinemaId === Number(id) || item.cinema?.id === Number(id)
          )
        : [];

      setCinemaItems(filteredItems);
    } catch (err) {
      toast.error("Lỗi đồng bộ dữ liệu hệ thống", adminToast);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const loadingToast = toast.loading("Đang tiến hành gỡ bỏ...", adminToast);

    try {
      setDeleting(true);

      const res = await apiSuperAdminRequest(
        `/api/v1/cinema-items/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(result.message || "Đã xóa thành công", {
          id: loadingToast,
          ...adminToast,
        });

        setDeleteTarget(null);
        fetchData();
      } else {
        toast.error(result.message || "Không thể xóa dữ liệu", {
          id: loadingToast,
          ...adminToast,
        });
      }
    } catch (err) {
      toast.error("Lỗi kết nối server", {
        id: loadingToast,
        ...adminToast,
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalItems = cinemaItems.length;

  const totalHours = useMemo(() => {
    return cinemaItems.reduce(
      (sum, item) => sum + Number(item.hoursPerRoom || 0),
      0
    );
  }, [cinemaItems]);

  if (loading) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <span className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase animate-pulse">
            Đang đồng bộ cấu trúc hệ thống
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-yellow-300 transition-all text-[10px] font-black uppercase tracking-[0.16em]"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Quay lại danh sách
        </button>

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
                  Infrastructure Hub
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                {cinema?.name || "CINEMA DETAIL"}
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                NODE_ID #{id} • Quản lý đơn vị cơ sở trực thuộc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button
              onClick={fetchData}
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
              onClick={() => setModalData(null)}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Thêm đơn vị
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard
            icon={<Clapperboard size={18} />}
            title="Tổng cơ sở"
            value={`${totalItems.toLocaleString("vi-VN")} đơn vị`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Clock3 size={18} />}
            title="Tổng giờ vận hành"
            value={`${totalHours.toLocaleString("vi-VN")}H/D`}
            theme="cyan"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Trạng thái"
            value="Đang hoạt động"
            theme="emerald"
          />
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {cinemaItems.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/super-admin/room/${item.id}`)}
              className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl p-6 transition-all duration-300 hover:border-cyan-300/35 cursor-pointer overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.025] group-hover:text-yellow-300/[0.07] transition-colors tracking-tighter">
                {String(item.id).padStart(2, "0")}
              </span>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 group-hover:text-cyan-300 group-hover:bg-cyan-300/10 group-hover:border-cyan-300/30 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                  <Clapperboard size={21} />
                </div>

                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setModalData(item);
                    }}
                    className="w-9 h-9 bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 hover:text-yellow-300 rounded-xl transition-all shadow-md active:scale-90 flex items-center justify-center"
                    aria-label="Sửa đơn vị"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteTarget(item);
                    }}
                    className="w-9 h-9 bg-[#080c1b] border border-white/10 hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all shadow-md active:scale-90 flex items-center justify-center"
                    aria-label="Xóa đơn vị"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <h3 className="text-base font-black uppercase text-white group-hover:text-yellow-200 transition-colors duration-200 tracking-[0.04em] truncate">
                    {item.name}
                  </h3>

                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] mt-1">
                    CINEMA_ITEM #{item.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#080c1b] border border-white/10 rounded-xl">
                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-[0.14em] mb-1">
                      Khu vực
                    </p>

                    <p className="text-xs font-black text-cyan-300 uppercase truncate flex items-center gap-1">
                      <MapPin size={11} />
                      {item.city || "N/A"}
                    </p>
                  </div>

                  <div className="p-3 bg-[#080c1b] border border-white/10 rounded-xl">
                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-[0.14em] mb-1">
                      Capacity
                    </p>

                    <p className="text-xs font-black text-yellow-300 uppercase flex items-center gap-1">
                      <Clock3 size={11} />
                      {item.hoursPerRoom || 0}H/D
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between group-hover:border-cyan-300/20 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 group-hover:text-slate-300 transition-colors">
                    Quản lý danh sách phòng
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}

          {cinemaItems.length === 0 && (
            <div className="col-span-full py-24 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
              <Clapperboard className="mx-auto mb-4 text-slate-600" size={42} />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Trống - Chờ khởi tạo dữ liệu đơn vị cơ sở
              </p>

              <button
                onClick={() => setModalData(null)}
                className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
              >
                Tạo đơn vị đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      <AddCinemaItemModal
        isOpen={modalData !== undefined}
        onClose={() => setModalData(undefined)}
        cinemaId={Number(id)}
        onSuccess={fetchData}
        initialData={modalData}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.name}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
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