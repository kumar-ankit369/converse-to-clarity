import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  Target,
  Clock,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export const FeatureGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning analyzes communication patterns to surface hidden insights about team dynamics and collaboration effectiveness.",
      highlights: ["Natural Language Processing", "Pattern Recognition", "Predictive Analytics"],
      badge: "AI-Driven",
      color: "bg-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Real-time Metrics",
      description: "Track sentiment, productivity, and engagement levels as they happen with live dashboard updates and instant notifications.",
      highlights: ["Live Updates", "Custom Alerts", "Performance Tracking"],
      badge: "Real-time",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Team Expertise Mapping",
      description: "Automatically identify subject matter experts and knowledge gaps within your organization to optimize resource allocation.",
      highlights: ["Skills Detection", "Knowledge Graphs", "Expert Identification"],
      badge: "Smart Mapping",
      color: "bg-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Blocker Detection",
      description: "Spot stalled conversations and potential roadblocks before they impact your team's progress with intelligent monitoring.",
      highlights: ["Early Warning System", "Bottleneck Analysis", "Resolution Tracking"],
      badge: "Proactive",
      color: "bg-orange-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure with enterprise-grade encryption and privacy-preserving analytics that protect sensitive information.",
      highlights: ["End-to-End Encryption", "GDPR Compliant", "Data Anonymization"],
      badge: "Secure",
      color: "bg-red-500"
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Get actionable recommendations and coaching tips powered by conversational AI analysis to improve team performance immediately.",
      highlights: ["Smart Recommendations", "Coaching Tips", "Action Items"],
      badge: "Actionable",
      color: "bg-yellow-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting",
      description: "Generate comprehensive reports with custom metrics, visualizations, and insights tailored to your organization's needs.",
      highlights: ["Custom Dashboards", "Export Options", "Scheduled Reports"],
      badge: "Pro Analytics",
      color: "bg-indigo-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor communication goals with intelligent progress tracking and milestone celebrations for continuous improvement.",
      highlights: ["SMART Goals", "Progress Monitoring", "Achievement Tracking"],
      badge: "Goal-Oriented",
      color: "bg-teal-500"
    },
    {
      icon: Clock,
      title: "Time Intelligence",
      description: "Understand when your team is most productive and collaborative with time-based analytics and optimal scheduling suggestions.",
      highlights: ["Peak Hours Analysis", "Meeting Optimization", "Productivity Patterns"],
      badge: "Time-Smart",
      color: "bg-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Powerful Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Everything You Need to Transform Your Team
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            InsightFlow provides comprehensive analytics and actionable insights to help you build 
            more effective, happier, and high-performing teams with data-driven decision making.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8">
                <div className="relative">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <Badge variant="secondary" className="mb-4 text-xs">
                    {feature.badge}
                  </Badge>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="group/btn w-full justify-between">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button size="lg" className="text-lg px-8 py-6">
            Explore All Features
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};