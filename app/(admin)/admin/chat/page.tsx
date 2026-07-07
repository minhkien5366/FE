"use client";

import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  MessageSquareDot,
  Send,
  User,
  Search,
  MapPin,
  CheckCircle2,
  Loader2,
  Power,
  Clock,
  Check,
  Sparkles,
  ShieldCheck,
  Headphones,
  Wifi,
  XCircle,
} from "lucide-react";
import { apiAdminRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

interface ChatMessage {
  roomId: string;
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string;
  timestamp?: string;
  cinemaItemId?: number;
}

export default function AdminChatPage() {
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState<string>("");

  const [activeRooms, setActiveRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchRoom, setSearchRoom] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const adminToast: any = {
    duration: 3200,
    style: {
      background: "#0b1020",
      color: "#f8fafc",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
      fontSize: "11px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      borderRadius: "16px",
    },
    success: {
      iconTheme: {
        primary: "#f4d419",
        secondary: "#111827",
      },
      style: {
        border: "1px solid rgba(244,212,25,0.45)",
      },
    },
    error: {
      iconTheme: {
        primary: "#fb7185",
        secondary: "#111827",
      },
      style: {
        border: "1px solid rgba(244,63,94,0.5)",
      },
    },
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    apiAdminRequest("/api/v1/users/me")
      .then((res) => res.json())
      .then((data) => {
        const id =
          data?.managedCinemaItemId ||
          data?.data?.managedCinemaItemId ||
          data?.data?.cinemaId;

        if (id) {
          setCinemaId(Number(id));

          apiAdminRequest(`/api/v1/cinema-items/${id}`)
            .then((res) => res.json())
            .then((cinemaData) => {
              setCinemaName(
                cinemaData?.data?.name ||
                  cinemaData?.name ||
                  "Chi nhánh hiện tại"
              );
            })
            .catch(() => {
              setCinemaName("Chi nhánh hiện tại");
            });
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin Admin:", err);
      });
  }, []);

  useEffect(() => {
    if (!cinemaId) return;

    apiAdminRequest(`/api/v1/chat/active-rooms/${cinemaId}`)
      .then((res) => res.json())
      .then((result) => {
        const rooms = Array.isArray(result) ? result : result?.data || [];

        if (Array.isArray(rooms)) {
          setActiveRooms(rooms);
        }
      })
      .catch((err) => {
        console.error("Lỗi đồng bộ danh sách phòng chat cũ:", err);
      });
  }, [cinemaId]);

  useEffect(() => {
    if (!cinemaId || stompClientRef.current?.active) return;

    setIsConnecting(true);

    let wsUrl = BASE_URL || "http://localhost:8080";

    if (wsUrl.endsWith("/")) {
      wsUrl = wsUrl.slice(0, -1);
    }

    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (wsUrl.startsWith("http://") && !wsUrl.includes("localhost")) {
        wsUrl = wsUrl.replace("http://", "https://");
      }
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => {
      setIsConnecting(false);

      client.subscribe(`/topic/admin.notifications.cinema.${cinemaId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);

        if (newMsg.content === "[SYSTEM_CLOSE]") {
          setActiveRooms((prev) =>
            prev.filter((roomId) => roomId !== newMsg.roomId)
          );
          return;
        }

        setActiveRooms((prev) => {
          if (!prev.includes(newMsg.roomId)) {
            return [newMsg.roomId, ...prev];
          }

          return prev;
        });
      });
    };

    client.onStompError = () => {
      setIsConnecting(false);
      toast.error("Kết nối CSKH gặp sự cố!", adminToast);
    };

    client.onWebSocketClose = () => {
      setIsConnecting(true);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }

      stompClientRef.current = null;
    };
  }, [cinemaId]);

  useEffect(() => {
    if (!selectedRoom) return;

    apiAdminRequest(`/api/v1/chat/history/${selectedRoom}`)
      .then((res) => res.json())
      .then((result) => {
        const history = Array.isArray(result) ? result : result?.data || [];
        const isClosed = history.some(
          (message: any) => message.content === "[SYSTEM_CLOSE]"
        );

        if (isClosed) {
          setActiveRooms((prev) =>
            prev.filter((roomId) => roomId !== selectedRoom)
          );
          setMessages([]);
          return;
        }

        setMessages(history || []);
        scrollToBottom();
      })
      .catch((err) => {
        console.error("Lỗi tải lịch sử chat:", err);
        toast.error("Không thể tải lịch sử phiên chat!", adminToast);
      });

    let subscription: any = null;

    const timer = setTimeout(() => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        try {
          subscription = stompClientRef.current.subscribe(
            `/topic/room/${selectedRoom}`,
            (msg) => {
              const newMsg: ChatMessage = JSON.parse(msg.body);

              if (newMsg.content === "[SYSTEM_CLOSE]") {
                setActiveRooms((prev) =>
                  prev.filter((roomId) => roomId !== selectedRoom)
                );
                toast.success("Phiên kết nối đã được đóng!", adminToast);
                return;
              }

              setMessages((prev) => [...prev, newMsg]);
              scrollToBottom();
            }
          );
        } catch (error) {
          console.error("Lỗi đăng ký kết nối STOMP:", error);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);

      if (
        subscription &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        try {
          subscription.unsubscribe();
        } catch (e) {}
      }
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !inputValue.trim() ||
      !selectedRoom ||
      !stompClientRef.current?.connected
    ) {
      return;
    }

    const payload: ChatMessage = {
      roomId: selectedRoom,
      sender: "Quản Lý CSKH",
      content: inputValue,
      senderRole: "ADMIN",
      receiverRole: "USER",
      cinemaItemId: cinemaId!,
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload),
    });

    setInputValue("");
  };

  const handleCloseRoomActive = async () => {
    if (!selectedRoom) return;

    const confirmed = window.confirm(
      `Xác nhận ĐÓNG và KẾT THÚC phiên hỗ trợ cho mã phòng ${selectedRoom}?`
    );

    if (!confirmed) return;

    try {
      await apiAdminRequest(`/api/v1/chat/close/${selectedRoom}`, {
        method: "POST",
      });

      setActiveRooms((prev) => prev.filter((roomId) => roomId !== selectedRoom));
      toast.success("Đã đóng phiên hỗ trợ!", adminToast);
    } catch (err) {
      toast.error("Gặp lỗi khi xử lý đóng phòng!", adminToast);
    }
  };

  const filteredRooms = activeRooms.filter((roomId) =>
    roomId.toLowerCase().includes(searchRoom.toLowerCase())
  );

  const isCurrentRoomClosed =
    selectedRoom !== null && !activeRooms.includes(selectedRoom);

  if (!cinemaId) {
    return (
      <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 relative overflow-hidden">
        <Toaster position="top-right" toastOptions={adminToast} />

        <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

        <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-yellow-300" size={30} />
          </div>

          <p className="text-[11px] uppercase tracking-[0.22em] font-black text-slate-500">
            Đang thiết lập kết nối mã hóa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* PAGE HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Headphones size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Trung tâm điều hành CSKH
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                HỖ TRỢ{" "}
                <span className="text-yellow-300">KHÁCH HÀNG</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2 flex items-center gap-2">
                <MapPin size={11} className="text-cyan-300" />
                Phân quyền:{" "}
                <span className="text-slate-300">{cinemaName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#0d1222] border border-white/10 px-4 py-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnecting
                  ? "bg-yellow-300 animate-pulse shadow-[0_0_12px_rgba(244,212,25,0.75)]"
                  : "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.85)]"
              }`}
            />

            <Wifi
              size={15}
              className={isConnecting ? "text-yellow-300" : "text-cyan-300"}
            />

            <span
              className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                isConnecting ? "text-yellow-300" : "text-cyan-300"
              }`}
            >
              {isConnecting ? "Đang kết nối" : "Đã kết nối trực tuyến"}
            </span>
          </div>
        </header>

        {/* CHAT FRAME */}
        <div className="flex flex-col h-[calc(100vh-250px)] min-h-[620px] bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <div className="bg-[#0b1020] border-b border-white/10 p-5 flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="pointer-events-none absolute top-[-120px] right-[-80px] w-72 h-72 bg-yellow-300/[0.04] rounded-full blur-3xl" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-yellow-300/10 rounded-2xl flex items-center justify-center border border-yellow-300/25 shadow-inner">
                <MessageSquareDot className="text-yellow-300" size={24} />
              </div>

              <div>
                <h2 className="text-white font-black uppercase tracking-[0.12em] text-sm drop-shadow-md">
                  Live Chat Console
                </h2>

                <p className="text-slate-500 text-[10px] uppercase font-black mt-1 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-cyan-300" />
                  Đường truyền nội bộ bảo mật
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2.5 bg-cyan-300/10 border border-cyan-300/25 px-4 py-2 rounded-full relative z-10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                {activeRooms.length} phiên đang mở
              </span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-80 bg-[#0b1020] border-r border-white/10 flex flex-col relative shrink-0">
              <div className="p-4 border-b border-white/10 shrink-0 bg-[#0b1020]">
                <div className="relative group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
                    size={16}
                  />

                  <input
                    type="text"
                    value={searchRoom}
                    onChange={(e) => setSearchRoom(e.target.value)}
                    placeholder="Tra cứu mã phiên..."
                    className="w-full bg-[#0d1222] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[12px] font-bold text-white outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filteredRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-56 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-slate-600" />
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-500">
                      Không có yêu cầu chờ xử lý
                    </p>
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-300 group border ${
                        selectedRoom === room
                          ? "bg-yellow-300/10 border-yellow-300/35 shadow-[0_16px_34px_rgba(244,212,25,0.08)]"
                          : "bg-[#0d1222] border-white/10 hover:border-cyan-300/30 hover:bg-[#111827]"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors border ${
                          selectedRoom === room
                            ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_0_16px_rgba(244,212,25,0.32)]"
                            : "bg-[#111827] border-white/10 text-slate-500 group-hover:text-cyan-300 group-hover:border-cyan-300/35"
                        }`}
                      >
                        <User size={18} />
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <p
                          className={`text-[13px] font-black truncate tracking-wide ${
                            selectedRoom === room
                              ? "text-yellow-200"
                              : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {room}
                        </p>

                        <p className="text-slate-500 text-[10px] uppercase font-black mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          Đang chờ xử lý
                        </p>
                      </div>

                      {selectedRoom === room && (
                        <div className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(244,212,25,0.75)]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* MAIN CHAT */}
            <main className="flex-1 flex flex-col bg-[#080c1b] relative min-w-0">
              {!selectedRoom ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 animate-in fade-in duration-500 px-8 text-center">
                  <div className="w-24 h-24 bg-white/[0.04] border border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <MessageSquareDot size={42} className="opacity-50" />
                  </div>

                  <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                    Chọn một phiên chat ở cột trái
                  </p>

                  <p className="text-xs font-medium text-slate-600 mt-2">
                    Các phiên hỗ trợ đang mở sẽ xuất hiện theo thời gian thực.
                  </p>
                </div>
              ) : isCurrentRoomClosed ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 animate-in zoom-in-95 fade-in duration-500 bg-[#080c1b] px-8 text-center">
                  <div className="w-32 h-32 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-400/30 shadow-[0_0_50px_rgba(244,63,94,0.12)] relative">
                    <div className="absolute inset-0 rounded-full border border-rose-400/40 animate-ping" />
                    <Check size={48} className="text-rose-300" />
                  </div>

                  <h3
                    className="text-3xl font-black text-white uppercase tracking-[-0.04em] mb-3"
                    style={{
                      fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                    }}
                  >
                    Phiên hỗ trợ đã đóng
                  </h3>

                  <p className="text-[13px] font-medium text-slate-500 mt-1 mb-8 text-center max-w-sm leading-relaxed">
                    Mã phòng{" "}
                    <span className="text-rose-300 font-bold">
                      {selectedRoom}
                    </span>{" "}
                    đã được kết thúc bởi khách hàng hoặc hệ thống tự động đóng.
                  </p>

                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="px-8 h-12 bg-[#111827] hover:bg-[#162034] text-white rounded-xl uppercase font-black text-[10px] tracking-[0.14em] transition-all border border-white/10 hover:border-cyan-300/35 shadow-lg active:scale-95"
                  >
                    Quay lại danh sách
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-5 md:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0b1020]/85 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_12px_rgba(103,232,249,0.85)]" />

                      <div className="min-w-0">
                        <h4 className="text-slate-100 font-black uppercase text-[12px] md:text-[13px] tracking-[0.13em] truncate">
                          Mã phiên: {selectedRoom}
                        </h4>

                        <span className="text-cyan-300/80 text-[10px] font-black uppercase tracking-wider">
                          Đường truyền bảo mật
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseRoomActive}
                      className="flex items-center gap-2 px-4 h-10 bg-rose-500/10 border border-rose-400/30 hover:bg-rose-500 hover:text-white hover:border-rose-400 rounded-xl text-[10px] font-black text-rose-300 uppercase tracking-[0.12em] transition-all shadow-sm active:scale-95"
                      title="Kết thúc hỗ trợ"
                    >
                      <Power size={14} />
                      Đóng phiên
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, index) => {
                      if (msg.senderRole === "BOT" || msg.receiverRole === "BOT") {
                        return null;
                      }

                      const isMe = msg.senderRole === "ADMIN";

                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${
                            isMe ? "items-end" : "items-start"
                          } animate-in fade-in slide-in-from-bottom-2`}
                        >
                          <span
                            className={`text-[9px] font-black uppercase tracking-[0.16em] mb-2 px-1 ${
                              isMe ? "text-yellow-300/70" : "text-slate-500"
                            }`}
                          >
                            {msg.sender}
                          </span>

                          <div
                            className={`max-w-[78%] text-[13px] md:text-[14px] px-5 py-3.5 shadow-xl leading-relaxed border whitespace-pre-wrap ${
                              isMe
                                ? "bg-yellow-300 border-yellow-200 text-[#111827] rounded-2xl rounded-tr-sm font-semibold shadow-[0_14px_34px_rgba(244,212,25,0.16)]"
                                : "bg-[#111827] border-white/10 text-slate-200 rounded-2xl rounded-tl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={sendMessage}
                    className="p-4 md:p-5 border-t border-white/10 bg-[#0b1020] flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Nhập câu trả lời cho khách hàng..."
                      className="flex-1 bg-[#0d1222] border border-white/10 rounded-xl px-5 py-4 text-[14px] font-medium text-white focus:outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 shadow-inner"
                    />

                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-14 h-14 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl flex items-center justify-center transition-all disabled:opacity-45 disabled:cursor-not-allowed shadow-[0_16px_34px_rgba(244,212,25,0.24)] active:scale-95"
                      aria-label="Gửi tin nhắn"
                    >
                      <Send size={20} className="ml-1" />
                    </button>
                  </form>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b1020;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}