"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  Menu,
  ChevronDown,
  X,
  ChevronRight,
  User,
  Ticket,
  Settings,
  CreditCard,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import LiveSearchBar from "../components/home/LiveSearchBar";
import { apiRequest } from "../../lib/api";
import { getTokenByRole, RoleType } from "../../lib/auth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedItem(null);
  }, [pathname]);

  const getCurrentRole = useCallback((): RoleType => {
    if (pathname.startsWith("/super-admin")) return "SUPER_ADMIN";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "USER";
  }, [pathname]);

  const handleClearAuth = useCallback((role: RoleType) => {
    const tokenKey =
      role === "SUPER_ADMIN"
        ? "token_super_admin"
        : role === "ADMIN"
          ? "token_admin"
          : "token_user";

    localStorage.removeItem(tokenKey);
    Cookies.remove(tokenKey, { path: "/" });
    localStorage.removeItem(`user_info_${role.toLowerCase()}`);
    setUser(null);
  }, []);

  const fetchLatestProfile = useCallback(async () => {
    const role = getCurrentRole();
    const token = getTokenByRole(role);

    setLoadingUser(true);

    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const res = await apiRequest("/api/v1/users/me", { method: "GET" }, role);

      if (res.ok) {
        const result = await res.json();
        const rawData = result.data?.user || result.data || result;
        const accountRoles: string[] =
          rawData?.roles?.map((r: any) => r.roleName || r) || [];

        if (
          role === "USER" &&
          !accountRoles.includes("ROLE_USER") &&
          !accountRoles.includes("USER")
        ) {
          setUser(null);
        } else {
          setUser(rawData);
          localStorage.setItem(
            `user_info_${role.toLowerCase()}`,
            JSON.stringify(rawData)
          );
        }
      } else {
        handleClearAuth(role);
      }
    } catch (err) {
      const stored = localStorage.getItem(`user_info_${role.toLowerCase()}`);
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [getCurrentRole, handleClearAuth]);

  useEffect(() => {
    fetchLatestProfile();

    const handleAuthChange = () => fetchLatestProfile();

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [fetchLatestProfile]);

  const handleLogout = () => {
    const currentRole = getCurrentRole();

    handleClearAuth(currentRole);
    window.dispatchEvent(new Event("auth-changed"));

    window.location.href =
      currentRole === "SUPER_ADMIN" || currentRole === "ADMIN" ? "/auth" : "/";
  };

  const isSuperAdmin = user?.roles?.some((r: any) =>
    ["ROLE_SUPER_ADMIN", "SUPER_ADMIN"].includes(r.roleName || r)
  );

  const isAdmin = user?.roles?.some((r: any) =>
    ["ROLE_ADMIN", "ADMIN"].includes(r.roleName || r)
  );

  const navItems = [
    {
      title: "PHIM",
      href: "/",
      submenu: [
        { name: "Phim Đang Chiếu", href: "/movies/now" },
        { name: "Phim Sắp Chiếu", href: "/movies/coming" },
      ],
    },
    {
      title: "RẠP KN",
      submenu: [
        { name: "Tất Cả Các Rạp", href: "/cinema" },
        { name: "Rạp Đặc Biệt (Gold Class)", href: "/cinema/special" },
        { name: "Rạp 3D / Công Nghệ Mới", href: "/cinema/3d" },
      ],
    },
    {
      title: "THÀNH VIÊN",
      submenu: [
        ...(user ? [{ name: "Mã Giảm Giá", href: "/discounts" }] : []),
        { name: "Quyền Lợi Thành Viên", href: "/membership" },
      ],
    },
    { title: "SỰ KIỆN", href: "/events" },
    { title: "COMBO Bắp & Nước", href: "/combos" },
    { title: "GIỚI THIỆU", href: "/about" },
  ];

  const leftNavItems = navItems.slice(0, 2);
  const rightNavItems = navItems.slice(2);

  const renderDesktopNavItem = (
    item: any,
    dropdownAlign: "left" | "right" = "right"
  ) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div key={item.title} className="relative group/menu">
        {hasSubmenu ? (
          <>
            <Link
              href={item.href || "#"}
              className="flex items-center gap-1.5 text-[10px] xl:text-[11px] whitespace-nowrap font-black text-slate-100 hover:text-cyan-200 transition-all tracking-[0.08em] uppercase py-1.5 no-underline group-hover/menu:drop-shadow-[0_0_8px_rgba(103,232,249,0.45)]"
            >
              {item.title}
              <ChevronDown
                size={12}
                className="group-hover/menu:rotate-180 transition-transform duration-300 text-yellow-300"
              />
            </Link>

            <div
              className={`absolute top-full ${
                dropdownAlign === "left" ? "left-0" : "right-0"
              } pt-3 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0 z-[110]`}
            >
              <div className="bg-[#080c1b] border border-white/10 p-2.5 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.65)] min-w-[220px]">
                <div className="flex flex-col gap-1">
                  {item.submenu.map((sub: any) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="text-[9px] font-black text-slate-300 hover:text-yellow-200 hover:bg-[#111827] hover:translate-x-1 transition-all duration-300 uppercase tracking-[0.12em] flex items-center gap-2.5 group/item no-underline px-3 py-2.5 rounded-xl"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full scale-0 group-hover/item:scale-100 transition-transform" />
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <Link
            href={item.href || "#"}
            className="flex items-center gap-1.5 text-[10px] xl:text-[11px] whitespace-nowrap font-black text-slate-100 hover:text-cyan-200 transition-all tracking-[0.08em] uppercase py-1.5 no-underline"
          >
            {item.title}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="w-full z-[999] relative">
      <header
        className={`w-full transition-all duration-500 bg-[#0b1020]/95 backdrop-blur-xl border-b border-white/10 ${
          isScrolled
            ? "fixed top-0 left-0 shadow-[0_14px_38px_rgba(0,0,0,0.38)]"
            : "relative"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-7 lg:px-10">
          <div className="flex items-center justify-between py-2 md:py-2.5 border-b border-white/10">
            <Link
              href="/"
              className="flex items-center group shrink-0 no-underline overflow-visible"
            >
              <span className="inline-flex items-center overflow-visible px-1 py-0.5 text-3xl md:text-[46px] font-[1000] leading-none tracking-[-0.08em] italic transition-transform group-hover:scale-105 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-yellow-300 drop-shadow-[0_0_14px_rgba(255,255,255,0.16)]">
                KN
              </span>

              <span className="text-[10px] md:text-sm text-slate-100 font-[1000] tracking-[0.22em] uppercase mt-0.5 md:mt-1 ml-0.5">
                Cinema
              </span>
            </Link>

            <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5">
              <Link
                href="/movies/now"
                className="hidden lg:flex items-center gap-1.5 mr-5 xl:mr-8 shrink-0 relative z-[1] bg-[#f4d419] hover:bg-[#ffea3d] text-[#111827] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.11em] transition-all shadow-[0_12px_30px_rgba(244,212,25,0.22)] hover:shadow-[0_16px_36px_rgba(244,212,25,0.32)]"
              >
                <Ticket size={14} />
                Đặt vé ngay
              </Link>

              <div className="hidden md:block w-[240px] lg:w-[280px] xl:w-[320px] [&_input]:!h-9 [&_input]:!text-[11px] [&_button]:!h-9">
                <LiveSearchBar />
              </div>

              <div className="hidden sm:flex items-center h-full">
                {loadingUser ? (
                  <div className="flex items-center gap-2 opacity-70">
                    <Loader2 size={14} className="animate-spin text-cyan-300" />
                  </div>
                ) : user ? (
                  <div className="relative group h-full flex items-center z-[110]">
                    <div className="flex items-center gap-2 cursor-pointer select-none rounded-xl px-1.5 py-1 bg-[#0d1222] border border-white/10 hover:border-cyan-300/40 transition-all">
                      <div className="flex flex-col items-end leading-none gap-0.5">
                        <span className="text-[10px] font-black text-slate-100 group-hover:text-cyan-200 transition-all uppercase tracking-[0.1em] italic">
                          {user.lastName} {user.firstName}
                        </span>

                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase border bg-[#111827] text-slate-300 border-white/10">
                          {isSuperAdmin
                            ? "Super Admin"
                            : isAdmin
                              ? "System Admin"
                              : "Hội viên"}
                        </span>
                      </div>

                      <div className="w-8 h-8 bg-[#101829] border border-white/10 rounded-xl overflow-hidden group-hover:border-cyan-300/60 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.22)]">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-cyan-700 to-yellow-500">
                            <span className="text-[10px] font-black">
                              {user.firstName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronDown
                        size={12}
                        className="text-slate-300 group-hover:text-cyan-200 group-hover:rotate-180 transition-all duration-300"
                      />
                    </div>

                    <div className="absolute right-0 top-[100%] pt-3 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="bg-[#080c1b] border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
                        <div className="p-2 space-y-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#080c1b] hover:bg-[#111827] transition-all text-slate-300 hover:text-cyan-200"
                          >
                            <Settings size={13} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Tài khoản
                            </span>
                          </Link>

                          <Link
                            href="/ticket"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#080c1b] hover:bg-[#111827] transition-all text-slate-300 hover:text-yellow-200"
                          >
                            <Ticket size={13} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Vé của tôi
                            </span>
                          </Link>

                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#080c1b] hover:bg-[#111827] transition-all text-slate-300 hover:text-yellow-200"
                          >
                            <CreditCard size={13} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Đơn hàng
                            </span>
                          </Link>

                          {(isAdmin || isSuperAdmin) && (
                            <Link
                              href={isSuperAdmin ? "/super-admin" : "/admin"}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#080c1b] hover:bg-[#1b1230] transition-all text-purple-200 hover:text-white"
                            >
                              <ShieldCheck size={13} />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                Bảng quản trị
                              </span>
                            </Link>
                          )}
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111827] hover:bg-rose-600 text-slate-300 hover:text-white transition-all border-t border-white/10"
                        >
                          <LogOut size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">
                            Đăng xuất
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center gap-1.5 text-slate-200 hover:text-cyan-200 transition-all text-[10px] font-black uppercase tracking-[0.1em] group"
                  >
                    <div className="p-1.5 bg-[#0d1222] rounded-full border border-white/10 group-hover:border-cyan-300/50 group-hover:bg-[#111827] transition-all">
                      <User size={13} />
                    </div>
                    Đăng nhập
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-slate-200 p-2 bg-[#0d1222] border border-white/10 rounded-xl hover:bg-[#111827] hover:text-white transition-all shrink-0"
                aria-label="Mở menu"
              >
                <Menu size={19} />
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-between py-2">
            <div className="flex items-center gap-6 xl:gap-7">
              {leftNavItems.map((item) => renderDesktopNavItem(item, "left"))}
            </div>

            <div className="flex items-center gap-6 xl:gap-7">
              {rightNavItems.map((item) => renderDesktopNavItem(item, "right"))}
            </div>
          </nav>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-[#050914]/82 backdrop-blur-md z-[200] lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-[85vw] sm:w-[340px] bg-[#0b1020] border-l border-white/10 z-[210] lg:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.45)] ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <span className="flex items-center overflow-visible">
            <span className="inline-flex items-center overflow-visible px-1 py-0.5 text-3xl font-[1000] leading-none tracking-[-0.08em] italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-yellow-300 drop-shadow-[0_0_14px_rgba(255,255,255,0.16)]">
              KN
            </span>

            <span className="text-[10px] text-slate-300 ml-0.5 tracking-[0.24em] uppercase font-black">
              CINEMA
            </span>
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-[#111827] hover:bg-rose-600 rounded-xl transition-all text-slate-200 hover:text-white border border-white/10"
            aria-label="Đóng menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar">
          <div className="mb-5 sm:hidden border-b border-white/10 pb-5">
            {!user ? (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 bg-[#f4d419] hover:bg-[#ffea3d] text-[#111827] py-3 rounded-xl font-black uppercase text-xs w-full"
              >
                <User size={15} />
                Đăng Nhập / Đăng Ký
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0d1222] border border-white/10">
                  <img
                    src={
                      user.avatar ||
                      "https://ui-avatars.com/api/?name=" + user.firstName
                    }
                    className="w-10 h-10 rounded-full border border-cyan-300/50 object-cover"
                    alt="avatar"
                  />

                  <div>
                    <p className="text-xs font-black text-white uppercase">
                      {user.lastName} {user.firstName}
                    </p>
                    <p className="text-[9px] text-cyan-200 font-bold">
                      Thành viên KN Cinema
                    </p>
                  </div>
                </div>

                <Link
                  href="/ticket"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[#111827] text-yellow-200 py-2.5 rounded-lg text-xs font-black uppercase mt-1 border border-white/10 transition-all"
                >
                  <Ticket size={14} />
                  Vé của tôi
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 bg-[#111827] text-slate-200 hover:bg-rose-600 hover:text-white py-2 rounded-lg text-xs font-bold uppercase border border-white/10 transition-all"
                >
                  <LogOut size={14} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {navItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.title} className="border-b border-white/10 last:border-0">
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() =>
                        setMobileExpandedItem(
                          mobileExpandedItem === item.title ? null : item.title
                        )
                      }
                      className="w-full flex justify-between items-center py-3.5 text-[11px] font-black text-slate-100 tracking-[0.16em] uppercase hover:text-cyan-200 transition-colors"
                    >
                      {item.title}
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-300 ${
                          mobileExpandedItem === item.title
                            ? "rotate-180 text-yellow-300"
                            : "text-slate-500"
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        mobileExpandedItem === item.title
                          ? "max-h-[250px] pb-4 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex flex-col gap-2 pl-4 border-l border-white/10 ml-2">
                        {item.submenu.map((sub: any) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[10px] font-bold text-slate-400 hover:text-yellow-200 uppercase tracking-widest flex items-center gap-2 no-underline transition-colors py-1"
                          >
                            <ChevronRight size={12} className="text-slate-600" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex justify-between items-center py-3.5 text-[11px] font-black text-slate-100 hover:text-cyan-200 tracking-[0.16em] uppercase transition-colors no-underline"
                  >
                    {item.title}
                    <ChevronRight size={14} className="text-slate-600" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}