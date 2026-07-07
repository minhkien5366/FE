"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { apiAdminRequest } from "@/app/lib/api";
import {
  ChevronLeft,
  Heart,
  Trash2,
  Plus,
  Save,
  RefreshCcw,
  AlertTriangle,
  Lock,
  Loader2,
  Armchair,
  Monitor,
  Sparkles,
} from "lucide-react";

export default function SeatDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;

  const [danhSachGhe, setDanhSachGhe] = useState<any[]>([]);
  const [deletedSeatIds, setDeletedSeatIds] = useState<number[]>([]);

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [config, setConfig] = useState({ rows: 10, cols: 12 });
  const [manualSeat, setManualSeat] = useState({ row: "A", num: "1" });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  const adminToast: any = {
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
      padding: "14px 16px",
    },
    success: {
      iconTheme: {
        primary: "#f4d419",
        secondary: "#111827",
      },
    },
    error: {
      iconTheme: {
        primary: "#fb7185",
        secondary: "#111827",
      },
    },
  };

  const taiDuLieu = useCallback(async () => {
    if (!roomId) return;

    try {
      setDangTai(true);
      setDeletedSeatIds([]);

      const resSeats = await apiAdminRequest(`/api/v1/seats/room/${roomId}`);
      const resultSeats = await resSeats.json();
      const seatsData = resultSeats.data || [];

      setDanhSachGhe(seatsData);

      if (seatsData.length > 0 && seatsData[0]?.room) {
        const roomData = seatsData[0].room;

        setRoomInfo({
          id: roomData.id,
          name: roomData.name,
          totalSeats: roomData.totalSeats || 0,
        });

        return;
      }

      const resRoom = await apiAdminRequest(`/api/v1/rooms/${roomId}`);

      if (!resRoom.ok) throw new Error("Không load được room");

      const roomResult = await resRoom.json();
      const rawRoom = roomResult.data;

      setRoomInfo({
        id: rawRoom.id,
        name: rawRoom.name,
        totalSeats: rawRoom.totalSeats || 0,
      });
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Lỗi tải dữ liệu!", adminToast);
    } finally {
      setDangTai(false);
    }
  }, [roomId]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "warning"
  ) => {
    setModalConfig({ isOpen: true, title, message, onConfirm, type });
  };

  const closeConfirm = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const checkSeatEligibility = async (seatId: any) => {
    try {
      const res = await apiAdminRequest(`/api/v1/seats/${seatId}/check-tickets`);

      if (res.ok) {
        const result = await res.json();
        return result.data.canDelete;
      }

      return false;
    } catch {
      return false;
    }
  };

  const handleXoaGhe = async (ghe: any) => {
    const isTemp = String(ghe.id).startsWith("temp-");

    if (isTemp) {
      setDanhSachGhe((prev) => prev.filter((seat) => seat.id !== ghe.id));
      return;
    }

    const loadingCheck = toast.loading("Đang kiểm tra dữ liệu...", adminToast);
    const canDelete = await checkSeatEligibility(ghe.id);

    toast.dismiss(loadingCheck);

    if (!canDelete) {
      return openConfirm(
        "Không thể thao tác!",
        "Phòng chiếu này hiện đã có lịch suất chiếu hoạt động hoặc sắp diễn ra. Không thể xóa ghế này.",
        closeConfirm,
        "info"
      );
    }

    openConfirm(
      "Xác nhận xóa ghế?",
      `Ghế ${ghe.seatRow}${ghe.seatNumber} sẽ biến mất khỏi sơ đồ. Bấm LƯU DATABASE để xóa thật.`,
      () => {
        closeConfirm();
        setDeletedSeatIds((prev) => [...prev, ghe.id]);
        setDanhSachGhe((prev) => prev.filter((seat) => seat.id !== ghe.id));
        toast.success(
          `Đã xóa ảo ghế ${ghe.seatRow}${ghe.seatNumber}!`,
          adminToast
        );
      },
      "danger"
    );
  };

  const handleResetSạchSẽ = () => {
    if (danhSachGhe.length === 0) {
      return toast.error("Phòng đang trống!", adminToast);
    }

    openConfirm(
      "Dọn sạch sơ đồ?",
      "Toàn bộ ghế sẽ bị gỡ khỏi màn hình. Cần bấm LƯU DATABASE để cập nhật vào máy chủ.",
      async () => {
        closeConfirm();

        const realSeats = danhSachGhe.filter(
          (ghe) => !String(ghe.id).startsWith("temp-")
        );

        if (realSeats.length > 0) {
          const loadingCheck = toast.loading(
            "Đang kiểm tra điều kiện...",
            adminToast
          );

          const isEligible = await checkSeatEligibility(realSeats[0].id);

          toast.dismiss(loadingCheck);

          if (!isEligible) {
            return openConfirm(
              "Không thể dọn sạch!",
              "Phòng chiếu này hiện đã có lịch suất chiếu hoạt động. Không thể thực hiện dọn sạch sơ đồ mẫu.",
              closeConfirm,
              "info"
            );
          }
        }

        setDeletedSeatIds((prev) => [
          ...prev,
          ...realSeats.map((ghe) => ghe.id),
        ]);

        setDanhSachGhe([]);

        toast.success(
          "Đã dọn sạch ảo. Hãy bấm LƯU DATABASE để xác nhận.",
          adminToast
        );
      },
      "danger"
    );
  };

  const handleGenerateMultiple = () => {
    const totalToGenerate = config.rows * config.cols;
    const maxCapacity = roomInfo?.totalSeats || 0;

    if (totalToGenerate > maxCapacity) {
      return toast.error(
        `Vượt sức chứa cấu hình rạp (${maxCapacity})!`,
        adminToast
      );
    }

    openConfirm(
      "Tạo sơ đồ hàng loạt?",
      `Tạo ma trận ${config.rows}x${config.cols}. Thao tác này sẽ gỡ bỏ các ghế cũ trên màn hình. Cần bấm LƯU DATABASE để áp dụng.`,
      async () => {
        closeConfirm();

        const realSeats = danhSachGhe.filter(
          (ghe) => !String(ghe.id).startsWith("temp-")
        );

        if (realSeats.length > 0) {
          const loadingCheck = toast.loading(
            "Đang kiểm tra dữ liệu...",
            adminToast
          );

          const isEligible = await checkSeatEligibility(realSeats[0].id);

          toast.dismiss(loadingCheck);

          if (!isEligible) {
            return openConfirm(
              "Không thể tạo hàng loạt!",
              "Phòng chiếu này đã có suất chiếu. Vui lòng đợi các suất chiếu kết thúc để cấu hình lại sơ đồ.",
              closeConfirm,
              "info"
            );
          }
        }

        const newSeats = [];
        let currentRow = 65;

        for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
          const rowChar = String.fromCharCode(currentRow + rowIndex);

          for (let colIndex = 1; colIndex <= config.cols; colIndex++) {
            newSeats.push({
              id: `temp-gen-${Date.now()}-${rowIndex}-${colIndex}`,
              seatRow: rowChar,
              seatNumber: colIndex,
              seatType: "NORMAL",
              price: 80000,
              roomId: Number(roomId),
            });
          }
        }

        setDeletedSeatIds((prev) => [
          ...prev,
          ...realSeats.map((ghe) => ghe.id),
        ]);

        setDanhSachGhe(newSeats);

        toast.success(
          "Đã khởi tạo ma trận ảo. Hãy bấm LƯU DATABASE để hoàn tất.",
          adminToast
        );
      }
    );
  };

  const handleAddSingleSeat = () => {
    const row = manualSeat.row.trim().toUpperCase();
    const num = parseInt(manualSeat.num);
    const maxCapacity = roomInfo?.totalSeats || 0;

    if (!row || isNaN(num)) {
      return toast.error("Nhập đủ thông tin!", adminToast);
    }

    if (danhSachGhe.length >= maxCapacity) {
      return toast.error("Phòng đầy!", adminToast);
    }

    if (
      danhSachGhe.some(
        (ghe) => ghe.seatRow === row && Number(ghe.seatNumber) === num
      )
    ) {
      return toast.error("Trùng vị trí ghế!", adminToast);
    }

    const newSeat = {
      id: `temp-add-${Date.now()}`,
      seatRow: row,
      seatNumber: num,
      seatType: "NORMAL",
      price: 60000,
      roomId: Number(roomId),
    };

    setDanhSachGhe((prev) => [...prev, newSeat]);
    setManualSeat((prev) => ({ ...prev, num: (num + 1).toString() }));
  };

  const toggleSeatType = (ghe: any) => {
    const types = ["NORMAL", "VIP", "SWEETBOX"];
    const prices: any = {
      NORMAL: 80000,
      VIP: 120000,
      SWEETBOX: 250000,
    };

    const nextType = types[(types.indexOf(ghe.seatType) + 1) % types.length];

    setDanhSachGhe(
      danhSachGhe.map((seat) =>
        seat.id === ghe.id
          ? { ...seat, seatType: nextType, price: prices[nextType] }
          : seat
      )
    );
  };

  const handleSaveAll = async () => {
    setDangLuu(true);

    const loading = toast.loading(
      "Đang đồng bộ dữ liệu. Vui lòng không đóng trang!",
      adminToast
    );

    try {
      for (const id of deletedSeatIds) {
        const res = await apiAdminRequest(`/api/v1/seats/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          throw new Error(result.message || "Lỗi khi xóa ghế cũ!");
        }
      }

      for (const ghe of danhSachGhe) {
        const isNew = String(ghe.id).startsWith("temp-");

        const body = {
          seatRow: ghe.seatRow,
          seatNumber: ghe.seatNumber,
          seatType: ghe.seatType,
          price: ghe.price,
          roomId: Number(roomId),
        };

        const res = await apiAdminRequest(
          isNew ? "/api/v1/seats" : `/api/v1/seats/${ghe.id}`,
          {
            method: isNew ? "POST" : "PUT",
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          throw new Error(
            result.message || `Lỗi khi lưu ghế ${ghe.seatRow}${ghe.seatNumber}!`
          );
        }
      }

      toast.success("Đã đồng bộ sơ đồ xuống máy chủ thành công!", {
        id: loading,
        ...adminToast,
      });

      taiDuLieu();
    } catch (err: any) {
      toast.error(err.message || "Lỗi đồng bộ dữ liệu hệ thống!", {
        id: loading,
        ...adminToast,
      });
    } finally {
      setDangLuu(false);
    }
  };

  const groupedSeats: any = useMemo(() => {
    return danhSachGhe.reduce((acc: any, ghe: any) => {
      const row = ghe.seatRow;

      if (!acc[row]) acc[row] = [];
      acc[row].push(ghe);

      return acc;
    }, {});
  }, [danhSachGhe]);

  const sortedRows = useMemo(
    () => Object.keys(groupedSeats).sort(),
    [groupedSeats]
  );

  const maxColNum = useMemo(
    () =>
      Math.max(
        config.cols,
        ...danhSachGhe.map((ghe) => Number(ghe.seatNumber) || 0)
      ),
    [danhSachGhe, config.cols]
  );

  const CustomModal = () => {
    if (!modalConfig.isOpen) return null;

    const isDanger = modalConfig.type === "danger";
    const isInfo = modalConfig.type === "info";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
        <div
          className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md"
          onClick={closeConfirm}
        />

        <div className="bg-[#0b1020] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden relative z-10 shadow-[0_28px_80px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`h-1 w-full bg-gradient-to-r from-transparent ${
              isDanger
                ? "via-rose-400"
                : isInfo
                  ? "via-cyan-300"
                  : "via-yellow-300"
            } to-transparent`}
          />

          <div className="p-6">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 border ${
                isDanger
                  ? "bg-rose-500/10 text-rose-300 border-rose-400/25"
                  : isInfo
                    ? "bg-cyan-300/10 text-cyan-300 border-cyan-300/25"
                    : "bg-yellow-300/10 text-yellow-300 border-yellow-300/25"
              }`}
            >
              {isInfo ? <Lock size={24} /> : <AlertTriangle size={24} />}
            </div>

            <h3
              className="text-2xl font-black text-white uppercase tracking-[-0.04em] mb-2"
              style={{
                fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
              }}
            >
              {modalConfig.title}
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              {modalConfig.message}
            </p>
          </div>

          <div className="flex border-t border-white/10">
            {!isInfo && (
              <button
                onClick={closeConfirm}
                className="flex-1 px-6 py-4 text-[10px] font-black uppercase text-slate-500 hover:bg-[#111827] hover:text-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            )}

            <button
              onClick={isInfo ? closeConfirm : modalConfig.onConfirm}
              className={`flex-1 px-6 py-4 text-[10px] font-black uppercase transition-all ${
                isDanger
                  ? "bg-rose-500 hover:bg-rose-400 text-white"
                  : isInfo
                    ? "bg-cyan-300 hover:bg-cyan-200 text-[#111827]"
                    : "bg-yellow-300 hover:bg-yellow-200 text-[#111827]"
              }`}
            >
              {isInfo ? "Đã hiểu" : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (dangTai) {
    return (
      <div className="h-screen bg-transparent flex items-center justify-center text-white relative overflow-hidden">
        <div className="pointer-events-none absolute top-[-160px] left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-white/[0.025] blur-[160px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-300" size={28} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            Loading Designer
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-transparent text-slate-400 flex flex-col overflow-hidden font-sans relative">
      <Toaster position="top-right" toastOptions={adminToast} />

      <CustomModal />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />

      <header className="h-[76px] px-5 md:px-6 border-b border-white/10 flex justify-between items-center bg-[#0b1020]/80 backdrop-blur-xl z-30 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-[#111827] border border-white/10 rounded-xl text-slate-300 hover:bg-yellow-300 hover:text-[#111827] hover:border-yellow-200 transition-all active:scale-95"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={11} className="text-yellow-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                Seat Designer
              </span>
            </div>

            <h1 className="text-sm font-black text-white tracking-[0.12em] uppercase leading-none truncate">
              {roomInfo?.name || "PHÒNG CHƯA ĐẶT TÊN"}
            </h1>

            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.18em] mt-1.5">
              Sức chứa: {danhSachGhe.length} / {roomInfo?.totalSeats || 0}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleResetSạchSẽ}
            className="h-10 px-4 bg-[#111827] border border-white/10 hover:bg-rose-500 hover:border-rose-400 text-slate-200 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-[0.12em] transition-all flex items-center gap-2 active:scale-95"
          >
            <Trash2 size={12} />
            Reset sạch
          </button>

          <button
            onClick={handleSaveAll}
            disabled={dangLuu}
            className="h-10 px-5 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black text-[9px] uppercase tracking-[0.12em] transition-all flex items-center gap-2 shadow-[0_16px_36px_rgba(244,212,25,0.22)] disabled:opacity-55 disabled:cursor-not-allowed active:scale-95"
          >
            {dangLuu ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {dangLuu ? "Saving..." : "Lưu database"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <aside className="w-[270px] bg-[#0b1020]/92 border-r border-white/10 p-5 flex flex-col gap-6 shrink-0">
          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] flex items-center gap-2">
              <RefreshCcw size={11} className="text-yellow-300" />
              Tạo tự động
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">
                  Hàng
                </span>

                <input
                  type="number"
                  value={config.rows}
                  onChange={(e) =>
                    setConfig({ ...config, rows: +e.target.value })
                  }
                  className="w-full bg-[#0d1222] border border-white/10 focus:border-cyan-300/45 rounded-xl py-2.5 text-white text-center text-xs outline-none font-black"
                />
              </div>

              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">
                  Cột
                </span>

                <input
                  type="number"
                  value={config.cols}
                  onChange={(e) =>
                    setConfig({ ...config, cols: +e.target.value })
                  }
                  className="w-full bg-[#0d1222] border border-white/10 focus:border-cyan-300/45 rounded-xl py-2.5 text-white text-center text-xs outline-none font-black"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateMultiple}
              className="w-full h-11 bg-yellow-300 hover:bg-yellow-200 text-[#111827] rounded-xl font-black text-[9px] uppercase tracking-[0.12em] transition-all active:scale-95 shadow-[0_16px_36px_rgba(244,212,25,0.18)]"
            >
              Tạo hàng loạt
            </button>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.16em] flex items-center gap-2">
              <Plus size={11} className="text-cyan-300" />
              Thêm ghế lẻ
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualSeat.row}
                onChange={(e) =>
                  setManualSeat({ ...manualSeat, row: e.target.value })
                }
                className="w-1/2 bg-[#0d1222] border border-white/10 focus:border-cyan-300/45 rounded-xl py-2.5 text-center text-white text-xs font-black uppercase outline-none"
              />

              <input
                type="number"
                value={manualSeat.num}
                onChange={(e) =>
                  setManualSeat({ ...manualSeat, num: e.target.value })
                }
                className="w-1/2 bg-[#0d1222] border border-white/10 focus:border-cyan-300/45 rounded-xl py-2.5 text-center text-white text-xs font-black outline-none"
              />
            </div>

            <button
              onClick={handleAddSingleSeat}
              className="w-full h-11 bg-[#111827] text-slate-200 hover:text-cyan-200 hover:border-cyan-300/35 border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-[0.12em] transition-all active:scale-95"
            >
              Chèn ghế
            </button>
          </div>

          <div className="mt-auto p-4 bg-[#0d1222] rounded-xl border border-white/10 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-3 tracking-[0.16em]">
              Chú thích
            </p>

            <div className="space-y-2 text-[9px] font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#111827] border border-white/10 rounded-sm" />
                Normal
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-300/20 border border-yellow-300/35 rounded-sm" />
                VIP
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-pink-400/20 border border-pink-300/35 rounded-sm" />
                Sweetbox
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-transparent overflow-auto p-8 md:p-12 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-xl mb-16 relative">
            <div className="relative h-12">
              <div className="absolute left-0 right-0 top-5 h-[5px] rounded-full bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_34px_rgba(244,212,25,0.45)]" />
              <div className="absolute left-8 right-8 top-0 h-16 bg-gradient-to-b from-yellow-300/14 to-transparent blur-2xl opacity-80" />
            </div>

            <p className="text-[8px] font-black tracking-[1.2em] text-yellow-200/70 text-center mt-1 uppercase ml-[1.2em]">
              Screen Area
            </p>
          </div>

          {sortedRows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1222] px-10 py-14">
                <Armchair className="mx-auto text-slate-600 mb-4" size={38} />

                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.18em]">
                  Chưa có ghế trong sơ đồ
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pb-32">
              {sortedRows.map((rowLetter) => (
                <div key={rowLetter} className="flex items-center gap-5">
                  <span className="w-5 text-right font-black text-slate-700 text-[10px] uppercase">
                    {rowLetter}
                  </span>

                  <div className="flex gap-1.5">
                    {Array.from({ length: maxColNum }).map((_, index) => {
                      const seatNum = index + 1;
                      const ghe = (groupedSeats[rowLetter] || []).find(
                        (seat: any) => Number(seat.seatNumber) === seatNum
                      );

                      if (!ghe) {
                        return (
                          <div
                            key={index}
                            className="w-8 h-8 border border-dashed border-white/10 rounded-lg opacity-45"
                          />
                        );
                      }

                      const isSweet = ghe.seatType === "SWEETBOX";
                      const isVip = ghe.seatType === "VIP";

                      return (
                        <div
                          key={ghe.id}
                          onClick={() => toggleSeatType(ghe)}
                          className={`h-8 flex-shrink-0 rounded-lg flex flex-col items-center justify-center border relative group cursor-pointer transition-all duration-200 active:scale-90 hover:-translate-y-0.5 ${
                            isSweet
                              ? "w-[66px] bg-pink-400/10 border-pink-300/40 text-pink-200 hover:bg-pink-300/16"
                              : isVip
                                ? "w-8 bg-yellow-300/10 border-yellow-300/40 text-yellow-200 hover:bg-yellow-300/16"
                                : "w-8 bg-[#111827] border-white/10 text-slate-400 hover:border-cyan-300/45 hover:text-cyan-200"
                          }`}
                        >
                          {isSweet && (
                            <Heart
                              size={8}
                              fill="currentColor"
                              className="mb-0.5 animate-pulse"
                            />
                          )}

                          {!isSweet && (
                            <Monitor
                              size={8}
                              className="mb-0.5 opacity-50"
                            />
                          )}

                          <span className="text-[8px] font-black select-none tracking-tighter leading-none">
                            {ghe.seatRow}
                            {ghe.seatNumber}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleXoaGhe(ghe);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 text-[10px] font-bold shadow-[0_6px_14px_rgba(244,63,94,0.28)]"
                            aria-label="Xóa ghế"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <span className="w-5 text-left font-black text-slate-700 text-[10px] uppercase">
                    {rowLetter}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
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