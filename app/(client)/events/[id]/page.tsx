"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  BookmarkCheck,
  Gift,
  Zap,
  Calendar,
  Clock,
  Sparkles,
  BadgePercent,
  ShieldCheck,
  CheckCircle2,
  Copy,
  X,
  AlertTriangle,
  Ticket,
  PartyPopper,
} from "lucide-react";
import { apiRequest, BASE_URL } from "@/app/lib/api";
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const getUserToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_user") || "";
    }

    return "";
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatCurrency = (value: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không giới hạn";

    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = getUserToken();

      const requests: Promise<Response>[] = [
        apiRequest(`/api/v1/promotions/${params.id}`),
        apiRequest(`/api/v1/vouchers/promotion/${params.id}`),
      ];

      if (token) {
        requests.push(
          apiRequest(`/api/v1/vouchers/my-vouchers`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        );
      }

      const responses = await Promise.all(requests);

      const eventJson = await responses[0].json().catch(() => ({}));
      if (responses[0].ok) setEvent(eventJson.data || eventJson);

      const voucherJson = await responses[1].json().catch(() => ({}));
      if (responses[1].ok) {
        const rawVoucher = voucherJson?.data?.content || voucherJson?.data || [];
        setVouchers(Array.isArray(rawVoucher) ? rawVoucher : []);
      }

      if (token && responses[2]?.ok) {
        const myVouchersJson = await responses[2].json().catch(() => ({}));
        const myVoucherList =
          myVouchersJson?.data?.content || myVouchersJson?.data || [];

        if (Array.isArray(myVoucherList)) {
          setSavedIds(
            myVoucherList.map((voucher: any) =>
              Number(voucher?.voucherId || voucher?.voucher?.id || voucher?.id)
            )
          );
        }
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết sự kiện:", err);
      toast.error("Lỗi kết nối dữ liệu máy chủ", userToast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchData();
  }, [params.id]);

  const handleSaveVoucher = async (voucherId: number) => {
    const token = getUserToken();

    if (!token) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá", userToast);
      router.push("/auth");
      return;
    }

    setIsSavingId(voucherId);

    try {
      const res = await apiRequest(`/api/v1/vouchers/save/${voucherId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        setSavedIds((prev) => [...prev, voucherId]);
        toast.success("Đã lưu mã ưu đãi thành công", userToast);
      } else {
        toast.error(result?.message || "Không thể lưu voucher này", userToast);
      }
    } catch (err) {
      toast.error("Lỗi đường truyền mạng, thử lại sau", userToast);
    } finally {
      setIsSavingId(null);
    }
  };

  const handleCopyCode = async (code?: string) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Đã sao chép mã voucher", userToast);
    } catch {
      toast.error("Không thể sao chép mã", userToast);
    }
  };

  const heroImage = event?.thumbnail
    ? getImageUrl(event.thumbnail)
    : "https://placehold.co/1600x700/0b1020/f4d419?text=KN+Event";

  const savedCount = useMemo(() => savedIds.length, [savedIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-4">
        <Toaster position="top-right" toastOptions={userToast} />

        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-300" size={30} />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 animate-pulse">
          Đang tải chi tiết sự kiện
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 pb-20 font-sans antialiased selection:bg-yellow-300 selection:text-[#111827] relative overflow-hidden">
      <Toaster position="top-right" toastOptions={userToast} />

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      <section className="relative h-[48vh] min-h-[360px] w-full overflow-hidden bg-[#0b1020] border-b border-white/10">
        <img
          src={heroImage}
          alt={event?.title || "KN Event"}
          className="w-full h-full object-cover opacity-40 brightness-75 scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/1600x700/0b1020/f4d419?text=KN+Event";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/96 via-[#070b14]/60 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-5 md:left-8 w-11 h-11 flex items-center justify-center bg-[#0d1222]/80 backdrop-blur-md rounded-xl border border-white/10 text-slate-300 hover:border-yellow-300/35 hover:text-yellow-300 hover:bg-[#111827] transition-all z-50 shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute left-5 md:left-8 bottom-14 z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-yellow-300/10 border border-yellow-300/25">
            <Sparkles size={11} className="text-yellow-300" />

            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-200">
              KN Cinema Promotion
            </span>
          </div>

          <h1
            className="text-[34px] md:text-[64px] font-black uppercase tracking-[-0.06em] text-white leading-[0.94]"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            {event?.title || "Sự kiện KN Cinema"}
          </h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 md:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <section className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoCard
                icon={<Calendar size={16} />}
                label="Ngày đăng"
                value={formatDate(event?.createdAt)}
                theme="yellow"
              />

              <InfoCard
                icon={<Gift size={16} />}
                label="Voucher"
                value={`${vouchers.length.toLocaleString("vi-VN")} mã`}
                theme="cyan"
              />

              <InfoCard
                icon={<BookmarkCheck size={16} />}
                label="Đã lưu"
                value={`${savedCount.toLocaleString("vi-VN")} mã`}
                theme="emerald"
              />
            </div>

            {event?.movie && (
              <div className="rounded-2xl bg-yellow-300/10 border border-yellow-300/25 p-4 flex items-center gap-3">
                <Ticket size={18} className="text-yellow-300 shrink-0" />

                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-yellow-100">
                  Phim áp dụng:{" "}
                  <span className="text-white">{event.movie.title}</span>
                </p>
              </div>
            )}

            <article className="relative overflow-hidden bg-[#0d1222] border border-white/10 p-6 md:p-9 rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
              <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-cyan-300/[0.035] blur-3xl rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-12 h-[2px] bg-yellow-300" />

                  <h2 className="text-[10px] font-black uppercase tracking-[0.34em] text-yellow-300">
                    Nội dung chương trình
                  </h2>
                </div>

                <div
                  className="text-slate-300 text-sm md:text-base leading-relaxed prose prose-invert max-w-none 
                    prose-headings:text-white prose-headings:font-black prose-headings:uppercase
                    prose-p:text-slate-400 prose-strong:text-white prose-a:text-yellow-300 hover:prose-a:text-yellow-200
                    prose-li:text-slate-400 prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
                  dangerouslySetInnerHTML={{
                    __html:
                      event?.content ||
                      "<p>Nội dung sự kiện đang được cập nhật.</p>",
                  }}
                />
              </div>
            </article>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5 bg-[#0d1222] border border-white/10 p-5 rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.32)] overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-yellow-300/[0.04] blur-3xl rounded-full" />

              <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300">
                    <BadgePercent size={18} />
                  </div>

                  <div>
                    <h2 className="text-[11px] font-black uppercase text-white tracking-[0.14em]">
                      Voucher sẵn có
                    </h2>

                    <p className="text-[9px] text-slate-600 font-bold mt-1">
                      Lưu mã vào ví ưu đãi của bạn
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid gap-3 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {vouchers.length > 0 ? (
                  vouchers.map((voucher) => {
                    const isSaved = savedIds.includes(Number(voucher.id));
                    const isSaving = isSavingId === voucher.id;

                    return (
                      <div
                        key={voucher.id}
                        className={`relative overflow-hidden flex items-center justify-between bg-[#080c1b] border rounded-2xl p-4 transition-all ${
                          isSaved
                            ? "border-emerald-300/25 bg-emerald-300/10"
                            : "border-white/10 hover:border-cyan-300/35 hover:bg-[#111827]"
                        }`}
                      >
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                              CODE:
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCopyCode(voucher.code)}
                              className="text-[10px] font-black text-yellow-300 uppercase truncate hover:text-yellow-200 transition-colors inline-flex items-center gap-1"
                            >
                              {voucher.code || "KN-VOUCHER"}
                              <Copy size={10} />
                            </button>
                          </div>

                          <div className="text-2xl font-black text-white tracking-tight">
                            {voucher.discountValue
                              ? voucher.discountValue > 100
                                ? formatCurrency(voucher.discountValue)
                                : `${Math.round(voucher.discountValue * 100)}%`
                              : "Ưu đãi đặc biệt"}
                          </div>

                          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                            <Clock size={10} className="text-cyan-300" />
                            <span>Hạn: {formatDate(voucher.endDate)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSaveVoucher(voucher.id)}
                          disabled={isSaved || isSaving}
                          className={`ml-4 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] rounded-xl transition-all flex items-center justify-center min-w-[76px] active:scale-95 ${
                            isSaved
                              ? "bg-emerald-300/10 border border-emerald-300/25 text-emerald-300 cursor-not-allowed"
                              : "bg-yellow-300 text-[#111827] hover:bg-yellow-200 shadow-[0_16px_36px_rgba(244,212,25,0.2)]"
                          }`}
                        >
                          {isSaving ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : isSaved ? (
                            <BookmarkCheck size={15} />
                          ) : (
                            "Lấy"
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-[#080c1b]">
                    <Gift className="mx-auto text-slate-600 mb-3" size={26} />

                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.16em]">
                      Chưa có mã ưu đãi nào
                    </p>
                  </div>
                )}
              </div>

              <div className="relative z-10 bg-cyan-300/10 p-4 rounded-2xl border border-cyan-300/20 flex items-start gap-3">
                <ShieldCheck size={15} className="text-cyan-300 shrink-0 mt-0.5" />

                <p className="text-[10px] text-cyan-100/80 leading-relaxed font-bold">
                  Khuyến mãi chỉ áp dụng cho tài khoản thành viên khi thanh toán
                  trực tuyến. Số lượng mã phát hành có hạn theo từng chương trình.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

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

function InfoCard({
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
    <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <p className="text-xs font-black text-white truncate mt-1">{value}</p>
      </div>
    </div>
  );
}