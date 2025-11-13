import React, { useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSocket } from '@/hooks/use-socket';
import {
  useGetConversationsQuery,
  useCreateConversationMutation,
} from '@/store/api';
import { addMessage } from '@/store/slices/conversationSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Example Component demonstrating:
 * - Redux Toolkit state management
 * - RTK Query for API calls
 * - Socket.io for real-time communication
 * - React Hook Form for forms
 * - React Dropzone for file uploads
 * - Recharts for data visualization
 */
export function ExampleFeatures() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.conversation.messages);

  // RTK Query hooks
  const { data: conversations, isLoading } = useGetConversationsQuery(undefined);
  const [createConversation] = useCreateConversationMutation();

  // Socket.io hook (using user ID as token for now)
  const { isConnected, on, off, emit } = useSocket(user?.id);

  useEffect(() => {
    // Listen for real-time messages
    const handleNewMessage = (message: { id: string; content: string; sender: 'user' | 'assistant'; timestamp: string }) => {
      dispatch(addMessage(message));
    };

    on('message', handleNewMessage);

    return () => {
      off('message', handleNewMessage);
    };
  }, [dispatch, on, off]);

  const handleFileUpload = (files: File[]) => {
    console.log('Uploaded files:', files);
    // Handle file upload logic here
  };

  const handleSendMessage = () => {
    emit('sendMessage', {
      content: 'Hello from Redux + Socket.io!',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Socket.io Status:</span>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <Separator />

          {/* RTK Query Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              RTK Query - Conversations
            </h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-2">
                {conversations?.map((conv: { id: string; title: string }) => (
                  <Card key={conv.id} className="p-3">
                    <p className="text-sm font-medium">{conv.title}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Socket.io Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Real-time Messaging
            </h3>
            <Button onClick={handleSendMessage} disabled={!isConnected}>
              Send Test Message
            </Button>
            <div className="mt-2 space-y-1">
              {Array.isArray(messages) && messages.map((msg: { id?: string; content: string }, i: number) => (
                <p key={msg.id || i} className="text-sm">
                  {msg.content}
                </p>
              ))}
            </div>
          </div>

          <Separator />

          {/* File Upload Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-2">File Upload</h3>
            <FileUpload onUpload={handleFileUpload} maxFiles={3} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
