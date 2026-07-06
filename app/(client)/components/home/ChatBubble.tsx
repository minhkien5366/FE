"use client";

import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Film,
  ArrowRight,
  Move,
  MapPin,
  Trash2,
  Headset,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

import { apiRequest, BASE_URL } from "../../../lib/api";

interface ChatMessage {
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string;
  timestamp?: string;
  cinemaItemId?: number | null;
}

interface Cinema {
  id: number;
  name: string;
}

interface CinemaItem {
  id: number;
  name: string;
  city: string;
  cinema?: Cinema;
  cinemaId?: number;
}

const CHAT_WIDTH = 380;
const CHAT_HEIGHT = 600;
const SAFE_MARGIN = 12;

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const [chatMode, setChatMode] = useState<"BOT" | "SELECT_CINEMA" | "ADMIN">(
    () => {
      if (typeof window !== "undefined") {
        return (localStorage.getItem("guest_chat_mode") as any) || "BOT";
      }
      return "BOT";
    }
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaItems, setCinemaItems] = useState<CinemaItem[]>([]);
  const [selectedParentCinema, setSelectedParentCinema] =
    useState<Cinema | null>(null);

  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("guest_cinema_id");
      return saved ? parseInt(saved) : null;
    }
    return null;
  });

  const [isLoadingCinemas, setIsLoadingCinemas] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [roomId, setRoomId] = useState(() => {
    if (typeof window !== "undefined") {
      let savedRoom = localStorage.getItem("guest_room_id");

      if (!savedRoom) {
        savedRoom =
          "ROOM_" + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem("guest_room_id", savedRoom);
      }

      return savedRoom;
    }

    return "ROOM_TEMP";
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "guest_chat_mode",
        chatMode === "SELECT_CINEMA" ? "BOT" : chatMode
      );

      if (selectedCinemaId) {
        localStorage.setItem("guest_cinema_id", selectedCinemaId.toString());
      } else {
        localStorage.removeItem("guest_cinema_id");
      }
    }
  }, [chatMode, selectedCinemaId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 150);
  }, [messages, isOpen, chatMode]);

  useEffect(() => {
    if (
      isOpen &&
      typeof window !== "undefined" &&
      position.x === 0 &&
      position.y === 0
    ) {
      const widgetWidth = Math.min(CHAT_WIDTH, window.innerWidth - SAFE_MARGIN * 2);
      const widgetHeight = Math.min(
        CHAT_HEIGHT,
        window.innerHeight - SAFE_MARGIN * 2
      );

      setPosition({
        x: Math.max(
          SAFE_MARGIN,
          window.innerWidth - widgetWidth - SAFE_MARGIN * 2
        ),
        y: Math.max(
          SAFE_MARGIN,
          window.innerHeight - widgetHeight - 90
        ),
      });
    }
  }, [isOpen, position.x, position.y]);

  const handleCloseChatBySystem = async () => {
    try {
      await apiRequest(`/api/v1/chat/close/${roomId}`, { method: "POST" });
    } catch (e) {
      console.error("Lỗi đóng cuộc chat tự động", e);
    }
  };

  const resetAutoCloseTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (chatMode !== "ADMIN" || !selectedCinemaId) return;

    timeoutRef.current = setTimeout(() => {
      handleCloseChatBySystem();
    }, 180000);
  };

  const handleUserActiveCancel = async () => {
    if (
      window.confirm(
        "Kết thúc phiên trò chuyện với quản lý rạp và quay lại dùng AI?"
      )
    ) {
      await handleCloseChatBySystem();
      setChatMode("BOT");
      setSelectedCinemaId(null);
    }
  };

  useEffect(() => {
    if (isOpen && cinemas.length === 0 && cinemaItems.length === 0) {
      setIsLoadingCinemas(true);

      Promise.all([
        apiRequest("/api/v1/cinemas")
          .then((res) => res.json())
          .catch(() => []),
        apiRequest("/api/v1/cinema-items")
          .then((res) => res.json())
          .catch(() => []),
      ])
        .then(([parentData, childData]) => {
          const safeParents = Array.isArray(parentData)
            ? parentData
            : parentData?.data || parentData?.content || [];

          const safeChildren = Array.isArray(childData)
            ? childData
            : childData?.data || childData?.content || [];

          const activeParentIds = new Set(
            safeChildren
              .map((child: any) => child.cinema?.id || child.cinemaId || child.cinema)
              .filter((id: number | null | undefined) => id !== null && id !== undefined)
          );

          setCinemas(safeParents.filter((parent: any) => activeParentIds.has(parent.id)));
          setCinemaItems(safeChildren);
        })
        .catch(() => {
          setCinemas([]);
          setCinemaItems([]);
        })
        .finally(() => setIsLoadingCinemas(false));
    }
  }, [isOpen, cinemas.length, cinemaItems.length]);

  const connectWebSocket = (roomToConnect: string = roomId) => {
    if (stompClientRef.current?.active) return;

    setIsConnecting(true);

    let wsUrl = BASE_URL || "http://localhost:8080";
    if (wsUrl.endsWith("/")) {
      wsUrl = wsUrl.slice(0, -1);
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
      reconnectDelay: 5000,
    });

    client.onConnect = function () {
      setIsConnecting(false);

      client.subscribe(`/topic/room/${roomToConnect}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);

        if (newMsg.content === "[SYSTEM_OPEN]") {
          setMessages((prev) =>
            prev.filter((m) => m.content !== "[SYSTEM_CLOSE]")
          );
          return;
        }

        if (newMsg.content === "[SYSTEM_CLOSE]") {
          setChatMode("BOT");
          setSelectedCinemaId(null);
          return;
        }

        setMessages((prev) => [...prev, newMsg]);

        if (newMsg.receiverRole === "ADMIN" || newMsg.senderRole === "ADMIN") {
          resetAutoCloseTimeout();
        }
      });

      apiRequest(`/api/v1/chat/history/${roomToConnect}`)
        .then((res) => res.json())
        .then((data: ChatMessage[]) => {
          if (data && data.length > 0) {
            let isCurrentlyClosed = false;

            for (let i = data.length - 1; i >= 0; i--) {
              if (data[i].content === "[SYSTEM_CLOSE]") {
                isCurrentlyClosed = true;
                break;
              }

              if (
                data[i].receiverRole === "ADMIN" ||
                data[i].senderRole === "ADMIN"
              ) {
                isCurrentlyClosed = false;
                break;
              }
            }

            if (isCurrentlyClosed && chatMode === "ADMIN") {
              setChatMode("BOT");
              setSelectedCinemaId(null);
            }

            const validMessages = data.filter(
              (m) =>
                m.content !== "[SYSTEM_CLOSE]" &&
                m.content !== "[SYSTEM_OPEN]"
            );

            setMessages(validMessages);
          }
        })
        .catch((err) => console.error(err));
    };

    client.onStompError = () => {
      setIsConnecting(false);
    };

    client.onWebSocketError = () => {
      setIsConnecting(false);
    };

    client.activate();
    stompClientRef.current = client;
  };

  const handleOpenChat = () => {
    setIsOpen(true);

    if (!stompClientRef.current?.active) {
      connectWebSocket(roomId);
    }
  };

  const handleSelectCinema = (newCinemaId: number) => {
    if (selectedCinemaId !== newCinemaId) {
      const newRoom =
        "ROOM_" + Math.random().toString(36).substring(2, 9).toUpperCase();

      setRoomId(newRoom);
      setSelectedCinemaId(newCinemaId);
      setMessages([]);

      if (typeof window !== "undefined") {
        localStorage.setItem("guest_room_id", newRoom);
        localStorage.setItem("guest_cinema_id", newCinemaId.toString());
      }

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }

      setTimeout(() => connectWebSocket(newRoom), 100);
    } else {
      setSelectedCinemaId(newCinemaId);
    }

    setChatMode("ADMIN");
    resetAutoCloseTimeout();
  };

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (
      !inputValue.trim() ||
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {
      return;
    }

    if (chatMode === "ADMIN") {
      setMessages((prev) =>
        prev.filter(
          (m) => m.content !== "[SYSTEM_CLOSE]" && m.content !== "[SYSTEM_OPEN]"
        )
      );
    }

    const payload = {
      roomId,
      sender: "Khách Hàng",
      content: inputValue,
      senderRole: "USER",
      receiverRole: chatMode === "ADMIN" ? "ADMIN" : "BOT",
      cinemaItemId: chatMode === "ADMIN" ? selectedCinemaId : null,
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload),
    });

    setInputValue("");

    if (chatMode === "ADMIN") resetAutoCloseTimeout();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".btn-no-drag")) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    if (typeof window !== "undefined") {
      const widgetWidth = Math.min(CHAT_WIDTH, window.innerWidth - SAFE_MARGIN * 2);
      const widgetHeight = Math.min(
        CHAT_HEIGHT,
        window.innerHeight - SAFE_MARGIN * 2
      );

      newX = Math.max(
        SAFE_MARGIN,
        Math.min(newX, window.innerWidth - widgetWidth - SAFE_MARGIN)
      );

      newY = Math.max(
        SAFE_MARGIN,
        Math.min(newY, window.innerHeight - widgetHeight - SAFE_MARGIN)
      );
    }

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    const target = e.target as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  };

  const renderMessageContent = (text: string, role: string) => {
    if (role === "USER") {
      return text.split("\n").map((item, i) => (
        <span key={i}>
          {item}
          <br />
        </span>
      ));
    }

    const parts = text.split(/(\$\$MOVIE\|[^$]+\$\$|\$\$SEEMORE\$\$)/g);

    const parseInlineFormat = (rawText: string) => {
      const subParts = rawText.split(/(\*\*[^*]+\*\*)/g);

      return subParts.map((subPart, subIdx) => {
        if (subPart.startsWith("**") && subPart.endsWith("**")) {
          return (
            <strong
              key={subIdx}
              className="font-black text-white mx-0.5 drop-shadow-md"
            >
              {subPart.slice(2, -2)}
            </strong>
          );
        }

        return subPart.split("\n").map((line, lineIdx) => (
          <React.Fragment key={`${subIdx}-${lineIdx}`}>
            {line}
            {lineIdx < subPart.split("\n").length - 1 && <br />}
          </React.Fragment>
        ));
      });
    };

    return parts.map((part, index) => {
      if (part.startsWith("$$MOVIE|")) {
        const cleanPart = part.replace("$$MOVIE|", "").replace(/\$\$$/, "");
        const [id, title, ...posterUrlParts] = cleanPart.split("|");
        const poster = posterUrlParts.join("|");

        return (
          <Link href={`/movies/${id}`} key={index} className="block mt-3 mb-2 group/movie">
            <div className="relative flex items-center bg-[#0b1020] border border-[#1f2a44] p-2.5 rounded-2xl overflow-hidden transition-all duration-300 group-hover/movie:-translate-y-1 group-hover/movie:border-yellow-300/45 group-hover/movie:shadow-[0_10px_28px_rgba(244,212,25,0.12)]">
              <img
                src={poster}
                alt={title}
                className="w-14 h-20 object-cover rounded-xl shadow-md bg-[#111936]"
              />

              <div className="flex-1 ml-3">
                <h4 className="text-slate-100 font-black text-[13px] leading-tight line-clamp-2 mb-1">
                  {title}
                </h4>

                <p className="text-[10px] text-yellow-300 font-black uppercase flex items-center gap-1.5 transition-colors">
                  <Film size={12} />
                  Đặt vé ngay
                </p>
              </div>
            </div>
          </Link>
        );
      }

      if (part === "$$SEEMORE$$") {
        return (
          <Link href="/movies" key={index} className="block mt-4 mb-1">
            <div className="w-full py-3 bg-[#0b1020] border border-[#1f2a44] hover:border-yellow-300/45 text-center rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 group/see">
              <span className="text-[11px] font-black text-yellow-300 uppercase tracking-widest">
                Khám phá kho phim
              </span>

              <ArrowRight
                size={14}
                className="text-yellow-300 group-hover/see:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        );
      }

      return <React.Fragment key={index}>{parseInlineFormat(part)}</React.Fragment>;
    });
  };

  const currentCinemaName = cinemaItems.find((c) => c.id === selectedCinemaId)?.name;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end select-none font-sans">
      {/* KHUNG CHAT */}
      <div
        className={`fixed bg-[#080b14]/96 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_45px_rgba(34,211,238,0.08)] flex flex-col overflow-hidden transform transition-all ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
        style={{
          width: "min(380px, calc(100vw - 24px))",
          height: "min(600px, calc(100vh - 24px))",
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging
            ? "none"
            : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.4s, left 0.1s ease-out, top 0.1s ease-out",
        }}
      >
        {/* HEADER */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="p-4 flex justify-between items-center relative overflow-hidden cursor-move touch-none shrink-0 bg-[#0b1020] border-b border-white/10"
        >
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-300/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 pointer-events-none">
            <div
              className={`w-12 h-12 backdrop-blur-md rounded-2xl flex items-center justify-center border p-2.5 shadow-inner ${
                chatMode === "ADMIN"
                  ? "bg-emerald-400/10 border-emerald-300/25"
                  : "bg-yellow-300/10 border-yellow-300/25"
              }`}
            >
              {chatMode === "ADMIN" ? (
                <Headset size={24} className="text-emerald-200 drop-shadow-md" />
              ) : (
                <Bot size={24} className="text-yellow-200 drop-shadow-md" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-white text-[15px] tracking-widest uppercase italic drop-shadow-md">
                  {chatMode === "ADMIN" ? "Quản lý rạp" : "Trợ lý KN"}
                </h3>

                <Move size={12} className="text-white/35" />
              </div>

              <p className="text-[10px] text-slate-300 font-black flex items-center gap-1.5 tracking-widest mt-0.5 uppercase">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnecting
                      ? "bg-amber-400 animate-pulse"
                      : "bg-green-400 shadow-[0_0_8px_#4ade80]"
                  }`}
                />
                {isConnecting ? "Đang kết nối..." : "Hệ thống online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {chatMode === "BOT" ? (
              <button
                onClick={() => setChatMode("SELECT_CINEMA")}
                className="btn-no-drag w-8 h-8 rounded-full bg-white/[0.06] hover:bg-yellow-300/15 border border-white/10 hover:border-yellow-300/35 text-white hover:text-yellow-200 flex items-center justify-center transition-all active:scale-95"
                title="Gặp quản lý"
              >
                <Headset size={14} />
              </button>
            ) : chatMode === "ADMIN" ? (
              <button
                onClick={handleUserActiveCancel}
                className="btn-no-drag w-8 h-8 rounded-full bg-white/[0.06] hover:bg-red-500/80 border border-white/10 hover:border-red-300/40 text-white flex items-center justify-center transition-all active:scale-95"
                title="Kết thúc trò chuyện"
              >
                <Trash2 size={13} />
              </button>
            ) : null}

            <button
              onClick={() => setIsOpen(false)}
              className="btn-no-drag w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white hover:bg-white/[0.12] transition-all active:scale-90 border border-white/10"
              title="Thu nhỏ"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* BODY */}
        {chatMode === "SELECT_CINEMA" ? (
          <div className="flex-1 overflow-y-auto bg-[#080b14] p-5 flex flex-col items-center custom-scrollbar animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => {
                setChatMode("BOT");
                setSelectedParentCinema(null);
              }}
              className="self-start text-[10px] font-black uppercase text-slate-500 hover:text-yellow-200 mb-6 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={14} />
              Quay lại trò chuyện AI
            </button>

            <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-300/20 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
              <MapPin size={26} className="text-cyan-200" />
            </div>

            {!selectedParentCinema ? (
              <>
                <h4 className="text-white font-black text-[15px] mb-1 uppercase tracking-wide">
                  Chọn hệ thống rạp
                </h4>

                <p className="text-slate-500 text-xs font-medium text-center mb-6 px-4 leading-relaxed">
                  Chọn cụm rạp bạn quan tâm để kết nối đúng nhân viên hỗ trợ.
                </p>

                {isLoadingCinemas ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Loader2 size={22} className="animate-spin mb-3 text-yellow-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Đang tải rạp...
                    </span>
                  </div>
                ) : cinemas.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-10">
                    Chưa có hệ thống rạp khả dụng.
                  </div>
                ) : (
                  <div className="w-full space-y-2.5">
                    {cinemas.map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedParentCinema(parent)}
                        className="w-full bg-[#0d1222] border border-[#141c30] p-4 rounded-xl text-left text-[13px] font-bold text-slate-300 hover:text-yellow-200 hover:border-yellow-300/35 transition-all flex justify-between items-center group shadow-sm"
                      >
                        <span className="uppercase tracking-wider">{parent.name}</span>

                        <ArrowRight
                          size={16}
                          className="text-slate-600 group-hover:text-yellow-300 group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full animate-in slide-in-from-right-4 duration-200">
                <h4 className="text-white font-black text-[15px] mb-1 text-center uppercase tracking-wide">
                  Chọn chi nhánh
                </h4>

                <p className="text-slate-500 text-xs font-medium text-center mb-4">
                  Thuộc hệ thống {selectedParentCinema.name}
                </p>

                <button
                  onClick={() => setSelectedParentCinema(null)}
                  className="w-full mb-4 text-[10px] font-black uppercase text-yellow-300 hover:text-yellow-200 py-2.5 bg-yellow-300/10 rounded-xl transition-colors border border-yellow-300/20"
                >
                  Đổi hệ thống rạp khác
                </button>

                <div className="w-full space-y-2.5">
                  {cinemaItems
                    .filter(
                      (i) =>
                        i.cinema?.id === selectedParentCinema.id ||
                        i.cinemaId === selectedParentCinema.id ||
                        (i as any).cinema === selectedParentCinema.id
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectCinema(item.id)}
                        className="w-full bg-[#0d1222] border border-[#141c30] p-4 rounded-xl text-left text-slate-300 hover:text-cyan-200 hover:border-cyan-300/35 transition-all flex justify-between items-center group shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-[13px] uppercase tracking-wider">
                            {item.name}
                          </span>

                          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {item.city}
                          </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-cyan-300/35 transition-colors">
                          <ArrowRight
                            size={14}
                            className="text-slate-500 group-hover:text-cyan-200 group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[#080b14]">
              <div className="text-center mb-6 mt-2">
                <span className="text-[9px] bg-white/[0.04] px-4 py-1.5 rounded-full text-slate-500 font-black border border-white/10 uppercase tracking-[0.2em]">
                  Hỗ trợ đặt vé và tư vấn phim
                </span>
              </div>

              <div className="flex flex-col items-start animate-in fade-in duration-500">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 pl-1 flex items-center gap-1.5">
                  <Sparkles size={10} className="text-yellow-300" />
                  Trợ lý AI KN
                </span>

                <div className="max-w-[85%] text-[13px] px-5 py-4 rounded-2xl rounded-tl-sm shadow-md leading-relaxed bg-[#0d1222] border border-[#141c30] text-slate-300">
                  Xin chào! Tôi là trợ lý AI của KN Cinema. Bạn cần kiểm tra lịch
                  chiếu, giá vé hay muốn nhận gợi ý phim hôm nay?
                </div>
              </div>

              {chatMode === "ADMIN" && selectedCinemaId && (
                <div className="flex flex-col items-center my-6 animate-in zoom-in-95 duration-300">
                  <div className="bg-cyan-400/10 border border-cyan-300/20 px-5 py-3 rounded-2xl text-center max-w-[90%] shadow-inner">
                    <p className="text-[10px] text-cyan-200 font-black uppercase tracking-widest mb-1">
                      Đã kết nối tổng đài viên
                    </p>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Hỗ trợ viên tại <b>{currentCinemaName}</b> đã tham gia trò
                      chuyện. Vui lòng cung cấp mã vé hoặc vấn đề bạn cần xử lý.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.senderRole === "USER";
                const isAdmin = msg.senderRole === "ADMIN";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                      {isUser ? (
                        "Bạn"
                      ) : isAdmin ? (
                        <>
                          <Headset size={10} className="text-cyan-300" />
                          CSKH KN
                        </>
                      ) : (
                        <>
                          <Sparkles size={10} className="text-yellow-300" />
                          Trợ lý AI
                        </>
                      )}
                    </span>

                    <div
                      className={`max-w-[88%] text-[13px] px-5 py-3.5 rounded-2xl shadow-lg leading-relaxed border ${
                        isUser
                          ? "bg-yellow-300 text-[#111827] border-yellow-200 rounded-tr-sm shadow-yellow-900/10 font-semibold"
                          : isAdmin
                            ? "bg-cyan-400/10 border-cyan-300/20 text-cyan-50 rounded-tl-sm"
                            : "bg-[#0d1222] border-[#141c30] text-slate-300 rounded-tl-sm"
                      }`}
                    >
                      {renderMessageContent(msg.content, msg.senderRole)}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 bg-[#0b1020]/96 backdrop-blur-xl border-t border-white/10 flex gap-2.5 shrink-0 relative z-20"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isConnecting}
                placeholder={
                  chatMode === "ADMIN"
                    ? "Nhắn với quản lý rạp..."
                    : "Hỏi AI KN Cinema..."
                }
                className="flex-1 bg-[#0d1222] border border-[#1f2a44] rounded-xl px-4 py-3.5 text-[13px] font-medium text-white focus:outline-none focus:border-yellow-300/50 focus:shadow-[0_0_0_3px_rgba(244,212,25,0.08)] transition-all placeholder:text-slate-600 disabled:opacity-50 shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isConnecting}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                  chatMode === "ADMIN"
                    ? "bg-cyan-500 hover:bg-cyan-400 text-[#061018] shadow-[0_0_20px_rgba(34,211,238,0.22)]"
                    : "bg-yellow-300 hover:bg-yellow-200 text-[#111827] shadow-[0_0_20px_rgba(244,212,25,0.22)]"
                }`}
              >
                {isConnecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} className="ml-0.5" />
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <button
        onClick={handleOpenChat}
        className={`w-16 h-16 bg-yellow-300 hover:bg-yellow-200 rounded-full flex items-center justify-center text-[#111827] shadow-[0_12px_34px_rgba(244,212,25,0.34),0_0_28px_rgba(34,211,238,0.1)] transition-all duration-500 hover:scale-110 hover:-translate-y-2 border-2 border-white/20 hover:border-white/50 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 animate-[chatFloat_3.5s_ease-in-out_infinite]"
        }`}
        aria-label="Mở chat hỗ trợ"
      >
        <MessageCircle size={28} strokeWidth={2.5} />
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 212, 25, 0.45);
        }

        @keyframes chatFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-8px) scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}