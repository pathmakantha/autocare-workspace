import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch } from '@/redux/hooks';
import { continueAsGuest, loginSuccess } from '@/redux/slices/authSlice';
import { fetchVehicles, setVehicles } from '@/redux/slices/vehicleSlice';
import { setRecords } from '@/redux/slices/maintenanceSlice';
import { colors, roundness, shadows, spacing } from '@/utils/theme';
import apiClient from '@/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GUEST_DATA_STORAGE_KEY } from '@/redux/store';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function AuthScreen() {
  const dispatch = useAppDispatch();
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
      setError('Please fill all fields');
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
        const { vehicles, records } = JSON.parse(guestRaw);
        dispatch(setVehicles(vehicles || []));
        dispatch(setRecords(records || []));
      }
    } catch {
      // no previously saved guest data — start fresh
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.primary }}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>AutoCare</Text>
        <Text style={styles.brandSub}>PRECISION VEHICLE CONCIERGE</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

        {!isLogin && (
          <CustomInput label="Full Name" placeholder="Enter your name" value={name} onChangeText={setName} />
        )}
        <CustomInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <CustomInput
          label="Password"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <CustomButton
          label={isLogin ? 'Log In' : 'Sign Up'}
          onPress={handleAuth}
          loading={loading}
          style={{ marginTop: spacing.xs }}
        />

        <Text style={styles.divider}>OR</Text>

        <CustomButton
          label="Continue with Google"
          onPress={promptGoogleSignIn}
          loading={googleLoading}
          disabled={!googleReady}
          variant="muted"
        />
        {!isPlatformConfigured && (
          <Text style={styles.googleNote}>
            Google sign-in isn't set up for this platform yet.{'\n'}Try the web build for now.
          </Text>
        )}

        <Text style={styles.switchText} onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </Text>
      </View>

      <View style={styles.guestBlock}>
        <Text style={styles.or}>OR</Text>
        <CustomButton label="Continue as Guest" onPress={handleGuest} variant="outline" />
        <Text style={styles.guestNote}>
          Add up to 1 vehicle without an account.{'\n'}Data is stored locally.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 80, paddingHorizontal: spacing.lg, paddingBottom: 40 },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontFamily: 'Manrope_800ExtraBold', fontSize: 40, color: colors.white, marginBottom: 4 },
  brandSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    borderColor: colors.surfaceLow,
    ...shadows.soft,
  },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
  divider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  googleNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  switchText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  guestBlock: { alignItems: 'center', marginTop: spacing.xl, paddingBottom: 40 },
  or: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.white, opacity: 0.6, marginBottom: spacing.md },
  guestNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
