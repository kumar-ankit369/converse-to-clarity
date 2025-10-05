import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Target, 
  Brain,
  ArrowUpRight,
  Calendar,
  Filter
} from "lucide-react"

interface DashboardMetric {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  description?: string
}

const metrics: DashboardMetric[] = [
  {
    title: "Total Conversations",
    value: "2,847",
    change: 12.5,
    changeLabel: "+12.5% from last month",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Active conversations tracked"
  },
  {
    title: "Clarity Score",
    value: "87%",
    change: 5.2,
    changeLabel: "+5.2% improvement",
    icon: <Brain className="h-4 w-4" />,
    description: "Average clarity rating"
  },
  {
    title: "Active Users",
    value: "1,249",
    change: -2.1,
    changeLabel: "-2.1% from last week",
    icon: <Users className="h-4 w-4" />,
    description: "Users engaged this month"
  },
  {
    title: "Goals Achieved",
    value: "156",
    change: 23.8,
    changeLabel: "+23.8% this quarter",
    icon: <Target className="h-4 w-4" />,
    description: "Communication goals met"
  }
]

interface Goal {
  id: string
  title: string
  progress: number
  target: number
  current: number
  deadline: string
  priority: "high" | "medium" | "low"
}

const goals: Goal[] = [
  {
    id: "1",
    title: "Improve Customer Support Clarity",
    progress: 78,
    target: 100,
    current: 78,
    deadline: "Dec 15, 2024",
    priority: "high"
  },
  {
    id: "2", 
    title: "Reduce Meeting Duration",
    progress: 45,
    target: 80,
    current: 36,
    deadline: "Jan 30, 2025",
    priority: "medium"
  },
  {
    id: "3",
    title: "Enhance Team Communication",
    progress: 92,
    target: 100,
    current: 92,
    deadline: "Nov 20, 2024",
    priority: "low"
  }
]

export function ProfessionalDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your communication clarity and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {metric.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={metric.change > 0 ? "text-green-600" : "text-red-600"}>
                  {metric.changeLabel}
                </span>
              </div>
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Goals</CardTitle>
          <CardDescription>
            Track progress on your clarity and engagement objectives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{goal.title}</h4>
                    <Badge 
                      variant={
                        goal.priority === "high" ? "destructive" : 
                        goal.priority === "medium" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {goal.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due {goal.deadline}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {goal.current}/{goal.target}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.progress}% complete
                  </div>
                </div>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
