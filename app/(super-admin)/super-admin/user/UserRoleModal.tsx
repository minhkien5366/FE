"use client";

import React from "react";
import {
  Search,
  Building2,
  Check,
  X,
  ShieldCheck,
  User,
  MapPin,
  Lock,
  Sparkles,
  Loader2,
  Mail,
  AlertTriangle,
  Crown,
} from "lucide-react";

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedCinema: number | string;
  setSelectedCinema: (id: number | string) => void;
  cinemaSearch: string;
  setCinemaSearch: (search: string) => void;
  filteredCinemas: any[];
  onConfirm: () => void;
  allUsers: any[];
  isSubmitting?: boolean;
}

const hasRole = (user: any, roleName: string) => {
  if (!Array.isArray(user?.roles)) return false;

  return user.roles.some((role: any) => {
    const value =
      typeof role === "string"
        ? role
        : role?.name || role?.roleName || role?.authority || "";

    return String(value).toUpperCase() === roleName.toUpperCase();
  });
};

const getFullName = (user: any) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return fullName || user?.email || "Người dùng hệ thống";
};

export default function UserRoleModal({
  isOpen,
  onClose,
  selectedUser,
  selectedRole,
  setSelectedRole,
  selectedCinema,
  setSelectedCinema,
  cinemaSearch,
  setCinemaSearch,
  filteredCinemas,
  onConfirm,
  allUsers,
  isSubmitting = false,
}: UserRoleModalProps) {
  if (!isOpen) return null;

  const getAdminOfCinema = (cinemaId: number) => {
    return allUsers.find(
      (user) =>
        (hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN")) &&
        String(user.managedCinemaItemId) === String(cinemaId) &&
        user.userId !== selectedUser?.userId
    );
  };

  const selectedCinemaData = filteredCinemas.find(
    (cinema) => String(cinema.id) === String(selectedCinema)
  );

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 select-none">
      <div
        className="absolute inset-0 bg-[#020617]/86 backdrop-blur-md animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative bg-[#0b1020] border border-white/10 w-full max-w-2xl rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.58)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="pointer-events-none absolute top-[-140px] right-[-120px] w-96 h-96 rounded-full bg-yellow-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] w-96 h-96 rounded-full bg-cyan-300/[0.035] blur-3xl" />

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
          aria-label="Đóng modal"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 p-6 md:p-7 border-b border-white/10 bg-[#0d1222]">
          <div className="flex items-center gap-4 pr-12">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center text-yellow-300 shadow-[0_18px_45px_rgba(244,212,25,0.12)]">
              <Crown size={21} />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Access Permission Console
                </span>
              </div>

              <h2
                className="text-2xl md:text-3xl font-black uppercase text-white tracking-[-0.045em] leading-none"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                CẤP QUYỀN <span className="text-yellow-300">TRUY CẬP</span>
              </h2>

              <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-[0.14em] truncate flex items-center gap-1.5">
                <Mail size={11} className="text-cyan-300 shrink-0" />
                {selectedUser?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-7 space-y-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-2xl bg-[#080c1b] border border-white/10 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-300/10 border border-cyan-300/25 flex items-center justify-center text-cyan-300 shrink-0">
              <User size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-[0.04em] truncate">
                {getFullName(selectedUser)}
              </p>

              <p className="text-[10px] text-slate-500 font-bold truncate">
                User ID #{selectedUser?.userId || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.18em] ml-1">
              Vai trò hệ thống
            </label>

            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#080c1b] rounded-2xl border border-white/10">
              {[
                {
                  label: "Thành viên",
                  val: "ROLE_USER",
                  icon: <User size={14} />,
                  desc: "Quyền người dùng",
                },
                {
                  label: "Quản trị",
                  val: "ROLE_ADMIN",
                  icon: <ShieldCheck size={14} />,
                  desc: "Quản lý chi nhánh",
                },
              ].map((item) => {
                const active = selectedRole === item.val;

                return (
                  <button
                    key={item.val}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setSelectedRole(item.val);

                      if (item.val === "ROLE_USER") {
                        setSelectedCinema("");
                      }
                    }}
                    className={`rounded-xl p-4 text-left transition-all active:scale-[0.98] disabled:opacity-50 border ${
                      active
                        ? "bg-yellow-300 text-[#111827] border-yellow-200 shadow-[0_16px_34px_rgba(244,212,25,0.2)]"
                        : "bg-[#0d1222] border-white/10 text-slate-500 hover:text-cyan-200 hover:border-cyan-300/35 hover:bg-[#111827]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.14em]">
                      {item.icon}
                      {item.label}
                    </div>

                    <p
                      className={`text-[9px] font-bold mt-2 ${
                        active ? "text-[#111827]/65" : "text-slate-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole === "ROLE_ADMIN" && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.18em] flex items-center gap-2 ml-1">
                <Building2 size={12} className="text-yellow-300" />
                Chọn cơ sở rạp quản lý
              </label>

              <div className="bg-[#080c1b] border border-white/10 rounded-2xl p-4">
                <div className="relative mb-4 group">
                  <Search
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-300 transition-colors"
                  />

                  <input
                    type="text"
                    placeholder="Tìm tên, địa chỉ hoặc thành phố rạp..."
                    className="w-full bg-[#0d1222] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-bold outline-none text-white placeholder:text-slate-600 focus:border-cyan-300/45 focus:bg-[#111827] transition-all"
                    value={cinemaSearch}
                    disabled={isSubmitting}
                    onChange={(event) => setCinemaSearch(event.target.value)}
                  />
                </div>

                <div className="max-h-[240px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {filteredCinemas.length > 0 ? (
                    filteredCinemas.map((cinema) => {
                      const existingAdmin = getAdminOfCinema(cinema.id);
                      const isSelected =
                        String(selectedCinema) === String(cinema.id);
                      const isOccupied = !!existingAdmin;

                      return (
                        <button
                          key={cinema.id}
                          type="button"
                          disabled={isOccupied || isSubmitting}
                          onClick={() => setSelectedCinema(cinema.id)}
                          className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl text-left border transition-all active:scale-[0.99] ${
                            isSelected
                              ? "bg-yellow-300/10 text-white border-yellow-300/45"
                              : isOccupied
                                ? "bg-[#0b1020] text-slate-700 border-white/5 cursor-not-allowed opacity-60"
                                : "bg-[#0d1222] text-slate-400 border-white/10 hover:bg-[#111827] hover:border-cyan-300/35 hover:text-cyan-200"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                                isOccupied
                                  ? "bg-slate-500/10 border-slate-500/20 text-slate-700"
                                  : isSelected
                                    ? "bg-yellow-300/10 border-yellow-300/25 text-yellow-300"
                                    : "bg-cyan-300/10 border-cyan-300/25 text-cyan-300"
                              }`}
                            >
                              {isOccupied ? <Lock size={13} /> : <MapPin size={13} />}
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-[10px] font-black uppercase tracking-[0.08em] truncate ${
                                  isOccupied ? "text-slate-700" : "text-current"
                                }`}
                              >
                                {cinema.name || `Cơ sở #${cinema.id}`}
                              </p>

                              <p className="text-[9px] font-semibold text-slate-600 truncate mt-1">
                                {cinema.address || "Chưa cập nhật địa chỉ"}
                              </p>

                              {isOccupied && (
                                <p className="text-[8px] text-rose-300/80 font-bold mt-1 truncate">
                                  Đã được quản lý bởi: {getFullName(existingAdmin)}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <Check size={15} className="text-yellow-300 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center border border-dashed border-white/10 rounded-xl bg-[#0d1222]">
                      <AlertTriangle
                        size={28}
                        className="mx-auto text-slate-600 mb-3"
                      />

                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Không tìm thấy cơ sở phù hợp
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedCinemaData && (
                <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 flex items-start gap-3">
                  <Check
                    size={15}
                    className="text-emerald-300 shrink-0 mt-0.5"
                  />

                  <p className="text-[10px] text-emerald-100/85 leading-relaxed font-bold">
                    Quản trị viên sẽ được gán quyền quản lý tại{" "}
                    <span className="text-white">
                      {selectedCinemaData.name || selectedCinemaData.address}
                    </span>
                    .
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 p-6 md:p-7 border-t border-white/10 bg-[#0d1222] flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 h-12 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.14em] transition-colors disabled:opacity-40"
          >
            Hủy bỏ
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#111827] font-black uppercase text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_16px_36px_rgba(244,212,25,0.24)]"
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}

            {isSubmitting ? "Đang thiết lập" : "Xác nhận thiết lập"}
          </button>
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
    </div>
  );
}