import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useGetTeamQuery, useUpdateTeamMutation, useDeleteTeamMutation, useTransferTeamOwnershipMutation } from '@/store/api'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function TeamSettings() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { data: team, refetch } = useGetTeamQuery(teamId || '')
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation()
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation()
  const [transferOwnership, { isLoading: isTransferring }] = useTransferTeamOwnershipMutation()
  const [name, setName] = useState(team?.name || '')
  const [description, setDescription] = useState(team?.description || '')
  const [avatar, setAvatar] = useState(team?.avatar || '')
  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  const { toast } = useToast()

  const handleSave = async () => {
    if (!teamId) return
    try {
      await updateTeam({ id: teamId, name, description, avatar }).unwrap()
      toast({ title: 'Success', description: 'Team updated' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update team', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!teamId) return
    if (!confirm(`Delete team "${team?.name}"? This cannot be undone.`)) return
    try {
      // Only owners should be allowed to delete; simple client-side guard
      const currentUserId = localStorage.getItem('userId') || ''
      const isOwner = team?.owner === currentUserId
      if (!isOwner) {
        toast({ title: 'Forbidden', description: 'Only the owner can delete this team', variant: 'destructive' })
        return
      }
      await deleteTeam(teamId).unwrap()
      toast({ title: 'Deleted', description: 'Team deleted' })
      navigate('/teams')
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete team', variant: 'destructive' })
    }
  }

  const handleTransferOwnership = async () => {
    if (!teamId || !selectedNewOwner) return
    try {
      await transferOwnership({ teamId, newOwnerId: selectedNewOwner }).unwrap()
      toast({ title: 'Success', description: 'Ownership transferred successfully' })
      await refetch()
      navigate(`/teams/${teamId}`)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to transfer ownership', variant: 'destructive' })
    }
  }

  // Only show settings if current user is the owner
  const currentUserId = localStorage.getItem('userId') || ''
  const isOwner = team?.owner === currentUserId

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Only the team owner can access settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar URL</label>
              <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleSave} disabled={isUpdating}>Save</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Delete Team</Button>
          </CardFooter>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transfer Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transfer ownership to another team member. You will become an admin after the transfer.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">New Owner</label>
              <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {team?.members
                    ?.filter((m) => m.role !== 'owner' && m.userId?._id)
                    .map((m) => (
                      <SelectItem key={m.userId._id} value={m.userId._id}>
                        {m.userId.name} ({m.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!selectedNewOwner || isTransferring}>
                  Transfer Ownership
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Ownership Transfer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to transfer ownership? You will become an admin and will no longer be able to delete this team or transfer ownership again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTransferOwnership}>
                    Transfer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
