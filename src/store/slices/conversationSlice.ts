import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ConversationState {
  currentConversationId: string | null;
  messages: Message[];
  isTyping: boolean;
}

const initialState: ConversationState = {
  currentConversationId: null,
  messages: [],
  isTyping: false,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversationId = null;
    },
  },
});

export const {
  setCurrentConversation,
  addMessage,
  setMessages,
  setTyping,
  clearMessages,
} = conversationSlice.actions;

export default conversationSlice.reducer;
