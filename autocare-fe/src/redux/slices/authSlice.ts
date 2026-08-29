import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/client';
import { User } from '@/types/user';

export type AppScreen = 'splash' | 'auth' | 'main';

interface AuthState {
  screen: AppScreen;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  screen: 'splash',
  isAuthenticated: false,
  isGuest: false,
  user: null,
  token: null,
};

export type ProfilePayload = { name: string; email: string; phone?: string };

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload: ProfilePayload) => {
  const { data } = await apiClient.patch<{ user: User }>('/auth/me', payload);
  return data.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setScreen(state, action: PayloadAction<AppScreen>) {
      state.screen = action.payload;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.isGuest = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.screen = 'main';
    },
    continueAsGuest(state) {
      state.isGuest = true;
      state.screen = 'main';
      if (!state.user) state.user = { id: 'guest', name: '', email: '', phone: '' };
    },
    // Guest mode has no backend account — profile edits (and restoring a saved
    // guest profile from AsyncStorage) update local state directly.
    updateProfileLocal(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.isGuest = false;
      state.user = null;
      state.token = null;
      state.screen = 'auth';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { setScreen, loginSuccess, continueAsGuest, updateProfileLocal, logout } = authSlice.actions;
export default authSlice.reducer;
