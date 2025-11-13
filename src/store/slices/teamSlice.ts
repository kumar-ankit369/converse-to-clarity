import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  projectCount: number;
  avatar?: string;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = action.payload;
      }
      if (state.currentTeam?.id === action.payload.id) {
        state.currentTeam = action.payload;
      }
    },
    removeTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter(t => t.id !== action.payload);
      if (state.currentTeam?.id === action.payload) {
        state.currentTeam = null;
      }
    },
    addTeamMember: (state, action: PayloadAction<{ teamId: string; member: TeamMember }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.members.push(action.payload.member);
      }
      if (state.currentTeam?.id === action.payload.teamId) {
        state.currentTeam.members.push(action.payload.member);
      }
    },
    updateTeamMember: (state, action: PayloadAction<{ teamId: string; member: TeamMember }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        const index = team.members.findIndex(m => m.id === action.payload.member.id);
        if (index !== -1) {
          team.members[index] = action.payload.member;
        }
      }
      if (state.currentTeam?.id === action.payload.teamId) {
        const index = state.currentTeam.members.findIndex(m => m.id === action.payload.member.id);
        if (index !== -1) {
          state.currentTeam.members[index] = action.payload.member;
        }
      }
    },
    removeTeamMember: (state, action: PayloadAction<{ teamId: string; memberId: string }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.members = team.members.filter(m => m.id !== action.payload.memberId);
      }
      if (state.currentTeam?.id === action.payload.teamId) {
        state.currentTeam.members = state.currentTeam.members.filter(m => m.id !== action.payload.memberId);
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
  setTeams,
  setCurrentTeam,
  addTeam,
  updateTeam,
  removeTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  setLoading,
  setError,
} = teamSlice.actions;

export default teamSlice.reducer;
