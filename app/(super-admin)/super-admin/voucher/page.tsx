"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Ticket,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  Lock,
  Gift,
  Sparkles,
  Coins,
  RefreshCw,
  CheckCircle2,
  X,
  AlertTriangle,
  Users,
  WalletCards,
  Mail,
  User,
} from "lucide-react";

import { apiSuperAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import VoucherModal from "./VoucherModal";

export interface Voucher {
  id: number;
  code: string;
  title: string;
  description?: string;
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  endDate: string;
  voucherType: "EVENT" | "REDEEM";
  costPoints?: number;
  promotion?: {
    id: number;
    title: string;
  };
}

interface UserItem {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  points?: number;
  roles?: any[];
}

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

export default function AdminVoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rewardForm, setRewardForm] = useState({
    email: "",
    points: 0,
  });

  const [rewardError, setRewardError] = useState("");

  useEffect(() => {
    fetchVouchers();
    fetchUsers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/vouchers");

      if (!res.ok) {
        toast.error("Không thể tải danh sách voucher", adminToast);
        return;
      }

      const json = await res.json();
      setVouchers(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      toast.error("Lỗi kết nối database", adminToast);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/users");
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Không tải được users", adminToast);
        return;
      }

      const rawUsers = result?.data?.content || [];

      const filteredUsers = rawUsers.filter((user: any) => {
        if (!Array.isArray(user.roles)) return false;

        return user.roles.some((role: any) => {
          const roleName = role?.name || role?.roleName || role?.authority || role;

          return String(roleName).toUpperCase() === "ROLE_USER";
        });
      });

      setUsers(filteredUsers);
    } catch (error) {
      toast.error("Lỗi tải danh sách user", adminToast);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenModal = (voucher: Voucher | null = null) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const method = selectedVoucher ? "PUT" : "POST";
      const url = selectedVoucher
        ? `/api/v1/vouchers/${selectedVoucher.id}`
        : "/api/v1/vouchers";

      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setTimeout(() => {
          fetchVouchers();
        }, 300);
      }

      return res;
    } catch (error) {
      console.error("Lỗi kết nối hệ thống:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;

    if (selectedVoucher.usedCount > 0) {
      toast.error("Voucher đã được sử dụng, không thể xóa", adminToast);
      return;
    }

    const toastId = toast.loading("Đang xóa voucher...", adminToast);

    setIsSubmitting(true);

    try {
      const res = await apiSuperAdminRequest(
        `/api/v1/vouchers/${selectedVoucher.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(result.message || "Không thể xóa", {
          id: toastId,
          ...adminToast,
        });

        return;
      }

      toast.success("Đã xóa voucher", {
        id: toastId,
        ...adminToast,
      });

      fetchVouchers();
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error("Lỗi hệ thống", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRewardPoints = async () => {
    if (!rewardForm.email) {
      toast.error("Vui lòng chọn user", adminToast);
      return;
    }

    if (rewardForm.points <= 0) {
      setRewardError("Số điểm thưởng phải lớn hơn 0");
      toast.error("Số điểm phải lớn hơn 0", adminToast);
      return;
    }

    const toastId = toast.loading("Đang cộng điểm thưởng...", adminToast);

    setIsSubmitting(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/vouchers/reward-points", {
        method: "POST",
        body: JSON.stringify(rewardForm),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Tặng điểm thất bại", {
          id: toastId,
          ...adminToast,
        });

        return;
      }

      toast.success("Đã tặng điểm thành công", {
        id: toastId,
        ...adminToast,
      });

      setRewardForm({
        email: "",
        points: 0,
      });

      setRewardError("");
      setUserSearch("");
      setIsRewardModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Lỗi hệ thống", {
        id: toastId,
        ...adminToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("vi-VN");
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const keyword =
        voucher.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = filterType === "ALL" || voucher.voucherType === filterType;

      return keyword && typeMatch;
    });
  }, [vouchers, searchTerm, filterType]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.toLowerCase().trim();

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = user.email?.toLowerCase() || "";

      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [users, userSearch]);

  const redeemCount = useMemo(() => {
    return vouchers.filter((voucher) => voucher.voucherType === "REDEEM").length;
  }, [vouchers]);

  const eventCount = useMemo(() => {
    return vouchers.filter((voucher) => voucher.voucherType === "EVENT").length;
  }, [vouchers]);

  const totalUsed = useMemo(() => {
    return vouchers.reduce((sum, voucher) => sum + Number(voucher.usedCount || 0), 0);
  }, [vouchers]);

  const selectedRewardUser = useMemo(() => {
    return users.find((user) => user.email === rewardForm.email);
  }, [users, rewardForm.email]);

  const getVoucherTypeBadge = (voucher: Voucher) => {
    if (voucher.voucherType === "REDEEM") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-300/10 border border-yellow-300/25 text-yellow-300 text-[8px] font-black uppercase tracking-[0.12em]">
          <Gift size={10} />
          Đổi điểm
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-300/10 border border-cyan-300/25 text-cyan-300 text-[8px] font-black uppercase tracking-[0.12em]">
        <Sparkles size={10} />
        Sự kiện
      </div>
    );
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
              <Ticket size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Voucher Control Center
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                TRUNG TÂM <span className="text-yellow-300">VOUCHER</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Quản lý voucher sự kiện, voucher đổi điểm và điểm thưởng
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-yellow-300/25 hover:border-yellow-300/45 text-yellow-300 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            >
              <Gift size={15} />
              Tặng điểm
            </button>

            <button
              onClick={fetchVouchers}
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
              onClick={() => handleOpenModal(null)}
              className="h-12 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<Ticket size={18} />}
            title="Tổng voucher"
            value={`${vouchers.length.toLocaleString("vi-VN")} mã`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Sparkles size={18} />}
            title="Voucher sự kiện"
            value={`${eventCount.toLocaleString("vi-VN")} mã`}
            theme="cyan"
          />

          <SummaryCard
            icon={<Gift size={18} />}
            title="Voucher đổi điểm"
            value={`${redeemCount.toLocaleString("vi-VN")} mã`}
            theme="emerald"
          />

          <SummaryCard
            icon={<WalletCards size={18} />}
            title="Đã sử dụng"
            value={`${totalUsed.toLocaleString("vi-VN")} lượt`}
            theme="amber"
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
              size={15}
            />

            <input
              type="text"
              placeholder="Tìm kiếm mã voucher, tiêu đề..."
              className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)] uppercase"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            className="h-12 bg-[#0d1222] border border-white/10 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white outline-none focus:border-cyan-300/45 focus:bg-[#111827] cursor-pointer [color-scheme:dark]"
          >
            <option value="ALL">Tất cả voucher</option>
            <option value="EVENT">Voucher sự kiện</option>
            <option value="REDEEM">Voucher đổi điểm</option>
          </select>
        </section>

        <section className="bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden relative min-h-[520px] shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                <Ticket size={15} className="text-yellow-300" />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Bảng dữ liệu voucher
                </h3>

                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {filteredVouchers.length.toLocaleString("vi-VN")} kết quả đang hiển thị
                </p>
              </div>
            </div>

            {!loading && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-300/10 border border-emerald-300/25 px-3 py-1.5">
                <CheckCircle2 size={12} className="text-emerald-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                  Ready
                </span>
              </div>
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 bg-[#0b1020]/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={28} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Đang đồng bộ voucher
              </p>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10 text-[9px] font-black uppercase text-slate-500 tracking-[0.13em]">
                  <th className="py-4 px-6">Voucher</th>
                  <th className="py-4 px-4">Loại</th>
                  <th className="py-4 px-4">Giảm giá</th>
                  <th className="py-4 px-4">Đổi điểm</th>
                  <th className="py-4 px-4">Sử dụng</th>
                  <th className="py-4 px-4">Hết hạn</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-[11px]">
                {filteredVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-[#111827] group transition-all"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-slate-600 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-all">
                          <Hash size={14} />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <p className="font-black tracking-[0.04em] text-white uppercase truncate">
                            #{voucher.code}
                          </p>

                          <p className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[240px]">
                            {voucher.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">{getVoucherTypeBadge(voucher)}</td>

                    <td className="py-4 px-4 font-black text-yellow-300 tracking-tight">
                      {voucher.discountValue < 100
                        ? `-${voucher.discountValue}%`
                        : `-${formatCurrency(voucher.discountValue)}`}
                    </td>

                    <td className="py-4 px-4">
                      {voucher.voucherType === "REDEEM" ? (
                        <span className="text-cyan-300 font-black">
                          {voucher.costPoints || 0} điểm
                        </span>
                      ) : (
                        <span className="text-slate-700 font-black">---</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#080c1b] border border-white/10 rounded-lg text-slate-300 font-black">
                        {voucher.usedCount}/{voucher.usageLimit}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[10px] font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={11} className="text-cyan-300" />
                        {formatDate(voucher.endDate)}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(voucher)}
                          className="w-9 h-9 inline-flex items-center justify-center bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 hover:text-yellow-300 rounded-xl transition-all active:scale-90"
                          title="Chỉnh sửa voucher"
                        >
                          <Edit3 size={14} />
                        </button>

                        {voucher.usedCount > 0 ? (
                          <button
                            disabled
                            className="w-9 h-9 inline-flex items-center justify-center bg-[#080c1b] border border-white/5 text-slate-700 rounded-xl cursor-not-allowed"
                            title="Voucher đã sử dụng, không thể xóa"
                          >
                            <Lock size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setDeleteModalOpen(true);
                            }}
                            className="w-9 h-9 inline-flex items-center justify-center bg-[#080c1b] border border-white/10 hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all active:scale-90"
                            title="Xóa voucher"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredVouchers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-24 text-center text-[10px] font-black uppercase text-slate-500 tracking-[0.18em]"
                    >
                      <AlertCircle size={36} className="mx-auto text-slate-600 mb-4" />
                      Không tìm thấy voucher phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <VoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedVoucher}
        isSubmitting={isSubmitting}
      />

      {isDeleteModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => !isSubmitting && setDeleteModalOpen(false)}
          />

          <div className="relative bg-[#0b1020] border border-white/10 p-7 rounded-2xl max-w-sm w-full text-center shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.06] blur-3xl rounded-full" />

            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={isSubmitting}
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
                Xóa voucher?
              </h3>

              <p className="text-[11px] text-slate-500 mt-2 font-semibold leading-relaxed">
                Voucher{" "}
                <span className="text-yellow-300 font-black">
                  #{selectedVoucher.code}
                </span>{" "}
                sẽ bị xóa khỏi hệ thống nếu chưa phát sinh sử dụng.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-11 bg-[#111827] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-40"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="h-11 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(244,63,94,0.22)]"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRewardModalOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => {
              if (isSubmitting) return;

              setIsRewardModalOpen(false);
              setRewardError("");
            }}
          />

          <div className="relative bg-[#0b1020] border border-white/10 p-7 md:p-8 rounded-2xl max-w-md w-full shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
            <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 bg-yellow-300/[0.045] blur-3xl rounded-full" />
            <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 bg-cyan-300/[0.035] blur-3xl rounded-full" />

            <button
              onClick={() => {
                setIsRewardModalOpen(false);
                setRewardError("");
              }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all disabled:opacity-40"
            >
              <X size={16} />
            </button>

            <div className="relative z-10">
              <div className="text-center mb-7">
                <div className="w-16 h-16 mx-auto bg-yellow-300/10 border border-yellow-300/25 rounded-2xl flex items-center justify-center text-yellow-300 mb-4 shadow-[0_18px_45px_rgba(244,212,25,0.12)]">
                  <Gift size={30} />
                </div>

                <h2
                  className="text-2xl font-black text-white uppercase tracking-[-0.045em]"
                  style={{
                    fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  }}
                >
                  Tặng điểm thưởng
                </h2>

                <p className="text-[10px] uppercase font-black text-slate-500 mt-2 tracking-[0.16em]">
                  Cộng điểm trực tiếp cho tài khoản
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] px-1">
                    Chọn người dùng
                  </label>

                  <div className="relative group">
                    <Search
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-300 transition-colors"
                    />

                    <input
                      type="text"
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Tìm theo tên hoặc email..."
                      className="w-full bg-[#0d1222] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-xs font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <select
                    value={rewardForm.email}
                    onChange={(event) =>
                      setRewardForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="w-full bg-[#0d1222] border border-white/10 p-3.5 rounded-xl text-white font-bold text-xs outline-none focus:border-yellow-300/45 focus:bg-[#111827] transition-all [color-scheme:dark]"
                  >
                    <option value="">
                      {loadingUsers ? "Đang tải..." : "Chọn từ danh sách kết quả"}
                    </option>

                    {filteredUsers.map((user) => (
                      <option key={user.userId} value={user.email}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>

                  {selectedRewardUser && (
                    <div className="rounded-xl bg-[#080c1b] border border-white/10 p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center text-cyan-300">
                        <User size={14} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-white uppercase truncate">
                          {selectedRewardUser.firstName} {selectedRewardUser.lastName}
                        </p>

                        <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 truncate">
                          <Mail size={10} />
                          {selectedRewardUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] px-1">
                    Số điểm cộng
                  </label>

                  <div className="relative">
                    <Coins
                      size={14}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        rewardError ? "text-rose-300" : "text-yellow-300"
                      }`}
                    />

                    <input
                      type="number"
                      min={1}
                      value={rewardForm.points || ""}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        setRewardForm((prev) => ({
                          ...prev,
                          points: value,
                        }));

                        if (value <= 0) {
                          setRewardError("Số điểm thưởng phải lớn hơn 0");
                        } else {
                          setRewardError("");
                        }
                      }}
                      placeholder="Nhập số điểm..."
                      className={`w-full bg-[#0d1222] border p-3.5 pl-11 rounded-xl text-white font-black outline-none transition-all placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        rewardError
                          ? "border-rose-400/50 focus:border-rose-300"
                          : "border-white/10 focus:border-yellow-300/45 focus:bg-[#111827]"
                      }`}
                    />
                  </div>

                  {rewardError && (
                    <div className="flex items-center gap-1.5 text-[10px] text-rose-300 font-bold px-1 mt-1 animate-pulse">
                      <AlertCircle size={12} />
                      <span>{rewardError}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRewardPoints}
                  disabled={isSubmitting || !!rewardError}
                  className="w-full h-13 bg-yellow-300 hover:bg-yellow-200 active:scale-[0.98] disabled:bg-[#111827] disabled:text-slate-600 text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Gift size={15} />
                      Xác nhận cộng điểm
                    </>
                  )}
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