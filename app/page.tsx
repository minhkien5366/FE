import PostSection from "./(client)/components/home/PostSection";
import MovieSection from "./(client)/components/home/MovieSection";
import ComboSection from "./(client)/components/home/ComboSection";
import Banner from "./(client)/components/home/Banner";
import TopBanner from "./(client)/components/TopBanner";
import Navbar from "./(client)/components/Navbar";
import Footer from "./(client)/components/Footer";
import ChatBubble from "./(client)/components/home/ChatBubble";
import NewMovieSection from "./(client)/components/home/NewMovieSection";
export default function Home() {
  return (
    <>
            <TopBanner />
      <Navbar />
      <Banner />
      <NewMovieSection />
      <ComboSection />
      <PostSection />
      <MovieSection />
      <ChatBubble />
      <Footer />
    </>
  );
}