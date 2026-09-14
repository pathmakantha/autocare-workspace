import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lang } from '@/i18n/translations';

export type PermissionKey = 'notifications' | 'location' | 'camera' | 'storage';
export type Plan = 'free' | 'pro' | 'fleet';
export type DistanceUnit = 'km' | 'mi';
export type Currency = 'LKR' | 'INR' | 'RUB' | 'USD' | 'EUR';
export type Region = 'LK' | 'IN' | 'RU' | 'OTHER';
type BooleanSettingKey = 'thirtyDays' | 'fourteenDays' | 'sevenDays' | 'oneDay' | 'pushEnabled' | 'darkMode' | 'privacyMode';

interface SettingsState {
  thirtyDays: boolean;
  fourteenDays: boolean;
  sevenDays: boolean;
  oneDay: boolean;
  pushEnabled: boolean;
  darkMode: boolean;
  privacyMode: boolean;
  language: Lang;
  permissions: Record<PermissionKey, boolean>;
  plan: Plan;
  distanceUnit: DistanceUnit;
  currency: Currency;
  region: Region;
  /** False until the country picker has been answered — it gates app entry. */
  onboarded: boolean;
}

const initialState: SettingsState = {
  thirtyDays: true,
  fourteenDays: true,
  sevenDays: true,
  oneDay: true,
  pushEnabled: true,
  darkMode: false,
  privacyMode: true,
  language: 'en',
  permissions: { notifications: true, location: true, camera: false, storage: true },
  plan: 'free',
  distanceUnit: 'km',
  currency: 'LKR',
  region: 'LK',
  onboarded: false,
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
    setDistanceUnit(state, action: PayloadAction<DistanceUnit>) {
      state.distanceUnit = action.payload;
    },
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload;
    },
    setRegion(state, action: PayloadAction<Region>) {
      state.region = action.payload;
    },
    // Picking a country is one decision with several consequences: it sets the region
    // (which drives emergency numbers and which country-specific features exist) plus
    // the money and distance defaults. `language` is only passed during first-run
    // onboarding — changing country later must not override a language the user chose.
    applyCountry(
      state,
      action: PayloadAction<{
        region: Region;
        currency: Currency;
        distanceUnit: DistanceUnit;
        language?: Lang;
      }>
    ) {
      state.region = action.payload.region;
      state.currency = action.payload.currency;
      state.distanceUnit = action.payload.distanceUnit;
      if (action.payload.language) state.language = action.payload.language;
      state.onboarded = true;
    },
    hydrateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  toggleSetting,
  setLanguage,
  togglePermission,
  setPlan,
  setDistanceUnit,
  setCurrency,
  setRegion,
  applyCountry,
  hydrateSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
