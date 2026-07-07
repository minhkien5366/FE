export default function AdminFooter() {
  return (
    <footer className="px-6 md:px-8 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0b1020]/92 backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 text-center md:text-left">
        &copy; 2026 KN Cinema Management System. All Rights Reserved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[9px] font-black uppercase tracking-[0.16em]">
        <span className="text-cyan-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.75)]" />
          DB Connected
        </span>

        <span className="text-slate-500">Version 3.4.0-stable</span>

        <a
          href="#"
          className="text-slate-500 hover:text-yellow-300 transition-colors"
        >
          Hỗ trợ kỹ thuật
        </a>
      </div>
    </footer>
  );
}