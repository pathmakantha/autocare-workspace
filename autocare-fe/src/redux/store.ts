import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import settingsReducer from './slices/settingsSlice';

export const SETTINGS_STORAGE_KEY = 'autocare:settings';
export const GUEST_DATA_STORAGE_KEY = 'autocare:guestData';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    maintenance: maintenanceReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Guest-mode data has no backend account to live in, so persist it (and notification
// settings, which have no backend model at all) to AsyncStorage on every relevant change.
let lastSettingsSnapshot: string | null = null;
let lastGuestSnapshot: string | null = null;

store.subscribe(() => {
  const state = store.getState();

  const settingsSnapshot = JSON.stringify(state.settings);
  if (settingsSnapshot !== lastSettingsSnapshot) {
    lastSettingsSnapshot = settingsSnapshot;
    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, settingsSnapshot).catch(() => {});
  }

  if (state.auth.isGuest) {
    const guestSnapshot = JSON.stringify({
      vehicles: state.vehicles.vehicles,
      records: state.maintenance.records,
      profile: state.auth.user,
    });
    if (guestSnapshot !== lastGuestSnapshot) {
      lastGuestSnapshot = guestSnapshot;
      AsyncStorage.setItem(GUEST_DATA_STORAGE_KEY, guestSnapshot).catch(() => {});
    }
  }
});
