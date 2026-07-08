"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Gift,
  Sparkles,
  Ticket,
  Coins,
  ChevronRight,
  CheckCircle2,
  WalletCards,
  PartyPopper,
  Clock3,
  X,
  Loader2,
  Crown,
  ShieldCheck,
  CalendarDays,
  AlertTriangle,
  BadgePercent,
  RefreshCw,
  UserRound,
  Copy,
  ArrowRight,
} from "lucide-react";

import { apiRequest } from "@/app/lib/api";

type Voucher = {
  id: number;
  code: string;
  title: string;
  description: string;
  discountValue: number;
  minOrderAmount: number;
  costPoints: number;
  endDate?: string;
  voucherType?: string;
  usageLimit?: number;
  usedCount?: number;
};

type UserProfile = {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  points: number;
};

type ToastState = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

const formatMoney = (value?: number) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
};

const formatDate = (value?: string) => {
  if (!value) return "Không giới hạn";

  return new Date(value).toLocaleDateString("vi-VN");
};

export default function MembershipPage() {
  const router = useRouter();

  const [points, setPoints] = useState<number>(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token_user");
  };

  const showToastMessage = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({
        show: true,
        type,
        message,
      });

      window.setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3200);
    },
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/auth");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes, voucherRes, myVoucherRes] = await Promise.all([
        apiRequest("/api/v1/users/me", {
          method: "GET",
          headers,
        }),
        apiRequest("/api/v1/vouchers/redeemable", {
          method: "GET",
          headers,
        }),
        apiRequest("/api/v1/vouchers/my-vouchers", {
          method: "GET",
          headers,
        }),
      ]);

      if (userRes.status === 401 || userRes.status === 403) {
        localStorage.removeItem("token_user");
        router.push("/auth/login");
        return;
      }

      const [userJson, voucherJson, myVoucherJson] = await Promise.all([
        userRes.json().catch(() => ({})),
        voucherRes.json().catch(() => ({})),
        myVoucherRes.json().catch(() => ({})),
      ]);

      const userData = userJson?.data?.user || userJson?.data || {};
      const voucherData = Array.isArray(voucherJson?.data)
        ? voucherJson.data
        : Array.isArray(voucherJson?.data?.content)
          ? voucherJson.data.content
          : [];

      const ownedVouchers = Array.isArray(myVoucherJson?.data)
        ? myVoucherJson.data
        : Array.isArray(myVoucherJson?.data?.content)
          ? myVoucherJson.data.content
          : [];

      setUser(userData);
      setPoints(Number(userData?.points || 0));
      setMyVouchers(ownedVouchers);

      const redeemVouchers = voucherData.filter(
        (voucher: Voucher) =>
          !voucher.voucherType || voucher.voucherType === "REDEEM"
      );

      setVouchers(redeemVouchers);
    } catch (error) {
      console.error(error);
      showToastMessage("error", "Không thể tải dữ liệu thành viên");
    } finally {
      setLoading(false);
    }
  }, [router, showToastMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const redeemVoucher = async (voucher: Voucher) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/auth/login");
        return;
      }

      setRedeemingId(voucher.id);

      const res = await apiRequest(`/api/v1/vouchers/redeem/${voucher.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token_user");
        router.push("/auth/login");
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToastMessage(
          "error",
          json?.message || "Đổi voucher thất bại, vui lòng thử lại"
        );
        return;
      }

      showToastMessage("success", json?.message || "Đổi voucher thành công");
      fetchData();
    } catch (error: any) {
      console.error(error);
      showToastMessage("error", error?.message || "Đổi voucher thất bại");
    } finally {
      setRedeemingId(null);
    }
  };

  const handleCopyCode = async (code?: string) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      showToastMessage("success", "Đã sao chép mã voucher");
    } catch {
      showToastMessage("error", "Không thể sao chép mã");
    }
  };

  const fullName = useMemo(() => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  }, [user]);

  const ownedVoucherIds = useMemo(() => {
    return new Set(
      myVouchers.map((item) =>
        String(item?.voucherId || item?.voucher?.id || item?.id || "")
      )
    );
  }, [myVouchers]);

  const ownedVoucherCodes = useMemo(() => {
    return new Set(
      myVouchers
        .map((item) => String(item?.code || item?.voucher?.code || ""))
        .filter(Boolean)
    );
  }, [myVouchers]);

  const redeemableCount = useMemo(() => {
    return vouchers.filter((voucher) => points >= Number(voucher.costPoints || 0))
      .length;
  }, [vouchers, points]);

  const totalOwned = myVouchers.length;

  const nextVoucher = useMemo(() => {
    const sorted = [...vouchers]
      .filter((voucher) => points < Number(voucher.costPoints || 0))
      .sort(
        (a, b) => Number(a.costPoints || 0) - Number(b.costPoints || 0)
      );

    return sorted[0] || null;
  }, [vouchers, points]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 overflow-hidden relative selection:bg-yellow-300 selection:text-[#111827]">
      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      <section className="relative z-10 overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 text-yellow-300 text-[10px] font-black uppercase tracking-[0.22em]">
                <Sparkles size={13} />
                KN Cinema Rewards
              </div>

              <h1
                className="mt-7 text-[44px] md:text-[74px] font-black uppercase leading-[0.9] tracking-[-0.06em] text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                THÀNH VIÊN{" "}
                <span className="text-yellow-300">KN</span>
              </h1>

              <p className="mt-6 text-slate-400 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                Tích điểm sau mỗi giao dịch, đổi voucher ưu đãi và tận hưởng
                hệ sinh thái quyền lợi dành riêng cho thành viên KN Cinema.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/movies/now"
                  className="group px-7 h-13 rounded-2xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] transition-all duration-300 font-black uppercase text-[11px] tracking-[0.15em] flex items-center gap-2 shadow-[0_18px_45px_rgba(244,212,25,0.24)] active:scale-95 no-underline"
                >
                  <Ticket size={16} />
                  Đặt vé ngay
                  <ChevronRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                <Link
                  href="/discounts"
                  className="px-7 h-13 rounded-2xl border border-white/10 bg-[#0d1222] hover:bg-[#111827] hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 transition-all duration-300 font-black uppercase text-[11px] tracking-[0.14em] flex items-center gap-2 no-underline"
                >
                  <Gift size={15} />
                  Kho voucher
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 mt-11">
                <FeatureBox
                  icon={<Coins size={20} />}
                  title="+1 điểm"
                  sub="10.000 VNĐ"
                  theme="yellow"
                />

                <FeatureBox
                  icon={<Gift size={20} />}
                  title="Voucher"
                  sub="Đổi điểm"
                  theme="cyan"
                />

                <FeatureBox
                  icon={<WalletCards size={20} />}
                  title="Reward"
                  sub="KN Cinema"
                  theme="emerald"
                />
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[450px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1222] p-6 md:p-7 shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
                <div className="pointer-events-none absolute -top-28 -right-28 w-80 h-80 rounded-full bg-yellow-300/[0.055] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-cyan-300/[0.045] blur-3xl" />

                <div className="relative z-10 flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.28em] text-slate-500 font-black">
                      Member Card
                    </p>

                    <h2 className="mt-3 text-2xl md:text-3xl font-black uppercase leading-tight text-white truncate">
                      {fullName || "KN MEMBER"}
                    </h2>

                    <p className="text-slate-500 text-xs mt-2 font-bold truncate">
                      {user?.email || "Cinema Rewards System"}
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_18px_45px_rgba(244,212,25,0.24)] shrink-0">
                    <Crown size={28} />
                  </div>
                </div>

                <div className="relative z-10 mt-10">
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.18em] font-black">
                    Reward Points
                  </p>

                  <h1 className="text-6xl md:text-7xl font-black leading-none mt-2 text-yellow-300 tracking-tight">
                    {points.toLocaleString("vi-VN")}
                  </h1>

                  <p className="mt-4 text-sm text-slate-400 font-semibold">
                    Điểm hiện có trong tài khoản thành viên.
                  </p>
                </div>

                <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
                  <MiniCard
                    icon={<Coins size={18} />}
                    label="Tích điểm"
                    value="+1 / 10K"
                    theme="yellow"
                  />

                  <MiniCard
                    icon={<Gift size={18} />}
                    label="Voucher"
                    value={`${totalOwned} mã`}
                    theme="cyan"
                  />
                </div>

                <div className="relative z-10 mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      className="text-emerald-300 shrink-0 mt-0.5"
                      size={18}
                    />

                    <div>
                      <p className="font-black text-sm text-white">
                        Điểm thưởng tự động
                      </p>

                      <p className="text-emerald-100/75 text-xs mt-1 leading-relaxed font-semibold">
                        Điểm được cộng tự động sau mỗi lần thanh toán thành công.
                      </p>
                    </div>
                  </div>
                </div>

                {nextVoucher && (
                  <div className="relative z-10 mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-yellow-300">
                      Voucher kế tiếp
                    </p>

                    <p className="text-xs text-yellow-100/85 mt-1 font-bold">
                      Cần thêm{" "}
                      <span className="text-white font-black">
                        {Number(nextVoucher.costPoints - points).toLocaleString(
                          "vi-VN"
                        )}
                      </span>{" "}
                      điểm để đổi “{nextVoucher.title}”.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6 mt-20">
            <RewardBlock
              icon={<Ticket size={26} />}
              title="Đặt Vé"
              desc="Đặt vé nhanh chóng và nhận điểm thưởng tự động khi thanh toán thành công."
              theme="yellow"
            />

            <RewardBlock
              icon={<Coins size={26} />}
              title="Tích Điểm"
              desc="Mỗi 10.000 VNĐ tương ứng 1 điểm thưởng trong hệ thống KN Rewards."
              theme="cyan"
            />

            <RewardBlock
              icon={<WalletCards size={26} />}
              title="Đổi Voucher"
              desc="Dùng điểm hiện có để đổi các voucher ưu đãi từ hệ thống."
              theme="emerald"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5">
          <div>
            <p className="text-yellow-300 uppercase tracking-[0.24em] text-[10px] font-black">
              Voucher đổi điểm
            </p>

            <h2
              className="mt-3 text-4xl md:text-5xl font-black uppercase text-white tracking-[-0.05em]"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              }}
            >
              KHO <span className="text-yellow-300">VOUCHER</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="h-11 px-4 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-300 hover:text-cyan-200 font-black uppercase text-[10px] tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-yellow-300" : ""}
              />
              Đồng bộ
            </button>

            <div className="flex items-center gap-3 px-4 h-11 rounded-xl border border-white/10 bg-[#0d1222]">
              <Coins className="text-yellow-300" size={16} />

              <span className="text-[11px] font-black text-slate-200 uppercase tracking-[0.12em]">
                {points.toLocaleString("vi-VN")} điểm
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <SummaryCard
            icon={<Gift size={18} />}
            title="Voucher khả dụng"
            value={`${vouchers.length.toLocaleString("vi-VN")} mã`}
            theme="yellow"
          />

          <SummaryCard
            icon={<WalletCards size={18} />}
            title="Voucher của tôi"
            value={`${totalOwned.toLocaleString("vi-VN")} mã`}
            theme="cyan"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Có thể đổi ngay"
            value={`${redeemableCount.toLocaleString("vi-VN")} mã`}
            theme="emerald"
          />

          <SummaryCard
            icon={<Coins size={18} />}
            title="Điểm hiện có"
            value={points.toLocaleString("vi-VN")}
            theme="amber"
          />
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={30} />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">
              Đang đồng bộ kho voucher
            </p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-28 text-center border border-dashed border-white/10 bg-[#0d1222] rounded-3xl shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Gift size={50} className="mx-auto text-slate-600" />

            <h3 className="mt-5 text-2xl font-black uppercase text-white">
              Chưa có voucher
            </h3>

            <p className="text-slate-500 mt-3 text-sm font-semibold">
              Hiện chưa có voucher redeem trong hệ thống.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {vouchers.map((voucher) => {
              const canRedeem = points >= Number(voucher.costPoints || 0);
              const alreadyOwned =
                ownedVoucherIds.has(String(voucher.id)) ||
                ownedVoucherCodes.has(String(voucher.code));

              const isRedeeming = redeemingId === voucher.id;
              const usedPercent =
                voucher.usageLimit && voucher.usageLimit > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(voucher.usedCount || 0) /
                          Number(voucher.usageLimit || 1)) *
                          100
                      )
                    )
                  : 0;

              return (
                <div
                  key={voucher.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1222] hover:border-cyan-300/35 transition-all duration-300 shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-300/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shadow-[0_16px_36px_rgba(244,212,25,0.2)]">
                        <BadgePercent size={27} />
                      </div>

                      <div className="px-3 py-1 rounded-full bg-cyan-300/10 border border-cyan-300/25 text-cyan-300 text-[9px] font-black uppercase tracking-widest">
                        Redeem
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-black leading-tight line-clamp-2 min-h-[48px] uppercase text-white group-hover:text-yellow-200 transition-colors">
                        {voucher.title}
                      </h3>

                      <p className="mt-2 text-slate-500 text-xs leading-relaxed line-clamp-2 min-h-[36px] font-semibold">
                        {voucher.description}
                      </p>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#080c1b] border border-white/10 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                          Mã voucher
                        </p>

                        <p className="text-[11px] font-black text-yellow-300 uppercase truncate mt-1">
                          {voucher.code || "KN-VOUCHER"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(voucher.code)}
                        className="w-9 h-9 rounded-xl bg-[#0d1222] border border-white/10 text-slate-500 hover:text-cyan-300 hover:border-cyan-300/35 transition-all flex items-center justify-center shrink-0"
                        title="Sao chép mã"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      <VoucherInfoRow
                        label="Giảm giá"
                        value={formatMoney(voucher.discountValue)}
                        highlight
                      />

                      <VoucherInfoRow
                        label="Đổi điểm"
                        value={`${Number(voucher.costPoints || 0).toLocaleString(
                          "vi-VN"
                        )} điểm`}
                      />

                      <VoucherInfoRow
                        label="Đơn tối thiểu"
                        value={formatMoney(voucher.minOrderAmount)}
                      />

                      <VoucherInfoRow
                        label="Hạn sử dụng"
                        value={formatDate(voucher.endDate)}
                      />
                    </div>

                    {voucher.usageLimit ? (
                      <div className="mt-5">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.12em] text-slate-500 mb-2">
                          <span>Lượt dùng</span>
                          <span>
                            {voucher.usedCount || 0}/{voucher.usageLimit}
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-[#080c1b] border border-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-300"
                            style={{
                              width: `${usedPercent}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <button
                      onClick={() => redeemVoucher(voucher)}
                      disabled={!canRedeem || alreadyOwned || isRedeeming}
                      className={`mt-6 w-full h-12 rounded-2xl font-black uppercase tracking-[0.14em] text-[10px] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${
                        alreadyOwned
                          ? "bg-[#111827] border border-white/10 text-slate-600 cursor-not-allowed"
                          : canRedeem
                            ? "bg-yellow-300 hover:bg-yellow-200 text-[#111827] shadow-[0_16px_36px_rgba(244,212,25,0.22)]"
                            : "bg-[#111827] border border-white/10 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {isRedeeming ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : alreadyOwned ? (
                        <CheckCircle2 size={15} />
                      ) : canRedeem ? (
                        <ArrowRight size={15} />
                      ) : (
                        <AlertTriangle size={15} />
                      )}

                      {isRedeeming
                        ? "Đang đổi"
                        : alreadyOwned
                          ? "Đã đổi"
                          : canRedeem
                            ? "Đổi ngay"
                            : "Không đủ điểm"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-5 md:px-8 pb-24 relative z-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1222] p-6 md:p-9 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-yellow-300/[0.05] blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-300 text-[#111827] flex items-center justify-center shrink-0 shadow-[0_18px_45px_rgba(244,212,25,0.24)]">
              <Coins size={30} />
            </div>

            <div className="flex-1">
              <h3
                className="text-3xl md:text-4xl font-black uppercase text-white tracking-[-0.045em]"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                }}
              >
                QUY TẮC <span className="text-yellow-300">TÍCH ĐIỂM</span>
              </h3>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {[
                  "Mỗi 10.000 VNĐ = 1 điểm thưởng.",
                  "Điểm cộng tự động từ hệ thống.",
                  "Voucher redeem bằng điểm thật.",
                  "Không thể đổi điểm thành tiền.",
                  "Voucher có hạn sử dụng riêng.",
                  "Điểm dùng để đổi ưu đãi hấp dẫn.",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-300 font-semibold rounded-2xl bg-[#080c1b] border border-white/10 p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-cyan-300 mt-0.5 shrink-0"
                    />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed top-5 right-5 z-[999] transition-all duration-300 ${
          toast.show
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-4"
        }`}
      >
        <div
          className={`relative overflow-hidden w-[340px] rounded-2xl border backdrop-blur-xl px-5 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.38)] ${
            toast.type === "success"
              ? "bg-[#0b1020]/96 border-emerald-300/25"
              : "bg-[#0b1020]/96 border-rose-400/25"
          }`}
        >
          <button
            onClick={() =>
              setToast((prev) => ({
                ...prev,
                show: false,
              }))
            }
            className="absolute top-3 right-3 text-slate-500 hover:text-white transition"
          >
            <X size={15} />
          </button>

          <div className="relative flex items-center gap-3 pr-6">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-300 text-[#111827]"
                  : "bg-rose-400 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <PartyPopper size={21} />
              ) : (
                <Gift size={19} />
              )}
            </div>

            <div>
              <h4 className="font-black text-sm text-white uppercase tracking-[0.08em]">
                {toast.type === "success" ? "Thành công" : "Thông báo"}
              </h4>

              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed font-semibold">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBox({
  icon,
  title,
  sub,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4 md:p-5 backdrop-blur-xl hover:border-cyan-300/25 transition-all">
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <h4 className="mt-4 font-black text-white text-sm uppercase tracking-[0.06em]">
        {title}
      </h4>

      <p className="text-slate-500 text-xs mt-1 font-semibold">{sub}</p>
    </div>
  );
}

function MiniCard({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: "yellow" | "cyan";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#080c1b] p-4">
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-slate-500 text-[9px] uppercase tracking-[0.16em] font-black">
        {label}
      </p>

      <h4 className="mt-1 text-lg font-black text-white">{value}</h4>
    </div>
  );
}

function RewardBlock({
  icon,
  title,
  desc,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: "bg-yellow-300/10 border-yellow-300/25 text-yellow-300",
    cyan: "bg-cyan-300/10 border-cyan-300/25 text-cyan-300",
    emerald: "bg-emerald-300/10 border-emerald-300/25 text-emerald-300",
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#0d1222] p-7 md:p-8 hover:border-cyan-300/25 transition-all shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div
        className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <h3 className="mt-6 text-2xl font-black uppercase text-white tracking-[-0.03em]">
        {title}
      </h3>

      <p className="mt-4 text-slate-500 text-sm leading-relaxed font-semibold">
        {desc}
      </p>
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

function VoucherInfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 text-xs font-semibold">{label}</span>

      <span
        className={`font-black text-xs text-right ${
          highlight ? "text-yellow-300" : "text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}