"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Layers,
  Search,
  ShieldAlert,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Database,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/genres");

      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      } else {
        toast.error("Không thể tải danh sách thể loại");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((category) =>
      String(category.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setErrorMessage("");
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Tên thể loại không được để trống");
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/v1/genres/${currentId}` : "/api/v1/genres";

    try {
      setSubmitting(true);

      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(
          isEditing ? "Cập nhật thành công!" : "Thêm thể loại mới thành công!"
        );

        resetForm();
        fetchCategories();
      } else {
        const message = data?.message || data?.error || "Có lỗi xảy ra";
        setErrorMessage(message);
        toast.error(message);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Thao tác thất bại");
      toast.error("Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async (id: number) => {
    const loadingToast = toast.loading("Đang thực hiện xóa...");

    try {
      setDeletingId(id);

      const res = await apiSuperAdminRequest(`/api/v1/genres/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn thể loại.", {
          id: loadingToast,
        });

        fetchCategories();

        if (currentId === id) {
          resetForm();
        }
      } else {
        const data = await res.json().catch(() => ({}));

        toast.error(data?.message || "Không thể xóa mục này.", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error("Lỗi kết nối hệ thống.", {
        id: loadingToast,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: number) => {
    toast(
      (toastItem) => (
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/25 flex items-center justify-center shrink-0">
              <ShieldAlert className="text-rose-300" size={18} />
            </div>

            <div>
              <p className="text-xs font-black text-white uppercase tracking-[0.08em]">
                Xác nhận xóa thể loại?
              </p>

              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">
                Dữ liệu sẽ bị xóa khỏi hệ thống nếu không bị ràng buộc bởi phim.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(toastItem.id)}
              className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              onClick={() => {
                toast.dismiss(toastItem.id);
                executeDelete(id);
              }}
              className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.12em] rounded-xl hover:bg-rose-400 transition-all shadow-[0_12px_28px_rgba(244,63,94,0.18)] active:scale-95"
            >
              Xác nhận
            </button>
          </div>
        </div>
      ),
      {
        duration: 5200,
        style: {
          background: "#0b1020",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
          padding: "14px",
          borderRadius: "16px",
        },
      }
    );
  };

  const editCategory = (category: any) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setErrorMessage("");
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-full bg-transparent px-5 sm:px-8 md:px-10 py-8 md:py-10 text-slate-300 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
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
              <Layers size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Genres Registry
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CẤU HÌNH{" "}
                <span className="text-yellow-300">THỂ LOẠI</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Quản lý dữ liệu phân loại phim KN Cinema
              </p>
            </div>
          </div>

          <button
            onClick={fetchCategories}
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-yellow-300/35 text-slate-200 hover:text-yellow-300 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ dữ liệu
          </button>
        </header>

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard
            icon={<Layers size={18} />}
            title="Tổng thể loại"
            value={`${categories.length.toLocaleString("vi-VN")} mục`}
            theme="yellow"
          />

          <SummaryCard
            icon={<Search size={18} />}
            title="Kết quả hiển thị"
            value={`${filtered.length.toLocaleString("vi-VN")} mục`}
            theme="cyan"
          />

          <SummaryCard
            icon={<Database size={18} />}
            title="Trạng thái dữ liệu"
            value={loading ? "Đang đồng bộ" : "Sẵn sàng"}
            theme="emerald"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* FORM */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleSubmit}
              className="bg-[#0d1222] border border-white/10 rounded-2xl p-5 md:p-6 sticky top-24 shadow-[0_22px_60px_rgba(0,0,0,0.32)] relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
              <div className="pointer-events-none absolute top-[-120px] right-[-120px] w-72 h-72 bg-yellow-300/[0.04] blur-3xl rounded-full" />
              <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] w-72 h-72 bg-cyan-300/[0.035] blur-3xl rounded-full" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isEditing
                          ? "bg-cyan-300/10 text-cyan-300 border-cyan-300/25"
                          : "bg-yellow-300/10 text-yellow-300 border-yellow-300/25"
                      }`}
                    >
                      {isEditing ? <Pencil size={15} /> : <Plus size={15} />}
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                        {isEditing ? "Cập nhật dữ liệu" : "Thiết lập mới"}
                      </h3>

                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {isEditing
                          ? `Đang chỉnh sửa mã #${currentId}`
                          : "Tạo phân loại phim mới"}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-9 h-9 rounded-xl bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:bg-rose-500 hover:border-rose-400 transition-all active:scale-95 flex items-center justify-center"
                      aria-label="Hủy chỉnh sửa"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-400/25 p-3.5 flex items-start gap-2.5">
                    <AlertTriangle
                      size={15}
                      className="text-rose-300 shrink-0 mt-0.5"
                    />

                    <p className="text-[10px] font-bold text-rose-200 leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.16em] mb-2 block">
                      Tên thể loại
                    </label>

                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                      placeholder="Ví dụ: Hành động, Kinh dị..."
                      className="w-full h-12 bg-[#080c1b] border border-white/10 rounded-xl px-4 text-xs font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all placeholder:text-slate-600 text-white shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.16em] mb-2 block">
                      Mô tả chi tiết
                    </label>

                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          description: event.target.value,
                        })
                      }
                      placeholder="Nhập mô tả ngắn gọn về phân loại phim này..."
                      className="w-full bg-[#080c1b] border border-white/10 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all resize-none placeholder:text-slate-600 text-white leading-relaxed shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black uppercase text-[10px] tracking-[0.14em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}

                    {submitting
                      ? "Đang lưu"
                      : isEditing
                        ? "Cập nhật dữ liệu"
                        : "Áp dụng cấu hình"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* TABLE */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-all"
                size={15}
              />

              <input
                type="text"
                value={searchTerm}
                placeholder="Tìm kiếm nhanh tên thể loại phim..."
                className="w-full h-12 bg-[#0d1222] border border-white/10 rounded-2xl pl-11 pr-4 text-xs font-bold outline-none focus:border-cyan-300/45 focus:bg-[#111827] transition-all text-white placeholder:text-slate-600 shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
              <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center">
                    <FileText size={15} className="text-cyan-300" />
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                      Bảng dữ liệu thể loại
                    </h3>

                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {filtered.length.toLocaleString("vi-VN")} kết quả đang hiển thị
                    </p>
                  </div>
                </div>

                {!loading && (
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-300/10 border border-emerald-300/25 px-3 py-1.5">
                    <CheckCircle2 size={12} className="text-emerald-300" />

                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-[#111827] border-b border-white/10">
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.13em] w-24">
                        Mã số
                      </th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.13em]">
                        Tên thể loại
                      </th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.13em]">
                        Dữ liệu mô tả
                      </th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.13em] text-right w-32">
                        Hành động
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                              <RefreshCw
                                className="animate-spin text-yellow-300"
                                size={26}
                              />
                            </div>

                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] animate-pulse">
                              Đang đồng bộ dữ liệu
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-16 text-center">
                          <Layers className="mx-auto text-slate-600 mb-4" size={36} />

                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            Hệ thống không tìm thấy kết quả phù hợp
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((category) => (
                        <tr
                          key={category.id}
                          className="hover:bg-[#111827] group transition-colors"
                        >
                          <td className="p-4">
                            <span className="text-xs font-mono font-black text-slate-600 group-hover:text-yellow-300 transition-colors">
                              #{category.id}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="text-xs font-black text-slate-100 group-hover:text-yellow-200 transition-colors uppercase tracking-[0.05em]">
                              {category.name}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="text-xs text-slate-500 max-w-sm break-words line-clamp-2 font-medium group-hover:text-slate-300 transition-colors leading-relaxed">
                              {category.description ||
                                "Chưa có dữ liệu mô tả cho mục này"}
                            </p>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => editCategory(category)}
                                className="w-9 h-9 bg-[#080c1b] hover:bg-yellow-300/10 hover:text-yellow-300 rounded-xl transition-all border border-white/10 hover:border-yellow-300/35 active:scale-90 flex items-center justify-center"
                                title="Chỉnh sửa thể loại"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                onClick={() => confirmDelete(category.id)}
                                disabled={deletingId === category.id}
                                className="w-9 h-9 bg-[#080c1b] hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all border border-white/10 hover:border-rose-400/35 active:scale-90 disabled:opacity-50 flex items-center justify-center"
                                title="Xóa thể loại"
                              >
                                {deletingId === category.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

function SummaryCard({
  icon,
  title,
  value,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  theme: "yellow" | "cyan" | "emerald";
}) {
  const themeMap = {
    yellow: {
      border: "hover:border-yellow-300/35",
      icon: "bg-yellow-300/10 text-yellow-300 border-yellow-300/25",
      text: "text-yellow-300",
    },
    cyan: {
      border: "hover:border-cyan-300/35",
      icon: "bg-cyan-300/10 text-cyan-300 border-cyan-300/25",
      text: "text-cyan-300",
    },
    emerald: {
      border: "hover:border-emerald-300/35",
      icon: "bg-emerald-300/10 text-emerald-300 border-emerald-300/25",
      text: "text-emerald-300",
    },
  };

  const currentTheme = themeMap[theme];

  return (
    <div
      className={`rounded-2xl bg-[#0d1222] border border-white/10 p-4 flex items-center gap-3 shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 ${currentTheme.border}`}
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${currentTheme.icon}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <p className={`text-sm font-black ${currentTheme.text}`}>{value}</p>
      </div>
    </div>
  );
}