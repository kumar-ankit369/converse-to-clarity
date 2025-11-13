import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSearchUsersQuery, useAddTeamMemberMutation } from '@/store/api'
import { useToast } from '@/hooks/use-toast'

interface Props {
  teamId: string
  defaultRole?: 'member' | 'admin'
  onInvited?: () => void
}

export default function UserSearchInvite({ teamId, defaultRole = 'member', onInvited }: Props) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: users, isLoading } = useSearchUsersQuery(debounced, { skip: debounced === '' })
  const [addMember, { isLoading: isInviting }] = useAddTeamMemberMutation()
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  const handleInvite = async () => {
    if (!selectedId) return toast({ title: 'Select a user first', variant: 'destructive' })
    try {
      await addMember({ teamId, userId: selectedId, role: defaultRole }).unwrap()
      toast({ title: 'Invited', description: 'User invited to the team' })
      setQ('')
      setSelectedId(null)
      if (onInvited) onInvited()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to invite user', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="Search users by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button onClick={handleInvite} disabled={!selectedId || isInviting}>Invite</Button>
      </div>

      {debounced !== '' && (
        <div className="bg-card rounded-md border p-2 max-h-48 overflow-auto">
          {isLoading && <div className="text-sm text-muted-foreground">Searching...</div>}
          {!isLoading && (!users || users.length === 0) && (
            <div className="text-sm text-muted-foreground">No users found</div>
          )}
          {!isLoading && users && users.map((u: { id: string; name: string; email: string; avatar?: string }) => (
            <div key={u.id} className={`flex items-center justify-between gap-2 p-2 rounded hover:bg-muted ${selectedId === u.id ? 'bg-muted/30' : ''}`}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{(u.name || '').substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <div>
                <Button size="sm" variant={selectedId === u.id ? 'secondary' : 'ghost'} onClick={() => setSelectedId(u.id)}>
                  {selectedId === u.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
