"use client";

import React, { useState } from "react";
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
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);

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
    <>
      {/* SPACER: giữ chỗ để nội dung không chui xuống dưới sidebar fixed */}
      <div
        aria-hidden="true"
        className={`shrink-0 transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-[100] h-screen bg-[#0b1020] border-r border-white/10 flex flex-col overflow-hidden shadow-[14px_0_38px_rgba(0,0,0,0.22)] transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* LOGO + TOGGLE */}
        <div
          className={`h-[76px] px-5 flex items-center shrink-0 border-b border-white/10 ${
            isOpen ? "justify-between gap-3" : "justify-center"
          }`}
        >
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className={`items-center gap-3 min-w-0 cursor-pointer group ${
              isOpen ? "flex flex-1" : "hidden"
            }`}
          >
            <div className="relative shrink-0">
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
          </button>

          {!isOpen && (
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="relative w-10 h-10 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:border-yellow-300/35 transition-all"
              title="KN Admin"
            >
              <Film size={19} />
            </button>
          )}

          {isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl bg-[#0d1222] border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-300 hover:border-yellow-300/35 hover:bg-[#111827] transition-all active:scale-95 shrink-0"
              aria-label="Thu gọn sidebar"
              title="Thu gọn"
            >
              <Menu size={17} />
            </button>
          )}
        </div>

        {!isOpen && (
          <div className="px-3 pt-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full h-11 rounded-xl bg-[#0d1222] border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-300 hover:border-yellow-300/35 hover:bg-[#111827] transition-all active:scale-95"
              aria-label="Mở rộng sidebar"
              title="Mở rộng"
            >
              <Menu size={17} />
            </button>
          </div>
        )}

        {/* NAV */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-5">
          {isOpen && (
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.18em] px-3 mb-3">
              Danh mục quản lý
            </p>
          )}

          {danhSachMenu.map((link) => {
            const dangKichHoat =
              pathname.startsWith(link.href) &&
              (link.href !== "/admin" || pathname === "/admin");

            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                title={!isOpen ? link.name : undefined}
                className={`flex items-center rounded-xl transition-all duration-300 group ${
                  isOpen
                    ? "justify-between px-3 py-3"
                    : "justify-center px-0 py-3"
                } ${
                  dangKichHoat
                    ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                    : "text-slate-500 hover:bg-[#111827] hover:text-slate-100"
                }`}
              >
                <div
                  className={`flex items-center min-w-0 ${
                    isOpen ? "gap-3" : "gap-0"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      dangKichHoat
                        ? "text-[#111827] shrink-0"
                        : "group-hover:text-cyan-300 transition-colors shrink-0"
                    }
                  />

                  {isOpen && (
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate">
                      {link.name}
                    </span>
                  )}
                </div>

                {isOpen && dangKichHoat && (
                  <ChevronRight size={12} className="shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM */}
        <div className="p-3 mt-auto border-t border-white/10 shrink-0 bg-[#0b1020]">
          {isOpen ? (
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
          ) : (
            <button
              onClick={xuLyDangXuat}
              title="Đăng xuất hệ thống"
              className="w-full h-11 rounded-xl bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all flex items-center justify-center active:scale-95"
            >
              <LogOut size={15} />
            </button>
          )}
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
    </>
  );
}