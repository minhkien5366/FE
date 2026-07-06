"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Loader2, ChevronDown, 
  CreditCard, ArrowLeft, Ticket, Coffee, Receipt, ChevronUp, Tag,
  Film, Calendar, Monitor, MapPin, QrCode
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import Link from 'next/link';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/api/v1/orders/my-history');
        if (res.ok) {
          const result = await res.json();
          setOrders((result.data || []).sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    })();
  }, []);

  const fmtVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 no-scrollbar selection:bg-red-600 selection:text-white">
      <nav className="max-w-4xl mx-auto flex justify-between mb-10 opacity-70">
        <Link href="/profile" className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter hover:text-red-600 transition-colors">
          <ArrowLeft size={14} /> Quay lại hồ sơ
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Hệ thống giao dịch A&K</span>
      </nav>

      <main className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">Lịch sử <span className="text-zinc-800">Giao dịch</span></h1>
          <div className="h-1 w-12 bg-red-600 mt-2 rounded-full" />
        </header>

        <div className="space-y-6">
          {orders.length > 0 ? orders.map((o) => {
            // Phân loại vật phẩm dựa trên cấu trúc JSON từ API
            const tickets = o.orderDetails?.filter((item: any) => item.itemType === 'TICKET') || [];
            const combos = o.orderDetails?.filter((item: any) => item.itemType === 'COMBO') || [];
            const voucherItem = o.orderDetails?.find((item: any) => item.itemType === 'VOUCHER');

            // Tính toán tạm tính từ các mặt hàng thực tế mua (Vé + Combo)
            const purchaseItems = o.orderDetails?.filter((item: any) => item.itemType !== 'VOUCHER') || [];
            const subTotal = purchaseItems.reduce((acc: number, item: any) => acc + (Math.abs(item.price) * (item.quantity || 1)), 0);
            
            // Tính số tiền giảm (bọc lót nếu BE lưu price = 0 thì lấy tạm tính trừ tổng tiền)
            const discountAmount = voucherItem && Math.abs(voucherItem.price) > 0 
              ? Math.abs(voucherItem.price) 
              : (subTotal - o.totalAmount > 0 ? subTotal - o.totalAmount : 0);

            // 🔥 LOGIC KIỂM TRA ĐIỀU KIỆN HIỂN THỊ MÃ SOÁT VÉ
            const isValidTicket = o.status === 'PAID' && o.bookingCode;

            return (
              <div key={o.id} className={`bg-[#0a0a0a] border rounded-[2.5rem] transition-all overflow-hidden ${activeId === o.id ? 'border-red-600/40 shadow-[0_25px_60px_rgba(0,0,0,0.8)]' : 'border-white/5 hover:border-white/10'}`}>
                
                {/* THANH TIÊU ĐỀ RÚT GỌN */}
                <div onClick={() => setActiveId(activeId === o.id ? null : o.id)} className="p-6 cursor-pointer flex items-center justify-between gap-4 select-none group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl transition-all duration-300 ${activeId === o.id ? 'bg-red-600 text-white shadow-[0_8px_25px_rgba(220,38,38,0.4)] scale-105' : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'}`}>
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Mã hóa đơn: AK-{o.id}</p>
                      <h3 className="text-sm font-black text-zinc-200 group-hover:text-white transition-colors uppercase truncate max-w-[180px] sm:max-w-xs">
                        {o.movieTitle || "Hóa đơn dịch vụ"}
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-500">{o.date || new Date(o.createdAt).toLocaleDateString('vi-VN')} • {o.time?.split(' ')[0] || ''}</p>
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">Tổng thanh toán</p>
                    <p className="font-black font-mono italic text-red-500 text-base">{fmtVND(o.totalAmount)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-wider ${
                      o.status === 'PAID' 
                        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                        : o.status === 'CANCELLED' 
                          ? 'text-red-500 border-red-500/20 bg-red-500/5' 
                          : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                    }`}>
                      {o.status === 'PAID' ? 'HOÀN TẤT' : o.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'CHỜ XỬ LÝ'}
                    </span>
                    {activeId === o.id ? <ChevronUp size={18} className="text-zinc-500"/> : <ChevronDown size={18} className="text-zinc-500"/>}
                  </div>
                </div>

                {/* PHẦN HIỂN THỊ CHI TIẾT ĐẦY ĐỦ */}
                {activeId === o.id && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-3 duration-300 space-y-5">
                    
                    {/* 1. KHU VỰC VÉ XEM PHIM ĐIỆN ẢNH (Nếu có thông tin phim) */}
                    {o.movieTitle && (
                      <div className={`relative overflow-hidden bg-gradient-to-br from-[#121212] to-[#181111] border rounded-3xl p-5 shadow-inner ${o.status === 'CANCELLED' ? 'border-red-900/30 opacity-70' : 'border-zinc-800'}`}>
                        {/* Hào quang đỏ rạp phim */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 blur-2xl rounded-full pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                          <div className="space-y-3 flex-1">
                            <div className={`flex items-center gap-2 ${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-red-500'}`}>
                              <Film size={16} />
                              <span className="text-xs font-black uppercase tracking-widest">
                                {o.status === 'CANCELLED' ? 'Thông tin vé (Đã Hủy)' : 'Thông tin vé xem phim'}
                              </span>
                            </div>
                            
                            <h2 className="text-xl font-black text-white italic tracking-tight uppercase">
                              {o.movieTitle}
                            </h2>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs pt-1 text-zinc-400">
                              <div className="flex items-center gap-2"><MapPin size={13} className="text-zinc-650 shrink-0"/> <span className="truncate">{o.cinemaName}</span></div>
                              <div className="flex items-center gap-2"><Monitor size={13} className="text-zinc-650"/> <span>{o.roomName}</span></div>
                              <div className="flex items-center gap-2"><Calendar size={13} className="text-zinc-650"/> <span>Suất: {o.date}</span></div>
                              <div className="flex items-center gap-2"><Clock size={13} className="text-zinc-650"/> <span className="font-mono text-zinc-300 font-bold">{o.time}</span></div>
                            </div>

                            {/* Danh sách ghế ngồi cụ thể */}
                            {tickets.length > 0 && (
                              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">Ghế đặt:</span>
                                {tickets.map((t: any) => (
                                  <span key={t.id} className={`px-2.5 py-0.5 rounded border text-xs font-black font-mono ${
                                    o.status === 'CANCELLED' 
                                      ? 'bg-zinc-900/50 border-zinc-700/50 text-zinc-500 line-through' 
                                      : 'bg-red-600/10 border-red-600/30 text-red-500'
                                  }`}>
                                    {t.itemName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 🔥 ẨN MÃ QR NẾU VÉ KHÔNG PHẢI TRẠNG THÁI 'PAID' */}
                          {isValidTicket && (
                            <div className="flex md:flex-col items-center justify-center md:pl-6 border-t md:border-t-0 md:border-l border-dashed border-zinc-800 pt-4 md:pt-0 gap-3 shrink-0">
                              <div className="p-2.5 bg-white rounded-2xl shadow-lg">
                                <QrCode size={56} className="text-black" />
                              </div>
                              <div className="text-center md:text-right">
                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Mã soát vé</p>
                                <p className="text-base font-mono font-black text-white tracking-widest uppercase select-all">{o.bookingCode}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. CHI TIẾT SẢN PHẨM HOÁ ĐƠN */}
                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Chi tiết dịch vụ dùng</p>
                      
                      <div className="space-y-3">
                        {/* Hiển thị Vé */}
                        {tickets.map((i: any) => (
                          <div key={i.id} className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Ticket size={14} className={`${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-red-500'} shrink-0`}/>
                              <span className={`font-bold truncate ${o.status === 'CANCELLED' ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                                Vé ghế số {i.itemName} 
                                <span className={`text-[10px] ml-1.5 font-mono font-black ${o.status === 'CANCELLED' ? 'text-zinc-700' : 'text-zinc-600'}`}>x{i.quantity || 1}</span>
                              </span>
                            </div>
                            <span className={`font-black font-mono shrink-0 ${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-zinc-200'}`}>
                              {fmtVND(Math.abs(i.price) * (i.quantity || 1))}
                            </span>
                          </div>
                        ))}

                        {/* Hiển thị Bắp nước/Combo */}
                        {combos.map((i: any) => (
                          <div key={i.id} className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Coffee size={14} className={`${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-amber-500'} shrink-0`}/>
                              <span className={`font-bold truncate ${o.status === 'CANCELLED' ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                                {i.itemName}
                                <span className={`text-[10px] ml-1.5 font-mono font-black ${o.status === 'CANCELLED' ? 'text-zinc-700' : 'text-zinc-600'}`}>x{i.quantity || 1}</span>
                              </span>
                            </div>
                            <span className={`font-black font-mono shrink-0 ${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-zinc-200'}`}>
                              {fmtVND(Math.abs(i.price) * (i.quantity || 1))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* 3. KHU VỰC TÍNH TOÁN BIẾN ĐỘNG GIÁ CẢ */}
                      <div className="pt-3 border-t border-zinc-900 space-y-2.5 text-xs">
                        <div className="flex justify-between text-zinc-500 font-bold">
                          <span>Tạm tính hệ thống:</span>
                          <span className="font-mono">{fmtVND(subTotal)}</span>
                        </div>

                        {/* Nếu tồn tại VoucherItem hoặc tính toán giảm giá */}
                        {(voucherItem || discountAmount > 0) && (
                          <div className={`flex justify-between font-bold items-center border px-3 py-2 rounded-xl ${
                            o.status === 'CANCELLED' ? 'text-zinc-600 bg-zinc-900/20 border-zinc-800/30' : 'text-red-500 bg-red-950/20 border-red-900/30'
                          }`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Tag size={12} className={`${o.status === 'CANCELLED' ? 'text-zinc-600' : 'text-red-500 animate-pulse'} shrink-0`} />
                              <span className="truncate">Ưu đãi: {voucherItem?.itemName || "Áp dụng Voucher"}</span>
                            </div>
                            <span className="font-black font-mono shrink-0">
                              {discountAmount > 0 ? `-${fmtVND(discountAmount)}` : "Miễn phí"}
                            </span>
                          </div>
                        )}

                        {/* Tổng số tiền thanh toán cuối cùng */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-zinc-900">
                          <span className="font-black uppercase tracking-wider text-[10px] text-zinc-400">Thành tiền thực tế:</span>
                          <span className={`font-[1000] italic text-lg font-mono ${o.status === 'CANCELLED' ? 'text-zinc-600 line-through' : 'text-red-500'}`}>
                            {fmtVND(o.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* THANH FOOTER HOÁ ĐƠN */}
                      <div className="pt-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 opacity-40 border-t border-zinc-900 text-[9px] uppercase font-bold tracking-widest text-zinc-500">
                        <div className="flex gap-2 items-center"><CreditCard size={11}/> Thanh toán qua: {o.paymentMethod}</div>
                        <div>Ngày lập đơn: {new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest text-xs">Chưa có giao dịch nào</div>
          )}
        </div>
      </main>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}