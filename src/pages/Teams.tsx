import { useEffect } from "react"
import { useTeamSocket } from "@/hooks/use-team-socket"
import { useGetTeamsQuery } from "@/store/api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setTeams } from "@/store/slices/teamSlice"
import TeamCard from "@/components/teams/TeamCard"
import CreateTeamDialog from "@/components/teams/CreateTeamDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"
import Navbar from "@/components/Navbar"

export default function Teams() {
  // subscribe to team socket events to keep list up-to-date
  useTeamSocket()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const teams = useAppSelector(state => state.team.teams)
  const { data, isLoading } = useGetTeamsQuery(undefined)

  useEffect(() => {
    if (data) {
      dispatch(setTeams(data))
    }
  }, [data, dispatch])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground mt-2">
              Collaborate with your team members on projects
            </p>
          </div>
          <CreateTeamDialog />
        </div>

      {teams.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">No teams yet</CardTitle>
            <CardDescription className="mb-6">
              Create your first team to start collaborating with others
            </CardDescription>
            <CreateTeamDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              currentUserId={user?.id || ''}
            />
          ))}
        </div>
      )}

      {/* Stats Section */}
      {teams.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {teams.length}
              </CardTitle>
              <CardDescription>Total Teams</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {teams.reduce((acc, t) => acc + t.members.length, 0)}
              </CardTitle>
              <CardDescription>Total Members</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {teams.reduce((acc, t) => acc + t.projectCount, 0)}
              </CardTitle>
              <CardDescription>Total Projects</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}
