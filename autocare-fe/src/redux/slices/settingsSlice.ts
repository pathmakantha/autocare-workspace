import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  thirtyDays: boolean;
  fourteenDays: boolean;
  sevenDays: boolean;
  oneDay: boolean;
  pushEnabled: boolean;
}

const initialState: SettingsState = {
  thirtyDays: true,
  fourteenDays: true,
  sevenDays: true,
  oneDay: true,
  pushEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSetting(state, action: PayloadAction<keyof SettingsState>) {
      state[action.payload] = !state[action.payload];
    },
    hydrateSettings(state, action: PayloadAction<SettingsState>) {
      return action.payload;
    },
  },
});

export const { toggleSetting, hydrateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
