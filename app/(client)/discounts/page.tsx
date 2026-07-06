"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Loader2,
  Copy,
  History,
  Ticket,
  X,
  CheckCircle2,
  Wallet,
  CalendarDays,
  BadgePercent,
  CircleDollarSign,
  Gift,
  Flame
} from 'lucide-react';

import { apiRequest } from '@/app/lib/api';

// Bộ lọc voucher còn thời hạn sử dụng
const isNotExpired = (voucher: any) => {
  if (!voucher.endDate) return true;
  return new Date(voucher.endDate).getTime() >= new Date().getTime();
};

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [marketVouchers, setMarketVouchers] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  const [userInfo, setUserInfo] = useState({
    points: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token_user')
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes, voucherRes, marketRes] = await Promise.all([
        apiRequest('/api/v1/users/me', { headers }),
        apiRequest('/api/v1/vouchers/my-vouchers', { headers }),
        apiRequest('/api/v1/vouchers/redeemable', { headers }),
      ]);

      const [u, v, m] = await Promise.all([
        userRes.json(),
        voucherRes.json(),
        marketRes.json(),
      ]);

      setUserInfo({
        points: u.data?.points || 0,
      });

      setVouchers(Array.isArray(v.data) ? v.data : []);
      setMarketVouchers(Array.isArray(m.data) ? m.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenHistory = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token_user')
        : null;

    try {
      const res = await apiRequest('/api/v1/vouchers/point-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      setPointHistory(Array.isArray(json.data) ? json.data : []);
      setIsHistoryOpen(true);
    } catch (e) {
      console.error('Lỗi:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validMyVouchers = vouchers.filter(isNotExpired);
  const validMarketVouchers = marketVouchers.filter(isNotExpired);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-4 md:p-8 no-scrollbar selection:bg-red-600 selection:text-white">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* THÈ TÍCH ĐIỂM ĐỎ ĐEN - LUXURY CINEMA CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e0e] via-[#121212] to-[#181111] border border-zinc-800/60 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
          {/* Hiệu ứng hào quang đỏ mờ phía sau */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-900/5 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-extrabold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Tài khoản tích điểm
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-[1000] tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent italic">
                  {userInfo.points.toLocaleString()}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-red-500">
                  Điểm thưởng
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenHistory}
              className="bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/30 text-zinc-400 hover:text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 shadow-lg group/btn text-xs font-bold uppercase tracking-widest"
            >
              <History size={15} className="group-hover/btn:rotate-[-15deg] text-red-500 transition-transform" />
              Lịch sử nhận/đổi
            </button>
          </div>
        </div>

        {/* THANH CHUYỂN TAB ĐỎ ĐEN CHUẨN RẠP PHIM */}
        <div className="flex bg-[#0a0a0a] border border-zinc-900 p-1.5 rounded-2xl shadow-inner">
          {(['my', 'market'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.3)] scale-[1.01]'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {tab === 'my' ? 'Kho Voucher của tôi' : 'Đổi Quà Thưởng'}
            </button>
          ))}
        </div>

        {/* DANH SÁCH THẺ VOUCHER */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={28} />
              <p className="text-[10px] uppercase tracking-widest text-zinc-700 font-bold">Đang tải dữ liệu...</p>
            </div>
          ) : activeTab === 'my' ? (
            validMyVouchers.length > 0 ? (
              validMyVouchers.map((v) => <VoucherCard key={v.id} v={v} />)
            ) : (
              <EmptyState message="Kho mã trống! Hãy tích điểm để đổi nhiều ưu đãi hấp dẫn nhé." />
            )
          ) : validMarketVouchers.length > 0 ? (
            validMarketVouchers.map((v) => {
              const alreadyOwned = vouchers.some(
                (myVoucher) =>
                  myVoucher.id === v.id ||
                  myVoucher.code === v.code ||
                  myVoucher.title === v.title
              );

              return (
                <MarketCard
                  key={v.id}
                  v={v}
                  balance={userInfo.points}
                  onRedeem={fetchData}
                  alreadyOwned={alreadyOwned}
                />
              );
            })
          ) : (
            <EmptyState message="Chợ quà thưởng hiện đang đóng hoặc đã hết quà." />
          )}
        </div>
      </div>

      {/* CỬA SỔ LỊCH SỬ ĐIỂM THƯỞNG (MODAL) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/5 blur-2xl rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <History size={16} className="text-red-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  Biến động điểm số
                </h3>
              </div>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar relative z-10">
              {pointHistory.length > 0 ? (
                pointHistory.map((h: any) => {
                  const typeStr = String(h.type || '').toUpperCase();
                  const isAddType = typeStr.includes('ADD') || typeStr.includes('EARN') || typeStr.includes('REWARD') || typeStr.includes('REFUND');
                  const isMinusType = typeStr.includes('DEDUCT') || typeStr.includes('USE') || typeStr.includes('REDEEM') || typeStr.includes('SUB');
                  
                  let isPositive = true;
                  if (isAddType) isPositive = true;
                  else if (isMinusType) isPositive = false;
                  else isPositive = Number(h.amount) > 0;

                  return (
                    <div
                      key={h.id}
                      className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-zinc-300 truncate">
                          {h.description}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                          {new Date(h.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black font-mono shrink-0 ${
                          isPositive ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? '+' : '-'}{Math.abs(Number(h.amount))}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-600 text-[10px] uppercase tracking-widest font-extrabold">
                  Chưa ghi nhận biến động nào
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* THẺ VOUCHER CỦA TÔI (ĐỎ ĐEN) */
function VoucherCard({ v }: { v: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#090909] to-[#141414] border border-zinc-900 hover:border-zinc-800/80 rounded-2xl p-5 transition-all duration-300 group flex gap-4">
      
      {/* Thiết kế vết cắt cuống vé */}
      <div className="flex flex-col items-center justify-center pr-4 border-r-2 border-dashed border-zinc-800/80 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-red-600/5 border border-red-600/10 flex items-center justify-center text-red-500 shadow-inner">
          <Ticket size={22} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        {v.voucherType && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-zinc-900 text-[8px] tracking-wider font-black uppercase text-zinc-500 border border-zinc-800">
            {v.voucherType === 'TICKET' ? 'Vé' : v.voucherType === 'FOOD' ? 'Nước' : 'Mã giảm'}
          </span>
        )}
      </div>

      {/* Chi tiết nội dung */}
      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
          {v.title}
        </h4>

        {v.description && (
          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
            {v.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[10px] text-zinc-400 pt-1">
          {v.discountValue && (
            <div className="flex items-center gap-1 font-extrabold text-red-500">
              <CircleDollarSign size={12} />
              Giảm {Number(v.discountValue).toLocaleString()}đ
            </div>
          )}
          {v.minOrderAmount && (
            <div className="flex items-center gap-1 text-zinc-500">
              <BadgePercent size={12} />
              Đơn từ {Number(v.minOrderAmount).toLocaleString()}đ
            </div>
          )}
          {v.endDate && (
            <div className="flex items-center gap-1 text-zinc-600 font-mono">
              <CalendarDays size={11} />
              HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <div className="bg-black border border-zinc-900 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest text-zinc-400 select-all group-hover:border-red-600/20 transition-colors">
            {v.code}
          </div>
          {v.usageLimit !== undefined && (
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
              Còn {Math.max(0, (v.usageLimit || 0) - (v.usedCount || 0))} lượt dùng
            </span>
          )}
        </div>
      </div>

      {/* Nút Copy */}
      <button
        onClick={handleCopy}
        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 hover:text-white hover:border-red-600/30 transition-all shrink-0 self-center group/copy"
      >
        {copied ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <Copy size={15} className="group-hover/copy:scale-105 transition-transform" />
        )}
      </button>
    </div>
  );
}

/* THẺ ĐỔI ĐIỂM TRÊN CHỢ ĐỎ ĐEN */
function MarketCard({
  v,
  balance,
  onRedeem,
  alreadyOwned,
}: {
  v: any;
  balance: number;
  onRedeem: () => void;
  alreadyOwned: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const canAfford = balance >= v.costPoints;

  const handleRedeem = async () => {
    if (alreadyOwned || !canAfford) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token_user');

      await apiRequest(`/api/v1/vouchers/redeem/${v.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onRedeem();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#090909] to-[#141414] border border-zinc-900 rounded-2xl p-5 transition-all duration-300 group flex gap-4">
      
      {/* Cuống quà tặng */}
      <div className="flex flex-col items-center justify-center pr-4 border-r-2 border-dashed border-zinc-800/80 shrink-0">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner ${
          alreadyOwned ? 'bg-zinc-900/50 text-zinc-600 border-zinc-850' : 'bg-red-600/5 text-red-500 border-red-600/10'
        }`}>
          <Gift size={20} />
        </div>
        {alreadyOwned && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] font-black uppercase tracking-wider text-zinc-500">
            Sở hữu
          </span>
        )}
      </div>

      {/* Nội dung quà */}
      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
          {v.title}
        </h4>

        {v.description && (
          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
            {v.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[10px] text-zinc-400 pt-1">
          {v.discountValue && (
            <div className="flex items-center gap-1 font-extrabold text-zinc-400">
              <CircleDollarSign size={12} className="text-zinc-600" />
              Trị giá {Number(v.discountValue).toLocaleString()}đ
            </div>
          )}
          {v.endDate && (
            <div className="flex items-center gap-1 text-zinc-600 font-mono">
              <CalendarDays size={11} />
              Hạn đổi: {new Date(v.endDate).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>

        {/* Điểm số yêu cầu dạng nhãn lửa đỏ */}
        <div className="pt-2 flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Flame size={12} className="fill-red-500/20" />
            {v.costPoints.toLocaleString()} Điểm
          </div>
          {v.usageLimit !== undefined && (
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
              Còn {Math.max(0, (v.usageLimit || 0) - (v.usedCount || 0))} suất
            </span>
          )}
        </div>
      </div>

      {/* Nút tương tác đổi thưởng */}
      <button
        disabled={!canAfford || submitting || alreadyOwned}
        onClick={handleRedeem}
        className={`shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 h-fit self-center border ${
          alreadyOwned
            ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
            : !canAfford
              ? 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white border-transparent active:scale-95 shadow-[0_4px_15px_rgba(220,38,38,0.2)]'
        }`}
      >
        {submitting ? '...' : alreadyOwned ? 'Đã có' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
      </button>
    </div>
  );
}

/* KHÔNG CÓ DỮ LIỆU */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-[#090909] border border-zinc-900 flex items-center justify-center mx-auto text-zinc-800">
        <Ticket size={24} className="stroke-[1.5]" />
      </div>
      <p className="text-xs font-medium text-zinc-500 leading-relaxed px-4">
        {message}
      </p>
    </div>
  );
}