import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  channelId: string;
  parentId?: string; // For threads
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: 'project' | 'team' | 'direct';
  projectId?: string;
  teamId?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
}

interface ChatState {
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Record<string, Message[]>; // channelId -> messages
  threads: Record<string, Message[]>; // parentMessageId -> replies
  typingUsers: TypingIndicator[];
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  channels: [],
  currentChannel: null,
  messages: {},
  threads: {},
  typingUsers: [],
  onlineUsers: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    setCurrentChannel: (state, action: PayloadAction<Channel | null>) => {
      state.currentChannel = action.payload;
    },
    addChannel: (state, action: PayloadAction<Channel>) => {
      state.channels.push(action.payload);
    },
    updateChannel: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.channels[index] = action.payload;
      }
      if (state.currentChannel?.id === action.payload.id) {
        state.currentChannel = action.payload;
      }
    },
    setMessages: (state, action: PayloadAction<{ channelId: string; messages: Message[] }>) => {
      state.messages[action.payload.channelId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const channelId = action.payload.channelId;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      state.messages[channelId].push(action.payload);
      
      // Update channel's last message
      const channel = state.channels.find(c => c.id === channelId);
      if (channel) {
        channel.lastMessage = action.payload;
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const channelId = action.payload.channelId;
      const messages = state.messages[channelId];
      if (messages) {
        const index = messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          messages[index] = action.payload;
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ channelId: string; messageId: string }>) => {
      const messages = state.messages[action.payload.channelId];
      if (messages) {
        state.messages[action.payload.channelId] = messages.filter(m => m.id !== action.payload.messageId);
      }
    },
    addReaction: (state, action: PayloadAction<{ channelId: string; messageId: string; reaction: MessageReaction }>) => {
      const messages = state.messages[action.payload.channelId];
      if (messages) {
        const message = messages.find(m => m.id === action.payload.messageId);
        if (message) {
          const existingReaction = message.reactions.find(
            r => r.emoji === action.payload.reaction.emoji && r.userId === action.payload.reaction.userId
          );
          if (!existingReaction) {
            message.reactions.push(action.payload.reaction);
          }
        }
      }
    },
    removeReaction: (state, action: PayloadAction<{ channelId: string; messageId: string; emoji: string; userId: string }>) => {
      const messages = state.messages[action.payload.channelId];
      if (messages) {
        const message = messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.reactions = message.reactions.filter(
            r => !(r.emoji === action.payload.emoji && r.userId === action.payload.userId)
          );
        }
      }
    },
    setThreadMessages: (state, action: PayloadAction<{ parentId: string; messages: Message[] }>) => {
      state.threads[action.payload.parentId] = action.payload.messages;
    },
    addThreadMessage: (state, action: PayloadAction<Message>) => {
      const parentId = action.payload.parentId;
      if (parentId) {
        if (!state.threads[parentId]) {
          state.threads[parentId] = [];
        }
        state.threads[parentId].push(action.payload);
      }
    },
    setTypingUsers: (state, action: PayloadAction<TypingIndicator[]>) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action: PayloadAction<TypingIndicator>) => {
      const exists = state.typingUsers.find(
        u => u.userId === action.payload.userId && u.channelId === action.payload.channelId
      );
      if (!exists) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ userId: string; channelId: string }>) => {
      state.typingUsers = state.typingUsers.filter(
        u => !(u.userId === action.payload.userId && u.channelId === action.payload.channelId)
      );
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const channel = state.channels.find(c => c.id === action.payload);
      if (channel && channel.id !== state.currentChannel?.id) {
        channel.unreadCount += 1;
      }
    },
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const channel = state.channels.find(c => c.id === action.payload);
      if (channel) {
        channel.unreadCount = 0;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChannels,
  setCurrentChannel,
  addChannel,
  updateChannel,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  setThreadMessages,
  addThreadMessage,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  incrementUnreadCount,
  resetUnreadCount,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
