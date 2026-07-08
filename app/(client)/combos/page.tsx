"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  X,
  Flame,
  Utensils,
  Star,
  Layers,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  Package,
  BadgePercent,
} from "lucide-react";
import { apiRequest, getImageUrl } from "../../lib/api";

interface ComboItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

const fallbackImage =
  "https://placehold.co/900x560/0b1020/f4d419?text=KN+Combo";

const formatPrice = (price: number) => {
  return Number(price || 0).toLocaleString("vi-VN");
};

const resolveComboImage = (imageUrl?: string | null) => {
  if (!imageUrl) return fallbackImage;

  if (
    imageUrl.startsWith("http") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return getImageUrl(imageUrl);
};

export default function ComboDealsSection() {
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);

        const res = await apiRequest("/api/v1/combos");
        const resData = await res.json().catch(() => ({}));

        const targetData = resData?.data?.content || resData?.data || resData;

        if (res.ok) {
          setCombos(Array.isArray(targetData) ? targetData : []);
        } else {
          setCombos([]);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách Combo:", error);
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  useEffect(() => {
    if (selectedCombo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedCombo]);

  const averagePrice = useMemo(() => {
    if (!combos.length) return 0;

    const total = combos.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return Math.round(total / combos.length);
  }, [combos]);

  if (loading) {
    return (
      <section className="relative bg-[#070b14] py-16 px-4 overflow-hidden">
        <div className="pointer-events-none absolute top-[-160px] right-[-160px] w-[420px] h-[420px] bg-cyan-400/[0.025] rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] w-[420px] h-[420px] bg-yellow-300/[0.02] rounded-full blur-[140px]" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={30} />
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 animate-pulse">
            Đang chuẩn bị thực đơn
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#070b14] py-14 md:py-18 px-4 text-slate-200 overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[120px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-[#0d1222] border border-white/10 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/[0.045] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-300/[0.035] rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-7">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  KN Cinema Food Counter
                </span>
              </div>

              <h2
                className="text-[34px] md:text-[56px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                COMBO <span className="text-yellow-300">BẮP NƯỚC</span>
              </h2>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-3">
                Thực đơn bắp nước, snack và combo tiện lợi khi xem phim tại KN Cinema
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-[480px]">
              <MiniStat
                icon={<ShoppingBag size={16} />}
                label="Combo"
                value={`${combos.length} món`}
                theme="yellow"
              />

              <MiniStat
                icon={<BadgePercent size={16} />}
                label="Giá TB"
                value={`${formatPrice(averagePrice)}đ`}
                theme="cyan"
              />

              <MiniStat
                icon={<CheckCircle2 size={16} />}
                label="Trạng thái"
                value="Sẵn sàng"
                theme="emerald"
              />
            </div>
          </div>
        </header>

        {combos.length === 0 ? (
          <div className="py-28 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-3xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Utensils size={48} className="mx-auto text-slate-600" />

            <h3 className="mt-5 text-2xl font-black uppercase text-white">
              Thực đơn đang cập nhật
            </h3>

            <p className="text-slate-500 mt-3 text-sm font-semibold">
              Hiện chưa có combo bắp nước nào được mở bán.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {combos.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden bg-[#0d1222] border border-white/10 rounded-3xl transition-all duration-300 hover:border-cyan-300/35 hover:-translate-y-1 shadow-[0_18px_50px_rgba(0,0,0,0.26)] flex flex-col"
              >
                <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-300/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative aspect-[16/10] overflow-hidden bg-[#080c1b] border-b border-white/10">
                  <img
                    src={resolveComboImage(item.imageUrl)}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/92 via-[#0b1020]/10 to-transparent" />

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#080c1b]/85 border border-white/10 backdrop-blur">
                    <span className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
                      Combo
                    </span>
                  </div>

                  <div className="absolute right-3 bottom-3 px-3 py-1.5 bg-yellow-300 text-[#111827] rounded-xl shadow-[0_16px_36px_rgba(244,212,25,0.22)]">
                    <span className="text-[10px] font-black">
                      {formatPrice(item.price)}đ
                    </span>
                  </div>
                </div>

                <div className="relative z-10 p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-5 h-[2px] bg-yellow-300 rounded-full" />

                    <span className="text-[8px] font-black text-yellow-300 uppercase tracking-[0.16em]">
                      Quầy phục vụ
                    </span>
                  </div>

                  <h4 className="text-sm font-black uppercase tracking-[0.03em] text-white line-clamp-2 group-hover:text-yellow-200 transition-colors min-h-[38px]">
                    {item.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed font-medium min-h-[50px]">
                    {item.description ||
                      "Khẩu phần bắp nước tiêu chuẩn, chuẩn bị nóng hổi tại quầy KN Cinema."}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      <Star size={11} className="text-yellow-300" />
                      Best choice
                    </div>

                    <button
                      onClick={() => setSelectedCombo(item)}
                      className="h-10 px-4 rounded-xl bg-[#080c1b] border border-white/10 text-slate-300 hover:bg-yellow-300 hover:border-yellow-200 hover:text-[#111827] transition-all active:scale-95 text-[10px] font-black uppercase tracking-[0.12em] flex items-center gap-1.5"
                    >
                      Chi tiết
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedCombo && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedCombo(null)}
          />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0b1020] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
            <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 rounded-full bg-yellow-300/[0.045] blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 rounded-full bg-cyan-300/[0.035] blur-3xl" />

            <button
              onClick={() => setSelectedCombo(null)}
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95"
              aria-label="Đóng chi tiết combo"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-0">
              <div className="relative min-h-[260px] md:min-h-[420px] bg-[#080c1b] border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                <img
                  src={resolveComboImage(selectedCombo.imageUrl)}
                  className="w-full h-full object-cover opacity-90"
                  alt={selectedCombo.name}
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/90 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-300 text-[#111827] px-3 py-2 shadow-[0_16px_36px_rgba(244,212,25,0.24)]">
                    <Flame size={15} />

                    <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                      Phục vụ ngay
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles size={11} className="text-cyan-300" />

                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Combo Detail
                  </span>
                </div>

                <h3
                  className="text-3xl md:text-4xl font-black uppercase text-white tracking-[-0.045em] leading-tight"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  {selectedCombo.name}
                </h3>

                <p className="mt-4 text-sm text-slate-400 leading-relaxed font-medium bg-[#080c1b] border border-white/10 rounded-2xl p-4">
                  {selectedCombo.description ||
                    "Sự kết hợp hoàn hảo giữa bắp rang thơm lừng cùng thức uống giải khát mát lạnh tại quầy KN Cinema."}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <InfoBox
                    icon={<Utensils size={15} />}
                    label="Danh mục"
                    value="Combo"
                    theme="cyan"
                  />

                  <InfoBox
                    icon={<Layers size={15} />}
                    label="Tình trạng"
                    value="Sẵn sàng"
                    theme="emerald"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">
                      Giá combo
                    </span>

                    <span className="text-3xl font-black text-yellow-300 tracking-tight">
                      {formatPrice(selectedCombo.price)}
                      <span className="text-sm text-yellow-300/80 ml-1">đ</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-300 uppercase tracking-[0.12em] px-3 py-2 bg-emerald-300/10 rounded-xl border border-emerald-300/20">
                    <CheckCircle2 size={13} />
                    Có sẵn
                  </span>
                </div>

                <button
                  onClick={() => setSelectedCombo(null)}
                  className="w-full mt-7 h-12 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .xs\\:grid-cols-2 {
          @media (min-width: 480px) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}

function MiniStat({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
  };

  return (
    <div className="rounded-2xl bg-[#080c1b] border border-white/10 p-4 flex items-center gap-3 min-w-0">
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500 truncate">
          {label}
        </p>

        <p className="text-xs font-black text-white truncate mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: "cyan" | "emerald";
}) {
  const themeMap = {
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
  };

  return (
    <div className="rounded-2xl bg-[#080c1b] border border-white/10 p-4">
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="text-xs font-black text-white mt-1 truncate">
        {value}
      </p>
    </div>
  );
}