"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Copy,
  History,
  Ticket,
  X,
  CheckCircle2,
  Wallet,
  CalendarDays,
  BadgePercent,
  CircleDollarSign,
  Gift,
  Flame,
  Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiRequest } from "@/app/lib/api";

const isNotExpired = (voucher: any) => {
  if (!voucher.endDate) return true;
  return new Date(voucher.endDate).getTime() >= new Date().getTime();
};

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [marketVouchers, setMarketVouchers] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  const [userInfo, setUserInfo] = useState({
    points: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "market">("my");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const showToastError = (message: string) => {
    toast.error(message);
  };

  const showToastSuccess = (message: string) => {
    toast.success(message);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token_user") : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes, voucherRes, marketRes] = await Promise.all([
        apiRequest("/api/v1/users/me", { headers }),
        apiRequest("/api/v1/vouchers/my-vouchers", { headers }),
        apiRequest("/api/v1/vouchers/redeemable", { headers }),
      ]);

      const [userJson, voucherJson, marketJson] = await Promise.all([
        userRes.json(),
        voucherRes.json(),
        marketRes.json(),
      ]);

      setUserInfo({
        points: Number(userJson.data?.points || 0),
      });

      setVouchers(Array.isArray(voucherJson.data) ? voucherJson.data : []);
      setMarketVouchers(
        Array.isArray(marketJson.data) ? marketJson.data : []
      );
    } catch (error) {
      console.error(error);
      showToastError("Không thể tải dữ liệu mã giảm giá!");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenHistory = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token_user") : null;

    try {
      const res = await apiRequest("/api/v1/vouchers/point-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      setPointHistory(Array.isArray(json.data) ? json.data : []);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error("Lỗi:", error);
      showToastError("Không thể tải lịch sử điểm!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validMyVouchers = vouchers.filter(isNotExpired);
  const validMarketVouchers = marketVouchers.filter(isNotExpired);

  return (
    <div className="min-h-screen bg-transparent text-white px-4 sm:px-6 lg:px-24 xl:px-40 py-10 md:py-12 relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#0b1020",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
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
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-[980px] mx-auto space-y-7 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
              <Sparkles size={11} className="text-yellow-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                Thành viên KN
              </span>
            </div>

            <h1
              className="text-[34px] md:text-[52px] font-black uppercase tracking-[-0.05em] leading-none text-white"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              }}
            >
              MÃ GIẢM GIÁ
            </h1>

            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.18em] mt-2">
              Quản lý voucher và đổi điểm thưởng
            </p>
          </div>

          <button
            onClick={handleOpenHistory}
            className="h-11 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-300 hover:text-cyan-200 flex items-center gap-2.5 transition-all duration-300 shadow-[0_16px_34px_rgba(0,0,0,0.24)] text-[10px] font-black uppercase tracking-[0.14em] active:scale-95"
          >
            <History
              size={15}
              className="text-yellow-300 transition-transform group-hover:rotate-[-15deg]"
            />
            Lịch sử điểm
          </button>
        </div>

        {/* POINT CARD */}
        <div className="relative overflow-hidden bg-[#0d1222] border border-[#182038] rounded-2xl p-6 md:p-7 shadow-[0_18px_50px_rgba(0,0,0,0.28)] group">
          <div className="pointer-events-none absolute top-[-80px] right-[-80px] w-72 h-72 bg-yellow-300/[0.055] blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="pointer-events-none absolute bottom-[-120px] left-[-80px] w-64 h-64 bg-cyan-300/[0.04] blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500 font-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                Tài khoản tích điểm
              </p>

              <div className="flex items-end gap-3">
                <span className="text-5xl md:text-6xl font-black tracking-tight text-yellow-300 leading-none">
                  {userInfo.points.toLocaleString("vi-VN")}
                </span>

                <span className="text-xs font-black uppercase tracking-widest text-slate-400 pb-1">
                  Điểm thưởng
                </span>
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center shadow-[0_16px_34px_rgba(244,212,25,0.1)]">
              <Wallet size={27} className="text-yellow-300" />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-[#0b1020] border border-white/10 p-1 rounded-2xl shadow-[0_16px_34px_rgba(0,0,0,0.24)]">
          {(["my", "market"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                activeTab === tab
                  ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                  : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827]"
              }`}
            >
              {tab === "my" ? "Kho voucher của tôi" : "Đổi quà thưởng"}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={28} />
              </div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
                Đang tải dữ liệu
              </p>
            </div>
          ) : activeTab === "my" ? (
            validMyVouchers.length > 0 ? (
              validMyVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onCopySuccess={showToastSuccess}
                  onCopyError={showToastError}
                />
              ))
            ) : (
              <EmptyState message="Kho mã trống. Hãy tích điểm để đổi nhiều ưu đãi hấp dẫn nhé." />
            )
          ) : validMarketVouchers.length > 0 ? (
            validMarketVouchers.map((voucher) => {
              const alreadyOwned = vouchers.some(
                (myVoucher) =>
                  myVoucher.id === voucher.id ||
                  myVoucher.code === voucher.code ||
                  myVoucher.title === voucher.title
              );

              return (
                <MarketCard
                  key={voucher.id}
                  voucher={voucher}
                  balance={userInfo.points}
                  onRedeem={fetchData}
                  alreadyOwned={alreadyOwned}
                  onSuccess={showToastSuccess}
                  onError={showToastError}
                />
              );
            })
          ) : (
            <EmptyState message="Chợ quà thưởng hiện đang đóng hoặc đã hết quà." />
          )}
        </div>
      </div>

      {/* HISTORY MODAL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-[#020617]/88 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0b1020] border border-white/10 rounded-2xl p-6 shadow-[0_28px_80px_rgba(0,0,0,0.58)] relative overflow-hidden">
            <div className="pointer-events-none absolute top-[-90px] left-[-70px] w-56 h-56 bg-cyan-300/[0.04] blur-3xl rounded-full" />
            <div className="pointer-events-none absolute bottom-[-90px] right-[-70px] w-56 h-56 bg-yellow-300/[0.04] blur-3xl rounded-full" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <History size={16} className="text-yellow-300" />
                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">
                  Biến động điểm
                </h3>
              </div>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-all active:scale-95"
                aria-label="Đóng lịch sử điểm"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar relative z-10">
              {pointHistory.length > 0 ? (
                pointHistory.map((history: any) => {
                  const typeStr = String(history.type || "").toUpperCase();
                  const isAddType =
                    typeStr.includes("ADD") ||
                    typeStr.includes("EARN") ||
                    typeStr.includes("REWARD") ||
                    typeStr.includes("REFUND");
                  const isMinusType =
                    typeStr.includes("DEDUCT") ||
                    typeStr.includes("USE") ||
                    typeStr.includes("REDEEM") ||
                    typeStr.includes("SUB");

                  let isPositive = true;

                  if (isAddType) isPositive = true;
                  else if (isMinusType) isPositive = false;
                  else isPositive = Number(history.amount) > 0;

                  return (
                    <div
                      key={history.id}
                      className="bg-[#0d1222] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-[#111827] hover:border-cyan-300/25 transition-all duration-300"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {history.description || "Biến động điểm"}
                        </p>

                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                          {history.createdAt
                            ? new Date(history.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black font-mono shrink-0 ${
                          isPositive ? "text-cyan-300" : "text-rose-300"
                        }`}
                      >
                        {isPositive ? "+" : "-"}
                        {Math.abs(Number(history.amount || 0)).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-600 text-[10px] uppercase tracking-widest font-black">
                  Chưa ghi nhận biến động nào
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function VoucherCard({
  voucher,
  onCopySuccess,
  onCopyError,
}: {
  voucher: any;
  onCopySuccess: (message: string) => void;
  onCopyError: (message: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      onCopySuccess("Đã sao chép mã giảm giá!");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      onCopyError("Không thể sao chép mã!");
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#0d1222] border border-[#182038] hover:border-cyan-300/35 rounded-2xl p-4 md:p-5 transition-all duration-300 group flex gap-4 shadow-[0_16px_34px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(34,211,238,0.1)]">
      <div className="flex flex-col items-center justify-center pr-4 border-r-2 border-dashed border-white/10 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300 shadow-inner">
          <Ticket
            size={22}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {voucher.voucherType && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-[#111827] text-[8px] tracking-wider font-black uppercase text-slate-400 border border-white/10">
            {voucher.voucherType === "TICKET"
              ? "Vé"
              : voucher.voucherType === "FOOD"
                ? "Combo"
                : "Mã giảm"}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-[13px] md:text-sm font-black text-white uppercase tracking-wide truncate group-hover:text-yellow-200 transition-colors">
          {voucher.title}
        </h4>

        {voucher.description && (
          <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed line-clamp-2">
            {voucher.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[9px] md:text-[10px] text-slate-400 pt-1">
          {voucher.discountValue && (
            <div className="flex items-center gap-1 font-black text-yellow-300">
              <CircleDollarSign size={12} />
              Giảm {Number(voucher.discountValue).toLocaleString("vi-VN")}đ
            </div>
          )}

          {voucher.minOrderAmount && (
            <div className="flex items-center gap-1 text-slate-500">
              <BadgePercent size={12} />
              Đơn từ{" "}
              {Number(voucher.minOrderAmount).toLocaleString("vi-VN")}đ
            </div>
          )}

          {voucher.endDate && (
            <div className="flex items-center gap-1 text-slate-600 font-mono">
              <CalendarDays size={11} />
              HSD: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <div className="bg-[#070a12] border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest text-slate-300 select-all group-hover:border-yellow-300/25 transition-colors">
            {voucher.code}
          </div>

          {voucher.usageLimit !== undefined && (
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">
              Còn{" "}
              {Math.max(
                0,
                (voucher.usageLimit || 0) - (voucher.usedCount || 0)
              )}{" "}
              lượt dùng
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#111827] hover:bg-yellow-300 hover:border-yellow-200 transition-all shrink-0 self-center active:scale-95"
        aria-label="Sao chép mã giảm giá"
      >
        {copied ? (
          <CheckCircle2 size={16} className="text-cyan-300" />
        ) : (
          <Copy size={15} />
        )}
      </button>
    </div>
  );
}

function MarketCard({
  voucher,
  balance,
  onRedeem,
  alreadyOwned,
  onSuccess,
  onError,
}: {
  voucher: any;
  balance: number;
  onRedeem: () => void;
  alreadyOwned: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const canAfford = balance >= Number(voucher.costPoints || 0);

  const handleRedeem = async () => {
    if (alreadyOwned || !canAfford || submitting) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token_user");

      const res = await apiRequest(`/api/v1/vouchers/redeem/${voucher.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        onError(errorData?.message || "Không thể đổi mã giảm giá!");
        return;
      }

      onSuccess("Đổi mã giảm giá thành công!");
      onRedeem();
    } catch (error) {
      console.error(error);
      onError("Lỗi kết nối khi đổi mã!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#0d1222] border border-[#182038] hover:border-cyan-300/35 rounded-2xl p-4 md:p-5 transition-all duration-300 group flex gap-4 shadow-[0_16px_34px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(34,211,238,0.1)]">
      <div className="flex flex-col items-center justify-center pr-4 border-r-2 border-dashed border-white/10 shrink-0">
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner ${
            alreadyOwned
              ? "bg-[#111827] text-slate-600 border-white/10"
              : "bg-cyan-300/10 text-cyan-300 border-cyan-300/25"
          }`}
        >
          <Gift size={20} />
        </div>

        {alreadyOwned && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-[#111827] border border-white/10 text-[8px] font-black uppercase tracking-wider text-slate-500">
            Sở hữu
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-[13px] md:text-sm font-black text-white uppercase tracking-wide truncate group-hover:text-yellow-200 transition-colors">
          {voucher.title}
        </h4>

        {voucher.description && (
          <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed line-clamp-2">
            {voucher.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[9px] md:text-[10px] text-slate-400 pt-1">
          {voucher.discountValue && (
            <div className="flex items-center gap-1 font-bold text-slate-400">
              <CircleDollarSign size={12} className="text-yellow-300" />
              Trị giá{" "}
              {Number(voucher.discountValue).toLocaleString("vi-VN")}đ
            </div>
          )}

          {voucher.endDate && (
            <div className="flex items-center gap-1 text-slate-600 font-mono">
              <CalendarDays size={11} />
              Hạn đổi:{" "}
              {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-yellow-300/10 border border-yellow-300/25 text-yellow-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Flame size={12} className="fill-yellow-300/20" />
            {Number(voucher.costPoints || 0).toLocaleString("vi-VN")} Điểm
          </div>

          {voucher.usageLimit !== undefined && (
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">
              Còn{" "}
              {Math.max(
                0,
                (voucher.usageLimit || 0) - (voucher.usedCount || 0)
              )}{" "}
              suất
            </span>
          )}
        </div>
      </div>

      <button
        disabled={!canAfford || submitting || alreadyOwned}
        onClick={handleRedeem}
        className={`shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 h-fit self-center border active:scale-95 ${
          alreadyOwned
            ? "bg-[#111827] border-white/10 text-slate-500 cursor-not-allowed"
            : !canAfford
              ? "bg-[#070a12] border-white/10 text-slate-700 cursor-not-allowed"
              : "bg-yellow-300 hover:bg-yellow-200 text-[#111827] border-yellow-200 shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
        }`}
      >
        {submitting
          ? "..."
          : alreadyOwned
            ? "Đã có"
            : !canAfford
              ? "Thiếu điểm"
              : "Đổi ngay"}
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 text-center space-y-4 max-w-sm mx-auto border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
      <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center mx-auto text-slate-600">
        <Ticket size={24} className="stroke-[1.5]" />
      </div>

      <p className="text-xs font-medium text-slate-500 leading-relaxed px-6">
        {message}
      </p>
    </div>
  );
}