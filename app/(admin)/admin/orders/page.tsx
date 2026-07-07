"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Info,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Sparkles,
  Building2,
  WalletCards,
} from "lucide-react";
import { apiAdminRequest } from "@/app/lib/api";

export default function OrderHistoryTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [myCinemaId, setMyCinemaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userRes = await apiAdminRequest("/api/v1/users/me");
        const userData = await userRes.json();

        const cinemaId =
          userData.data?.managedCinemaItemId || userData.data?.cinemaId;

        setMyCinemaId(cinemaId);

        const res = await apiAdminRequest("/api/v1/orders");
        const result = await res.json();

        if (res.ok && result?.data) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu hệ thống:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const cleanStatus = order.status ? order.status.trim() : "";

    let matchesStatus = false;

    if (activeFilter === "ALL") {
      matchesStatus = true;
    } else if (activeFilter === "PAID") {
      matchesStatus = cleanStatus === "PAID" || cleanStatus === "SUCCESS";
    } else {
      matchesStatus = cleanStatus === activeFilter;
    }

    const matchesCinema = myCinemaId
      ? Number(order.cinemaItemId) === Number(myCinemaId)
      : true;

    return matchesStatus && matchesCinema;
  });

  const getStatusInfo = (status: string) => {
    const cleanStatus = status ? status.trim() : "";

    switch (cleanStatus) {
      case "PAID":
      case "SUCCESS":
        return {
          label: "Thành công",
          color: "text-cyan-200 bg-cyan-300/10 border-cyan-300/25",
          icon: <CheckCircle2 size={11} />,
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          label: "Đã hủy",
          color: "text-rose-300 bg-rose-500/10 border-rose-400/25",
          icon: <XCircle size={11} />,
        };

      default:
        return {
          label: "Chờ xử lý",
          color: "text-yellow-300 bg-yellow-300/10 border-yellow-300/25",
          icon: <Clock size={11} />,
        };
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("T")) return "N/A";

    try {
      const [date, time] = dateStr.split("T");
      const [year, month, day] = date.split("-");

      return `${time.substring(0, 5)} - ${day}/${month}/${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  const formatMoney = (value: number) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <Loader2 className="animate-spin text-yellow-300" size={28} />
        </div>

        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Đang đồng bộ giao dịch
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans text-white relative">
      <div className="pointer-events-none absolute top-[-180px] right-[-160px] w-[420px] h-[420px] bg-cyan-400/[0.025] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-160px] w-[420px] h-[420px] bg-yellow-300/[0.018] rounded-full blur-[140px]" />

      {/* HEADER FILTER */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0d1222] p-4 rounded-2xl border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300">
            <Receipt size={18} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 mb-1">
              <Sparkles size={10} className="text-yellow-300" />
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                Admin Transaction
              </span>
            </div>

            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.08em] text-white">
              Giao dịch rạp
            </h2>

            <p className="text-[9px] text-slate-500 font-bold mt-0.5 flex items-center gap-1.5">
              <Building2 size={10} />
              Mã cơ sở hiện tại:{" "}
              <span className="font-black text-yellow-300">
                {myCinemaId || "Tất cả"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex bg-[#080c1b] p-1 rounded-xl border border-white/10 w-full lg:w-auto justify-center overflow-x-auto no-scrollbar">
          {["ALL", "PAID", "PENDING", "CANCELLED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.11em] transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? "bg-yellow-300 text-[#111827] shadow-[0_10px_24px_rgba(244,212,25,0.2)]"
                  : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827]"
              }`}
            >
              {tab === "ALL"
                ? "Tất cả"
                : tab === "PAID"
                  ? "Thành công"
                  : tab === "PENDING"
                    ? "Chờ xử lý"
                    : "Đã hủy"}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
          <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center">
            <WalletCards size={17} className="text-cyan-300" />
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              Tổng đơn lọc
            </p>
            <p className="text-sm font-black text-white">
              {filteredOrders.length.toLocaleString("vi-VN")} đơn
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
          <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
            <CheckCircle2 size={17} className="text-yellow-300" />
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              Hoàn tất
            </p>
            <p className="text-sm font-black text-white">
              {
                filteredOrders.filter(
                  (o) => o.status === "PAID" || o.status === "SUCCESS"
                ).length
              }{" "}
              đơn
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-400/25 flex items-center justify-center">
            <XCircle size={17} className="text-rose-300" />
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              Đã hủy
            </p>
            <p className="text-sm font-black text-white">
              {
                filteredOrders.filter(
                  (o) => o.status === "CANCELLED" || o.status === "CANCELED"
                ).length
              }{" "}
              đơn
            </p>
          </div>
        </div>
      </div>

      {/* ORDER LIST */}
      <div className="relative z-10 grid gap-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const status = getStatusInfo(order.status);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="group flex items-center justify-between p-3.5 bg-[#0d1222] border border-[#182038] rounded-2xl hover:bg-[#111827] hover:border-cyan-300/35 transition-all duration-300 gap-4 shadow-[0_14px_34px_rgba(0,0,0,0.22)] hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 bg-[#080c1b] border border-white/10 rounded-xl flex items-center justify-center text-[11px] font-mono font-black text-slate-400 group-hover:text-yellow-300 group-hover:border-yellow-300/35 transition-colors">
                    #{order.id}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs md:text-sm font-black text-slate-100 truncate uppercase tracking-[0.06em] group-hover:text-yellow-200 transition-colors">
                      {order.cinemaName || "Rạp chưa cập nhật"}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-bold">
                      <span className="flex items-center gap-1 text-cyan-300/90 font-black uppercase tracking-tight">
                        <CreditCard size={9} />
                        {order.paymentMethod || "N/A"}
                      </span>

                      <span className="text-slate-700">•</span>

                      <span className="font-mono">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="space-y-1">
                    <div className="text-xs md:text-sm font-black text-yellow-300 font-mono tracking-tight">
                      {formatMoney(order.totalAmount)}
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <Info
                    size={14}
                    className="text-slate-700 group-hover:text-cyan-300 transition-colors hidden sm:block"
                  />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <Receipt className="mx-auto text-slate-600 mb-4" size={34} />

            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">
              Không có dữ liệu giao dịch
            </p>
          </div>
        )}
      </div>

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