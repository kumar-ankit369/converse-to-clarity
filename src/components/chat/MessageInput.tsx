import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSendMessageMutation, useUploadChatFileMutation } from "@/store/api"
import { useToast } from "@/hooks/use-toast"
import { Send, Paperclip, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MessageInputProps {
  channelId: string
  onTyping?: () => void
}

export default function MessageInput({ channelId, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [uploadFile, { isLoading: isUploading }] = useUploadChatFileMutation()
  const { toast } = useToast()

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return

    try {
      const attachments = []

      // Upload files first
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          const result = await uploadFile({ channelId, formData }).unwrap()
          attachments.push(result)
        }
      }

      // Send message
      await sendMessage({
        channelId,
        content: message.trim(),
        attachments,
      }).unwrap()

      setMessage("")
      setFiles([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="border-t p-4 space-y-2">
      {/* File attachments preview */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <Badge key={index} variant="secondary" className="gap-2 py-1">
              <span className="text-xs truncate max-w-[150px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Upload file"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || isUploading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            onTyping?.()
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[120px] resize-none"
          disabled={isSending || isUploading}
        />
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && files.length === 0) || isSending || isUploading}
          size="icon"
        >
          {isSending || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
