"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#080b14] text-slate-300 border-t border-white/10">
      {/* Hiệu ứng ánh sáng nền nhẹ, hòa với giao diện navy */}
      <div className="absolute left-1/2 bottom-0 h-[180px] w-[80%] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[110px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-[180px] w-[45%] rounded-full bg-yellow-300/5 blur-[120px] pointer-events-none" />

      {/* Nội dung chính */}
      <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 md:px-12 py-16 text-sm">
        {/* Cột 1: Thương hiệu */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 no-underline w-fit group">
            <span className="text-4xl md:text-5xl font-[1000] tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-yellow-300 drop-shadow-[0_0_18px_rgba(255,255,255,0.16)] group-hover:scale-105 transition-transform">
              KN
            </span>

            <span className="text-[10px] md:text-xs text-slate-200 font-black tracking-[0.35em] uppercase mt-2">
              Cinema
            </span>
          </Link>

          <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
            Hệ thống rạp chiếu phim hiện đại, đặt vé nhanh, trải nghiệm điện ảnh
            sống động với âm thanh chất lượng cao và không gian giải trí tiện nghi.
          </p>

          <div className="flex gap-3 mt-2">
            <Link
              href="#"
              className="text-slate-300 hover:text-cyan-200 transition-all p-2.5 bg-white/[0.04] border border-white/10 rounded-full hover:border-cyan-300/40 hover:bg-cyan-300/10"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </Link>

            <Link
              href="#"
              className="text-slate-300 hover:text-yellow-200 transition-all p-2.5 bg-white/[0.04] border border-white/10 rounded-full hover:border-yellow-300/40 hover:bg-yellow-300/10"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </Link>

            <Link
              href="#"
              className="text-slate-300 hover:text-red-200 transition-all p-2.5 bg-white/[0.04] border border-white/10 rounded-full hover:border-red-300/40 hover:bg-red-300/10"
              aria-label="Youtube"
            >
              <Youtube size={18} />
            </Link>
          </div>
        </div>

        {/* Cột 2: Khám phá */}
        <div>
          <h4 className="text-slate-100 font-black uppercase tracking-[0.18em] mb-6 border-b border-yellow-300/60 w-fit pb-2">
            Khám phá
          </h4>

          <ul className="flex flex-col gap-3">
            {[
              { name: "Giới thiệu", href: "/about" },
              { name: "Tuyển dụng", href: "#" },
              { name: "Liên hệ", href: "#" },
              { name: "Hệ thống rạp", href: "/cinema" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-yellow-200 hover:translate-x-1 transition-all inline-block"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div>
          <h4 className="text-slate-100 font-black uppercase tracking-[0.18em] mb-6 border-b border-cyan-300/60 w-fit pb-2">
            Điều khoản
          </h4>

          <ul className="flex flex-col gap-3">
            {[
              { name: "Điều khoản chung", href: "#" },
              { name: "Chính sách bảo mật", href: "#" },
              { name: "Chính sách thanh toán", href: "#" },
              { name: "Câu hỏi thường gặp", href: "#" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-cyan-200 hover:translate-x-1 transition-all inline-block"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h4 className="text-slate-100 font-black uppercase tracking-[0.18em] mb-6 border-b border-white/20 w-fit pb-2">
            Hỗ trợ
          </h4>

          <div className="flex flex-col gap-4 text-slate-400">
            <div className="flex items-center gap-3 hover:text-white transition-colors group">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-yellow-300/40 group-hover:bg-yellow-300/10 transition-all">
                <Phone size={17} className="text-yellow-300" />
              </div>

              <span>Hotline: 1900 6017</span>
            </div>

            <div className="flex items-center gap-3 hover:text-white transition-colors group">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-cyan-300/40 group-hover:bg-cyan-300/10 transition-all">
                <Mail size={17} className="text-cyan-300" />
              </div>

              <span>Email: support@kncinema.vn</span>
            </div>

            <div className="flex items-start gap-3 hover:text-white transition-colors group">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-slate-300/40 group-hover:bg-white/[0.07] transition-all">
                <MapPin size={17} className="text-slate-300" />
              </div>

              <span className="text-xs leading-relaxed pt-1">
                Lầu 5, Bitexco, Quận 1, TP.HCM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="relative z-10 border-t border-white/10 bg-[#070a12] py-6">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] md:text-xs font-semibold tracking-[0.12em] text-slate-500 text-center md:text-left">
            © 2026 KN CINEMA - CÔNG TY CỔ PHẦN GIẢI TRÍ KN.
          </p>

          <div className="flex items-center gap-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Bocongthuong.svg/1200px-Bocongthuong.svg.png"
              alt="Đã thông báo Bộ Công Thương"
              className="h-8 opacity-35 hover:opacity-75 transition-opacity grayscale"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}