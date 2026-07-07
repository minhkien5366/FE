"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Film,
  Users,
  MapPin,
  LogOut,
  Search,
  Menu,
  Zap,
  BarChart3,
  Fingerprint,
  Ticket,
  Tag,
  Box,
  CalendarDays,
  ShoppingBag,
  Layers,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { apiSuperAdminRequest } from "@/app/lib/api";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    const targetKeys = ["token_super_admin", "roles"];

    targetKeys.forEach((key) => {
      localStorage.removeItem(key);
      Cookies.remove(key, { path: "/" });
    });

    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token_super_admin");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        const adminRes = await apiSuperAdminRequest("/api/v1/users/me");

        if (adminRes.ok) {
          const data = await adminRes.json();
          setAdminInfo(data.data?.user || data.data);
        } else if (adminRes.status === 401 || adminRes.status === 403) {
          handleLogout();
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu hệ thống:", error);
      }
    };

    fetchData();
  }, [handleLogout]);

  const MENU_ITEMS = [
    {
      label: "Tổng quan",
      icon: <LayoutDashboard size={16} />,
      href: "/super-admin",
    },
    {
      label: "Thể loại phim",
      icon: <Layers size={16} />,
      href: "/super-admin/genre",
    },
    {
      label: "Phim ảnh",
      icon: <Film size={16} />,
      href: "/super-admin/movie",
    },
    {
      label: "Hệ thống rạp",
      icon: <MapPin size={16} />,
      href: "/super-admin/cinema",
    },
    {
      label: "Lịch chiếu",
      icon: <CalendarDays size={16} />,
      href: "/super-admin/showtime",
    },
    {
      label: "Sự kiện & Ưu đãi",
      icon: <Tag size={16} />,
      href: "/super-admin/event",
    },
    {
      label: "Voucher",
      icon: <Zap size={16} />,
      href: "/super-admin/voucher",
    },
    {
      label: "Banner quảng cáo",
      icon: <BarChart3 size={16} />,
      href: "/super-admin/banner",
    },
    {
      label: "Quản lý đơn hàng",
      icon: <ShoppingBag size={16} />,
      href: "/super-admin/order",
    },
    {
      label: "Người dùng",
      icon: <Users size={16} />,
      href: "/super-admin/user",
    },
    {
      label: "Giá vé & Ghế",
      icon: <Ticket size={16} />,
      href: "/super-admin/seat-price",
    },
    {
      label: "Combo bắp nước",
      icon: <Box size={16} />,
      href: "/super-admin/food-combo",
    },
    {
      label: "Thống kê doanh thu",
      icon: <BarChart3 size={16} />,
      href: "/super-admin/analytic",
    },
  ];

  const adminName = adminInfo
    ? `${adminInfo.firstName || ""} ${adminInfo.lastName || ""}`.trim()
    : "SUPER ROOT";

  const adminRole = Array.isArray(adminInfo?.roles)
    ? (
        adminInfo.roles[0]?.roleName ||
        adminInfo.roles[0] ||
        "SUPER_ADMIN"
      )
        .replace("ROLE_", "")
        .replaceAll("_", " ")
    : "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-300 flex font-sans overflow-hidden select-none antialiased relative">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="pointer-events-none fixed top-[-220px] left-1/2 -translate-x-1/2 w-[980px] h-[420px] bg-white/[0.025] blur-[180px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-[260px] right-[-220px] w-[620px] h-[620px] bg-cyan-400/[0.025] blur-[170px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-[-220px] left-[-220px] w-[620px] h-[620px] bg-yellow-300/[0.018] blur-[170px] rounded-full z-0" />

      {/* SIDEBAR */}
      <aside
        className={`h-screen sticky top-0 transition-all duration-300 flex flex-col border-r border-white/10 bg-[#0b1020] shrink-0 z-40 shadow-[14px_0_38px_rgba(0,0,0,0.22)] ${
          isSidebarOpen ? "w-[272px]" : "w-20"
        }`}
      >
        {/* LOGO */}
        <div
          className={`px-5 py-6 flex items-center gap-3 shrink-0 cursor-pointer border-b border-white/10 ${
            isSidebarOpen ? "justify-start" : "justify-center"
          }`}
          onClick={() => router.push("/super-admin")}
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-yellow-300 blur-md opacity-20 transition-opacity" />

            <div className="relative w-10 h-10 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-yellow-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <Fingerprint size={19} className="animate-pulse" />
            </div>
          </div>

          {isSidebarOpen && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-white font-black uppercase tracking-tight text-base leading-none">
                KN <span className="text-yellow-300">Root</span>
              </span>

              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider mt-1">
                Executive Control
              </span>
            </div>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 w-full px-3 space-y-1 overflow-y-auto hide-scrollbar py-5">
          <p
            className={`text-[8px] font-black text-slate-600 uppercase tracking-[0.18em] px-3 mb-3 ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            Điều hướng hệ thống
          </p>

          {MENU_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/super-admin" && pathname.startsWith(item.href));

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                title={!isSidebarOpen ? item.label : undefined}
                className={`w-full flex items-center rounded-xl transition-all duration-300 group relative text-left ${
                  isSidebarOpen
                    ? "gap-3 px-3 py-3 justify-between"
                    : "justify-center px-0 py-3"
                } ${
                  active
                    ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                    : "text-slate-500 hover:bg-[#111827] hover:text-slate-100"
                }`}
              >
                <div
                  className={`flex items-center min-w-0 ${
                    isSidebarOpen ? "gap-3" : "gap-0"
                  }`}
                >
                  <span
                    className={`transition-colors shrink-0 ${
                      active
                        ? "text-[#111827]"
                        : "text-slate-500 group-hover:text-cyan-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {isSidebarOpen && (
                    <span className="text-[10px] font-black uppercase tracking-[0.09em] truncate animate-in fade-in duration-150">
                      {item.label}
                    </span>
                  )}
                </div>

                {isSidebarOpen && active && (
                  <ChevronRight size={12} className="shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="w-full px-3 pb-4 shrink-0 border-t border-white/10 pt-3 bg-[#0b1020]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-slate-400 hover:bg-rose-600 hover:text-white transition-all group text-left active:scale-95 ${
              isSidebarOpen
                ? "gap-3 px-3 py-3 justify-start"
                : "justify-center px-0 py-3"
            }`}
          >
            <LogOut
              size={16}
              className="shrink-0 group-hover:-translate-x-0.5 transition-transform"
            />

            {isSidebarOpen && (
              <span className="text-[9px] font-black uppercase tracking-[0.13em]">
                Thoát hệ thống
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen">
        {/* TOPBAR */}
        <header className="h-20 px-5 md:px-8 flex items-center justify-between border-b border-white/10 bg-[#0b1020]/95 backdrop-blur-xl shrink-0 sticky top-0 z-30 shadow-[0_14px_38px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-yellow-300/35 text-slate-400 hover:text-yellow-300 rounded-xl transition-all active:scale-95"
              aria-label="Thu gọn menu"
            >
              <Menu size={17} />
            </button>

            <div className="relative max-w-md w-full group hidden md:block">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
              />

              <input
                type="text"
                placeholder="Tra cứu log hệ thống, mã rạp, token..."
                className="w-full h-11 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all text-white placeholder:text-slate-600 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1222] border border-white/10">
              <Sparkles size={12} className="text-yellow-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Root Console
              </span>
            </div>

            <div className="h-7 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase tracking-wide leading-none">
                  {adminName || "SUPER ROOT"}
                </p>

                <div className="flex items-center justify-end gap-1 mt-1.5">
                  <ShieldCheck size={10} className="text-yellow-300" />

                  <p className="text-[8px] text-yellow-300 font-black tracking-wider uppercase">
                    {adminRole}
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#101829] border border-white/10 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.22)] flex-shrink-0 hover:border-cyan-300/45 transition-all">
                <img
                  src={
                    adminInfo?.avatar ||
                    "https://ui-avatars.com/api/?name=Super+Admin&background=111827&color=f4d419"
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto hide-scrollbar relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}