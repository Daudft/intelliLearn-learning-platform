import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Footer from "../../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-[#F1F2F4] min-h-screen">

      {/* LIGHT SECTIONS WITH PADDING */}
      <div className="px-4">
        <Navbar />
        <Hero />
      </div>

      {/* DARK SECTIONS - FULL WIDTH (NO SIDE PADDING) */}
      <Features />
      <HowItWorks />

      {/* FOOTER WITH NORMAL PADDING */}
      
        <Footer />
      

    </div>
  );
}
