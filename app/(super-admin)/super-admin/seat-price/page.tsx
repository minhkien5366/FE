"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  Armchair,
  Edit3,
  Trash2,
  CalendarDays,
  Settings2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Banknote,
  AlertTriangle,
  X,
  Ticket,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest } from "../../../lib/api";
import { PriceActionModal } from "./PriceActionModal";

const DAYS: Record<number, string> = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
  8: "Chủ Nhật",
};

const DAY_OPTIONS = [
  { value: 2, label: "Thứ Hai" },
  { value: 3, label: "Thứ Ba" },
  { value: 4, label: "Thứ Tư" },
  { value: 5, label: "Thứ Năm" },
  { value: 6, label: "Thứ Sáu" },
  { value: 7, label: "Thứ Bảy" },
  { value: 8, label: "Chủ Nhật" },
];

const SEAT_TYPE_ORDER = ["NORMAL", "VIP", "COUPLE", "SWEETBOX"];

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
  return Number(value || 0).toLocaleString("vi-VN");
};

const getSeatTypeMeta = (seatType: string) => {
  const type = String(seatType || "").toUpperCase();

  switch (type) {
    case "VIP":
      return {
        label: "Ghế VIP",
        sub: "Premium Seat",
        iconClass: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
        titleClass: "text-yellow-300",
        borderClass: "hover:border-yellow-300/35",
        glowClass: "bg-yellow-300/[0.045]",
      };

    case "COUPLE":
    case "SWEETBOX":
      return {
        label: "Ghế đôi",
        sub: "Couple Seat",
        iconClass: "bg-pink-300/10 text-pink-300 border-pink-300/25",
        titleClass: "text-pink-300",
        borderClass: "hover:border-pink-300/35",
        glowClass: "bg-pink-300/[0.045]",
      };

    case "NORMAL":
    default:
      return {
        label: "Ghế thường",
        sub: "Standard Seat",
        iconClass: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
        titleClass: "text-cyan-300",
        borderClass: "hover:border-cyan-300/35",
        glowClass: "bg-cyan-300/[0.045]",
      };
  }
};

export default function PriceManagementPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/seat-price-configs");
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const rawData = json?.data?.content || json?.data || [];

        setPrices(Array.isArray(rawData) ? rawData : []);
      } else {
        toast.error(json?.message || "Lỗi tải dữ liệu giá vé", adminToast);
      }
    } catch (err) {
      toast.error("Không thể kết nối với máy chủ", adminToast);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const groupedPrices = useMemo(() => {
    const groups: Record<string, any[]> = {};

    prices.forEach((item) => {
      const type = item.seatType || "NORMAL";

      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => Number(a.dayOfWeek) - Number(b.dayOfWeek));
    });

    return groups;
  }, [prices]);

  const groupedEntries = useMemo(() => {
    return Object.entries(groupedPrices).sort(([typeA], [typeB]) => {
      const indexA = SEAT_TYPE_ORDER.indexOf(String(typeA).toUpperCase());
      const indexB = SEAT_TYPE_ORDER.indexOf(String(typeB).toUpperCase());

      return (
        (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
      );
    });
  }, [groupedPrices]);

  const handleSave = async (formData: any) => {
    const payload = {
      seatType: formData.seatType,
      dayOfWeek: Number(formData.dayOfWeek),
      price: Number(formData.price),
    };

    const method = selectedItem?.id ? "PUT" : "POST";
    const url = selectedItem?.id
      ? `/api/v1/seat-price-configs/${selectedItem.id}`
      : "/api/v1/seat-price-configs";

    const toastId = toast.loading("Đang lưu cấu hình giá vé...", adminToast);

    try {
      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(
          selectedItem?.id ? "Cập nhật giá vé thành công" : "Thiết lập giá vé thành công",
          {
            id: toastId,
            ...adminToast,
          }
        );

        await fetchPrices();
        setIsActionOpen(false);
        setSelectedItem(null);
      } else {
        toast.error(json?.message || "Có lỗi xảy ra khi lưu cấu hình", {
          id: toastId,
          ...adminToast,
        });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi lưu cấu hình", {
        id: toastId,
        ...adminToast,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    const toastId = toast.loading("Đang xóa cấu hình giá vé...", adminToast);

    try {
      setDeleting(true);

      const res = await apiSuperAdminRequest(
        `/api/v1/seat-price-configs/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Xóa cấu hình thành công", {
          id: toastId,
          ...adminToast,
        });

        setDeleteTarget(null);
        await fetchPrices();
      } else {
        toast.error(json?.message || "Xóa cấu hình thất bại", {
          id: toastId,
          ...adminToast,
        });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi xóa", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalConfigs = prices.length;

  const averagePrice = useMemo(() => {
    if (!prices.length) return 0;

    const total = prices.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    return Math.round(total / prices.length);
  }, [prices]);

  const maxPrice = useMemo(() => {
    return prices.reduce(
      (max, item) => Math.max(max, Number(item.price || 0)),
      0
    );
  }, [prices]);

  const fullConfiguredTypes = useMemo(() => {
    return groupedEntries.filter(([, items]) => {
      const uniqueDays = new Set(items.map((item) => Number(item.dayOfWeek)));

      return uniqueDays.size >= 7;
    }).length;
  }, [groupedEntries]);

  const openCreateModal = () => {
    setSelectedItem(null);
    setIsActionOpen(true);
  };

  const openAddDayModal = (seatType: string, items: any[]) => {
    const existingDays = new Set(items.map((item) => Number(item.dayOfWeek)));
    const missingDay =
      DAY_OPTIONS.find((day) => !existingDays.has(day.value))?.value || 2;

    setSelectedItem({
      seatType,
      dayOfWeek: missingDay,
      price: 0,
    });

    setIsActionOpen(true);
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
              <Settings2 size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Seat Price Control
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                QUẢN LÝ <span className="text-yellow-300">GIÁ VÉ</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Thiết lập đơn giá theo loại ghế và ngày trong tuần cho toàn hệ thống
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <button
              onClick={fetchPrices}
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
              Thiết lập mới
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<Ticket size={18} />}
            title="Tổng cấu hình"
            value={`${totalConfigs.toLocaleString("vi-VN")} mục`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Banknote size={18} />}
            title="Giá trung bình"
            value={`${formatMoney(averagePrice)}đ`}
            theme="cyan"
          />

          <SummaryCard
            icon={<CalendarClock size={18} />}
            title="Nhóm đủ 7 ngày"
            value={`${fullConfiguredTypes.toLocaleString("vi-VN")} nhóm`}
            theme="emerald"
          />

          <SummaryCard
            icon={<ShieldCheck size={18} />}
            title="Giá cao nhất"
            value={`${formatMoney(maxPrice)}đ`}
            theme="amber"
          />
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={30} />
            </div>

            <span className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase animate-pulse">
              Đang đồng bộ dữ liệu giá vé
            </span>
          </div>
        ) : groupedEntries.length === 0 ? (
          <div className="py-28 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Armchair className="mx-auto mb-4 text-slate-600" size={42} />

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              Chưa có cấu hình giá vé nào
            </p>

            <button
              onClick={openCreateModal}
              className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
            >
              Tạo cấu hình đầu tiên
            </button>
          </div>
        ) : (
          <main className="space-y-8">
            {groupedEntries.map(([seatType, items]) => {
              const uniqueDays = new Set(
                items.map((item) => Number(item.dayOfWeek))
              );
              const isFullWeek = uniqueDays.size >= 7;
              const meta = getSeatTypeMeta(seatType);

              return (
                <section
                  key={seatType}
                  className={`relative bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)] overflow-hidden transition-all ${meta.borderClass}`}
                >
                  <div
                    className={`pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-80 ${meta.glowClass}`}
                  />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10 mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${meta.iconClass}`}
                      >
                        <Armchair size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-black text-white uppercase tracking-[0.08em]">
                            {meta.label}
                          </h2>

                          <span
                            className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-[0.12em] ${meta.iconClass}`}
                          >
                            {seatType}
                          </span>
                        </div>

                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-[0.14em]">
                          {meta.sub} • {uniqueDays.size}/7 ngày đã thiết lập
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
                          isFullWeek
                            ? "bg-emerald-300/10 border-emerald-300/25 text-emerald-300"
                            : "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
                        }`}
                      >
                        {isFullWeek ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}

                        <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                          {isFullWeek ? "Đủ tuần" : "Thiếu ngày"}
                        </span>
                      </div>

                      {!isFullWeek && (
                        <button
                          onClick={() => openAddDayModal(seatType, items)}
                          className="h-10 px-4 rounded-xl bg-[#080c1b] border border-white/10 text-slate-400 hover:border-yellow-300/35 hover:text-yellow-300 transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]"
                        >
                          <Plus size={13} />
                          Thêm ngày
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {items.map((item) => {
                      const isWeekend =
                        Number(item.dayOfWeek) === 7 ||
                        Number(item.dayOfWeek) === 8;

                      return (
                        <div
                          key={item.id}
                          className="group/card relative bg-[#080c1b] border border-white/10 p-5 rounded-2xl transition-all duration-300 hover:border-cyan-300/35 hover:bg-[#111827] shadow-[0_14px_34px_rgba(0,0,0,0.22)] flex flex-col justify-between min-h-[150px] overflow-hidden"
                        >
                          <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-cyan-300/[0.045] blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                          <div className="relative z-10 flex justify-between items-start gap-3">
                            <div>
                              <span
                                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${
                                  isWeekend ? "text-yellow-300" : "text-cyan-300"
                                }`}
                              >
                                <CalendarDays size={12} />
                                {DAYS[Number(item.dayOfWeek)] ?? "---"}
                              </span>

                              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.12em] mt-1">
                                Day code #{item.dayOfWeek}
                              </p>
                            </div>

                            <div className="opacity-100 sm:opacity-0 group-hover/card:opacity-100 flex items-center gap-1.5 transition-all duration-200">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsActionOpen(true);
                                }}
                                className="w-8 h-8 bg-[#0d1222] hover:bg-yellow-300/10 text-slate-500 hover:text-yellow-300 rounded-xl border border-white/10 hover:border-yellow-300/35 transition-all active:scale-90 flex items-center justify-center"
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="w-8 h-8 bg-[#0d1222] hover:bg-rose-500/10 text-slate-500 hover:text-rose-300 rounded-xl border border-white/10 hover:border-rose-400/35 transition-all active:scale-90 flex items-center justify-center"
                                title="Xóa cấu hình"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="relative z-10 pt-5 border-t border-white/10 mt-5">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.16em] mb-1 block">
                              Giá áp dụng
                            </span>

                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black tracking-tight text-white font-mono group-hover/card:text-yellow-200 transition-colors">
                                {formatMoney(Number(item.price))}
                              </span>

                              <span className="text-[10px] font-black text-yellow-300">
                                VND
                              </span>
                            </div>
                          </div>

                          <CalendarDays
                            className="absolute bottom-3 right-3 text-white/[0.025] group-hover/card:text-yellow-300/[0.06] transition-colors pointer-events-none"
                            size={58}
                          />
                        </div>
                      );
                    })}

                    {!isFullWeek && (
                      <button
                        onClick={() => openAddDayModal(seatType, items)}
                        className="group/add border border-dashed border-white/10 hover:border-yellow-300/40 rounded-2xl min-h-[150px] flex flex-col justify-center items-center transition-all duration-200 bg-[#080c1b]/70 hover:bg-[#111827]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#0d1222] border border-white/10 text-slate-500 group-hover/add:text-[#111827] group-hover/add:bg-yellow-300 group-hover/add:border-yellow-200 transition-all duration-200 flex items-center justify-center shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
                          <Plus size={16} strokeWidth={3} />
                        </div>

                        <span className="text-[10px] font-black mt-3 text-slate-500 group-hover/add:text-yellow-300 transition-colors uppercase tracking-[0.14em]">
                          Thêm ngày
                        </span>
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </main>
        )}
      </div>

      <PriceActionModal
        isOpen={isActionOpen}
        onClose={() => {
          setIsActionOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSave}
        initialData={selectedItem}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={deleting ? undefined : () => setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

            <button
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all disabled:opacity-40"
              aria-label="Đóng modal"
            >
              <X size={15} />
            </button>

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
                Xóa cấu hình?
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold px-2">
                Bạn đang xóa giá vé{" "}
                <span className="text-yellow-300 font-black">
                  {formatMoney(Number(deleteTarget.price))}đ
                </span>{" "}
                cho{" "}
                <span className="text-cyan-300 font-black">
                  {deleteTarget.seatType}
                </span>{" "}
                vào {DAYS[Number(deleteTarget.dayOfWeek)] || "ngày chưa rõ"}.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-7">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="h-11 rounded-xl border border-white/10 bg-[#111827] text-slate-300 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white/[0.08] hover:text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-11 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.14em] hover:bg-rose-400 transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,63,94,0.22)] flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
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