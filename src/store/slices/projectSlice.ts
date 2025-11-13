import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  dueDate?: string;
  progress: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  filters: {
    status?: string;
    priority?: string;
    search?: string;
  };
  isLoading: boolean;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  filters: {},
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.selectedProject?.id === action.payload) {
        state.selectedProject = null;
      }
    },
    selectProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<{
        status?: string;
        priority?: string;
        search?: string;
      }>
    ) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  selectProject,
  setFilters,
  setLoading,
} = projectSlice.actions;

export default projectSlice.reducer;
