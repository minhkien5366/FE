// File: ClientLayout.tsx

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TopBanner from "./components/TopBanner";
// Xóa dòng này: import TopMenu from "./components/TopMenu";
import ChatBubble from "./components/home/ChatBubble";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBanner />
      {/* Xóa dòng <TopMenu /> đi */}
      <Navbar />
      <main className="flex-grow relative">
        {children}
        <ChatBubble />
      </main>
      <Footer />
    </>
  );
}