import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Clock, Star } from "lucide-react"

interface RecentActivity {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
  priority: "high" | "medium" | "low"
  score?: number
}

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "/avatars/sarah.jpg"
    },
    action: "Generated clarity insight",
    target: "Product Strategy Meeting",
    timestamp: "2 minutes ago",
    priority: "high",
    score: 94
  },
  {
    id: "2",
    user: {
      name: "Michael Rodriguez",
      email: "michael@example.com",
      avatar: "/avatars/michael.jpg"
    },
    action: "Started conversation",
    target: "Q4 Planning Session",
    timestamp: "5 minutes ago",
    priority: "medium"
  },
  {
    id: "3",
    user: {
      name: "Emily Johnson",
      email: "emily@example.com",
      avatar: "/avatars/emily.jpg"
    },
    action: "Completed analysis",
    target: "Team Retrospective",
    timestamp: "12 minutes ago",
    priority: "high",
    score: 87
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      email: "david@example.com",
      avatar: "/avatars/david.jpg"
    },
    action: "Shared insights",
    target: "Client Feedback Review",
    timestamp: "18 minutes ago",
    priority: "low",
    score: 76
  },
  {
    id: "5",
    user: {
      name: "Lisa Thompson",
      email: "lisa@example.com",
      avatar: "/avatars/lisa.jpg"
    },
    action: "Updated conversation",
    target: "Marketing Campaign Brief",
    timestamp: "25 minutes ago",
    priority: "medium"
  }
]

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high": return "bg-red-500"
    case "medium": return "bg-yellow-500"
    case "low": return "bg-green-500"
    default: return "bg-gray-500"
  }
}

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates from your conversations and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 rounded-lg border p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>
                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <div className={`h-2 w-2 rounded-full ${getPriorityColor(activity.priority)}`} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} on <span className="font-medium">{activity.target}</span>
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{activity.timestamp}</span>
                  {activity.score && (
                    <>
                      <Star className="h-3 w-3 ml-2" />
                      <span>Clarity: {activity.score}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
