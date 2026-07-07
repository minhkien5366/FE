"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Search, ChevronDown, ShieldCheck, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { apiAdminRequest } from "@/app/lib/api";
import { useRouter, usePathname } from "next/navigation";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function AdminHeader() {
  const [thongTinAdmin, setThongTinAdmin] = useState<any>(null);
  const [hienMenuCaNhan, setHienMenuCaNhan] = useState(false);
  const [soTinNhanChuaDoc, setSoTinNhanChuaDoc] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const currentPathRef = useRef(pathname);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    currentPathRef.current = pathname;

    if (pathname === "/admin/chat") {
      setSoTinNhanChuaDoc(0);
    }
  }, [pathname]);

  const xuLyDangXuat = useCallback(() => {
    const keyToken = "token_admin";

    localStorage.removeItem(keyToken);
    Cookies.remove(keyToken, { path: "/" });
    localStorage.removeItem("user_info_admin");
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    const taiThongTin = async () => {
      try {
        const res = await apiAdminRequest("/api/v1/users/me");

        if (res.ok) {
          const ketQua = await res.json();
          const duLieuTho = ketQua.data?.user || ketQua.data;

          const quyenTaiKhoan: string[] =
            duLieuTho?.roles?.map((r: any) => r.roleName || r) || [];

          if (
            !quyenTaiKhoan.includes("ROLE_ADMIN") &&
            !quyenTaiKhoan.includes("ADMIN")
          ) {
            xuLyDangXuat();
            return;
          }

          setThongTinAdmin(duLieuTho);
        } else if (res.status === 401 || res.status === 403) {
          xuLyDangXuat();
        }
      } catch (loi) {
        console.error("Lỗi lấy thông tin Quản trị viên:", loi);
      }
    };

    taiThongTin();
  }, [xuLyDangXuat]);

  useEffect(() => {
    const cinemaId = thongTinAdmin?.managedCinemaItemId;

    if (!cinemaId || stompClientRef.current) return;

    let BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    if (BACKEND_URL.endsWith("/")) {
      BACKEND_URL = BACKEND_URL.slice(0, -1);
    }

    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (
        BACKEND_URL.startsWith("http://") &&
        !BACKEND_URL.includes("localhost")
      ) {
        BACKEND_URL = BACKEND_URL.replace("http://", "https://");
      }
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`),
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => {
      client.subscribe(`/topic/admin.notifications.cinema.${cinemaId}`, () => {
        if (currentPathRef.current !== "/admin/chat") {
          setSoTinNhanChuaDoc((prev) => prev + 1);

          try {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          } catch (e) {}
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [thongTinAdmin]);

  const adminName = thongTinAdmin
    ? `${thongTinAdmin.lastName || ""} ${thongTinAdmin.firstName || ""}`.trim()
    : "Quản trị viên";

  const adminRole = Array.isArray(thongTinAdmin?.roles)
    ? (thongTinAdmin.roles[0]?.roleName || thongTinAdmin.roles[0] || "ADMIN")
        .replace("ROLE_", "")
        .replace("_", " ")
    : "ADMIN";

  return (
    <header className="h-20 border-b border-white/10 bg-[#0b1020]/95 backdrop-blur-xl px-5 md:px-8 lg:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0 select-none shadow-[0_14px_38px_rgba(0,0,0,0.28)]">
      {/* SEARCH */}
      <div className="relative w-56 md:w-80 lg:w-96 group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-300 transition-colors"
          size={16}
        />

        <input
          type="text"
          placeholder="Tìm phim, mã vé hoặc cụm rạp..."
          className="w-full h-11 bg-[#0d1222] border border-white/10 rounded-2xl pl-12 pr-4 text-[11px] font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all text-slate-100 placeholder:text-slate-600 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* NOTIFICATION */}
        <button
          onClick={() => router.push("/admin/chat")}
          className="relative p-2.5 bg-[#0d1222] border border-white/10 rounded-xl text-slate-400 hover:text-yellow-300 hover:bg-[#111827] hover:border-yellow-300/35 transition-all group shadow-[0_10px_25px_rgba(0,0,0,0.22)] active:scale-95"
          aria-label="Thông báo chat"
        >
          <Bell
            size={16}
            className={
              soTinNhanChuaDoc > 0
                ? "animate-swing text-yellow-300"
                : "group-hover:rotate-12 transition-transform"
            }
          />

          {soTinNhanChuaDoc > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-yellow-300 rounded-full border-2 border-[#0b1020] text-[9px] font-black text-[#111827] flex items-center justify-center animate-in zoom-in shadow-[0_0_14px_rgba(244,212,25,0.55)]">
              {soTinNhanChuaDoc > 9 ? "9+" : soTinNhanChuaDoc}
            </span>
          )}
        </button>

        <div className="h-7 w-[1px] bg-white/10 hidden sm:block" />

        {/* ACCOUNT */}
        <div className="relative">
          <button
            onClick={() => setHienMenuCaNhan(!hienMenuCaNhan)}
            className="flex items-center gap-3 pl-2 group transition-all"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-white uppercase tracking-wide leading-none">
                {adminName || "Quản trị viên"}
              </p>

              <div className="flex items-center justify-end gap-1 mt-1.5">
                <ShieldCheck size={10} className="text-yellow-300" />
                <p className="text-[8px] font-black text-yellow-300 uppercase tracking-wider">
                  {adminRole}
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#101829] border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-cyan-300/45 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.22)]">
              {thongTinAdmin?.avatar ? (
                <img
                  src={thongTinAdmin.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-700 to-yellow-500 flex items-center justify-center">
                  <span className="text-[11px] font-black text-white">
                    {thongTinAdmin?.firstName?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>

            <ChevronDown
              size={12}
              className={`text-slate-500 group-hover:text-cyan-300 transition-transform duration-300 ${
                hienMenuCaNhan ? "rotate-180" : ""
              }`}
            />
          </button>

          {hienMenuCaNhan && (
            <>
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setHienMenuCaNhan(false)}
              />

              <div className="absolute right-0 mt-4 w-64 bg-[#080c1b] border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.65)] p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border border-white/10 mb-1 bg-[#0d1222] rounded-xl">
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider mb-1">
                    Tài khoản vận hành
                  </p>

                  <p className="text-[11px] text-slate-300 truncate font-bold">
                    {thongTinAdmin?.email || "Đang đồng bộ..."}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={xuLyDangXuat}
                    className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
                  >
                    <LogOut size={13} />
                    Đăng xuất hệ thống
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes swing {
          20% {
            transform: rotate(15deg);
          }
          40% {
            transform: rotate(-10deg);
          }
          60% {
            transform: rotate(5deg);
          }
          80% {
            transform: rotate(-5deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-swing {
          animation: swing 1s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}