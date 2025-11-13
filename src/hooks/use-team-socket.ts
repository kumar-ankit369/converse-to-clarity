/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import socketService from '@/lib/socket'
import { useAppDispatch } from '@/store/hooks'
import { addTeamMember, updateTeam, removeTeamMember, updateTeamMember } from '@/store/slices/teamSlice'

export function useTeamSocket() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token') || undefined
    const socket = socketService.getSocket() || socketService.connect(token)

    const handleMemberAdded = (payload: any) => {
      if (!payload || !payload.teamId || !payload.member) return
      dispatch(addTeamMember({ teamId: payload.teamId, member: payload.member }))
    }

    const handleMemberRemoved = (payload: any) => {
      if (!payload || !payload.teamId || !payload.memberId) return
      // Use removeTeamMember to remove just the member from the team state
      dispatch(removeTeamMember({ teamId: payload.teamId, memberId: payload.memberId }))
    }

    const handleRoleChanged = (payload: any) => {
      if (!payload || !payload.teamId || !payload.memberId) return
      // Update the member role in-place if we have minimal member info
      const updatedMember = payload.member || { id: payload.memberId, role: payload.role }
      dispatch(updateTeamMember({ teamId: payload.teamId, member: updatedMember }))
    }

    const handleTeamUpdated = (team: any) => {
      if (!team || !team.id) return
      dispatch(updateTeam(team))
    }

    socket.on('team:member:added', handleMemberAdded)
    socket.on('team:member:removed', handleMemberRemoved)
    socket.on('team:member:roleChanged', handleRoleChanged)
    socket.on('team:updated', handleTeamUpdated)

    return () => {
      socket.off('team:member:added', handleMemberAdded)
      socket.off('team:member:removed', handleMemberRemoved)
      socket.off('team:member:roleChanged', handleRoleChanged)
      socket.off('team:updated', handleTeamUpdated)
    }
  }, [dispatch])
}

export default useTeamSocket
