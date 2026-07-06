import { Josefin_Sans } from 'next/font/google';
import '@/app/ui/global.css';

// Khởi tạo font Josefin Sans với hỗ trợ tiếng Việt
const josefin = Josefin_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  // Bạn có thể khai báo biến CSS ở đây nếu muốn kết hợp chuyên sâu với Tailwind
  variable: '--font-josefin', 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      {/* 🎯 Áp dụng josefin.className để set font mặc định cho toàn bộ trang web */}
      <body className={`${josefin.className} min-h-screen flex flex-col antialiased text-slate-50`}>
        
        {/* Render nội dung các trang hoặc ClientLayout */}
        {children}
        
      </body>
    </html>
  );
}