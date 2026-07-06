"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, Loader2, Armchair } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import SeatMap from '../SeatMap'; 
import toast, { Toaster } from 'react-hot-toast';
import { getImageUrl } from "@/app/lib/api";

export default function BookingPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [dbSeats, setDbSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [showtimeInfo, setShowtimeInfo] = useState<any>(null);

  // 1. TẢI DỮ LIỆU LẦN ĐẦU & KHÔI PHỤC TRẠNG THÁI
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resSeats, resInfo] = await Promise.all([
          apiRequest(`/api/v1/seats/showtime/${showtimeId}`),
          apiRequest(`/api/v1/showtimes/${showtimeId}`)
        ]);
        if (resSeats.ok && resInfo.ok) {
          setDbSeats((await resSeats.json()).data);
          setShowtimeInfo((await resInfo.json()).data);

          const saved = sessionStorage.getItem('booking_data');
          const isBack = sessionStorage.getItem('is_back_from_combos');

          if (saved && isBack === 'true') {
            const parsed = JSON.parse(saved);
            if (String(parsed.showtimeId) === String(showtimeId) && parsed.selectedSeats) {
              setSelectedSeats(parsed.selectedSeats);
            }
            sessionStorage.removeItem('is_back_from_combos');
          } else {
            sessionStorage.removeItem('booking_data');
            setSelectedSeats([]);
          }
        }
      } catch (err) { 
        toast.error("Lỗi tải dữ liệu!"); 
      } finally { 
        setFetching(false); 
      }
    };
    loadData();
  }, [showtimeId]);

  // 2. POLLING THẦN THÁNH: Cập nhật sơ đồ ghế mỗi 3 giây
  useEffect(() => {
    if (fetching) return; 

    const interval = setInterval(async () => {
      try {
        const res = await apiRequest(`/api/v1/seats/showtime/${showtimeId}`);
        if (res.ok) {
          const newSeats = (await res.json()).data;
          setDbSeats(newSeats); 

          setSelectedSeats(prev => {
            if (prev.length === 0) return prev;
            let hasConflict = false;
            
            const validSeats = prev.filter(selectedSeat => {
              const dbMatch = newSeats.find((s: any) => s.id === selectedSeat.id);
              if (dbMatch && (dbMatch.status === 'OCCUPIED' || dbMatch.status === 'SOLD')) {
                hasConflict = true;
                return false;
              }
              return true;
            });

            if (hasConflict) {
              toast.error("Cảnh báo: Ghế bạn đang chọn vừa bị người khác mua hoặc giữ chỗ!", {
                duration: 4000,
                position: 'top-center',
                style: {
                  borderRadius: '12px', background: '#1a1a1a', color: '#fff',
                  border: '1px solid #dc2626', fontSize: '11px', fontWeight: '900', 
                  textTransform: 'uppercase', letterSpacing: '1px'
                },
                icon: <Armchair size={18} className="text-red-600" />, 
              });
              return validSeats;
            }
            return prev;
          });
        }
      } catch (err) {}
    }, 3000); 

    return () => clearInterval(interval);
  }, [showtimeId, fetching]);

  // ================= 3. XỬ LÝ SỰ KIỆN CLICK GHẾ =================
  const handleToggleSeat = async (seat: any) => {
    // 🔥 CHẶN CỨNG: Nếu ghế đã bị khóa (OCCUPIED), không cho bấm, không gọi API luôn!
    if (seat.status === 'OCCUPIED' || seat.status === 'SOLD') {
      return; 
    }

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    
    // NẾU ĐANG CHỌN MÀ MUỐN BỎ CHỌN (NHẢ GHẾ)
    if (isAlreadySelected) {
      try {
        await apiRequest(`/api/v1/seats/release?showtimeId=${showtimeId}&seatId=${seat.id}`, { method: 'POST' });
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      } catch (error) {
        toast.error("Lỗi khi hủy giữ ghế!");
      }
      return;
    }
    
    // NẾU MUỐN CHỌN GHẾ MỚI (KHÓA GHẾ)
    if (selectedSeats.length >= 6) {
      toast.error("Mỗi giao dịch chỉ được đặt tối đa 6 ghế!", {
        duration: 3000, position: 'top-center',
        style: { borderRadius: '12px', background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' },
        icon: <Armchair size={18} className="text-red-600" />, 
      });
      return; 
    }

    try {
      // Bắn API Khóa ghế lên Server ngay lập tức!
      const res = await apiRequest(`/api/v1/seats/hold?showtimeId=${showtimeId}&seatId=${seat.id}`, { method: 'POST' });
      
      if (res.ok) {
        setSelectedSeats(prev => [...prev, seat]); // Giữ thành công thì update UI
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Ghế này vừa bị người khác nhanh tay chọn mất!", {
           style: { borderRadius: '12px', background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626' }
        });
        
        // Quét lại rạp ngay lập tức để bôi đỏ cái ghế bị cướp
        const refreshRes = await apiRequest(`/api/v1/seats/showtime/${showtimeId}`);
        if (refreshRes.ok) setDbSeats((await refreshRes.json()).data);
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi giữ ghế!");
    }
  };


  const validateCGVSeatRules = (): boolean => {
    const uniqueRows = Array.from(new Set(dbSeats.map(s => s.seatRow)));

    for (const rowName of uniqueRows) {
      const rowSeats = dbSeats.filter(s => s.seatRow === rowName);
      const seatMapByNum = new Map(rowSeats.map(s => [parseInt(s.seatNumber), s]));

      for (const currentSeat of rowSeats) {
        const seatType = currentSeat.seatType ? String(currentSeat.seatType).toUpperCase() : 'NORMAL';
        if (seatType === 'SWEETBOX' || seatType === 'COUPLE') continue;

        const statusStr = String(currentSeat.status).toUpperCase();
        const isOccupied = statusStr === 'OCCUPIED' || statusStr === 'SOLD';
        const isSelected = selectedSeats.some(s => s.id === currentSeat.id);

        if (!isOccupied && !isSelected) {
          const currentNum = parseInt(currentSeat.seatNumber);

          const leftSeat = seatMapByNum.get(currentNum - 1);
          const leftIsWallOrWalkway = !leftSeat;
          let leftBlockedBySelectionOrOrder = false;
          let leftSelectedByMe = false;

          if (!leftIsWallOrWalkway) {
            const leftOccupied = String(leftSeat.status).toUpperCase() === 'OCCUPIED' || String(leftSeat.status).toUpperCase() === 'SOLD';
            const leftSimSelected = selectedSeats.some(s => s.id === leftSeat.id);
            if (leftOccupied || leftSimSelected) {
              leftBlockedBySelectionOrOrder = true;
              if (leftSimSelected) leftSelectedByMe = true;
            }
          }

          const rightSeat = seatMapByNum.get(currentNum + 1);
          const rightIsWallOrWalkway = !rightSeat;
          let rightBlockedBySelectionOrOrder = false;
          let rightSelectedByMe = false;

          if (!rightIsWallOrWalkway) {
            const rightOccupied = String(rightSeat.status).toUpperCase() === 'OCCUPIED' || String(rightSeat.status).toUpperCase() === 'SOLD';
            const rightSimSelected = selectedSeats.some(s => s.id === rightSeat.id);
            if (rightOccupied || rightSimSelected) {
              rightBlockedBySelectionOrOrder = true;
              if (rightSimSelected) rightSelectedByMe = true;
            }
          }

          let isSingleSeatError = false;

          if (!leftIsWallOrWalkway && !rightIsWallOrWalkway && leftBlockedBySelectionOrOrder && rightBlockedBySelectionOrOrder) {
            if (leftSelectedByMe || rightSelectedByMe) isSingleSeatError = true;
          }
          else if (leftIsWallOrWalkway && rightBlockedBySelectionOrOrder && rightSelectedByMe) {
            isSingleSeatError = true;
          }
          else if (rightIsWallOrWalkway && leftBlockedBySelectionOrOrder && leftSelectedByMe) {
            isSingleSeatError = true;
          }

          if (isSingleSeatError) {
            const label = currentSeat.name || `${currentSeat.seatRow}${currentSeat.seatNumber}`;
            toast.error(`Không được để lại ghế trống đơn lẻ (${label}) ở giữa hoặc đầu/cuối hàng ghế!`, {
              duration: 4000, position: 'top-center',
              style: { borderRadius: '12px', background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
              icon: <Armchair size={18} className="text-red-600" />, 
            });
            return false; 
          }
        }
      }
    }
    return true; 
  };

  const handleNext = () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ghế để tiếp tục!", {
        duration: 3000, position: 'top-center',
        style: { borderRadius: '12px', background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
        icon: <Armchair size={18} className="text-red-600" />, 
      });
      return;
    }

    if (!validateCGVSeatRules()) return; 

    const saved = sessionStorage.getItem('booking_data');
    const existingData = saved ? JSON.parse(saved) : {};

    const bookingData = {
      ...existingData, 
      showtimeId,
      movieTitle: showtimeInfo?.movie?.title,
      movieImage: getImageUrl(showtimeInfo?.movie?.posterUrl), 
      cinemaItemId: showtimeInfo?.cinemaItem?.id,
      cinemaName: showtimeInfo?.cinemaItem?.cinema?.name, 
      roomName: showtimeInfo?.cinemaItem?.name,
      date: new Date(showtimeInfo?.startTime).toLocaleDateString('vi-VN'),
      time: new Date(showtimeInfo?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      selectedSeats, 
      seatPrice: selectedSeats.reduce((sum, s) => sum + s.price, 0)
    };

    sessionStorage.setItem('booking_data', JSON.stringify(bookingData));
    router.push(`/booking/${showtimeId}/combos`);
  };

  if (fetching) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <Toaster />
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-black italic"><ChevronLeft size={16}/> Quay lại</button>
        <div className="text-center font-[1000] uppercase italic text-xl tracking-tighter">{showtimeInfo?.movie?.title}</div>
        <div className="w-20"></div>
      </div>
      <div className="flex-1 py-10">
        <div className="select-none overflow-x-auto"> 
          <SeatMap 
            dbSeats={dbSeats} 
            selectedSeats={selectedSeats} 
            onToggleSeat={handleToggleSeat} 
          />
        </div>
      </div>
      <div className="p-8 ml-8 bg-zinc-950 border-t border-white/5 flex justify-between items-center sticky bottom-0 z-50">
        <div>
          <p className="text-[10px] text-zinc-500 font-black uppercase">Ghế: <span className="text-white">{selectedSeats.map(s => s.seatRow + s.seatNumber).join(', ') || '...'}</span></p>
          <div className="text-2xl font-[1000] text-red-600 italic">{(selectedSeats.reduce((sum, s) => sum + s.price, 0)).toLocaleString()}đ</div>
        </div>
        <button onClick={handleNext} className="px-10 py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-red-600 hover:text-white transition-all">Chọn Combo <ArrowRight className="inline ml-2" size={16}/></button>
      </div>
    </div>
  );
}