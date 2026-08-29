import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lang } from '@/i18n/translations';

export type PermissionKey = 'notifications' | 'location' | 'camera' | 'storage';
export type Plan = 'free' | 'pro' | 'fleet';
type BooleanSettingKey = 'thirtyDays' | 'fourteenDays' | 'sevenDays' | 'oneDay' | 'pushEnabled' | 'darkMode';

interface SettingsState {
  thirtyDays: boolean;
  fourteenDays: boolean;
  sevenDays: boolean;
  oneDay: boolean;
  pushEnabled: boolean;
  darkMode: boolean;
  language: Lang;
  permissions: Record<PermissionKey, boolean>;
  plan: Plan;
}

const initialState: SettingsState = {
  thirtyDays: true,
  fourteenDays: true,
  sevenDays: true,
  oneDay: true,
  pushEnabled: true,
  darkMode: false,
  language: 'en',
  permissions: { notifications: true, location: true, camera: false, storage: true },
  plan: 'free',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSetting(state, action: PayloadAction<BooleanSettingKey>) {
      state[action.payload] = !state[action.payload];
    },
    setLanguage(state, action: PayloadAction<Lang>) {
      state.language = action.payload;
    },
    togglePermission(state, action: PayloadAction<PermissionKey>) {
      state.permissions[action.payload] = !state.permissions[action.payload];
    },
    setPlan(state, action: PayloadAction<Plan>) {
      state.plan = action.payload;
    },
    hydrateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      return { ...initialState, ...action.payload };
    },
  },
});

export const { toggleSetting, setLanguage, togglePermission, setPlan, hydrateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
