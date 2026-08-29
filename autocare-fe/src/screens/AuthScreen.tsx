import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { continueAsGuest, loginSuccess, updateProfileLocal } from '@/redux/slices/authSlice';
import { setLanguage } from '@/redux/slices/settingsSlice';
import { fetchVehicles, setVehicles } from '@/redux/slices/vehicleSlice';
import { setRecords } from '@/redux/slices/maintenanceSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { LANG_LABELS, LANG_ORDER } from '@/i18n/translations';
import apiClient from '@/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GUEST_DATA_STORAGE_KEY } from '@/redux/store';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const language = useAppSelector((s) => s.settings.language);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const completeAuth = async (endpoint: string, payload: object) => {
    const { data } = await apiClient.post(endpoint, payload);
    await AsyncStorage.setItem('authToken', data.token);
    dispatch(loginSuccess({ user: data.user, token: data.token }));
    dispatch(fetchVehicles());
  };

  const { isReady: googleReady, isPlatformConfigured, promptGoogleSignIn } = useGoogleAuth({
    onIdToken: async (idToken) => {
      setError('');
      setGoogleLoading(true);
      try {
        await completeAuth('/auth/google', { idToken });
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (message) => setError(message),
  });

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setError(t.fillFields);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      await completeAuth(endpoint, payload);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    dispatch(continueAsGuest());
    try {
      const guestRaw = await AsyncStorage.getItem(GUEST_DATA_STORAGE_KEY);
      if (guestRaw) {
        const { vehicles, records, profile } = JSON.parse(guestRaw);
        if (profile) dispatch(updateProfileLocal(profile));
        dispatch(setVehicles(vehicles || []));
        dispatch(setRecords(records || []));
      }
    } catch {
      // no previously saved guest data — start fresh
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDeep }]} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>AutoCare</Text>
        <Text style={styles.brandSub}>{t.tagline.toUpperCase()}</Text>
      </View>

      <View style={styles.langRow}>
        {LANG_ORDER.map((code) => {
          const active = language === code;
          return (
            <Pressable
              key={code}
              onPress={() => dispatch(setLanguage(code))}
              style={[
                styles.langChip,
                { backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0.08)' },
              ]}
            >
              <Text style={[styles.langChipText, { color: active ? '#000666' : '#ffffff' }]}>
                {LANG_LABELS[code]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{isLogin ? t.welcomeBack : t.createAccount}</Text>

        {!isLogin && (
          <CustomInput label={t.fullName} placeholder={t.enterName} value={name} onChangeText={setName} />
        )}
        <CustomInput
          label={t.email}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <CustomInput
          label={t.password}
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <CustomButton
          label={isLogin ? t.login : t.signUp}
          onPress={handleAuth}
          loading={loading}
          style={{ marginTop: spacing.xs }}
        />

        <Text style={[styles.divider, { color: colors.text }]}>{t.or}</Text>

        <CustomButton
          label="Continue with Google"
          onPress={promptGoogleSignIn}
          loading={googleLoading}
          disabled={!googleReady}
          variant="muted"
        />
        {!isPlatformConfigured && (
          <Text style={[styles.googleNote, { color: colors.text }]}>
            Google sign-in isn't set up for this platform yet.{'\n'}Try the web build for now.
          </Text>
        )}

        <Text style={[styles.switchText, { color: colors.primary }]} onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? t.noAccount : t.haveAccount}
        </Text>
      </View>

      <View style={styles.guestBlock}>
        <Text style={styles.or}>{t.or}</Text>
        <CustomButton label={t.continueGuest} onPress={handleGuest} variant="outline" />
        <Text style={styles.guestNote}>
          {t.guestNote}
          {'\n'}
          {t.guestNote2}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: 40 },
  brandBlock: { alignItems: 'center', marginBottom: spacing.lg },
  brand: { fontFamily: 'Manrope_800ExtraBold', fontSize: 40, color: '#ffffff', marginBottom: 4 },
  brandSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: spacing.lg },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  langChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  card: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
  },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginBottom: spacing.sm },
  divider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  googleNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  switchText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  guestBlock: { alignItems: 'center', marginTop: spacing.xl, paddingBottom: 40 },
  or: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#ffffff', opacity: 0.6, marginBottom: spacing.md },
  guestNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
