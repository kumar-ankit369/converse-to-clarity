import { useEffect, useState } from "react"
import { useGetChannelsQuery } from "@/store/api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setChannels, setCurrentChannel } from "@/store/slices/chatSlice"
import ChatWindow from "@/components/chat/ChatWindow"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Hash, Users, MessageCircle, Search, Plus } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

export default function Chat() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const channels = useAppSelector(state => state.chat.channels)
  const { data, isLoading } = useGetChannelsQuery(undefined)

  useEffect(() => {
    if (data) {
      dispatch(setChannels(data))
    }
  }, [data, dispatch])

  useEffect(() => {
    if (channelId) {
      const channel = channels.find(c => c.id === channelId)
      if (channel) {
        dispatch(setCurrentChannel(channel))
      }
    }
  }, [channelId, channels, dispatch])

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'team':
        return <Users className="h-4 w-4" />
      case 'direct':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex">
        <div className="w-80 border-r">
          <div className="p-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 p-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Channels List */}
      <Card className="w-80 border-r rounded-none border-t-0 border-l-0 border-b-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Channels</h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2 space-y-1">
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No channels found</p>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={channelId === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => navigate(`/chat/${channel.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getChannelIcon(channel.type)}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{channel.name}</p>
                      {channel.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.lastMessage.senderName}: {channel.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  {channel.unreadCount > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Quick Stats */}
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{channels.length}</p>
              <p className="text-xs text-muted-foreground">Channels</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {channels.reduce((acc, c) => acc + c.unreadCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  )
}
