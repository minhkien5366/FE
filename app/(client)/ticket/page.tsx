"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  X,
  Ticket as TicketIcon,
  Check,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Film,
  XCircle,
  Tv,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/app/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Toaster, toast } from "react-hot-toast";
import OrderTicketItem from "./OrderTicketItem";

const checkIsExpired = (startTimeStr: string) => {
  if (!startTimeStr) return false;

  try {
    const movieTime = new Date(startTimeStr);
    return movieTime < new Date();
  } catch (error) {
    return false;
  }
};

export default function TicketsTab() {
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showtimeDetail, setShowtimeDetail] = useState<any>(null);
  const [loadingShowtime, setLoadingShowtime] = useState(false);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const res = await apiRequest(
          `/api/v1/tickets/my-history?t=${new Date().getTime()}`
        );

        if (res.ok) {
          const result = await res.json();
          let rawData: any[] = [];

          if (Array.isArray(result)) rawData = result;
          else if (result.data && Array.isArray(result.data))
            rawData = result.data;
          else if (result.content && Array.isArray(result.content))
            rawData = result.content;

          const groupedTickets: Record<string, any> = {};
          const normalizedOrders: any[] = [];

          rawData.forEach((item: any) => {
            const showtimeStatus = item.showtime?.status || "ACTIVE";

            if (item.orderDetails) {
              normalizedOrders.push({
                ...item,
                date: item.date || "N/A",
                time: item.time || "N/A",
                movieTitle: item.movieTitle || "Vé Xem Phim",
                showtimeStatus,
              });
              return;
            }

            const code = item.bookingCode || `KN${item.id}`;

            if (!groupedTickets[code]) {
              let dateStr = "Hôm nay";
              let timeStr = "N/A";

              if (item.showtime && item.showtime.startTime) {
                try {
                  const dateObj = new Date(item.showtime.startTime);
                  timeStr = dateObj.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  dateStr = dateObj.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                } catch (e) {
                  console.error(e);
                }
              }

              groupedTickets[code] = {
                id: item.id,
                bookingCode: code,
                status: item.status,
                showtimeStatus,
                date: dateStr,
                time: timeStr,
                showtime: item.showtime,
                movieTitle: item.showtime?.movie?.title || "Vé Xem Phim",
                createdAt: item.createdAt,
                orderDetails: [],
              };
            }

            let seatName = "";

            if (item.seatName) {
              seatName = item.seatName;
            } else if (item.seatRow && item.seatNumber) {
              seatName = `${item.seatRow}${item.seatNumber}`;
            } else if (item.seat && item.seat.name) {
              seatName = item.seat.name;
            }

            if (seatName) {
              groupedTickets[code].orderDetails.push({
                itemType: "TICKET",
                itemName: seatName,
              });
            }
          });

          const finalOrders = [...normalizedOrders, ...Object.values(groupedTickets)];

          const validOrders = finalOrders.filter(
            (order: any) =>
              order.status === "PAID" ||
              order.status === "USED" ||
              order.status === "CANCELLED" ||
              order.status === "CANCELED"
          );

          validOrders.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setOrders(validOrders);
        } else {
          toast.error("Không thể tải lịch sử vé!");
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử vé:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleOpenDetail = async (order: any) => {
    setSelectedOrder(order);
    setShowtimeDetail(null);

    const showtimeId = order.showtime?.id;
    if (!showtimeId) return;

    setLoadingShowtime(true);

    try {
      const res = await apiRequest(`/api/v1/showtimes/${showtimeId}`);

      if (res.ok) {
        const data = await res.json();
        setShowtimeDetail(data.data || data);
      } else {
        console.error("Không thể lấy thông tin chi tiết suất chiếu");
      }
    } catch (err) {
      console.error("Lỗi gọi API showtime:", err);
    } finally {
      setLoadingShowtime(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const isCancelled =
      order.status === "CANCELLED" || order.status === "CANCELED";
    const isExpired =
      order.status === "PAID" &&
      checkIsExpired(order.showtime?.startTime || order.date);

    if (activeFilter === "upcoming") {
      return order.status === "PAID" && !isExpired && !isCancelled;
    }

    if (activeFilter === "done") {
      return (order.status === "USED" || isExpired) && !isCancelled;
    }

    if (activeFilter === "cancelled") {
      return isCancelled;
    }

    return true;
  });

  const cleanSeatsDisplay = () => {
    if (!selectedOrder) return "N/A";

    const tickets =
      selectedOrder.orderDetails?.filter(
        (detail: any) => detail.itemType === "TICKET"
      ) || [];

    if (tickets.length === 0) return "N/A";

    return tickets
      .map((ticket: any) => {
        if (!ticket.itemName) return "N/A";
        return ticket.itemName.replace(/Ghế\s+/i, "").trim();
      })
      .sort()
      .join(", ");
  };

  const isSelectedExpired =
    selectedOrder &&
    selectedOrder.status === "PAID" &&
    checkIsExpired(selectedOrder.showtime?.startTime || selectedOrder.date);

  const isSelectedUsed = selectedOrder && selectedOrder.status === "USED";

  const isSelectedCancelled =
    selectedOrder &&
    (selectedOrder.status === "CANCELLED" ||
      selectedOrder.status === "CANCELED");

  const isSystemCancelled =
    isSelectedCancelled && selectedOrder?.showtimeStatus === "CANCELLED";

  const isInvalid = isSelectedUsed || isSelectedExpired || isSelectedCancelled;

  const cinemaName =
    showtimeDetail?.cinemaItem?.cinema?.name ||
    selectedOrder?.cinemaName ||
    "KN Cinema";

  const roomName =
    showtimeDetail?.cinemaItem?.name ||
    showtimeDetail?.room?.name ||
    selectedOrder?.roomName ||
    "Phòng chiếu";

  return (
    <div className="min-h-screen bg-transparent text-white px-4 sm:px-6 lg:px-24 xl:px-40 py-10 md:py-12 relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "16px",
            background: "#0b1020",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
          error: {
            iconTheme: {
              primary: "#fb7185",
              secondary: "#111827",
            },
          },
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Sparkles size={11} className="text-yellow-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
              Vé điện tử
            </span>
          </div>

          <h2
            className="text-[34px] md:text-[52px] font-black uppercase tracking-[-0.05em] leading-none text-white"
            style={{
              fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            VÉ CỦA TÔI
          </h2>

          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.18em] mt-2">
            Quản lý lịch sử vé và mã QR soát vé
          </p>
        </div>

        <div className="flex bg-[#0b1020] p-1 rounded-2xl border border-white/10 gap-1 shadow-[0_16px_34px_rgba(0,0,0,0.24)] self-start sm:self-auto overflow-x-auto no-scrollbar">
          {[
            { id: "upcoming", label: "Vé sắp xem" },
            { id: "done", label: "Lịch sử xem" },
            { id: "cancelled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                  : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2
              className="animate-spin text-yellow-300"
              size={28}
              strokeWidth={2.5}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar pb-20 relative z-10">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <TicketIcon className="mx-auto text-slate-600 mb-4" size={36} />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Không có dữ liệu vé tương ứng
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="transition-all duration-300">
                <OrderTicketItem order={order} onOpenDetail={handleOpenDetail} />
              </div>
            ))
          )}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md transition-opacity duration-300"
            onClick={() => {
              setSelectedOrder(null);
              setShowtimeDetail(null);
            }}
          />

          <div className="relative bg-[#0b1020] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-[0_0_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 z-10">
            <button
              onClick={() => {
                setSelectedOrder(null);
                setShowtimeDetail(null);
              }}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:bg-rose-600 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <X size={14} strokeWidth={2.5} />
            </button>

            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#0b1020]">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">
                  <Film size={12} className="text-yellow-300" />
                  KN Cinema Pass
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tác phẩm điện ảnh
                  </span>

                  <h3
                    className={`text-xl font-black uppercase tracking-tight leading-tight ${
                      isSelectedCancelled
                        ? "text-slate-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {selectedOrder.movieTitle}
                  </h3>
                </div>

                <div
                  className={`grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-white/10 ${
                    isSelectedCancelled ? "opacity-60 grayscale" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <Calendar size={11} className="text-yellow-300" />
                      Ngày chiếu
                    </div>

                    <span className="text-sm font-extrabold text-slate-200 mt-1">
                      {selectedOrder.date}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <Clock size={11} className="text-cyan-300" />
                      Suất chiếu
                    </div>

                    <span className="text-sm font-extrabold text-slate-200 mt-1">
                      {selectedOrder.time}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <MapPin size={11} className="text-rose-300" />
                      Cụm rạp
                    </div>

                    {loadingShowtime ? (
                      <Loader2
                        className="animate-spin text-slate-600 mt-2"
                        size={12}
                      />
                    ) : (
                      <span
                        title={cinemaName}
                        className="text-[13px] font-black text-slate-200 mt-1 uppercase tracking-wide block break-words leading-tight pr-1"
                      >
                        {cinemaName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <Tv size={11} className="text-yellow-300" />
                      Phòng chiếu
                    </div>

                    {loadingShowtime ? (
                      <Loader2
                        className="animate-spin text-slate-600 mt-2"
                        size={12}
                      />
                    ) : (
                      <span className="text-sm font-black text-yellow-300 mt-1 uppercase tracking-wide">
                        {roomName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col col-span-2">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <Film size={11} className="text-cyan-300" />
                      Vị trí ghế
                    </div>

                    <span className="text-xs font-black text-slate-100 mt-1 tracking-wide bg-[#111827] border border-white/10 px-2.5 py-1 rounded-md w-fit min-w-[40px] text-center shadow-inner">
                      {cleanSeatsDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {isSelectedCancelled ? (
                <div className="mt-6 p-4 rounded-2xl border bg-[#190b12] border-rose-400/30 shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className="text-rose-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                      {isSystemCancelled ? "THÔNG BÁO TỪ HỆ THỐNG" : "THÔNG BÁO"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {isSystemCancelled
                      ? "KN Cinema xin lỗi khách hàng do suất chiếu có vấn đề nên bị huỷ. Rạp đã đền bù điểm cho khách hàng để đổi mã giảm giá cho lần đặt vé tiếp theo, mong quý khách thông cảm."
                      : "Bạn đã huỷ thanh toán."}
                  </p>
                </div>
              ) : (
                <div
                  className={`mt-6 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border text-center md:text-left w-fit ${
                    isSelectedUsed || isSelectedExpired
                      ? "bg-[#111827] text-slate-500 border-white/10"
                      : "bg-yellow-300/10 text-yellow-200 border-yellow-300/25 animate-pulse"
                  }`}
                >
                  {isSelectedUsed
                    ? "VÉ ĐÃ QUA SOÁT VÉ"
                    : isSelectedExpired
                      ? "VÉ HẾT HẠN SUẤT CHIẾU"
                      : "HỆ THỐNG VÉ ĐIỆN TỬ CHÍNH THỨC"}
                </div>
              )}
            </div>

            <div className="hidden md:flex flex-col justify-between py-6 relative w-[1px] border-r border-dashed border-white/15 bg-[#0b1020]">
              <div className="absolute -top-3 -left-2.5 w-5 h-5 rounded-full bg-[#020617] border-b border-white/10" />
              <div className="absolute -bottom-3 -left-2.5 w-5 h-5 rounded-full bg-[#020617] border-t border-white/10" />
            </div>

            <div
              className={`w-full md:w-64 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 border-white/10 shrink-0 ${
                isInvalid ? "bg-[#080c1b]" : "bg-[#0d1222]"
              }`}
            >
              <div className="relative p-3 rounded-2xl bg-[#111827] border border-white/10 shadow-inner overflow-hidden">
                <div
                  className={`bg-white p-3 rounded-xl shadow-md transition-all duration-300 ${
                    isInvalid ? "opacity-20 grayscale blur-[1.5px]" : ""
                  }`}
                >
                  <QRCodeSVG
                    value={selectedOrder.bookingCode || "KN-CINEMA"}
                    size={130}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {isInvalid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 rotate-[-12deg]">
                    <div
                      className={`border-2 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl ${
                        isSelectedCancelled
                          ? "border-rose-500 bg-[#0b1020] text-rose-300"
                          : isSelectedExpired
                            ? "border-yellow-300 bg-[#0b1020] text-yellow-300"
                            : "border-cyan-300 bg-[#0b1020] text-cyan-200"
                      }`}
                    >
                      {isSelectedCancelled ? (
                        <XCircle size={14} className="stroke-[2.5]" />
                      ) : isSelectedExpired ? (
                        <AlertTriangle size={13} className="stroke-[2.5]" />
                      ) : (
                        <Check size={13} className="stroke-[2.5]" />
                      )}

                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                        {isSelectedCancelled
                          ? "ĐÃ HỦY VÉ"
                          : isSelectedExpired
                            ? "HẾT HẠN"
                            : "ĐÃ DÙNG"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center w-full">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Mã đặt vé
                </span>

                <div
                  className={`px-4 py-1.5 rounded-xl bg-[#111827] border border-white/10 font-mono text-xs font-black tracking-[0.18em] shadow-sm text-center w-full max-w-[180px] ${
                    isInvalid
                      ? "text-slate-600 line-through decoration-slate-700"
                      : "text-slate-200"
                  }`}
                >
                  {isSelectedCancelled
                    ? "***-***-***"
                    : selectedOrder.bookingCode || "KN-CINEMA"}
                </div>
              </div>

              <p
                className={`mt-5 text-[9px] font-bold text-center tracking-wide ${
                  isInvalid ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {isSelectedCancelled
                  ? "Mã vé đã được ẩn vì lý do bảo mật"
                  : isInvalid
                    ? "Vé không còn giá trị sử dụng"
                    : "Đưa mã này cho nhân viên quầy soát vé"}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}