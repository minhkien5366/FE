"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Film,
  Upload,
  Star,
  Clock,
  Calendar,
  Users,
  Globe,
  Youtube,
  ShieldAlert,
  Check,
  Images,
  X
} from 'lucide-react';

import toast, { Toaster } from 'react-hot-toast';
import { apiSuperAdminRequest, getImageUrl } from '@/app/lib/api';

interface MovieFormProps {
  initialData?: any;
  type: 'create' | 'edit';
}

export default function MovieForm({
  initialData,
  type
}: MovieFormProps) {

  const router = useRouter();
  const pathname = usePathname();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🔥 THÊM REF ĐỂ MỞ CỬA SỔ CHỌN ẢNH NHÂN VẬT
  const charFileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [genres, setGenres] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // MẢNG ID THỂ LOẠI ĐƯỢC CHỌN
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // PREVIEW POSTER CHÍNH
  const [posterPreview, setPosterPreview] = useState("");

  // 🔥 STATE ĐỂ CHỨA CÁC FILE ẢNH NHÂN VẬT MỚI
  const [characterFiles, setCharacterFiles] = useState<File[]>([]);
  
  // 🔥 STATE ĐỂ CHỨA PREVIEW ẢNH NHÂN VẬT TẠM THỜI
  const [charPreviews, setCharPreviews] = useState<string[]>([]);

  // 🔥 STATE ĐỂ CHỨA LINK ẢNH NHÂN VẬT CŨ TỪ BACKEND TRẢ VỀ
  const [existingCharImages, setExistingCharImages] = useState<string[]>([]);

  const basePath = pathname.includes('/super-admin')
    ? '/super-admin/movie'
    : '/admin/movies';

  // =========================================================
  // LOAD DANH SÁCH THỂ LOẠI
  // =========================================================
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await apiSuperAdminRequest('/api/v1/genres');
        if (res.ok) {
          const data = await res.json();
          const genresData = data.data || data || [];
          setGenres(genresData);
        }
      } catch (err) {
        console.error("Lỗi tải genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // =========================================================
  // ĐỔ DỮ LIỆU EDIT
  // =========================================================
  useEffect(() => {
    if (!initialData) return;

    if (initialData.posterUrl) {
      const preview = initialData.posterUrl.startsWith("http")
        ? initialData.posterUrl
        : getImageUrl(initialData.posterUrl);
      setPosterPreview(preview);
    }

    // 🔥 ĐỔ DỮ LIỆU ẢNH NHÂN VẬT CŨ VÀO GIAO DIỆN
    if (initialData.characterImages && Array.isArray(initialData.characterImages)) {
      setExistingCharImages(initialData.characterImages);
    }

    let ids: number[] = [];
    if (initialData.genres && Array.isArray(initialData.genres)) {
      ids = initialData.genres.map((g: any) => Number(g.id)).filter(Boolean);
    } else if (initialData.genreIds && Array.isArray(initialData.genreIds)) {
      ids = initialData.genreIds.map((id: any) => Number(id)).filter(Boolean);
    } else if (initialData.genreId) {
      ids = [Number(initialData.genreId)];
    }
    setSelectedGenreIds(ids);

  }, [initialData]);

  // =========================================================
  // TOGGLE GENRE
  // =========================================================
  const handleToggleGenre = (genreId: number) => {
    setSelectedGenreIds(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }
      return [...prev, genreId];
    });
  };

  // =========================================================
  // XỬ LÝ CHỌN NHIỀU ẢNH NHÂN VẬT CÙNG LÚC
  // =========================================================
  const handleCharFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      setCharacterFiles(newFilesArray); // Ghi đè file mới
      
      // Tạo URL preview cho các file mới
      const newPreviews = newFilesArray.map(file => URL.createObjectURL(file));
      setCharPreviews(newPreviews);
      
      // Vì đã chọn ảnh mới nên hệ thống sẽ tự hiểu là muốn xóa sạch ảnh cũ
      setExistingCharImages([]); 
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (type === 'create' && !selectedFile) {
      return toast.error("Vui lòng chọn poster chính!");
    }

    if (selectedGenreIds.length === 0) {
      return toast.error("Vui lòng chọn ít nhất 1 thể loại!");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(type === 'edit' ? 'Đang cập nhật phim...' : 'Đang đăng phim...');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const movieData = {
        title: formData.get('title')?.toString().trim(),
        description: formData.get('description')?.toString().trim(),
        duration: Number(formData.get('duration')),
        director: formData.get('director')?.toString().trim(),
        cast: formData.get('cast')?.toString().trim(),
        country: formData.get('country')?.toString().trim(),
        trailerUrl: formData.get('trailerUrl')?.toString().trim(),
        releaseDate: formData.get('releaseDate'),
        status: formData.get('status'),
        ageRating: formData.get('ageRating'),
        genreIds: selectedGenreIds,
        // 🔥 Nếu người dùng KHÔNG upload file mới, ta gửi lại chuỗi file cũ cho Backend
        existingCharacterImages: existingCharImages.length > 0 ? existingCharImages.join(",") : ""
      };

      const payload = new FormData();

      payload.append('movie', new Blob([JSON.stringify(movieData)], { type: 'application/json' }));

      // Gắn file Poster chính
      if (selectedFile) {
        payload.append('file', selectedFile);
      }
      
      // 🔥 GẮN DANH SÁCH FILE ẢNH NHÂN VẬT LÊN FORM
      if (characterFiles.length > 0) {
          characterFiles.forEach(file => {
              payload.append('characterFiles', file);
          });
      }

      const url = type === 'edit' ? `/api/v1/movies/${initialData?.id}` : `/api/v1/movies`;

      const response = await apiSuperAdminRequest(url, {
          method: type === 'edit' ? 'PUT' : 'POST',
          body: payload
      });

      if (response.ok) {
        toast.success(type === 'edit' ? 'Cập nhật phim thành công!' : 'Đăng phim thành công!', { id: loadingToast });
        router.push(basePath);
        router.refresh();
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Xử lý thất bại!", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối máy chủ!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-2 text-white animate-in fade-in duration-500">
      <Toaster position="top-right" />

      <button type="button" onClick={() => router.push(basePath)} className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-all mb-4 font-black text-[9px] uppercase tracking-widest">
        <ArrowLeft size={12} /> Quay lại
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">

        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[1.5rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-600/10">
                <Film size={18} />
              </div>
              <h1 className="text-xl font-[1000] italic uppercase tracking-tighter">
                {type === 'edit' ? 'Sửa' : 'Thêm'} <span className="text-zinc-600">Phim</span>
              </h1>
            </div>

            <div className="grid gap-4">
              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Tiêu đề *</label>
                <input name="title" required defaultValue={initialData?.title} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 transition-all text-[13px] font-bold" placeholder="Tên phim..." />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Mô tả *</label>
                <textarea name="description" required rows={3} defaultValue={initialData?.description} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 text-[12px] leading-relaxed" placeholder="Nội dung tóm tắt..." />
              </div>

              {/* COUNTRY + DIRECTOR */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Globe size={10} />Quốc gia</label>
                  <input name="country" required defaultValue={initialData?.country} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Users size={10} />Đạo diễn</label>
                  <input name="director" defaultValue={initialData?.director} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" />
                </div>
              </div>

              {/* CAST */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Diễn viên</label>
                <input name="cast" defaultValue={initialData?.cast} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" placeholder="Cách nhau bằng dấu phẩy..." />
              </div>

              {/* TRAILER */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Youtube size={11} className="text-red-600" />Youtube Trailer</label>
                <input name="trailerUrl" type="url" defaultValue={initialData?.trailerUrl} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]" placeholder="Link video..." />
              </div>
              
              {/* ================================================= */}
              {/* 🔥 KHU VỰC UPLOAD ẢNH NHÂN VẬT MỚI (CHO CHỖ NGỒI) */}
              {/* ================================================= */}
              <div className="space-y-2 mt-4 p-4 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 flex items-center gap-1"><Images size={12} className="text-red-500"/>Ảnh nhân vật / Avatar Ghế</label>
                    <button type="button" onClick={() => charFileInputRef.current?.click()} className="text-[9px] font-black uppercase bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg transition-colors">
                        + Chọn ảnh
                    </button>
                    <input type="file" ref={charFileInputRef} hidden multiple accept="image/*" onChange={handleCharFilesChange} />
                </div>
                
                <p className="text-[10px] text-zinc-600 font-medium italic">Chọn nhiều ảnh cùng lúc. Khi khách chọn ghế sẽ hiện những hình này. (Nên chọn ảnh vuông, rõ mặt)</p>
                
                {/* HIỂN THỊ PREVIEW DANH SÁCH ẢNH ĐÃ CHỌN HOẶC ẢNH CŨ */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {/* Ảnh mới chuẩn bị upload */}
                    {charPreviews.length > 0 && charPreviews.map((src, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-full overflow-hidden border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                            <img src={src} className="w-full h-full object-cover" alt="Char preview" />
                            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none"></div>
                        </div>
                    ))}
                    
                    {/* Ảnh cũ từ Database */}
                    {charPreviews.length === 0 && existingCharImages.map((src, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                            <img src={src} className="w-full h-full object-cover" alt="Char old" />
                        </div>
                    ))}
                    
                    {charPreviews.length === 0 && existingCharImages.length === 0 && (
                        <div className="w-full text-center p-3 text-[10px] uppercase font-black text-zinc-700">Chưa có ảnh nhân vật</div>
                    )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-[1.5rem] space-y-4">
            
            {/* POSTER CHÍNH */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Poster Phim *</label>
              <div onClick={() => fileInputRef.current?.click()} className="relative aspect-[4/5] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center cursor-pointer group overflow-hidden">
                {posterPreview ? (
                  <img src={posterPreview} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Poster" />
                ) : (
                  <div className="text-center opacity-20 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-[8px] font-black uppercase">Tải Poster</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setPosterPreview(URL.createObjectURL(file));
                  }
                }} />
            </div>

            {/* RATING */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center">
              <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-1"><Star size={10} className="text-yellow-600" />Rating</label>
              <span className="text-[10px] font-black italic">{initialData?.rating || "0.0"}</span>
            </div>

            {/* AGE */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic flex items-center gap-1"><ShieldAlert size={10} />Phân loại độ tuổi *</label>
              <select name="ageRating" required defaultValue={initialData?.ageRating || 'P'} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400">
                <option value="P">P (Cho mọi lứa tuổi)</option>
                <option value="K">K (Dưới 13 tuổi xem cùng phụ huynh)</option>
                <option value="T13">T13 (Đủ 13 tuổi trở lên)</option>
                <option value="T16">T16 (Đủ 16 tuổi trở lên)</option>
                <option value="T18">T18 (Đủ 18 tuổi trở lên)</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Trạng thái</label>
              <select name="status" required defaultValue={initialData?.status || 'SHOWING'} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400">
                <option value="SHOWING">ĐANG CHIẾU</option>
                <option value="COMING_SOON">SẮP CHIẾU</option>
              </select>
            </div>

            {/* GENRES */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">Thể loại * ({selectedGenreIds.length} đã chọn)</label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-black/60 border border-white/10 rounded-xl max-h-[160px] overflow-y-auto custom-scrollbar">
                {genres.length === 0 ? (
                  <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest p-1">Đang tải...</span>
                ) : (
                  genres.map((g) => {
                    const isSelected = selectedGenreIds.includes(Number(g.id));
                    return (
                      <button type="button" key={g.id} onClick={() => handleToggleGenre(Number(g.id))} className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1 ${isSelected ? 'bg-red-600/20 text-red-400 border-red-500/50' : 'bg-zinc-950 text-zinc-500 border-zinc-900/60 hover:border-zinc-700 hover:text-zinc-300'}`}>
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                        {g.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* DURATION + DATE */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Clock size={9} />Thời lượng</label>
                <input name="duration" type="number" required min="1" defaultValue={initialData?.duration} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1"><Calendar size={9} />Ngày khởi chiếu</label>
                <input name="releaseDate" type="date" required defaultValue={initialData?.releaseDate?.split('T')[0]} className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black uppercase" />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-white hover:text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {type === 'edit' ? 'Cập nhật' : 'Đăng phim'}
          </button>
        </div>
      </form>
    </div>
  );
}