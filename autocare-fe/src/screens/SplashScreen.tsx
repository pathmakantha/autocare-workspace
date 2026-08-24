import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/redux/hooks';
import { continueAsGuest, loginSuccess, setScreen } from '@/redux/slices/authSlice';
import { hydrateSettings } from '@/redux/slices/settingsSlice';
import { setVehicles, fetchVehicles } from '@/redux/slices/vehicleSlice';
import { setRecords } from '@/redux/slices/maintenanceSlice';
import apiClient from '@/api/client';
import { GUEST_DATA_STORAGE_KEY, SETTINGS_STORAGE_KEY } from '@/redux/store';
import { colors } from '@/utils/theme';

export default function SplashScreen() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const settingsRaw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (settingsRaw) dispatch(hydrateSettings(JSON.parse(settingsRaw)));
      } catch {
        // corrupt/missing settings cache — fall back to defaults
      }

      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/me');
          if (cancelled) return;
          dispatch(loginSuccess({ user: data.user, token }));
          dispatch(fetchVehicles());
          return;
        } catch {
          // token expired/invalid — clear it and fall through to guest/auth
          await AsyncStorage.removeItem('authToken');
        }
      }

      try {
        const guestRaw = await AsyncStorage.getItem(GUEST_DATA_STORAGE_KEY);
        if (guestRaw) {
          const { vehicles, records } = JSON.parse(guestRaw);
          if (cancelled) return;
          dispatch(continueAsGuest());
          dispatch(setVehicles(vehicles || []));
          dispatch(setRecords(records || []));
          return;
        }
      } catch {
        // corrupt/missing guest cache — fall back to auth screen
      }

      if (!cancelled) dispatch(setScreen('auth'));
    }

    const minDelay = new Promise((resolve) => setTimeout(resolve, 900));
    Promise.all([restore(), minDelay]).catch(() => {
      if (!cancelled) dispatch(setScreen('auth'));
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>AC</Text>
      </View>
      <Text style={styles.title}>AutoCare</Text>
      <Text style={styles.subtitle}>Precision Vehicle Concierge</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>SECURE • RELIABLE • AUTOMATED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 48, color: colors.primary },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 36,
    color: colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    marginTop: 8,
    letterSpacing: 1,
  },
  footer: { position: 'absolute', bottom: 50 },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.white,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
