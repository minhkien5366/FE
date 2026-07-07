"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  ChevronRight,
  Hash,
  Ticket,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ReceiptText,
  WalletCards,
  Building2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest } from "@/app/lib/api";

export interface OrderDetail {
  id: number;
  itemType: string;
  itemId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  cinemaItemId: number;
  cinemaName: string;
  orderDetails: OrderDetail[];
  paymentUrl: string;
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

export default function SuperAdminHCMPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiSuperAdminRequest("/api/v1/orders", {
        method: "GET",
      });

      if (response.status === 401 || response.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();

        if (
          result.status === "OK" ||
          result.status === 200 ||
          result.status === 0
        ) {
          setIsAuthorized(true);

          const sorted = (result.data || []).sort(
            (a: Order, b: Order) => Number(b.id || 0) - Number(a.id || 0)
          );

          setOrders(sorted);
        } else {
          setOrders([]);
          setIsAuthorized(true);
        }
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Lỗi kết nối core hệ thống:", error);
      toast.error("Lỗi kết nối core hệ thống", adminToast);
      setIsAuthorized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const layTrangThai = (status: string) => {
    switch (status?.toUpperCase()?.trim()) {
      case "SUCCESS":
      case "PAID":
        return {
          label: "Đã thanh toán",
          className: "text-emerald-300 bg-emerald-300/10 border-emerald-300/25",
          icon: <CheckCircle2 size={11} />,
        };

      case "PENDING":
        return {
          label: "Chờ xử lý",
          className: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
          icon: <Clock size={11} />,
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          label: "Đã hủy",
          className: "text-rose-300 bg-rose-500/10 border-rose-400/25",
          icon: <XCircle size={11} />,
        };

      default:
        return {
          label: status || "Chưa rõ",
          className: "text-slate-400 bg-slate-500/10 border-slate-500/25",
          icon: <AlertTriangle size={11} />,
        };
    }
  };

  const formatMoney = (value?: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "---";

    return new Date(date).toLocaleDateString("vi-VN");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const keyword = searchTerm.toLowerCase().trim();

      return (
        order.id?.toString().includes(keyword) ||
        order.paymentMethod?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword) ||
        order.cinemaName?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, searchTerm]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => ["PAID", "SUCCESS"].includes(order.status?.toUpperCase()))
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [orders]);

  const paidCount = useMemo(() => {
    return orders.filter((order) =>
      ["PAID", "SUCCESS"].includes(order.status?.toUpperCase())
    ).length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter((order) =>
      ["CANCELLED", "CANCELED"].includes(order.status?.toUpperCase())
    ).length;
  }, [orders]);

  const totalItems = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.orderDetails?.length || 0),
      0
    );
  }, [orders]);

  if (isAuthorized === false) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-rose-400/[0.035] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center p-6 text-center select-none relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-400/25 flex items-center justify-center text-rose-300 mb-5 shadow-[0_18px_45px_rgba(244,63,94,0.12)]">
            <ShieldAlert size={38} className="animate-pulse" />
          </div>

          <h1
            className="text-3xl font-black uppercase tracking-[-0.045em] text-white"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            Truy cập bị từ chối
          </h1>

          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.14em] mt-3 max-w-md leading-relaxed">
            Tài khoản không có vai trò [SUPER_ADMIN]. Vui lòng đăng nhập lại
            bằng thực thể cấp cao.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-7 h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase tracking-[0.14em] text-[10px] transition-all active:scale-95 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Đi đến đăng nhập
          </button>
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
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <MapPin size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Transaction Center
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                KHU VỰC{" "}
                <span className="text-yellow-300">HỒ CHÍ MINH</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Hệ thống quản lý giao dịch thực tế • Quyền Super Admin
              </p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
            title="Làm mới dữ liệu"
          >
            <RefreshCcw
              size={14}
              className={loading ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<ReceiptText size={18} />}
            title="Tổng đơn hàng"
            value={`${orders.length.toLocaleString("vi-VN")} đơn`}
            theme="yellow"
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            title="Đã thanh toán"
            value={`${paidCount.toLocaleString("vi-VN")} đơn`}
            theme="cyan"
          />

          <SummaryCard
            icon={<WalletCards size={18} />}
            title="Doanh thu"
            value={formatMoney(totalRevenue)}
            theme="emerald"
          />

          <SummaryCard
            icon={<XCircle size={18} />}
            title="Đã hủy"
            value={`${cancelledCount.toLocaleString("vi-VN")} đơn`}
            theme="rose"
          />
        </section>

        <section className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
            size={15}
          />

          <input
            type="text"
            placeholder="Tìm kiếm mã giao dịch, trạng thái, tên rạp, phương thức thanh toán..."
            className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </section>

        <section className="bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden relative min-h-[560px] shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                <ShoppingBag size={15} className="text-yellow-300" />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Bảng dữ liệu giao dịch
                </h3>

                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {filteredOrders.length.toLocaleString("vi-VN")} kết quả •{" "}
                  {totalItems.toLocaleString("vi-VN")} mục hàng
                </p>
              </div>
            </div>

            {!loading && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-300/10 border border-emerald-300/25 px-3 py-1.5">
                <CheckCircle2 size={12} className="text-emerald-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                  Authorized
                </span>
              </div>
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 bg-[#0b1020]/82 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-yellow-300" size={30} />
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Đang truy xuất giao dịch
                </span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10 text-[9px] font-black uppercase text-slate-500 tracking-[0.13em]">
                  <th className="p-5 pl-8">Mã giao dịch</th>
                  <th className="p-5">Chi nhánh rạp</th>
                  <th className="p-5">Sản phẩm</th>
                  <th className="p-5">Thanh toán</th>
                  <th className="p-5 text-right">Tổng tiền</th>
                  <th className="p-5 text-right pr-8">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: Order) => {
                    const statusInfo = layTrangThai(order.status);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#111827] group transition-all"
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-slate-600 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-colors">
                              <Hash size={14} />
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-black tracking-[0.04em] text-white">
                                #{order.id}
                              </p>

                              <p className="text-[9px] font-bold text-slate-500 uppercase leading-none flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="max-w-[260px]">
                            <p className="text-[11px] font-black uppercase text-slate-300 truncate group-hover:text-yellow-200 transition-colors">
                              {order.cinemaName || "Hệ thống HCM"}
                            </p>

                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.12em] flex items-center gap-1 mt-1">
                              <Building2 size={10} />
                              Cinema Item #{order.cinemaItemId || "N/A"}
                            </p>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#080c1b] border border-white/10 rounded-lg">
                            <Ticket size={11} className="text-cyan-300" />

                            <span className="text-[10px] font-black uppercase text-slate-400">
                              {order.orderDetails?.length || 0} mục hàng
                            </span>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#080c1b] border border-white/10 rounded-lg text-[10px] font-black uppercase text-slate-400">
                            <CreditCard size={11} className="text-yellow-300" />
                            {order.paymentMethod || "Không xác định"}
                          </div>
                        </td>

                        <td className="p-5 text-right space-y-1">
                          <p className="text-sm font-black text-yellow-300 tracking-tight">
                            {formatMoney(order.totalAmount)}
                          </p>

                          <span
                            className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] leading-none px-2 py-1 rounded-lg border ${statusInfo.className}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>

                        <td className="p-5 text-right pr-8">
                          <button
                            onClick={() => router.push(`/super-admin/order/${order.id}`)}
                            className="w-9 h-9 inline-flex items-center justify-center bg-[#080c1b] border border-white/10 hover:border-yellow-300/35 text-slate-500 hover:text-yellow-300 rounded-xl transition-all active:scale-90"
                            title="Chi tiết đơn hàng"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-24 text-center text-[10px] font-black uppercase text-slate-500 tracking-[0.18em]"
                      >
                        <ShoppingBag className="mx-auto text-slate-600 mb-4" size={40} />
                        Không tìm thấy dữ liệu đơn hàng tương thích
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

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
  theme: "yellow" | "cyan" | "emerald" | "rose";
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
    rose: {
      border: "hover:border-rose-400/35",
      icon: "bg-rose-500/10 text-rose-300 border-rose-400/25",
      text: "text-rose-300",
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