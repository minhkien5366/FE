"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "../../../lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  createdAt: string;
  published?: boolean;
}

export default function PostSectionCombined() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [postDetail, setPostDetail] = useState<Post | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const postsPerPage = 4;

  useEffect(() => {
    apiRequest("/api/v1/posts")
      .then((res) => res.json())
      .then((resData) => {
        const targetData = resData.data || resData;

        if (Array.isArray(targetData)) {
          setPosts(targetData);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách tin tức:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPostId) {
      setPostDetail(null);
      return;
    }

    setLoadingDetail(true);

    apiRequest(`/api/v1/posts/${selectedPostId}`)
      .then((res) => res.json())
      .then((resData) => {
        const targetDetail = resData.data || resData;
        setPostDetail(targetDetail);
      })
      .catch((err) => console.error("Lỗi tải chi tiết bài viết:", err))
      .finally(() => setLoadingDetail(false));
  }, [selectedPostId]);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const visiblePosts = useMemo(() => {
    const startIndex = currentPage * postsPerPage;
    return posts.slice(startIndex, startIndex + postsPerPage);
  }, [posts, currentPage]);

  const handlePrev = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const getCustomDate = (dateStr: string) => {
    if (!dateStr) return { day: "19", month: "05" };

    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");

      return { day, month };
    } catch {
      return { day: "19", month: "05" };
    }
  };

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-14 md:py-16 bg-transparent relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="h-12 w-[300px] bg-white/10 animate-pulse rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[290px] w-full bg-[#1c233d]/40 border border-white/10 animate-pulse rounded-[1rem]"
              />
            ))}
          </div>

          <div className="flex justify-center mt-10 md:mt-12">
            <div className="h-12 md:h-14 w-[220px] md:w-[280px] bg-white/10 animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-14 md:py-16 bg-transparent relative overflow-hidden text-slate-50">
      {/* Glow rất nhẹ để section hòa vào nền chung, không bị tách màu */}
      <div className="pointer-events-none absolute top-[-160px] left-1/2 -translate-x-1/2 w-[820px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {selectedPostId ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPostId(null)}
              className="group inline-flex items-center gap-2 mb-8 text-slate-300 hover:text-yellow-200 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <ChevronLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform text-yellow-300"
              />
              Quay lại danh sách tin
            </button>

            {loadingDetail ? (
              <div className="space-y-6">
                <div className="w-full h-[360px] bg-[#1c233d]/40 animate-pulse rounded-[1.5rem]" />
                <div className="h-10 bg-[#1c233d]/40 animate-pulse w-3/4 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#1c233d]/40 animate-pulse w-full rounded" />
                  <div className="h-4 bg-[#1c233d]/40 animate-pulse w-5/6 rounded" />
                </div>
              </div>
            ) : (
              postDetail && (
                <div className="bg-[#0d1222] border border-[#141c30] rounded-[1.5rem] p-5 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="w-full h-[320px] md:h-[380px] overflow-hidden rounded-[1rem] mb-8 relative bg-[#0b1020]">
                    <img
                      src={postDetail.thumbnail}
                      alt={postDetail.title}
                      className="absolute -inset-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] object-cover scale-[1.025]"
                    />

                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_4px_#0b1020]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-transparent to-transparent" />
                  </div>

                  <h1
                    className="text-2xl md:text-4xl font-black uppercase tracking-[-0.035em] leading-tight mb-6 text-white"
                    style={{
                      fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                      WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                    }}
                  >
                    {postDetail.title}
                  </h1>

                  <div className="w-16 h-1 bg-yellow-300 rounded-full mb-8 shadow-[0_0_14px_rgba(244,212,25,0.55)]" />

                  <p className="text-slate-300 text-sm md:text-base leading-8 tracking-wide font-medium whitespace-pre-line">
                    {postDetail.content}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <>
            <div className="relative flex flex-col items-center justify-center text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={12} className="text-yellow-300" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
                  Bản tin nóng
                </span>
              </div>

              <h2
                className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[40px] leading-[0.92] font-black uppercase text-white tracking-[-0.045em] drop-shadow-[0_8px_28px_rgba(255,255,255,0.14)]"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.08)",
                }}
              >
                TIN ĐIỆN ẢNH
              </h2>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs uppercase tracking-widest font-mono">
                Hiện tại chưa có bài viết nào mới.
              </div>
            ) : (
              <div className="relative">
                {totalPages > 1 && (
                  <button
                    onClick={handlePrev}
                    className="hidden md:flex absolute left-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
                    aria-label="Tin trước"
                  >
                    <ChevronLeft size={52} strokeWidth={2.4} />
                  </button>
                )}

                {totalPages > 1 && (
                  <button
                    onClick={handleNext}
                    className="hidden md:flex absolute right-[-56px] top-[38%] -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full text-white hover:text-yellow-200 transition-all hover:scale-110"
                    aria-label="Tin tiếp theo"
                  >
                    <ChevronRight size={52} strokeWidth={2.4} />
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {visiblePosts.map((post) => {
                    const { day, month } = getCustomDate(post.createdAt);

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPostId(post.id)}
                        className="group relative flex flex-col h-[290px] rounded-[0.9rem] border border-[#141c30] bg-[#0d1222] hover:border-cyan-300/35 transition-all duration-300 hover:shadow-[0_10px_28px_rgba(34,211,238,0.12)] hover:-translate-y-1 cursor-pointer overflow-hidden"
                      >
                        <div className="h-36 w-full overflow-hidden relative bg-[#0b1020]">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="absolute -inset-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] object-cover scale-[1.025] transition-transform duration-700 group-hover:scale-[1.075] opacity-85 group-hover:opacity-100"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_4px_#0b1020]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/25 to-transparent" />

                          <div className="absolute top-3 left-3 flex flex-col items-center bg-[#070a12]/88 backdrop-blur-md px-2 py-1 rounded border border-[#1f2a44] min-w-[38px] text-center shadow-lg group-hover:border-yellow-300/40 transition-colors">
                            <span className="text-white text-xs font-black font-mono leading-none">
                              {day}
                            </span>
                            <span className="text-yellow-300 text-[8px] font-black uppercase tracking-wider mt-0.5 border-t border-[#26324f] pt-0.5 w-full">
                              T{month}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 w-7 h-7 bg-[#070a12]/80 backdrop-blur-md rounded border border-[#1f2a44] flex items-center justify-center text-yellow-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                            <ArrowUpRight size={14} />
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1 justify-between relative overflow-hidden bg-[#0d1222]">
                          <div className="absolute -bottom-5 right-2 text-white/[0.025] font-black text-5xl italic pointer-events-none select-none uppercase tracking-tighter">
                            NEWS
                          </div>

                          <div className="space-y-2 relative z-10">
                            <h3 className="text-[13px] font-black text-slate-100 uppercase leading-snug tracking-tight group-hover:text-yellow-200 transition-colors duration-300 line-clamp-2">
                              {post.title}
                            </h3>

                            <p className="text-slate-500 text-[10px] font-medium leading-relaxed line-clamp-2">
                              {post.content}
                            </p>
                          </div>

                          <div className="relative h-[2px] w-8 bg-[#202941] rounded-full overflow-hidden transition-all duration-500 group-hover:w-14">
                            <div className="absolute inset-0 bg-yellow-300 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex md:hidden items-center justify-center gap-5 mt-8">
                    <button
                      onClick={handlePrev}
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                      aria-label="Tin trước"
                    >
                      <ChevronLeft size={28} />
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white hover:text-yellow-200 hover:border-yellow-300/50 transition-all"
                      aria-label="Tin tiếp theo"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentPage === index
                            ? "bg-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.65)]"
                            : "bg-slate-400/45 hover:bg-slate-200/75"
                        }`}
                        aria-label={`Chuyển đến nhóm tin ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-center mt-10 md:mt-12">
                  <Link
                    href="/posts"
                    className="min-w-[220px] md:min-w-[280px] h-12 md:h-14 px-10 inline-flex items-center justify-center rounded-lg border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-[#111827] transition-all duration-300 font-black uppercase tracking-[0.08em] text-sm md:text-base"
                    style={{
                      fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    }}
                  >
                    Xem thêm
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}