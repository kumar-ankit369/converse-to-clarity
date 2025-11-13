import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  dueDate?: string;
}

interface GoalState {
  goals: Goal[];
  selectedGoalId: string | null;
}

const initialState: GoalState = {
  goals: [],
  selectedGoalId: null,
};

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.goals.push(action.payload);
    },
    updateGoal: (state, action: PayloadAction<Goal>) => {
      const index = state.goals.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    removeGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    selectGoal: (state, action: PayloadAction<string | null>) => {
      state.selectedGoalId = action.payload;
    },
  },
});

export const { setGoals, addGoal, updateGoal, removeGoal, selectGoal } =
  goalSlice.actions;

export default goalSlice.reducer;
