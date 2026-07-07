"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  CreditCard,
  Clock,
  Hash,
  MapPin,
  ShoppingBag,
  Calendar,
  QrCode,
  Download,
  Loader2,
  Sparkles,
  ReceiptText,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  WalletCards,
  Package,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest } from "@/app/lib/api";

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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.id;

  const [donHang, setDonHang] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);

  const layChiTietDonHang = useCallback(async () => {
    if (!orderId) return;

    try {
      setDangTai(true);

      const res = await apiSuperAdminRequest(`/api/v1/orders/${orderId}`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Không thể tải dữ liệu đơn hàng");
      }

      setDonHang(json.data || json);
    } catch (error: any) {
      console.error("Lỗi tải chi tiết đơn hàng:", error);
      toast.error(error?.message || "Lỗi tải chi tiết đơn hàng", adminToast);
      setDonHang(null);
    } finally {
      setDangTai(false);
    }
  }, [orderId]);

  useEffect(() => {
    layChiTietDonHang();
  }, [layChiTietDonHang]);

  const layTrangThai = (status: string) => {
    switch (status?.toUpperCase()?.trim()) {
      case "SUCCESS":
      case "PAID":
        return {
          nhan: "Đã thanh toán",
          mau: "text-emerald-300 bg-emerald-300/10 border-emerald-300/25",
          icon: <CheckCircle2 size={14} />,
        };

      case "PENDING":
        return {
          nhan: "Chờ xử lý",
          mau: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
          icon: <Clock size={14} />,
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          nhan: "Đã hủy",
          mau: "text-rose-300 bg-rose-500/10 border-rose-400/25",
          icon: <XCircle size={14} />,
        };

      default:
        return {
          nhan: status || "Chưa rõ",
          mau: "text-slate-400 bg-slate-500/10 border-slate-500/25",
          icon: <AlertTriangle size={14} />,
        };
    }
  };

  const formatMoney = (value?: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "---";

    return new Date(value).toLocaleDateString("vi-VN");
  };

  const formatTime = (value?: string) => {
    if (!value) return "---";

    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const thongTinTrangThai = layTrangThai(donHang?.status);

  const tongSoLuongVatPham = useMemo(() => {
    return (
      donHang?.orderDetails?.reduce(
        (tong: number, vatPham: any) => tong + Number(vatPham.quantity || 0),
        0
      ) || 0
    );
  }, [donHang]);

  const tongTienHang = useMemo(() => {
    return (
      donHang?.orderDetails?.reduce(
        (tong: number, vatPham: any) =>
          tong + Number(vatPham.price || 0) * Number(vatPham.quantity || 0),
        0
      ) || 0
    );
  }, [donHang]);

  const handleExportInvoice = () => {
    toast.success("Đang mở chế độ in hóa đơn", adminToast);
    window.print();
  };

  if (dangTai) {
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
            Đang đồng bộ chi tiết đơn hàng
          </span>
        </div>
      </div>
    );
  }

  if (!donHang) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center text-center gap-4">
          <ReceiptText className="text-slate-600" size={44} />

          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Hệ thống không tìm thấy dữ liệu đơn hàng
          </p>

          <button
            onClick={() => router.back()}
            className="h-11 px-6 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827] print:bg-white print:text-black">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px] print:hidden" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px] print:hidden" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px] print:hidden" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-yellow-300 transition-all text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Trở lại
          </button>

          <button
            onClick={layChiTietDonHang}
            disabled={dangTai}
            className="h-11 px-4 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={dangTai ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ
          </button>
        </div>

        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7 print:border-black/20">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)] print:bg-white print:border-black/20">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl print:hidden" />
              <ReceiptText
                size={26}
                className="text-yellow-300 relative z-10 print:text-black"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 print:border-black/20 print:bg-white">
                <Sparkles size={11} className="text-yellow-300 print:text-black" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300 print:text-black">
                  Transaction Record
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white print:text-black"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CHI TIẾT{" "}
                <span className="text-yellow-300 print:text-black">
                  ĐƠN HÀNG
                </span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2 print:text-black/60">
                <ShieldCheck size={12} className="text-cyan-300 print:text-black" />
                ORDER_ID #{donHang.id}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] ${thongTinTrangThai.mau}`}
          >
            {thongTinTrangThai.icon}

            <span className="text-[10px] font-black uppercase tracking-[0.14em]">
              {thongTinTrangThai.nhan}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 print:grid-cols-4">
          <SummaryCard
            icon={<Hash size={18} />}
            title="Mã hóa đơn"
            value={`#${donHang.id}`}
            theme="yellow"
          />

          <SummaryCard
            icon={<ShoppingBag size={18} />}
            title="Số lượng vật phẩm"
            value={`${tongSoLuongVatPham} mục`}
            theme="cyan"
          />

          <SummaryCard
            icon={<WalletCards size={18} />}
            title="Tạm tính"
            value={formatMoney(tongTienHang)}
            theme="emerald"
          />

          <SummaryCard
            icon={<CreditCard size={18} />}
            title="Tổng thanh toán"
            value={formatMoney(donHang.totalAmount)}
            theme="amber"
          />
        </section>

        <main className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <div className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.32)] print:bg-white print:border-black/20 print:shadow-none">
              <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-80 h-80 bg-yellow-300/[0.035] blur-3xl rounded-full print:hidden" />
              <Hash className="absolute -bottom-10 -right-8 text-white/[0.03] pointer-events-none print:hidden" size={180} />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black text-yellow-300 uppercase tracking-[0.18em] mb-2 print:text-black/60">
                    Hồ sơ giao dịch hệ thống
                  </p>

                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[-0.045em] leading-none text-white print:text-black">
                    Hóa đơn #{donHang.id}
                  </h2>

                  <p className="text-xs text-slate-500 font-bold mt-3 print:text-black/60">
                    Ghi nhận tại {formatDate(donHang.createdAt)} •{" "}
                    {formatTime(donHang.createdAt)}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] mb-1">
                    Tổng thanh toán
                  </p>

                  <p className="text-3xl md:text-4xl font-black text-yellow-300 tracking-tight leading-none print:text-black">
                    {formatMoney(donHang.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1222] border border-white/10 rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,0.32)] overflow-hidden print:bg-white print:border-black/20 print:shadow-none">
              <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3 print:bg-white print:border-black/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center print:border-black/20 print:bg-white">
                    <ShoppingBag
                      size={15}
                      className="text-yellow-300 print:text-black"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white print:text-black">
                      Danh sách vật phẩm
                    </h3>

                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 print:text-black/60">
                      Tổng số lượng: {tongSoLuongVatPham}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-cyan-300/10 border border-cyan-300/25 px-3 py-1.5 print:hidden">
                  <Package size={12} className="text-cyan-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-300">
                    Items
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-5 space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
                {donHang.orderDetails?.length > 0 ? (
                  donHang.orderDetails.map((vatPham: any) => (
                    <div
                      key={vatPham.id}
                      className="flex justify-between items-center gap-4 p-4 bg-[#080c1b] border border-white/10 rounded-2xl group hover:border-cyan-300/35 hover:bg-[#111827] transition-all print:bg-white print:border-black/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-[#0d1222] rounded-xl flex items-center justify-center border border-white/10 text-slate-500 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-colors print:bg-white print:border-black/10 print:text-black">
                          <Ticket size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.04em] leading-none mb-1 text-white group-hover:text-yellow-200 transition-colors truncate print:text-black">
                            {vatPham.itemName || "Vật phẩm chưa xác định"}
                          </p>

                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.13em] print:text-black/60">
                            {vatPham.itemType || "ITEM"} • Đơn giá:{" "}
                            {formatMoney(vatPham.price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase">
                          x{vatPham.quantity || 0}
                        </p>

                        <p className="text-sm font-black text-yellow-300 tracking-tight print:text-black">
                          {formatMoney(
                            Number(vatPham.price || 0) *
                              Number(vatPham.quantity || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#080c1b] print:bg-white print:border-black/20">
                    <ShoppingBag className="mx-auto text-slate-600 mb-4" size={40} />

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Đơn hàng chưa có vật phẩm
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="xl:col-span-4 space-y-5">
            <InfoPanel
              icon={<QrCode size={19} />}
              label="Trạng thái xử lý"
              value={thongTinTrangThai.nhan}
              badgeClass={thongTinTrangThai.mau}
              badgeIcon={thongTinTrangThai.icon}
            />

            <div className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] print:bg-white print:border-black/20 print:shadow-none">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-[0.16em]">
                Thời gian ghi nhận
              </p>

              <div className="grid grid-cols-2 gap-3">
                <MiniBlock
                  icon={<Calendar size={14} />}
                  label="Ngày"
                  value={formatDate(donHang.createdAt)}
                  theme="cyan"
                />

                <MiniBlock
                  icon={<Clock size={14} />}
                  label="Giờ"
                  value={formatTime(donHang.createdAt)}
                  theme="yellow"
                />
              </div>
            </div>

            <div className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 relative overflow-hidden group shadow-[0_18px_50px_rgba(0,0,0,0.26)] print:bg-white print:border-black/20 print:shadow-none">
              <MapPin className="absolute -top-4 -right-4 text-white/[0.035] group-hover:scale-105 transition-transform duration-500 pointer-events-none print:hidden" size={96} />

              <div className="relative z-10">
                <p className="text-[9px] font-black text-cyan-300 uppercase mb-2 tracking-[0.16em] print:text-black/60">
                  Địa điểm áp dụng
                </p>

                <h4 className="text-lg font-black uppercase leading-tight tracking-[0.04em] mb-3 text-white print:text-black">
                  {donHang.cinemaName || "Chưa cập nhật rạp"}
                </h4>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#080c1b] text-slate-400 text-[9px] font-black rounded-lg border border-white/10 print:bg-white print:border-black/20 print:text-black">
                  <Hash size={10} className="text-yellow-300 print:text-black" />
                  ID: {donHang.cinemaItemId || "N/A"}
                </div>
              </div>
            </div>

            <div className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] space-y-4 print:bg-white print:border-black/20 print:shadow-none">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em]">
                  Phương thức thanh toán
                </p>

                <span className="text-[8px] font-black text-emerald-300 bg-emerald-300/10 border border-emerald-300/25 px-2 py-1 rounded-lg uppercase tracking-[0.12em] print:hidden">
                  Bảo mật
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#080c1b] rounded-xl border border-white/10 print:bg-white print:border-black/20">
                <div className="w-9 h-9 bg-[#0d1222] rounded-xl text-yellow-300 border border-white/10 flex items-center justify-center print:bg-white print:border-black/20 print:text-black">
                  <CreditCard size={14} />
                </div>

                <p className="text-xs font-black uppercase tracking-[0.04em] text-white print:text-black">
                  {donHang.paymentMethod || "Không rõ"}
                </p>
              </div>

              <button
                onClick={handleExportInvoice}
                className="w-full h-11 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.24)] print:hidden"
              >
                <Download size={14} />
                Xuất hóa đơn
              </button>
            </div>
          </aside>
        </main>
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

        @media print {
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
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
      className={`rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 print:bg-white print:border-black/20 print:shadow-none ${currentTheme.border}`}
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center print:bg-white print:border-black/20 print:text-black ${currentTheme.icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 print:text-black/60">
          {title}
        </p>

        <p className={`text-sm font-black truncate print:text-black ${currentTheme.text}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoPanel({
  icon,
  label,
  value,
  badgeClass,
  badgeIcon,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badgeClass: string;
  badgeIcon: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:border-cyan-300/25 transition-all shadow-[0_18px_50px_rgba(0,0,0,0.26)] print:bg-white print:border-black/20 print:shadow-none">
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-[0.16em]">
          {label}
        </p>

        <span
          className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.13em] leading-none px-2.5 py-1.5 rounded-lg border ${badgeClass}`}
        >
          {badgeIcon}
          {value}
        </span>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-slate-600 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-all print:bg-white print:border-black/20 print:text-black">
        {icon}
      </div>
    </div>
  );
}

function MiniBlock({
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
    yellow: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
    cyan: "text-cyan-300 bg-cyan-300/10 border-cyan-300/25",
  };

  return (
    <div className="flex items-center gap-2.5 p-3 bg-[#080c1b] border border-white/10 rounded-xl print:bg-white print:border-black/20">
      <div
        className={`w-8 h-8 rounded-lg border flex items-center justify-center print:bg-white print:border-black/20 print:text-black ${themeMap[theme]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.12em]">
          {label}
        </p>

        <p className="text-[10px] font-black text-white truncate print:text-black">
          {value}
        </p>
      </div>
    </div>
  );
}