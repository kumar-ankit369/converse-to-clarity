import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Conversation', 'Goal', 'Analytics', 'Project', 'Team', 'Chat', 'Message'],
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // Conversations
    getConversations: builder.query({
      query: () => '/conversations',
      providesTags: ['Conversation'],
    }),
    getConversation: builder.query({
      query: (id) => `/conversations/${id}`,
      providesTags: ['Conversation'],
    }),
    createConversation: builder.mutation({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversation'],
    }),
    
    // Goals
    getGoals: builder.query({
      query: () => '/goals',
      providesTags: ['Goal'],
    }),
    createGoal: builder.mutation({
      query: (data) => ({
        url: '/goals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),
    updateGoal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/goals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),
    
    // Analytics
    getAnalytics: builder.query({
      query: () => '/analytics',
      providesTags: ['Analytics'],
    }),

    // Projects
    getProjects: builder.query({
      query: (filters) => ({
        url: '/projects',
        params: filters,
      }),
      providesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: ['Project'],
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    addCollaborator: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/projects/${projectId}/collaborators`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    removeCollaborator: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/collaborators/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Teams
    getTeams: builder.query({
      query: () => '/teams',
      providesTags: ['Team'],
    }),
    getTeam: builder.query({
      query: (id) => `/teams/${id}`,
      providesTags: ['Team'],
    }),
    // Search users (for invites)
    searchUsers: builder.query({
      query: (q: string) => ({ url: `/users/search?q=${encodeURIComponent(q)}` }),
      providesTags: ['User'],
    }),
    createTeam: builder.mutation({
      query: (data) => ({
        url: '/teams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    updateTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),
    addTeamMember: builder.mutation({
      query: ({ teamId, ...data }) => ({
        url: `/teams/${teamId}/members`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    updateTeamMemberRole: builder.mutation({
      query: ({ teamId, memberId, role }) => ({
        url: `/teams/${teamId}/members/${memberId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Team'],
    }),
    removeTeamMember: builder.mutation({
      query: ({ teamId, memberId }) => ({
        url: `/teams/${teamId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),
    transferTeamOwnership: builder.mutation({
      query: ({ teamId, newOwnerId }) => ({
        url: `/teams/${teamId}/transfer-owner`,
        method: 'POST',
        body: { newOwnerId },
      }),
      invalidatesTags: ['Team'],
    }),

    // Chat
    getChannels: builder.query({
      query: () => '/chat/channels',
      providesTags: ['Chat'],
    }),
    getChannel: builder.query({
      query: (id) => `/chat/channels/${id}`,
      providesTags: ['Chat'],
    }),
    createChannel: builder.mutation({
      query: (data) => ({
        url: '/chat/channels',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chat'],
    }),
    getMessages: builder.query({
      query: (channelId) => `/chat/channels/${channelId}/messages`,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation({
      query: ({ channelId, ...data }) => ({
        url: `/chat/channels/${channelId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message', 'Chat'],
    }),
    updateMessage: builder.mutation({
      query: ({ channelId, messageId, content }) => ({
        url: `/chat/channels/${channelId}/messages/${messageId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: ['Message'],
    }),
    deleteMessage: builder.mutation({
      query: ({ channelId, messageId }) => ({
        url: `/chat/channels/${channelId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
    addReaction: builder.mutation({
      query: ({ channelId, messageId, emoji }) => ({
        url: `/chat/channels/${channelId}/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      invalidatesTags: ['Message'],
    }),
    removeReaction: builder.mutation({
      query: ({ channelId, messageId, emoji }) => ({
        url: `/chat/channels/${channelId}/messages/${messageId}/reactions/${emoji}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
    getThreadMessages: builder.query({
      query: ({ channelId, parentId }) => `/chat/channels/${channelId}/messages/${parentId}/thread`,
      providesTags: ['Message'],
    }),
    uploadChatFile: builder.mutation({
      query: ({ channelId, formData }) => ({
        url: `/chat/channels/${channelId}/upload`,
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useGetAnalyticsQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddCollaboratorMutation,
  useRemoveCollaboratorMutation,
  // Teams
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddTeamMemberMutation,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
  useTransferTeamOwnershipMutation,
  // Chat
  useGetChannelsQuery,
  useGetChannelQuery,
  useCreateChannelMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useGetThreadMessagesQuery,
  useUploadChatFileMutation,
  useSearchUsersQuery,
} = api;
