import Navbar from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FeatureGrid } from "@/components/FeatureGrid";
import { StatsSection } from "@/components/StatsSection";
import { DemoVideo } from "@/components/DemoVideo";
import { useAppSelector } from "@/store/hooks";
import { Navigate } from "react-router-dom";

const Index = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // If user is already signed in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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