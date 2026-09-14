import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import documentsReducer from './slices/documentsSlice';
import settingsReducer from './slices/settingsSlice';
import fuelReducer from './slices/fuelSlice';

export const SETTINGS_STORAGE_KEY = 'autocare:settings';
export const GUEST_DATA_STORAGE_KEY = 'autocare:guestData';
export const FUEL_STORAGE_KEY = 'autocare:fuelLogs';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    maintenance: maintenanceReducer,
    documents: documentsReducer,
    settings: settingsReducer,
    fuel: fuelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Guest-mode data has no backend account to live in, so persist it (and notification
// settings, which have no backend model at all) to AsyncStorage on every relevant change.
let lastSettingsSnapshot: string | null = null;
let lastGuestSnapshot: string | null = null;
let lastFuelSnapshot: string | null = null;

store.subscribe(() => {
  const state = store.getState();

  const settingsSnapshot = JSON.stringify(state.settings);
  if (settingsSnapshot !== lastSettingsSnapshot) {
    lastSettingsSnapshot = settingsSnapshot;
    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, settingsSnapshot).catch(() => {});
  }

  // Fuel logs have no backend model, so persist them locally for guests and signed-in
  // users alike (unlike guestSnapshot below, which is guest-only).
  const fuelSnapshot = JSON.stringify(state.fuel.logs);
  if (fuelSnapshot !== lastFuelSnapshot) {
    lastFuelSnapshot = fuelSnapshot;
    AsyncStorage.setItem(FUEL_STORAGE_KEY, fuelSnapshot).catch(() => {});
  }

  if (state.auth.isGuest) {
    // Guest documents carry their image as base64 (see documentsSlice), so this snapshot
    // can get large with a few scanned documents. AsyncStorage has a per-item size ceiling
    // (a few MB) — fine for guest mode's 1-vehicle cap today, but compress images before
    // storing if that ever becomes a real limit.
    const guestSnapshot = JSON.stringify({
      vehicles: state.vehicles.vehicles,
      records: state.maintenance.records,
      documents: state.documents.documents,
      profile: state.auth.user,
    });
    if (guestSnapshot !== lastGuestSnapshot) {
      lastGuestSnapshot = guestSnapshot;
      AsyncStorage.setItem(GUEST_DATA_STORAGE_KEY, guestSnapshot).catch(() => {});
    }
  }
});
