import BenifitSection from "@/components/features/Home/BenifitSection";
import CareerSuccess from "@/components/features/Home/CareerSuccess";
import CareerTrack from "@/components/features/Home/CareerTrack";
import ContactSection from "@/components/features/Home/ContactSection";
import HeroSection from "@/components/features/Home/HeroSection";
import PracticalProjectSection from "@/components/features/Home/PracticalProjectSection";
import Footer from "@/components/shared/Footer/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Modern Hero Section */}
      <HeroSection/>
      
      {/* Career Track with Enhanced Spacing */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 -skew-y-1 transform origin-top-left"></div>
        <div className="relative">
          <CareerTrack/>
        </div>
      </div>
      
      {/* Benefits Section */}
      <BenifitSection/>
      
      {/* Practical Projects */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-teal-50/30 skew-y-1 transform origin-top-left"></div>
        <div className="relative">
          <PracticalProjectSection/>
        </div>
      </div>
      
      {/* Contact Section */}
      <ContactSection/>
      
      {/* Career Success Stories */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 to-orange-50/40 -skew-y-1 transform origin-top-left"></div>
        <div className="relative">
          <CareerSuccess/>
        </div>
      </div>
      
      {/* Footer */}
      <Footer/>
    </div>
  );
}
