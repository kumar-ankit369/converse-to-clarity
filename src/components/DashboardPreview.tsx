import { Card } from "@/components/ui/card";
import { SentimentChart } from "@/components/charts/SentimentChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { KnowledgeGraph } from "@/components/charts/KnowledgeGraph";
import { BlockerBoard } from "@/components/BlockerBoard";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, Users, MessageCircle, AlertTriangle } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            See Your Team's Pulse at a Glance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes communication patterns to provide deep insights into team dynamics, 
            productivity, and collaboration effectiveness.
          </p>
        </div>
        
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Team Sentiment"
            value="8.2"
            suffix="/10"
            trend="+12%"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Active Members"
            value="24"
            suffix="/30"
            trend="+5%"
            icon={Users}
            variant="primary"
          />
          <MetricCard
            title="Daily Messages"
            value="342"
            trend="+18%"
            icon={MessageCircle}
            variant="accent"
          />
          <MetricCard
            title="Blockers Found"
            value="3"
            trend="-25%"
            icon={AlertTriangle}
            variant="warning"
          />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Team Sentiment Trends</h3>
            <SentimentChart />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Levels</h3>
            <ActivityChart />
          </Card>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Knowledge Network</h3>
              <KnowledgeGraph />
            </Card>
          </div>
          
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Blockers</h3>
              <BlockerBoard />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};