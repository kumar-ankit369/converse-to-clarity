import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Target, TrendingUp } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  target: number
  current: number
  deadline: string
  status: "on-track" | "at-risk" | "behind"
  priority: "high" | "medium" | "low"
}

const goals: Goal[] = [
  {
    id: "1",
    title: "Q4 Conversation Quality",
    description: "Achieve 95% clarity score across all conversations",
    progress: 89,
    target: 95,
    current: 89,
    deadline: "Dec 31, 2024",
    status: "on-track",
    priority: "high"
  },
  {
    id: "2",
    title: "User Engagement",
    description: "Increase monthly active users to 1,000",
    progress: 57,
    target: 1000,
    current: 573,
    deadline: "Nov 30, 2024",
    status: "at-risk",
    priority: "high"
  },
  {
    id: "3",
    title: "Insight Generation",
    description: "Generate 2,000 AI insights this quarter",
    progress: 71,
    target: 2000,
    current: 1423,
    deadline: "Dec 31, 2024",
    status: "on-track",
    priority: "medium"
  },
  {
    id: "4",
    title: "Response Time",
    description: "Maintain sub-2 second insight generation",
    progress: 95,
    target: 100,
    current: 95,
    deadline: "Ongoing",
    status: "on-track",
    priority: "low"
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case "on-track": return "bg-green-500"
    case "at-risk": return "bg-yellow-500"
    case "behind": return "bg-red-500"
    default: return "bg-gray-500"
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "on-track": return "On Track"
    case "at-risk": return "At Risk"
    case "behind": return "Behind"
    default: return "Unknown"
  }
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "high": return "destructive"
    case "medium": return "default"
    case "low": return "secondary"
    default: return "outline"
  }
}

export function GoalsOverview() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Objectives
        </CardTitle>
        <CardDescription>
          Track progress towards key performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{goal.title}</h4>
                    <Badge variant={getPriorityVariant(goal.priority)} className="text-xs">
                      {goal.priority}
                    </Badge>
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(goal.status)}`} />
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(goal.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{goal.current}/{goal.target}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {goal.deadline}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
