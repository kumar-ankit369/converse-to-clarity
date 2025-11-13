import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { useGetTeamQuery, useAddTeamMemberMutation } from "@/store/api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setCurrentTeam } from "@/store/slices/teamSlice"
import TeamMemberList from "@/components/teams/TeamMemberList"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import socketService from "@/lib/socket"
import UserSearchInvite from "@/components/teams/UserSearchInvite"

export default function TeamDetail() {
  const { teamId } = useParams()
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const { data: team, isLoading, refetch } = useGetTeamQuery(teamId || '')
  const [addMember] = useAddTeamMemberMutation()
  const { toast } = useToast()
  const [inviteUserId, setInviteUserId] = useState("")
  const [role, setRole] = useState<'member' | 'admin'>('member')

  useEffect(() => {
    if (team) {
      dispatch(setCurrentTeam(team))
    }
  }, [team, dispatch])

  useEffect(() => {
    // join team room for real-time updates when socket available
    const token = localStorage.getItem('token') || undefined
    const socket = socketService.getSocket() || socketService.connect(token)
    if (teamId) {
      socket.emit('joinRoom', { type: 'team', id: teamId })
      socket.emit('join-room', { type: 'team', id: teamId })
    }

    return () => {
      if (teamId) {
        socket.emit('leaveRoom', { type: 'team', id: teamId })
      }
    }
  }, [teamId])

  const handleInvite = async () => {
    if (!inviteUserId) {
      toast({ title: 'Error', description: 'User ID is required', variant: 'destructive' })
      return
    }

    try {
      await addMember({ teamId: teamId!, userId: inviteUserId, role }).unwrap()
      toast({ title: 'Success', description: 'Member invited' })
      setInviteUserId('')
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to invite member', variant: 'destructive' })
    }
  }

  if (!teamId) return <div>Team not found</div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{team?.name || 'Team'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{team?.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Members</h3>
              {team ? (
                <TeamMemberList
                  teamId={team.id}
                  members={team.members}
                  currentUserId={user?.id || ''}
                  isOwner={team.owner === (user?.id || '')}
                />
              ) : null}
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-2">Invite Member</h4>
              <div>
                {team && <div className="mb-2 text-sm text-muted-foreground">Invite someone to "{team.name}" by searching their name or email.</div>}
                {team && ((team.owner === (user?.id || '')) || team.members.some(m => m.userId === (user?.id || '') && m.role === 'admin')) ? (
                  <UserSearchInvite teamId={team.id} defaultRole={role || 'member'} onInvited={() => refetch()} />
                ) : (
                  <div className="text-sm text-muted-foreground">Only owners or admins can invite members.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
