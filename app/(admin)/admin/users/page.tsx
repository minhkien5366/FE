"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  User,
  Mail,
  Ticket,
  ChevronRight,
  Sparkles,
  Users,
  WalletCards,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";
import { apiAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function TrangQuanLyKhachHang() {
  const [danhSachKhach, setDanhSachKhach] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const layDuLieu = async () => {
    try {
      setDangTai(true);

      const res = await apiAdminRequest("/api/v1/tickets");
      const ketQua = await res.json();

      if (res.ok && Array.isArray(ketQua.data)) {
        const mapKhachHang = new Map();

        ketQua.data.forEach((ticket: any) => {
          const user = ticket.user;

          if (user?.userId) {
            if (!mapKhachHang.has(user.userId)) {
              mapKhachHang.set(user.userId, {
                ...user,
                count: 0,
                total: 0,
                first: ticket.createdAt || new Date().toISOString(),
              });
            }

            const current = mapKhachHang.get(user.userId);
            current.count += 1;
            current.total += Number(ticket.price) || 0;
          }
        });

        setDanhSachKhach(Array.from(mapKhachHang.values()));
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      toast.error("Lỗi đồng bộ dữ liệu!");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const filtered = useMemo(() => {
    return danhSachKhach.filter((khach) =>
      `${khach.firstName || ""} ${khach.lastName || ""} ${khach.email || ""}`
        .toLowerCase()
        .includes(tuKhoaTimKiem.toLowerCase())
    );
  }, [danhSachKhach, tuKhoaTimKiem]);

  const tongVe = useMemo(() => {
    return filtered.reduce((sum, khach) => sum + Number(khach.count || 0), 0);
  }, [filtered]);

  const tongChi = useMemo(() => {
    return filtered.reduce((sum, khach) => sum + Number(khach.total || 0), 0);
  }, [filtered]);

  const formatMoney = (value: number) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";

    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
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
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Users size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Quản lý thành viên
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                KHÁCH HÀNG{" "}
                <span className="text-yellow-300">HỆ THỐNG</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                KN Cinema Management • dữ liệu giao dịch và thành viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />

              <input
                type="text"
                placeholder="Tìm tên, email khách hàng..."
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs focus:border-cyan-300/45 focus:bg-[#111827] outline-none transition-all placeholder:text-slate-600 text-white shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
              />
            </div>

            <button
              onClick={layDuLieu}
              className="w-12 h-12 bg-[#0d1222] border border-white/10 rounded-2xl hover:bg-[#111827] hover:border-yellow-300/35 transition-all active:scale-95 shrink-0 flex items-center justify-center shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
              aria-label="Làm mới dữ liệu"
            >
              <RefreshCw
                size={16}
                className={
                  dangTai
                    ? "animate-spin text-yellow-300"
                    : "text-slate-500 hover:text-yellow-300"
                }
              />
            </button>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
              <Users size={18} className="text-yellow-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Khách đang hiển thị
              </p>

              <p className="text-sm font-black text-white">
                {filtered.length.toLocaleString("vi-VN")} thành viên
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center">
              <Ticket size={18} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Tổng vé đã mua
              </p>

              <p className="text-sm font-black text-white">
                {tongVe.toLocaleString("vi-VN")} vé
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-300/10 border border-emerald-300/25 flex items-center justify-center">
              <CircleDollarSign size={18} className="text-emerald-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Tổng chi tiêu
              </p>

              <p className="text-sm font-black text-white">
                {formatMoney(tongChi)}
              </p>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="rounded-2xl bg-[#0d1222] border border-white/10 overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="hidden md:flex items-center px-5 py-3 bg-[#080c1b] border-b border-white/10 text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
            <div className="w-16">ID</div>
            <div className="flex-1">Thông tin thành viên</div>
            <div className="w-28 text-center">Gia nhập</div>
            <div className="w-24 text-center">Số vé</div>
            <div className="w-36 text-right">Tổng chi</div>
            <div className="w-10" />
          </div>

          {dangTai ? (
            <div className="py-32 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-300" size={28} />
              </div>

              <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Đang bóc tách dữ liệu
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filtered.map((khach) => (
                <div
                  key={khach.userId}
                  className="group flex items-center px-4 md:px-5 py-4 bg-[#0d1222] hover:bg-[#111827] transition-all duration-300 cursor-pointer"
                >
                  <div className="hidden md:block w-16 text-[11px] font-black text-slate-600 group-hover:text-yellow-300 transition-colors tracking-tighter">
                    #{khach.userId}
                  </div>

                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-300/35 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                      {khach.avatar ? (
                        <img
                          src={khach.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User
                          size={17}
                          className="text-slate-500 group-hover:text-cyan-300 transition-colors"
                        />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-xs md:text-sm font-black text-slate-100 uppercase tracking-[0.04em] truncate group-hover:text-yellow-200 transition-colors">
                        {khach.firstName} {khach.lastName}
                      </p>

                      <div className="flex items-center gap-1.5 opacity-80">
                        <Mail size={10} className="text-cyan-300 shrink-0" />
                        <p className="text-[10px] text-slate-500 font-medium truncate tracking-normal">
                          {khach.email || "Chưa cập nhật email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-28 hidden md:flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                    <CalendarDays size={10} />
                    {formatDate(khach.first)}
                  </div>

                  <div className="w-24 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111827] border border-white/10 rounded-full group-hover:border-cyan-300/35">
                      <Ticket
                        size={10}
                        className="text-slate-500 group-hover:text-cyan-300"
                      />

                      <span className="text-[10px] font-black text-slate-300 group-hover:text-cyan-200">
                        {khach.count}
                      </span>
                    </div>
                  </div>

                  <div className="w-32 md:w-36 text-right">
                    <p className="text-xs md:text-sm font-black text-yellow-300 tracking-tight">
                      {formatMoney(Number(khach.total) || 0)}
                    </p>
                  </div>

                  <div className="w-9 md:w-10 flex justify-end">
                    <div className="w-7 h-7 rounded-lg bg-[#111827] border border-white/10 flex items-center justify-center text-slate-600 group-hover:text-[#111827] group-hover:bg-yellow-300 group-hover:border-yellow-200 transition-all group-hover:translate-x-0.5">
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl m-5 bg-[#080c1b]">
              <Users className="mx-auto text-slate-600 mb-4" size={38} />

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Không tìm thấy dữ liệu thành viên
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}