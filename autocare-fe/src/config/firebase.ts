import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// Metro resolves this to Firebase's React Native build (which has this export) via the
// package's "react-native" exports condition, but tsc always sees the generic web typings.
// @ts-expect-error - getReactNativePersistence exists at runtime, missing from tsc's resolved types
import { getReactNativePersistence } from 'firebase/auth';

// Get these values from Firebase Console > Project Settings > General > Your apps (Web app).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const alreadyInitialized = getApps().length > 0;
const app = alreadyInitialized ? getApps()[0] : initializeApp(firebaseConfig);

// initializeAuth throws if called more than once on the same app (e.g. Fast Refresh),
// so fall back to the existing auth instance in that case.
export const firebaseAuth = alreadyInitialized
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export default app;
