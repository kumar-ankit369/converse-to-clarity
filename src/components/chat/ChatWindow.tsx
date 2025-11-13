/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useGetMessagesQuery } from "@/store/api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setMessages, setCurrentChannel } from "@/store/slices/chatSlice"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Hash } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"

export default function ChatWindow() {
  const { channelId } = useParams()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const currentChannel = useAppSelector(state => state.chat.currentChannel)
  const messages = useAppSelector(state => 
    channelId ? state.chat.messages[channelId] || [] : []
  )
  
  const { data, isLoading } = useGetMessagesQuery(channelId!, {
    skip: !channelId,
  })

  const socket = useSocket()

  useEffect(() => {
    if (data && channelId) {
      dispatch(setMessages({ channelId, messages: data }))
    }
  }, [data, channelId, dispatch])

  useEffect(() => {
    if (!socket || !channelId) return
    // Join channel room (supporting server join handlers)
    socket.emit('join-channel', channelId)
    socket.emit('joinRoom', { type: 'channel', id: channelId })

    // Helper to append message
    type Msg = { id?: string; channelId?: string; reactions?: unknown[] }
    const handleIncoming = (message: unknown) => {
      const msg = message as Msg
      if (!msg || msg.channelId !== channelId) return
      dispatch(setMessages({ channelId, messages: [...messages, msg as any] }))
    }

    // Listen for new messages (support older and newer event names)
    socket.on('new-message', handleIncoming)
    socket.on('message:created', handleIncoming)

    // Message updated/deleted
    socket.on('message:updated', (message: unknown) => {
      const msg = message as Msg
      if (!msg || msg.channelId !== channelId) return
      const updated = (messages || []).map(m => m.id === msg.id ? (msg as any) : m)
      dispatch(setMessages({ channelId, messages: updated }))
    })

    socket.on('message:deleted', (payload: unknown) => {
      const p = payload as { id?: string }
      const filtered = (messages || []).filter(m => m.id !== p.id)
      dispatch(setMessages({ channelId, messages: filtered }))
    })

    // Reactions
    socket.on('reaction:added', (payload: unknown) => {
      const p = payload as { messageId?: string; reaction?: any }
      // payload contains messageId and reaction; best-effort update
      const updated = (messages || []).map(m => {
        if (m.id === p.messageId && p.reaction) {
          return { ...m, reactions: [...(m.reactions||[]), p.reaction as any] }
        }
        return m
      })
      dispatch(setMessages({ channelId, messages: updated }))
    })

    // Typing indicators
    socket.on('user-typing', (data) => {
      console.log('User typing:', data)
    })

    return () => {
      socket.off('new-message', handleIncoming)
      socket.off('message:created', handleIncoming)
      socket.off('message:updated')
      socket.off('message:deleted')
      socket.off('reaction:added')
      socket.off('user-typing')
      socket.emit('leave-channel', channelId)
      socket.emit('leaveRoom', { type: 'channel', id: channelId })
    }
  }, [socket, channelId, dispatch, messages])

  const handleTyping = () => {
    if (socket && channelId) {
      socket.emit('typing', { channelId, userId: user?.id, userName: user?.name })
    }
  }

  if (!channelId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Hash className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Select a channel to start messaging</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Channel Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          {currentChannel?.type === 'team' ? (
            <Users className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Hash className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h2 className="font-semibold">{currentChannel?.name || 'Channel'}</h2>
            <p className="text-xs text-muted-foreground">
              {currentChannel?.participants.length} members
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        currentUserId={user?.id || ''} 
        channelId={channelId}
      />

      {/* Input */}
      <MessageInput channelId={channelId} onTyping={handleTyping} />
    </Card>
  )
}
