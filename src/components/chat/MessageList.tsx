import { useState, useEffect, useRef } from "react"
import { Message } from "@/store/slices/chatSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreVertical, 
  Reply, 
  Smile, 
  Edit2, 
  Trash2,
  Download,
  File
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDeleteMessageMutation, useAddReactionMutation, useRemoveReactionMutation } from "@/store/api"
import { useToast } from "@/hooks/use-toast"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  channelId: string
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🚀', '👀']

export default function MessageList({ messages, currentUserId, channelId, onReply, onEdit }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [deleteMessage] = useDeleteMessageMutation()
  const [addReaction] = useAddReactionMutation()
  const [removeReaction] = useRemoveReactionMutation()
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ channelId, messageId }).unwrap()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleReaction = async (messageId: string, emoji: string, hasReacted: boolean) => {
    try {
      if (hasReacted) {
        await removeReaction({ channelId, messageId, emoji }).unwrap()
      } else {
        await addReaction({ channelId, messageId, emoji }).unwrap()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      })
    }
  }

  const groupReactions = (reactions: Message['reactions']) => {
    const grouped: Record<string, { count: number; userIds: string[] }> = {}
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, userIds: [] }
      }
      grouped[r.emoji].count++
      grouped[r.emoji].userIds.push(r.userId)
    })
    return grouped
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId
        const groupedReactions = groupReactions(message.reactions)

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderAvatar} />
              <AvatarFallback className="bg-primary/10 text-xs">
                {message.senderName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{message.senderName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.isEdited && (
                  <Badge variant="secondary" className="text-xs">edited</Badge>
                )}
              </div>
              <div className={`group relative rounded-lg px-4 py-2 ${
                isOwnMessage 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                
                {/* Attachments */}
                {message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 rounded bg-background/10">
                        <File className="h-4 w-4" />
                        <span className="text-xs flex-1 truncate">{attachment.name}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={attachment.url} download target="_blank" rel="noopener noreferrer" title={`Download ${attachment.name}`}>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute -top-2 right-2 hidden group-hover:flex gap-1 bg-background border rounded-md shadow-md p-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="flex gap-1">
                        {EMOJI_REACTIONS.map((emoji) => {
                          const hasReacted = message.reactions.some(
                            r => r.emoji === emoji && r.userId === currentUserId
                          )
                          return (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-lg"
                              onClick={() => handleReaction(message.id, emoji, hasReacted)}
                            >
                              {emoji}
                            </Button>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {onReply && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onReply(message)}>
                      <Reply className="h-4 w-4" />
                    </Button>
                  )}
                  {isOwnMessage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(message)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(message.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Reactions */}
              {message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(groupedReactions).map(([emoji, data]) => {
                    const hasReacted = data.userIds.includes(currentUserId)
                    return (
                      <Button
                        key={emoji}
                        variant={hasReacted ? "secondary" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={() => handleReaction(message.id, emoji, hasReacted)}
                      >
                        <span>{emoji}</span>
                        <span>{data.count}</span>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
