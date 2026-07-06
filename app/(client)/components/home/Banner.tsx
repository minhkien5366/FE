"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { apiRequest } from "../../../lib/api";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

interface BannerType {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  status: string;
  sortOrder: number;
}

const fallbackBanners: BannerType[] = [
  {
    id: 999,
    title: "TRẢI NGHIỆM ĐIỆN ẢNH VŨ TRỤ",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1440&auto=format&fit=crop",
    linkUrl: "#",
    position: "HOME",
    status: "ACTIVE",
    sortOrder: 1,
  },
];

export default function Banner() {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiRequest("/api/v1/banners/active", {
          method: "GET",
        });

        if (!response.ok) {
          setBanners(fallbackBanners);
          setLoading(false);
          return;
        }

        const resData = await response.json();

        if (resData && resData.data && resData.data.length > 0) {
          setBanners(resData.data);
        } else {
          setBanners(fallbackBanners);
        }
      } catch (error) {
        console.error(error);
        setBanners(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleGoToBanner = (linkUrl: string) => {
    if (!linkUrl || linkUrl === "#") return;
    window.location.href = linkUrl;
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 pt-2 md:pt-4 bg-transparent">
        <div className="max-w-[1440px] mx-auto h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] bg-[#10172b]/60 border border-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="w-8 h-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_10px_rgba(244,212,25,0.75)]" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 pt-2 md:pt-4 bg-transparent relative z-10">
      <div className="max-w-[1440px] mx-auto w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] relative group overflow-hidden rounded-xl bg-[#0b1020]/70 border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          loop={banners.length > 1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="h-full w-full rounded-xl"
        >
          {banners.map((item) => {
            const isVideo = item.imageUrl?.toLowerCase().endsWith(".mp4");

            return (
              <SwiperSlide key={item.id}>
                <div className="relative w-full h-full flex items-center overflow-hidden">
                  {isVideo ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={item.imageUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div
                      className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#080b14]/95 via-[#0b1020]/58 to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/40 via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_36%)] z-10 pointer-events-none" />

                  <div className="relative z-20 px-6 sm:px-8 md:px-16 lg:px-20 w-full">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(244,212,25,0.85)]" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] text-slate-200">
                          KN Cinema
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-yellow-200 drop-shadow-[0_0_16px_rgba(255,255,255,0.45)]">
                        {item.title}
                      </h1>

                      <p className="text-xs sm:text-sm md:text-base text-slate-100/90 mb-6 font-medium max-w-md drop-shadow-lg hidden sm:block">
                        Trải nghiệm điện ảnh hiện đại, đặt vé nhanh và tận hưởng
                        khoảnh khắc giải trí trọn vẹn tại KN Cinema.
                      </p>

                      <div className="flex gap-3 sm:gap-4">
                        <button
                          onClick={() => handleGoToBanner(item.linkUrl)}
                          className="bg-[#f4d419] hover:bg-[#ffea3d] text-[#111827] px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all duration-300 hover:scale-105 shadow-[0_12px_28px_rgba(244,212,25,0.26)] hover:shadow-[0_16px_36px_rgba(244,212,25,0.38)]"
                        >
                          Đặt Vé Ngay
                        </button>

                        <button
                          onClick={() => handleGoToBanner(item.linkUrl)}
                          className="backdrop-blur-md bg-white/[0.06] border border-white/10 text-slate-100 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase hover:bg-white/[0.1] hover:border-cyan-300/40 hover:text-cyan-100 transition-all duration-300"
                        >
                          Chi Tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <style jsx global>{`
          @keyframes kenburns {
            from {
              transform: scale(1);
            }
            to {
              transform: scale(1.06);
            }
          }

          .animate-ken-burns {
            animation: kenburns 10s ease-out forwards;
          }

          .swiper-pagination {
            bottom: 14px !important;
          }

          .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.35) !important;
            opacity: 1;
          }

          .swiper-pagination-bullet-active {
            background: #f4d419 !important;
            width: 24px !important;
            border-radius: 999px;
            opacity: 1;
            box-shadow: 0 0 12px rgba(244, 212, 25, 0.8);
          }
        `}</style>
      </div>
    </div>
  );
}