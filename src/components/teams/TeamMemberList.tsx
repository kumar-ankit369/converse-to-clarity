import { TeamMember } from "@/store/slices/teamSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateTeamMemberRoleMutation, useRemoveTeamMemberMutation } from "@/store/api"
import { useToast } from "@/hooks/use-toast"
import { UserMinus, Shield } from "lucide-react"
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

interface TeamMemberListProps {
  teamId: string
  members: TeamMember[]
  currentUserId: string
  isOwner: boolean
}

export default function TeamMemberList({ teamId, members, currentUserId, isOwner }: TeamMemberListProps) {
  const [updateRole] = useUpdateTeamMemberRoleMutation()
  const [removeMember] = useRemoveTeamMemberMutation()
  const { toast } = useToast()

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!isOwner) {
      toast({ title: 'Forbidden', description: 'Only the owner can change roles', variant: 'destructive' })
      return
    }
    try {
      await updateRole({ teamId, memberId, role: newRole }).unwrap()
      toast({
        title: "Success",
        description: "Member role updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember({ teamId, memberId }).unwrap()
      toast({
        title: "Success",
        description: "Member removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'member':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-primary/10">
                {member.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {member.role === 'owner' ? (
              <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                <Shield className="h-3 w-3" />
                Owner
              </Badge>
            ) : isOwner ? (
              <>
                <Select
                  value={member.role}
                  onValueChange={(value) => handleRoleChange(member.id, value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {isOwner && member.userId !== currentUserId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.name} from this team?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <Badge variant={getRoleBadgeVariant(member.role)}>
                {member.role}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
