import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import TrustSection from "@/components/home/TrustSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedJobs />
        <HowItWorks />
        <TrustSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
