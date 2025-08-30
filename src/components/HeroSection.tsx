import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, MessageSquare, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-glow rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Brain className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">AI-Powered Team Analytics</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              From{" "}
              <span className="relative">
                Conversation
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-accent-glow rounded-full"></div>
              </span>{" "}
              to Clarity
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-lg">
              Transform your team's chat data into actionable insights. Discover hidden bottlenecks, 
              identify expertise, and boost productivity with AI-powered analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" size="lg" className="text-white border-white/20 hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-white/80">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Actionable Insights</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Dashboard mockup placeholder */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-large">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-6 bg-white/20 rounded"></div>
                    <div className="w-20 h-6 bg-accent-glow rounded"></div>
                  </div>
                  <div className="h-32 bg-white/10 rounded-lg"></div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-20 bg-white/10 rounded-lg"></div>
                    <div className="flex-1 h-20 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};