"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  Building2,
  User as UserIcon,
  ShieldCheck,
  Users,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  UserCog,
  Crown,
  Mail,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest } from "@/app/lib/api";
import UserRoleModal from "./UserRoleModal";

const adminToast: any = {
  duration: 3400,
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

export default function SuperAdminUserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("ROLE_USER");
  const [selectedCinema, setSelectedCinema] = useState<number | string>("");
  const [cinemaSearch, setCinemaSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [userRes, cinemaRes] = await Promise.all([
        apiSuperAdminRequest("/api/v1/users"),
        apiSuperAdminRequest("/api/v1/cinema-items"),
      ]);

      const userData = await userRes.json().catch(() => ({}));
      const cinemaData = await cinemaRes.json().catch(() => ({}));

      if (!userRes.ok) {
        throw new Error(userData?.message || "Không thể tải danh sách người dùng");
      }

      if (!cinemaRes.ok) {
        throw new Error(cinemaData?.message || "Không thể tải danh sách rạp");
      }

      const rawUsers = userData.data?.content || userData.data || [];
      const rawCinemas = cinemaData.data || [];

      setUsers(Array.isArray(rawUsers) ? rawUsers : []);
      setCinemas(Array.isArray(rawCinemas) ? rawCinemas : []);
    } catch (error: any) {
      toast.error(error?.message || "Lỗi tải dữ liệu hệ thống", adminToast);
      setUsers([]);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openRoleModal = (user: any) => {
    const isAdmin = hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN");

    setSelectedUser(user);
    setSelectedRole(isAdmin ? "ROLE_ADMIN" : "ROLE_USER");
    setSelectedCinema(user.managedCinemaItemId || "");
    setCinemaSearch("");
    setIsModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    if (selectedRole === "ROLE_ADMIN" && !selectedCinema) {
      toast.error("Vui lòng chọn cơ sở cho quản trị viên", adminToast);
      return;
    }

    const loadingToast = toast.loading("Đang cập nhật quyền truy cập...", adminToast);

    try {
      setUpdatingRole(true);

      const res = await apiSuperAdminRequest(
        `/api/v1/users/${selectedUser.userId}/assign-role`,
        {
          method: "PUT",
          body: JSON.stringify({
            roles: [selectedRole],
            cinemaItemId:
              selectedRole === "ROLE_ADMIN" ? Number(selectedCinema) : null,
          }),
        }
      );

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Cập nhật quyền thành công", {
          id: loadingToast,
          ...adminToast,
        });

        setIsModalOpen(false);
        setSelectedUser(null);
        fetchData();
      } else {
        toast.error(result?.message || "Không thể cập nhật quyền", {
          id: loadingToast,
          ...adminToast,
        });
      }
    } catch (error) {
      toast.error("Máy chủ không phản hồi", {
        id: loadingToast,
        ...adminToast,
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const isSuperAdmin =
        hasRole(user, "ROLE_SUPER_ADMIN") || hasRole(user, "SUPER_ADMIN");

      return !isSuperAdmin;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""} ${
        user.email || ""
      }`.toLowerCase();

      const matchSearch = fullName.includes(searchTerm.toLowerCase().trim());

      if (activeTab === "ALL") return matchSearch;

      const isAdmin = hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN");

      return activeTab === "ADMIN"
        ? isAdmin && matchSearch
        : !isAdmin && matchSearch;
    });
  }, [visibleUsers, searchTerm, activeTab]);

  const filteredCinemas = useMemo(() => {
    const keyword = cinemaSearch.toLowerCase().trim();

    return cinemas.filter((cinema) => {
      const text = `${cinema.name || ""} ${cinema.address || ""} ${
        cinema.city || ""
      }`.toLowerCase();

      return text.includes(keyword);
    });
  }, [cinemas, cinemaSearch]);

  const adminCount = useMemo(() => {
    return visibleUsers.filter(
      (user) => hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN")
    ).length;
  }, [visibleUsers]);

  const userCount = useMemo(() => {
    return visibleUsers.length - adminCount;
  }, [visibleUsers, adminCount]);

  const assignedAdminCount = useMemo(() => {
    return visibleUsers.filter((user) => {
      const isAdmin = hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN");

      return isAdmin && user.managedCinemaItemId;
    }).length;
  }, [visibleUsers]);

  return (
    <div className="min-h-full bg-transparent text-slate-300 px-5 sm:px-8 md:px-10 py-8 md:py-10 font-sans antialiased select-none tracking-tight relative overflow-hidden selection:bg-yellow-300 selection:text-[#111827]">
      <Toaster position="top-right" reverseOrder={false} toastOptions={adminToast} />

      <div className="pointer-events-none absolute top-[-180px] right-[-140px] w-[560px] h-[560px] bg-cyan-400/[0.025] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] w-[560px] h-[560px] bg-yellow-300/[0.018] rounded-full blur-[160px]" />
      <div className="pointer-events-none absolute top-[160px] left-1/2 -translate-x-1/2 w-[760px] h-[280px] bg-white/[0.018] rounded-full blur-[160px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-[#0d1222] border border-white/10 flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-yellow-300/10 blur-2xl rounded-2xl" />
              <Users size={26} className="text-yellow-300 relative z-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <Sparkles size={11} className="text-cyan-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300">
                  User Access Control
                </span>
              </div>

              <h1
                className="text-[32px] md:text-[50px] font-black uppercase tracking-[-0.055em] leading-none text-white"
                style={{
                  fontFamily: "'Anton', Impact, 'Arial Narrow', sans-serif",
                  WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                }}
              >
                NHÂN SỰ <span className="text-yellow-300">HỆ THỐNG</span>
              </h1>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mt-2">
                Phân quyền quản trị viên chi nhánh và người dùng KN Cinema
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-[#0d1222] hover:bg-[#111827] border border-white/10 hover:border-cyan-300/35 text-slate-200 hover:text-cyan-200 font-black text-[10px] uppercase tracking-[0.13em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_16px_34px_rgba(0,0,0,0.24)] flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-yellow-300" : ""}
            />
            Đồng bộ
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={<Users size={18} />}
            title="Tổng nhân sự"
            value={`${visibleUsers.length.toLocaleString("vi-VN")} tài khoản`}
            theme="yellow"
          />

          <SummaryCard
            icon={<ShieldCheck size={18} />}
            title="Quản trị viên"
            value={`${adminCount.toLocaleString("vi-VN")} tài khoản`}
            theme="cyan"
          />

          <SummaryCard
            icon={<UserIcon size={18} />}
            title="Người dùng"
            value={`${userCount.toLocaleString("vi-VN")} tài khoản`}
            theme="emerald"
          />

          <SummaryCard
            icon={<Building2 size={18} />}
            title="Đã gán cơ sở"
            value={`${assignedAdminCount.toLocaleString("vi-VN")} admin`}
            theme="amber"
          />
        </section>

        <section className="rounded-2xl bg-[#0d1222] border border-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-300 transition-colors"
              size={15}
            />

            <input
              type="text"
              placeholder="Tìm kiếm tên, họ hoặc email nhân sự..."
              className="w-full h-12 bg-[#080c1b] border border-white/10 rounded-xl pl-11 pr-4 text-xs font-bold outline-none text-white placeholder:text-slate-600 focus:border-cyan-300/45 focus:bg-[#111827] transition-all"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex gap-1.5 bg-[#080c1b] p-1.5 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
            {(["ALL", "ADMIN", "USER"] as const).map((tab) => {
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-[0.12em] whitespace-nowrap ${
                    active
                      ? "bg-yellow-300 text-[#111827] shadow-[0_12px_26px_rgba(244,212,25,0.2)]"
                      : "text-slate-500 hover:text-cyan-200 hover:bg-[#111827]"
                  }`}
                >
                  {tab === "ALL" ? "Tất cả" : tab === "ADMIN" ? "Admin" : "User"}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-[#0d1222] border border-white/10 rounded-2xl overflow-hidden relative min-h-[560px] shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="px-5 py-4 bg-[#080c1b] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-300/10 border border-yellow-300/25 flex items-center justify-center">
                <UserCog size={15} className="text-yellow-300" />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.13em] text-white">
                  Bảng phân quyền tài khoản
                </h3>

                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {filteredUsers.length.toLocaleString("vi-VN")} kết quả đang hiển thị
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

          {loading && (
            <div className="absolute inset-0 bg-[#0b1020]/82 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-yellow-300" size={30} />
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Đang đồng bộ nhân sự
                </span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10 text-[9px] font-black uppercase text-slate-500 tracking-[0.13em]">
                  <th className="p-5 pl-8">Người dùng</th>
                  <th className="p-5">Quyền hạn</th>
                  <th className="p-5">Cơ sở quản lý</th>
                  <th className="p-5 text-right pr-8">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {!loading && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isAdmin =
                      hasRole(user, "ROLE_ADMIN") || hasRole(user, "ADMIN");

                    const cinema = cinemas.find(
                      (cinemaItem) =>
                        String(cinemaItem.id) === String(user.managedCinemaItemId)
                    );

                    return (
                      <tr
                        key={user.userId}
                        className="hover:bg-[#111827] group transition-all"
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[#080c1b] border border-white/10 flex items-center justify-center text-yellow-300 font-bold overflow-hidden shadow-inner group-hover:border-yellow-300/35 transition-all shrink-0">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  className="w-full h-full object-cover"
                                  alt={getFullName(user)}
                                />
                              ) : (
                                <UserIcon size={18} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase text-white group-hover:text-yellow-200 transition-all tracking-[0.04em] truncate">
                                {getFullName(user)}
                              </p>

                              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 truncate max-w-[320px]">
                                <Mail size={11} className="text-cyan-300 shrink-0" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-[0.12em] ${
                              isAdmin
                                ? "border-yellow-300/25 text-yellow-300 bg-yellow-300/10"
                                : "border-cyan-300/25 text-cyan-300 bg-cyan-300/10"
                            }`}
                          >
                            {isAdmin ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
                            {isAdmin ? "Quản trị" : "Người dùng"}
                          </span>
                        </td>

                        <td className="p-5">
                          {isAdmin ? (
                            <div className="max-w-[360px]">
                              <p className="text-[11px] text-slate-300 font-black uppercase truncate flex items-center gap-1.5">
                                <Building2
                                  size={12}
                                  className="text-cyan-300 shrink-0"
                                />
                                {cinema?.name || "Chưa gán tên cơ sở"}
                              </p>

                              <p className="text-[9px] text-slate-600 font-bold truncate mt-1">
                                {cinema?.address || "Chưa gán địa chỉ"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.14em]">
                              ---
                            </span>
                          )}
                        </td>

                        <td className="p-5 text-right pr-8">
                          <button
                            onClick={() => openRoleModal(user)}
                            className="h-10 px-4 rounded-xl bg-[#080c1b] border border-white/10 text-slate-400 hover:border-yellow-300/35 hover:text-yellow-300 transition-all active:scale-95 text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2"
                          >
                            <UserCog size={13} />
                            Sửa quyền
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !loading && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-24 text-center text-[10px] font-black uppercase text-slate-500 tracking-[0.18em]"
                      >
                        <AlertCircle
                          size={36}
                          className="mx-auto text-slate-600 mb-4"
                        />
                        Không tìm thấy nhân sự phù hợp
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <UserRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedUser={selectedUser}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedCinema={selectedCinema}
        setSelectedCinema={setSelectedCinema}
        cinemaSearch={cinemaSearch}
        setCinemaSearch={setCinemaSearch}
        filteredCinemas={filteredCinemas}
        onConfirm={handleUpdateRole}
        allUsers={visibleUsers}
        isSubmitting={updatingRole}
      />

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
  theme: "yellow" | "cyan" | "emerald" | "amber";
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
    amber: {
      border: "hover:border-amber-300/35",
      icon: "bg-amber-300/10 text-amber-300 border-amber-300/25",
      text: "text-amber-200",
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

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>

        <p className={`text-sm font-black truncate ${currentTheme.text}`}>
          {value}
        </p>
      </div>
    </div>
  );
}