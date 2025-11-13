import { Team } from "@/store/slices/teamSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Settings, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDeleteTeamMutation } from "@/store/api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TeamCardProps {
  team: Team
  currentUserId: string
}

export default function TeamCard({ team, currentUserId }: TeamCardProps) {
  const navigate = useNavigate()
  const [deleteTeam, { isLoading }] = useDeleteTeamMutation()
  const { toast } = useToast()

  const isOwner = team.owner === currentUserId
  const memberCount = team.members.length

  const handleDelete = async () => {
    try {
      await deleteTeam(team.id).unwrap()
      toast({
        title: "Success",
        description: "Team deleted successfully",
      })
    } catch (error) {
      const err = error as { data?: { message?: string } }
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to delete team",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={team.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Users className="h-3 w-3" />
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </CardDescription>
            </div>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {team.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(team.createdAt).toLocaleDateString()}
          </div>
          <div>
            {team.projectCount} {team.projectCount === 1 ? 'project' : 'projects'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          View Team
        </Button>
        {isOwner && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/teams/${team.id}/settings`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{team.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
