"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ImageOff } from "lucide-react";
import { BASE_URL, apiRequest } from "@/app/lib/api";

export default function TopBanner() {
  const [activeBanner, setActiveBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchTopBanner = async () => {
      try {
        const res = await apiRequest("/api/v1/banners");
        const json = await res.json();

        const fallbackBanner = {
          id: 998,
          title: "🌟 TẢI APP KN CINEMA - NHẬN NGAY VOUCHER 50K 🌟",
          imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1440&auto=format&fit=crop", 
          linkUrl: "#"
        };

        if (json.status === 200 && Array.isArray(json.data)) {
          const banner = json.data
            .filter((b: any) => b.position === "HOME_TOP" && b.status === "ACTIVE")
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)[0];

          setActiveBanner(banner || fallbackBanner);
        } else {
          setActiveBanner(fallbackBanner);
        }
      } catch (err) {
        console.error(err);
        setActiveBanner({
          id: 998,
          title: "🌟 TẢI APP KN CINEMA - NHẬN NGAY VOUCHER 50K 🌟",
          imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1440&auto=format&fit=crop",
          linkUrl: "#"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopBanner();
  }, []);

  if (loading) {
    return <div className="h-10 w-full bg-[#0b0e17] border-b border-purple-500/20 animate-pulse"></div>;
  }

  if (!activeBanner) return null;

  const imageUrl =
    activeBanner.imageUrl?.startsWith("http")
      ? activeBanner.imageUrl
      : `${BASE_URL}${activeBanner.imageUrl}`;

  return (
    <a
      href={activeBanner.linkUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block h-10 bg-[#0b0e17] overflow-hidden group border-b border-purple-500/20"
    >
      <div className="absolute inset-0">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={activeBanner.title}
            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[5000ms]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1c233d]">
            <ImageOff size={14} className="text-cyan-400/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e17] via-fuchsia-900/40 to-[#0b0e17] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0e17]/60" />
      </div>

      <div className="relative z-20 h-full flex items-center justify-center gap-3 text-white px-4">
        <Sparkles size={12} className="text-cyan-400 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
        
        <span className="text-[10px] md:text-xs font-black uppercase italic tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-purple-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
          {activeBanner.title}
        </span>
        
        <Sparkles size={12} className="text-fuchsia-400 animate-pulse drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(34,211,238,0.2),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none mix-blend-color-dodge" />

      <style jsx>{`
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .animate-shimmer { animation: shimmer 6s infinite linear; }
      `}</style>
    </a>
  );
}