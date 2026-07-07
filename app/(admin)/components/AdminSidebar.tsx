"use client";

import React from "react";
import {
  LayoutDashboard,
  Monitor,
  Calendar,
  Users,
  Ticket,
  LogOut,
  ShoppingBag,
  Film,
  ChevronRight,
  QrCode,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const danhSachMenu = [
    { name: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
    { name: "Phòng chiếu", icon: Monitor, href: "/admin/rooms" },
    { name: "Lịch chiếu", icon: Calendar, href: "/admin/showtimes" },
    { name: "Quản lý đơn hàng", icon: Ticket, href: "/admin/orders" },
    { name: "Quản lý combo", icon: ShoppingBag, href: "/admin/combos" },
    { name: "Khách hàng", icon: Users, href: "/admin/users" },
    { name: "Quét mã QR", icon: QrCode, href: "/admin/scanner" },
    { name: "Hỗ trợ CSKH", icon: MessageSquare, href: "/admin/chat" },
  ];

  const xuLyDangXuat = () => {
    const keyToken = "token_admin";

    localStorage.removeItem(keyToken);
    localStorage.removeItem("user_info_admin");
    Cookies.remove(keyToken, { path: "/" });

    window.dispatchEvent(new Event("auth-changed"));

    toast.success("Đã đăng xuất phân vùng quản trị!");

    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  return (
    <aside className="w-64 h-screen bg-[#0b1020] border-r border-white/10 flex flex-col sticky top-0 overflow-hidden z-[100] shadow-[14px_0_38px_rgba(0,0,0,0.22)]">
      {/* LOGO */}
      <div
        className="p-6 flex items-center gap-3 shrink-0 group cursor-pointer border-b border-white/10"
        onClick={() => router.push("/admin")}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-300 blur-md opacity-15 group-hover:opacity-30 transition-opacity" />

          <div className="relative w-10 h-10 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center font-black text-yellow-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)] group-hover:border-yellow-300/35 transition-all">
            <Film size={19} />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-white font-black uppercase tracking-tight text-base leading-none">
            KN <span className="text-yellow-300">Admin</span>
          </span>

          <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider mt-1">
            Trung tâm điều hành
          </span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-5">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.18em] px-3 mb-3">
          Danh mục quản lý
        </p>

        {danhSachMenu.map((link) => {
          const dangKichHoat =
            pathname.startsWith(link.href) &&
            (link.href !== "/admin" || pathname === "/admin");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${
                dangKichHoat
                  ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)] translate-x-0.5"
                  : "text-slate-500 hover:bg-[#111827] hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <link.icon
                  size={16}
                  className={
                    dangKichHoat
                      ? "text-[#111827]"
                      : "group-hover:text-cyan-300 transition-colors"
                  }
                />

                <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate">
                  {link.name}
                </span>
              </div>

              {dangKichHoat && (
                <ChevronRight
                  size={12}
                  className="animate-in fade-in slide-in-from-left-1"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="p-3 mt-auto border-t border-white/10 shrink-0 bg-[#0b1020]">
        <div className="p-3.5 bg-[#0d1222] border border-white/10 rounded-xl space-y-3.5 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-300/10 border border-cyan-300/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.75)]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">
                Trạng thái máy chủ
              </span>

              <span className="text-[8px] text-cyan-300 font-black uppercase tracking-wider">
                Đang hoạt động
              </span>
            </div>
          </div>

          <button
            onClick={xuLyDangXuat}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-wider transition-all bg-[#111827] hover:bg-rose-600 border border-white/10 hover:border-rose-500 rounded-lg group active:scale-95"
          >
            <LogOut
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }

        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </aside>
  );
}