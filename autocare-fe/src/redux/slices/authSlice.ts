import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    },
    logout(state) {
      state.isAuthenticated = false;
      state.isGuest = false;
      state.user = null;
      state.token = null;
      state.screen = 'auth';
    },
  },
});

export const { setScreen, loginSuccess, continueAsGuest, logout } = authSlice.actions;
export default authSlice.reducer;
