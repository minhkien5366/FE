"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Monitor,
  Armchair,
  Trash2,
  Building2,
  AlertTriangle,
  Settings2,
  ChevronRight,
  Eye,
  Plus,
  Sparkles,
} from "lucide-react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiAdminRequest } from "@/app/lib/api";
import FormPhongChieu from "./RoomForm";

export default function QuanLyPhongCompact() {
  const router = useRouter();

  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState<string>("");
  const [phongChieu, setPhongChieu] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuuForm, setDangLuuForm] = useState(false);
  const [hienModal, setHienModal] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [duLieuForm, setDuLieuForm] = useState({ name: "", totalSeats: 0 });
  const [errors, setErrors] = useState<any>({});
  const [phongDangChonXoa, setPhongDangChonXoa] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const safeParse = async (res: Response) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

  const taiLaiDanhSach = async (targetId: number) => {
    try {
      const res = await apiAdminRequest(`/api/v1/rooms/cinema-item/${targetId}`);

      if (res.ok) {
        const ketQua = await safeParse(res);
        setPhongChieu(ketQua.data || []);
      }
    } catch (err) {
      console.error("Lỗi cập nhật danh sách phòng:", err);
    }
  };

  useEffect(() => {
    const khoiTao = async () => {
      try {
        setDangTai(true);

        const resUser = await apiAdminRequest("/api/v1/users/me");
        if (!resUser.ok) throw new Error();

        const userRes = await safeParse(resUser);
        const idRap = userRes.data?.managedCinemaItemId;

        if (idRap) {
          setCinemaId(idRap);

          const resCinema = await apiAdminRequest(
            `/api/v1/cinema-items/${idRap}`
          );

          const dataCinema = await safeParse(resCinema);

          setCinemaName(dataCinema.data?.name || `Cơ sở ${idRap}`);
          await taiLaiDanhSach(idRap);
        }
      } catch (err) {
        toast.error("Phiên đăng nhập hết hạn!");
        router.push("/login");
      } finally {
        setDangTai(false);
      }
    };

    khoiTao();
  }, [router]);

  const moThemPhong = () => {
    setDangSuaId(null);
    setDuLieuForm({ name: "", totalSeats: 0 });
    setErrors({});
    setHienModal(true);
  };

  const moSuaPhong = (phong: any) => {
    setDangSuaId(phong.id);
    setDuLieuForm({
      name: phong.name,
      totalSeats: phong.totalSeats,
    });
    setErrors({});
    setHienModal(true);
  };

  const xuLyLuu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaId) return;

    const dangSua = !!dangSuaId;
    const url = dangSua ? `/api/v1/rooms/${dangSuaId}` : "/api/v1/rooms";

    const thongBao = toast.loading("Đang xử lý dữ liệu...");

    try {
      setDangLuuForm(true);

      const res = await apiAdminRequest(url, {
        method: dangSua ? "PUT" : "POST",
        body: JSON.stringify({
          ...duLieuForm,
          cinemaItemId: cinemaId,
        }),
      });

      const data = await safeParse(res);

      if (res.ok) {
        toast.success(dangSua ? "Cập nhật thành công!" : "Đã thêm phòng mới!", {
          id: thongBao,
        });

        setHienModal(false);
        setErrors({});
        await taiLaiDanhSach(cinemaId);
      } else {
        toast.error(data.message || "Thao tác thất bại!", { id: thongBao });
        if (data.data) setErrors(data.data);
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ!", { id: thongBao });
    } finally {
      setDangLuuForm(false);
    }
  };

  const xacNhanXoa = async () => {
    if (!phongDangChonXoa || !cinemaId) return;

    const thongBao = toast.loading("Đang thực hiện xóa...");

    try {
      const res = await apiAdminRequest(
        `/api/v1/rooms/${phongDangChonXoa.id}`,
        { method: "DELETE" }
      );

      const data = await safeParse(res);

      if (res.ok) {
        toast.success(data.message || "Đã xóa phòng thành công!", {
          id: thongBao,
        });

        setPhongDangChonXoa(null);
        await taiLaiDanhSach(cinemaId);
      } else {
        toast.error(data.message || "Phòng đang có suất chiếu chưa diễn ra!", {
          id: thongBao,
        });
      }
    } catch (err) {
      toast.error("Không kết nối được máy chủ!", { id: thongBao });
    }
  };

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans select-none tracking-tight relative overflow-hidden">
      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-white/10 pb-7">
          <div className="flex items-center gap-4">
            <div className="relative p-5 bg-[#0d1222] rounded-2xl text-yellow-300 border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.28)] hover:scale-105 transition">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Building2 size={28} className="relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-yellow-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Quản lý phòng chiếu
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[48px] font-black uppercase tracking-[-0.05em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                RẠP{" "}
                <span className="text-yellow-300">
                  {cinemaName || "KN Cinema"}
                </span>
              </h1>

              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em] mt-2">
                Hệ thống quản lý phòng chiếu nội bộ
              </p>
            </div>
          </div>

          {!dangTai && (
            <button
              onClick={moThemPhong}
              className="h-12 px-6 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black text-[11px] uppercase tracking-[0.13em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.22)] hover:shadow-[0_20px_42px_rgba(244,212,25,0.34)] flex items-center gap-2"
            >
              <Plus size={15} />
              Thêm phòng chiếu
            </button>
          )}
        </header>

        {dangTai ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-300" size={28} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">
              Đang đồng bộ dữ liệu
            </span>
          </div>
        ) : phongChieu.length === 0 ? (
          <div className="py-28 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
            <Monitor className="mx-auto text-slate-600 mb-4" size={38} />

            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.18em]">
              Chưa có phòng chiếu nào
            </p>

            <button
              onClick={moThemPhong}
              className="mt-6 h-11 px-6 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
            >
              Tạo phòng đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {phongChieu.map((phong) => (
              <motion.div
                key={phong.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.24 }}
                className="group relative bg-[#0d1222] border border-[#182038] rounded-2xl p-5 md:p-6 hover:border-cyan-300/35 transition-all duration-300 overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.26)]"
              >
                <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 bg-cyan-300/[0.045] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-300/10 group-hover:border-cyan-300/30 transition-colors shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                    <Monitor
                      size={23}
                      className="text-yellow-300 group-hover:text-cyan-300 transition-colors"
                    />
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moSuaPhong(phong);
                      }}
                      className="w-9 h-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-300 hover:border-yellow-300/35 transition-all active:scale-95"
                      aria-label="Sửa phòng"
                    >
                      <Settings2 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhongDangChonXoa({ id: phong.id, name: phong.name });
                      }}
                      className="w-9 h-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-300 hover:border-rose-400/35 transition-all active:scale-95"
                      aria-label="Xóa phòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-5 group-hover:text-yellow-200 transition-colors relative z-10 truncate">
                  {phong.name}
                </h3>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Armchair
                      size={16}
                      className="text-slate-500 group-hover:text-cyan-300 transition"
                    />

                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {phong.totalSeats} Ghế
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/admin/rooms/${phong.id}`)}
                    className="text-[10px] font-black uppercase flex items-center gap-1 text-slate-500 hover:text-yellow-300 transition"
                  >
                    Xem
                    <Eye size={14} />
                    <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {hienModal && (
        <FormPhongChieu
          dangSuaId={dangSuaId}
          duLieuForm={duLieuForm}
          setDuLieuForm={setDuLieuForm}
          errors={errors}
          loading={dangLuuForm}
          onSubmit={xuLyLuu}
          onDong={() => {
            setHienModal(false);
            setErrors({});
          }}
        />
      )}

      {phongDangChonXoa && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md"
            onClick={() => setPhongDangChonXoa(null)}
          />

          <div className="relative bg-[#0b1020] border border-white/10 rounded-2xl p-7 w-full max-w-sm text-center shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <div className="pointer-events-none absolute top-[-110px] left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-400/[0.05] blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-400/25 flex items-center justify-center mb-5">
                <AlertTriangle size={30} className="text-rose-300" />
              </div>

              <h2
                className="text-2xl font-black text-white mb-2 uppercase tracking-[-0.04em]"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                }}
              >
                Xác nhận xóa?
              </h2>

              <p className="text-slate-500 text-[10px] font-black mb-7 uppercase tracking-[0.18em]">
                {phongDangChonXoa.name}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPhongDangChonXoa(null)}
                  className="h-11 rounded-xl bg-[#111827] border border-white/10 text-slate-300 hover:bg-white/[0.08] font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95"
                >
                  Hủy
                </button>

                <button
                  onClick={xacNhanXoa}
                  className="h-11 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-[10px] uppercase tracking-[0.14em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,63,94,0.2)]"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}