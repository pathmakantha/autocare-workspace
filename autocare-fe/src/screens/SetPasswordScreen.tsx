import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import apiClient from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout, passwordSetComplete } from '@/redux/slices/authSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

const MIN_PASSWORD_LENGTH = 6;

/**
 * Shown once, and only once, to accounts created through Google sign-in: they have no
 * password yet, and the app gates entry until they choose one. Afterwards they can sign
 * in with either Google or email + password.
 */
export default function SetPasswordScreen() {
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const email = useAppSelector((s) => s.auth.user?.email);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordsDontMatch);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/set-password', { password });
      dispatch(passwordSetComplete(data.user));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // The step is mandatory, but never a trap — signing out is always available.
  const handleSignOut = async () => {
    await AsyncStorage.removeItem('authToken');
    dispatch(logout());
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDeep }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>AutoCare</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.setPasswordT}</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>{t.setPasswordDesc}</Text>

          {!!email && (
            <View style={[styles.emailPill, { backgroundColor: colors.surfaceLow }]}>
              <Text style={[styles.emailPillText, { color: colors.text }]} numberOfLines={1}>
                {email}
              </Text>
            </View>
          )}

          <CustomInput
            label={t.newPassword}
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <CustomInput
            label={t.confirmPassword}
            placeholder="********"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
          />

          {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

          <CustomButton label={t.createPassword} onPress={handleSave} loading={loading} disabled={loading} />

          <Text style={[styles.signOutLink, { color: colors.outline }]} onPress={handleSignOut}>
            {t.logout}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(32), color: '#ffffff' },
  card: { padding: spacing.lg, borderRadius: roundness.xl, borderWidth: 1 },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: RFValue(22),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emailPill: {
    alignSelf: 'center',
    borderRadius: moderateScale(20),
    paddingVertical: moderateScale(8),
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    maxWidth: '100%',
  },
  emailPillText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(11),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  signOutLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
