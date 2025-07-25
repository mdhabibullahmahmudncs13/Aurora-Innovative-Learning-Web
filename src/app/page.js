import BenifitSection from "@/components/features/Home/BenifitSection";
import CareerSuccess from "@/components/features/Home/CareerSuccess";
import CareerTrack from "@/components/features/Home/CareerTrack";
import ContactSection from "@/components/features/Home/ContactSection";
import HeroSection from "@/components/features/Home/HeroSection";
import PracticalProjectSection from "@/components/features/Home/PracticalProjectSection";
import Footer from "@/components/shared/Footer/Footer";

export default function Home() {
  return (
    <div>
      <HeroSection/>
      <CareerTrack/>
      <BenifitSection/>
      <PracticalProjectSection/>
      <ContactSection/>
      <CareerSuccess/>
      <Footer/>
    </div>
  );
}
