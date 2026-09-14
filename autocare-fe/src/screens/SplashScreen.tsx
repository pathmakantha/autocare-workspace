import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/redux/hooks';
import { continueAsGuest, loginSuccess, setScreen, updateProfileLocal } from '@/redux/slices/authSlice';
import { hydrateSettings } from '@/redux/slices/settingsSlice';
import { setVehicles, fetchVehicles } from '@/redux/slices/vehicleSlice';
import { setRecords } from '@/redux/slices/maintenanceSlice';
import { setDocuments } from '@/redux/slices/documentsSlice';
import { setFuelLogs } from '@/redux/slices/fuelSlice';
import apiClient from '@/api/client';
import { FUEL_STORAGE_KEY, GUEST_DATA_STORAGE_KEY, SETTINGS_STORAGE_KEY } from '@/redux/store';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

export default function SplashScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const settingsRaw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (settingsRaw) dispatch(hydrateSettings(JSON.parse(settingsRaw)));
      } catch {
        // corrupt/missing settings cache — fall back to defaults
      }

      try {
        const fuelRaw = await AsyncStorage.getItem(FUEL_STORAGE_KEY);
        if (fuelRaw) dispatch(setFuelLogs(JSON.parse(fuelRaw)));
      } catch {
        // corrupt/missing fuel cache — fall back to empty
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
          const { vehicles, records, documents, profile } = JSON.parse(guestRaw);
          if (cancelled) return;
          dispatch(continueAsGuest());
          if (profile) dispatch(updateProfileLocal(profile));
          dispatch(setVehicles(vehicles || []));
          dispatch(setRecords(records || []));
          dispatch(setDocuments(documents || []));
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
    <View style={[styles.container, { backgroundColor: colors.brandDeep }]}>
      <View style={[styles.logoCircle, { backgroundColor: colors.white }]}>
        <Text style={[styles.logoText, { color: colors.primary }]}>AC</Text>
      </View>
      <Text style={styles.title}>AutoCare</Text>
      <Text style={styles.subtitle}>{t.tagline}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t.secure}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(24),
  },
  logoText: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(48) },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: RFValue(36),
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(14),
    color: '#ffffff',
    opacity: 0.7,
    marginTop: moderateScale(8),
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: moderateScale(32),
  },
  footer: { position: 'absolute', bottom: moderateScale(50) },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(11),
    color: '#ffffff',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
