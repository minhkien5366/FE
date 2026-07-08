import React from "react";
import { Clock, Star, Ticket, Play, Ban, MonitorPlay } from "lucide-react";
import { getImageUrl } from "@/app/lib/api";

const resolveMovieImage = (image?: string | null) => {
  if (!image) {
    return "https://placehold.co/500x750/0b1020/f4d419?text=KN+Cinema";
  }

  if (
    String(image).startsWith("http") ||
    String(image).startsWith("blob:") ||
    String(image).startsWith("data:")
  ) {
    return image;
  }

  return getImageUrl(image);
};

export default function MovieCard({ movie, onSelect }: any) {
  const movieImage = resolveMovieImage(movie?.image || movie?.posterUrl);
  const formats = movie?.formats || [];

  return (
    <div className="group relative overflow-hidden flex gap-4 p-4 rounded-3xl bg-[#0d1222] border border-white/10 hover:border-cyan-300/35 hover:bg-[#111827] transition-all duration-300 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 bg-cyan-300/[0.04] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative shrink-0 w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_18px_42px_rgba(0,0,0,0.32)] border border-white/10 bg-[#080c1b]">
        <img
          src={movieImage}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          alt={movie?.title || "movie"}
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/500x750/0b1020/f4d419?text=KN+Cinema";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/85 via-transparent to-transparent" />

        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#080c1b]/85 border border-white/10 backdrop-blur px-2 py-1.5">
            <Play size={10} className="text-yellow-300 fill-yellow-300" />
            <span className="text-[7px] font-black uppercase tracking-[0.12em] text-white">
              Trailer
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center py-1">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 min-w-0">
            <span className="shrink-0 bg-yellow-300/10 text-yellow-300 border border-yellow-300/25 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-[0.12em]">
              {movie?.tag || "P"}
            </span>

            <h4 className="text-base font-black uppercase truncate text-white group-hover:text-yellow-200 transition-colors tracking-[0.03em]">
              {movie?.title || "Phim đang cập nhật"}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] flex items-center gap-1">
              <Clock size={11} className="text-cyan-300" />
              {movie?.duration || "--"} phút
            </span>

            <span className="text-[9px] font-black uppercase tracking-[0.12em] flex items-center gap-1 min-w-0">
              <Star size={11} className="text-yellow-300" />
              <span className="truncate max-w-[220px]">{movie?.genre || "Phim"}</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {formats.length > 0 ? (
            formats.map((formatItem: any, index: number) => (
              <div key={`${formatItem.type}-${index}`} className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-cyan-300/10 border border-cyan-300/25 text-cyan-300 flex items-center justify-center">
                    <MonitorPlay size={10} />
                  </span>
                  {formatItem.type}
                </span>

                <div className="flex flex-wrap gap-2">
                  {formatItem.times?.map((showtime: any) => {
                    const isCancelled =
                      showtime.status === "CANCELLED" ||
                      showtime.status === "PENDING_CANCEL";

                    return (
                      <button
                        key={showtime.id}
                        disabled={isCancelled}
                        onClick={() => !isCancelled && onSelect(showtime.id)}
                        title={
                          isCancelled
                            ? "Suất chiếu này đã bị hủy"
                            : "Chọn suất chiếu này"
                        }
                        className={`relative min-w-[66px] px-3 py-2 rounded-xl text-[11px] font-black transition-all shadow-sm border flex items-center justify-center gap-1.5 active:scale-95 ${
                          isCancelled
                            ? "bg-[#080c1b] border-white/5 text-slate-700 line-through cursor-not-allowed opacity-60"
                            : "bg-[#080c1b] border-white/10 text-slate-200 hover:bg-yellow-300 hover:text-[#111827] hover:border-yellow-200 hover:shadow-[0_12px_28px_rgba(244,212,25,0.18)]"
                        }`}
                      >
                        {isCancelled ? <Ban size={10} /> : <Ticket size={10} />}
                        {showtime.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#080c1b] p-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">
                Chưa có suất chiếu khả dụng
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}