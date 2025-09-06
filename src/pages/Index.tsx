import Navbar from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FeatureGrid } from "@/components/FeatureGrid";
import { StatsSection } from "@/components/StatsSection";
import { DemoVideo } from "@/components/DemoVideo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DemoVideo />
      <StatsSection />
      <DashboardPreview />
      <FeatureGrid />
    </div>
  );
};

export default Index;