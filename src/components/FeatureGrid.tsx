import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, TrendingUp, Users, Shield, Zap } from "lucide-react";

export const FeatureGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning analyzes communication patterns to surface hidden insights about team dynamics."
    },
    {
      icon: TrendingUp,
      title: "Real-time Metrics",
      description: "Track sentiment, productivity, and engagement levels as they happen with live dashboard updates."
    },
    {
      icon: Users,
      title: "Team Expertise Mapping",
      description: "Automatically identify subject matter experts and knowledge gaps within your organization."
    },
    {
      icon: MessageSquare,
      title: "Blocker Detection",
      description: "Spot stalled conversations and potential roadblocks before they impact your team's progress."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure with enterprise-grade encryption and privacy-preserving analytics."
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Get actionable recommendations and coaching tips powered by conversational AI analysis."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need to Understand Your Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            InsightFlow provides comprehensive analytics and actionable insights to help you build 
            more effective, happier teams.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-medium transition-all duration-300">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};