import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import authReducer from './slices/authSlice';
import conversationReducer from './slices/conversationSlice';
import goalReducer from './slices/goalSlice';
import projectReducer from './slices/projectSlice';
import teamReducer from './slices/teamSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    conversation: conversationReducer,
    goal: goalReducer,
    project: projectReducer,
    team: teamReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
