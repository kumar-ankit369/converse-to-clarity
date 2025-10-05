import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, MessageSquare, Lightbulb, Target, Users } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  trend?: number
  icon: React.ReactNode
  className?: string
}

export function MetricCard({ title, value, description, trend, icon, className }: MetricCardProps) {
  const trendColor = trend && trend > 0 ? "text-green-600" : "text-red-600"
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {description}
          {trend && (
            <Badge variant="outline" className={`ml-2 ${trendColor}`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Conversations"
        value="2,847"
        description="Active conversations this month"
        trend={12}
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <MetricCard
        title="Insights Generated"
        value="1,423"
        description="AI-powered insights delivered"
        trend={8}
        icon={<Lightbulb className="h-4 w-4" />}
      />
      <MetricCard
        title="Clarity Score"
        value="89%"
        description="Average conversation clarity"
        trend={5}
        icon={<Target className="h-4 w-4" />}
      />
      <MetricCard
        title="Active Users"
        value="573"
        description="Users engaged this week"
        trend={-2}
        icon={<Users className="h-4 w-4" />}
      />
    </div>
  )
}
