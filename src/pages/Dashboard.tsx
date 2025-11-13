import Navbar from "@/components/Navbar"
import { ProfessionalDashboard } from "@/components/ProfessionalDashboard"
import { ChartAreaInteractive } from "@/components/charts/ChartAreaInteractive"
import { AnalyticsChart } from "@/components/charts/AnalyticsChart"
import { SentimentChart } from "@/components/charts/SentimentChart"
import { KnowledgeGraph } from "@/components/charts/KnowledgeGraph"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppSelector } from "@/store/hooks"

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Here's your communication clarity overview
            </p>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ProfessionalDashboard />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ChartAreaInteractive />
              <AnalyticsChart />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <SentimentChart />
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators for communication clarity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-muted-foreground">2.3 min avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clarity Score</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Engagement Rate</span>
                      <span className="text-sm text-muted-foreground">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Goal Completion</span>
                      <span className="text-sm text-muted-foreground">76%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <KnowledgeGraph />
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Insights</CardTitle>
                  <CardDescription>
                    Intelligent recommendations to improve communication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-green-600">Improvement Opportunity</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your team meetings could benefit from clearer agenda setting. 
                      Consider using structured templates to improve focus.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-blue-600">Trend Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Communication clarity has improved 15% over the last month. 
                      Keep up the great work!
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-orange-600">Action Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      3 goals are approaching their deadlines. Review progress and 
                      adjust timelines if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Create detailed reports for your communication analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Report generation feature coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


