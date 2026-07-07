"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Sparkles,
  CircleDollarSign,
  Boxes,
} from "lucide-react";
import { apiRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

interface ComboAdmin {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean;
  stock: number;
}

export default function AdminComboPage() {
  const [combos, setCombos] = useState<ComboAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_admin") || "";
    }

    return "";
  };

  const loadCombos = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const token = getAdminToken();

      const res = await apiRequest("/api/v1/cinema-combos", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok) {
        const data = Array.isArray(result) ? result : result.data || [];

        const formattedData = data.map((combo: any) => ({
          ...combo,
          stock: combo.stock !== undefined ? combo.stock : 0,
        }));

        setCombos(formattedData);
      } else {
        toast.error(result.message || "Không thể tải danh mục combo");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleToggle = async (comboId: number) => {
    if (togglingId) return;

    setTogglingId(comboId);

    try {
      const token = getAdminToken();

      const res = await apiRequest(`/api/v1/cinema-combos/${comboId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setCombos((prev) =>
          prev.map((combo) =>
            combo.id === comboId
              ? { ...combo, available: !combo.available }
              : combo
          )
        );

        toast.success("Đã cập nhật trạng thái combo thành công");
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateStock = async (comboId: number) => {
    const numericStock = parseInt(editValue, 10);

    if (isNaN(numericStock) || numericStock < 0) {
      toast.error("Số lượng tồn kho phải là số lớn hơn hoặc bằng 0");
      setEditingId(null);
      return;
    }

    const currentCombo = combos.find((combo) => combo.id === comboId);

    if (currentCombo && currentCombo.stock === numericStock) {
      setEditingId(null);
      return;
    }

    setUpdatingStockId(comboId);

    try {
      const token = getAdminToken();

      const res = await apiRequest(`/api/v1/cinema-combos/${comboId}/stock`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: numericStock,
        }),
      });

      if (res.ok) {
        setCombos((prev) =>
          prev.map((combo) =>
            combo.id === comboId ? { ...combo, stock: numericStock } : combo
          )
        );

        toast.success("Cập nhật số lượng tồn kho thành công");
      } else {
        const errResult = await res.json().catch(() => ({}));
        toast.error(errResult.message || "Không thể cập nhật số lượng tồn kho");
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng khi cập nhật kho");
    } finally {
      setUpdatingStockId(null);
      setEditingId(null);
    }
  };

  const startEditing = (combo: ComboAdmin) => {
    if (updatingStockId !== null) return;

    setEditingId(combo.id);
    setEditValue(
      combo.stock !== null && combo.stock !== undefined
        ? combo.stock.toString()
        : "0"
    );
  };

  const filteredCombos = combos.filter((combo) =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCount = combos.filter((combo) => combo.available).length;
  const totalStock = combos.reduce((sum, combo) => sum + Number(combo.stock || 0), 0);

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
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
        }}
      />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <ShoppingBag size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Quản lý thực đơn
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                THỰC ĐƠN{" "}
                <span className="text-yellow-300">CHI NHÁNH</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Hệ thống quản lý combo bắp nước KN Cinema
              </p>
            </div>
          </div>

          <div className="relative w-full xl:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              type="text"
              placeholder="Tìm tên combo bắp nước..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs focus:border-cyan-300/45 focus:bg-[#111827] outline-none transition-all placeholder:text-slate-600 text-white shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
            />
          </div>
        </header>

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
              <ShoppingBag size={18} className="text-yellow-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Tổng combo
              </p>

              <p className="text-sm font-black text-white">
                {combos.length.toLocaleString("vi-VN")} món
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Đang bán
              </p>

              <p className="text-sm font-black text-white">
                {availableCount.toLocaleString("vi-VN")} món
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-300/10 border border-emerald-300/25 flex items-center justify-center">
              <Boxes size={18} className="text-emerald-300" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                Tổng tồn kho
              </p>

              <p className="text-sm font-black text-white">
                {totalStock.toLocaleString("vi-VN")} phần
              </p>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading ? (
          <div className="py-44 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={28} />
            </div>

            <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
              Đang đồng bộ dữ liệu thực đơn
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {filteredCombos.map((combo) => (
              <div
                key={combo.id}
                className={`group bg-[#0d1222] border border-[#182038] transition-all duration-300 rounded-2xl overflow-hidden flex flex-col shadow-[0_18px_50px_rgba(0,0,0,0.26)] hover:-translate-y-1 ${
                  combo.available
                    ? "hover:border-cyan-300/35 hover:shadow-[0_20px_42px_rgba(34,211,238,0.08)]"
                    : "opacity-55 grayscale hover:opacity-80"
                }`}
              >
                <div className="aspect-[4/3] w-full bg-[#080c1b] border-b border-white/10 relative overflow-hidden">
                  <img
                    src={
                      combo.imageUrl ||
                      "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400"
                    }
                    alt={combo.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/70 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3">
                    {combo.available ? (
                      <div className="bg-cyan-300 text-[#111827] p-1.5 rounded-full shadow-[0_0_14px_rgba(103,232,249,0.35)]">
                        <CheckCircle2 size={13} />
                      </div>
                    ) : (
                      <div className="bg-[#0b1020] text-slate-500 p-1.5 rounded-full border border-white/10">
                        <XCircle size={13} />
                      </div>
                    )}
                  </div>

                  <div className="absolute left-3 bottom-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.12em] border ${
                        combo.available
                          ? "bg-yellow-300/95 text-[#111827] border-yellow-200"
                          : "bg-[#0b1020]/95 text-slate-500 border-white/10"
                      }`}
                    >
                      {combo.available ? "Đang bán" : "Tạm ẩn"}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      className={`text-xs md:text-sm font-black uppercase tracking-wide line-clamp-1 transition-colors ${
                        combo.available
                          ? "text-white group-hover:text-yellow-200"
                          : "text-slate-600"
                      }`}
                    >
                      {combo.name}
                    </h3>

                    <p className="text-[10px] md:text-[11px] text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                      {combo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <span
                      className={`text-sm font-black tracking-wide flex items-center gap-1.5 ${
                        combo.available ? "text-yellow-300" : "text-slate-600"
                      }`}
                    >
                      <CircleDollarSign size={13} />
                      {Number(combo.price).toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Package
                        size={13}
                        className={
                          combo.available ? "text-cyan-300" : "text-slate-700"
                        }
                      />

                      {editingId === combo.id ? (
                        <input
                          ref={inputRef}
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(event) => setEditValue(event.target.value)}
                          onBlur={() => handleUpdateStock(combo.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          className="w-16 bg-[#080c1b] text-white text-xs font-black px-2 py-1 rounded-lg border border-yellow-300/60 outline-none text-center shadow-[0_0_14px_rgba(244,212,25,0.16)]"
                        />
                      ) : (
                        <span
                          onClick={() => startEditing(combo)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer truncate flex items-center gap-1 ${
                            updatingStockId === combo.id
                              ? "bg-[#111827] border-white/10 text-slate-600"
                              : combo.available
                                ? "bg-[#111827] border-white/10 text-slate-300 hover:border-yellow-300/45 hover:text-yellow-200"
                                : "bg-[#080c1b] border-white/5 text-slate-600"
                          }`}
                          title="Click để sửa số lượng kho nhanh"
                        >
                          {updatingStockId === combo.id ? (
                            <Loader2
                              size={10}
                              className="animate-spin text-slate-500"
                            />
                          ) : (
                            <>
                              Kho:
                              <span className="font-black text-yellow-300">
                                {combo.stock}
                              </span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggle(combo.id)}
                      disabled={togglingId === combo.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer border active:scale-95 ${
                        combo.available
                          ? "bg-yellow-300 border-yellow-200 shadow-[0_0_14px_rgba(244,212,25,0.28)]"
                          : "bg-[#111827] border-white/10"
                      }`}
                      aria-label="Bật tắt trạng thái combo"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                          combo.available
                            ? "translate-x-6 bg-[#111827]"
                            : "translate-x-0.5 bg-slate-500"
                        }`}
                      />

                      {togglingId === combo.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                          <Loader2 size={10} className="animate-spin text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCombos.length === 0 && (
          <div className="py-28 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <ShoppingBag className="mx-auto text-slate-600 mb-4" size={34} />

            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.18em]">
              Không tìm thấy combo bắp nước phù hợp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}