import { HeroSection } from "@/components/HeroSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FeatureGrid } from "@/components/FeatureGrid";
import { StatsSection } from "@/components/StatsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <DashboardPreview />
      <FeatureGrid />
    </div>
  );
};

export default Index;