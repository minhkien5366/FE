"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Megaphone,
  ChevronRight,
  MapPin,
  Check,
  Search,
  ChevronDown,
  Calendar,
  Gift,
  Sparkles,
  Building2,
  AlertCircle,
  RefreshCw,
  BadgePercent,
} from "lucide-react";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const userToast: any = {
  duration: 3200,
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

const cleanHtmlText = (content?: string) => {
  return String(content || "").replace(/<[^>]*>?/gm, "").trim();
};

const formatDate = (value?: string) => {
  if (!value) return "Đang cập nhật";

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const normalizeBrandText = (value?: string) => {
  return String(value || "")
    .replace(/A&K/gi, "KN")
    .replace(/A & K/gi, "KN")
    .trim();
};

export default function EventsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCinemas, setLoadingCinemas] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCinemas = async () => {
    try {
      setLoadingCinemas(true);

      const res = await apiRequest("/api/v1/cinema-items");
      const json = await res.json().catch(() => ({}));

      const rawList = json?.data?.content || json?.data || [];
      const list = Array.isArray(rawList) ? rawList : [];

      setCinemas(list);

      if (list.length > 0) {
        setSelectedCinema((prev: any) => prev || list[0]);
      } else {
        setSelectedCinema(null);
        setLoading(false);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách rạp", userToast);
      setCinemas([]);
      setSelectedCinema(null);
      setLoading(false);
    } finally {
      setLoadingCinemas(false);
    }
  };

  const fetchPromotions = async () => {
    if (!selectedCinema?.id) return;

    setLoading(true);

    try {
      const res = await apiRequest(
        `/api/v1/promotions/client/${selectedCinema.id}`
      );

      const json = await res.json().catch(() => ({}));
      const rawData = json?.data?.content || json?.data || [];

      setPromotions(Array.isArray(rawData) ? rawData : []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu ưu đãi", userToast);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [selectedCinema?.id]);

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

  const filteredCinemas = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return cinemas.filter((cinema) => {
      const text = `${cinema?.name || ""} ${cinema?.address || ""} ${
        cinema?.city || ""
      } ${cinema?.cinema?.name || ""}`.toLowerCase();

      return text.includes(keyword);
    });
  }, [cinemas, searchTerm]);

  const selectedCinemaName = normalizeBrandText(selectedCinema?.name) || "Chọn rạp";

  const selectedCinemaAddress =
    normalizeBrandText(selectedCinema?.address || selectedCinema?.city) ||
    "Đang cập nhật địa chỉ";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 pt-10 pb-20 px-4 md:px-8 font-sans relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={userToast} />

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="relative rounded-3xl bg-[#0d1222] border border-white/10 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34)] overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/[0.045] rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-300/[0.035] rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-7 items-start">
            <div className="min-w-0 space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <Sparkles size={11} className="text-cyan-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                    KN Cinema Exclusive
                  </span>
                </div>

                <h1
                  className="text-[34px] md:text-[56px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                  }}
                >
                  ƯU ĐÃI & <span className="text-yellow-300">SỰ KIỆN</span>
                </h1>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-3">
                  Chọn rạp để xem ưu đãi đang áp dụng tại từng cụm rạp KN Cinema
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-white/10">
                <MiniInfo
                  icon={<Building2 size={16} />}
                  label="Rạp đang xem"
                  value={selectedCinemaName}
                  theme="yellow"
                />

                <MiniInfo
                  icon={<Megaphone size={16} />}
                  label="Ưu đãi khả dụng"
                  value={`${promotions.length.toLocaleString("vi-VN")} chương trình`}
                  theme="cyan"
                />

                <MiniInfo
                  icon={<MapPin size={16} />}
                  label="Địa chỉ"
                  value={selectedCinemaAddress}
                  theme="emerald"
                />
              </div>
            </div>

            <div className="w-full relative z-30" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                disabled={loadingCinemas}
                className={`w-full flex items-center justify-between gap-4 bg-[#080c1b] border px-4 py-3 rounded-2xl transition-all shadow-[0_16px_34px_rgba(0,0,0,0.24)] group disabled:opacity-60 focus:outline-none focus:ring-0 ${
                  isOpen
                    ? "border-yellow-300/45 bg-[#111827]"
                    : "border-white/10 hover:bg-[#111827] hover:border-cyan-300/35"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300 shrink-0">
                    {loadingCinemas ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Cụm rạp đang chọn
                    </p>

                    <span className="text-[11px] font-black truncate block text-white group-hover:text-yellow-200 transition-colors">
                      {selectedCinemaName}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  size={15}
                  className={`text-slate-500 transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-yellow-300" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-3 w-full bg-[#080c1b] border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden">
                  <div className="p-3 bg-[#0d1222] border-b border-white/10">
                    <div className="relative group">
                      <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
                        size={14}
                      />

                      <input
                        type="text"
                        placeholder="Tìm tên rạp, địa chỉ..."
                        className="w-full bg-[#080c1b] border border-white/10 rounded-xl py-3 pl-10 pr-3 text-[11px] font-bold outline-none text-white placeholder:text-slate-600 focus:border-cyan-300/45 focus:ring-0"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-[245px] overflow-y-auto custom-scrollbar p-2">
                    {filteredCinemas.length > 0 ? (
                      filteredCinemas.map((cinema) => {
                        const active =
                          String(selectedCinema?.id) === String(cinema.id);

                        return (
                          <button
                            key={cinema.id}
                            type="button"
                            onClick={() => {
                              setSelectedCinema(cinema);
                              setIsOpen(false);
                              setSearchTerm("");
                            }}
                            className={`w-full px-3 py-3 rounded-xl text-left transition-all flex justify-between items-center gap-3 focus:outline-none focus:ring-0 ${
                              active
                                ? "bg-yellow-300 text-[#111827]"
                                : "text-slate-300 hover:bg-[#111827] hover:text-cyan-200"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.08em] truncate">
                                {normalizeBrandText(cinema.name) || "KN Cinema"}
                              </p>

                              <p
                                className={`text-[9px] font-semibold truncate mt-1 ${
                                  active ? "text-[#111827]/65" : "text-slate-600"
                                }`}
                              >
                                {normalizeBrandText(
                                  cinema.address || cinema.city
                                ) || "Chưa cập nhật"}
                              </p>
                            </div>

                            {active && <Check size={14} className="shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-10 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                        <AlertCircle size={24} className="mx-auto mb-3" />
                        Không tìm thấy rạp
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="py-36 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={30} />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 animate-pulse">
              Đang đồng bộ ưu đãi
            </p>
          </div>
        ) : promotions.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {promotions.map((promotion) => {
              const cleanContent = cleanHtmlText(promotion.content);
              const hasDiscount =
                Number(promotion?.voucher?.discountValue || 0) > 0;

              const thumbnail = promotion.thumbnail
                ? getImageUrl(promotion.thumbnail)
                : "https://placehold.co/900x520/0b1020/f4d419?text=KN+Event";

              return (
                <article
                  key={promotion.id}
                  className="group relative bg-[#0d1222] border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-300/35 transition-all duration-300 flex flex-col shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-300/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="h-44 relative overflow-hidden bg-[#080c1b] border-b border-white/10">
                    <img
                      src={thumbnail}
                      alt={promotion.title}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/900x520/0b1020/f4d419?text=KN+Event";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/92 via-[#0b1020]/20 to-transparent" />

                    {hasDiscount && (
                      <div className="absolute top-3 right-3 bg-yellow-300 text-[#111827] text-[10px] font-black px-3 py-1.5 rounded-xl shadow-[0_16px_36px_rgba(244,212,25,0.22)] inline-flex items-center gap-1">
                        <BadgePercent size={12} />
                        -
                        {Number(
                          promotion.voucher.discountValue
                        ).toLocaleString("vi-VN")}
                        đ
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#080c1b]/85 border border-white/10 backdrop-blur">
                      <span className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
                        Promotion
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="w-5 h-[2px] bg-yellow-300 rounded-full" />

                      <span className="text-[8px] font-black text-yellow-300 uppercase tracking-[0.16em]">
                        KN Cinema Event
                      </span>
                    </div>

                    <h3 className="text-sm font-black uppercase mb-2 line-clamp-2 tracking-[0.02em] leading-snug text-white group-hover:text-yellow-200 transition-colors min-h-[38px]">
                      {promotion.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-3 mb-5 font-medium leading-relaxed min-h-[50px]">
                      {cleanContent || "Thông tin ưu đãi đang được cập nhật."}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] text-slate-600 gap-3">
                        <span className="inline-flex items-center gap-1 truncate">
                          <Calendar size={11} className="text-cyan-300 shrink-0" />
                          {formatDate(promotion.createdAt)}
                        </span>

                        {promotion?.voucher?.code && (
                          <span className="text-yellow-300 truncate max-w-[110px]">
                            {promotion.voucher.code}
                          </span>
                        )}
                      </div>

                      <Link href={`/events/${promotion.id}`} className="block no-underline">
                        <button className="w-full h-11 bg-[#080c1b] border border-white/10 text-slate-300 text-[10px] font-black uppercase rounded-xl hover:bg-yellow-300 hover:border-yellow-200 hover:text-[#111827] transition-all flex items-center justify-center gap-2 tracking-[0.13em] active:scale-95">
                          Chi tiết
                          <ChevronRight size={13} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="py-28 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-3xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Gift size={50} className="mx-auto text-slate-600" />

            <h3 className="mt-5 text-2xl font-black uppercase text-white">
              Chưa có ưu đãi
            </h3>

            <p className="text-slate-500 mt-3 text-sm font-semibold">
              Rạp này hiện chưa có sự kiện hoặc chương trình khuyến mãi nào.
            </p>

            <button
              onClick={fetchPromotions}
              className="mt-6 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Tải lại
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
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

function MiniInfo({
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
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <p className="text-xs font-black text-white truncate mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}