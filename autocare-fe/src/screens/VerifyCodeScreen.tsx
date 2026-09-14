import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import apiClient from '@/api/client';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VerifyCode'>;
type R = RouteProp<RootStackParamList, 'VerifyCode'>;

// Matches the backend's resend throttle, so the button isn't offered while the API
// would silently ignore the request anyway.
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyCodeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t.enterSixDigits);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/verify-reset-code', { email, code });
      navigation.navigate('ResetPassword', { email, resetToken: data.resetToken });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch {
      // Same generic behaviour as the first request — nothing useful to surface.
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDeep }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>AutoCare</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.verifyCodeT}</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>
            {t.verifyCodeDesc}
            {'\n'}
            <Text style={[styles.emailEmphasis, { color: colors.text }]}>{email}</Text>
          </Text>

          <CustomInput
            label={t.codeLabel}
            placeholder="000000"
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.codeInput}
          />

          {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

          <CustomButton label={t.verifyBtn} onPress={handleVerify} loading={loading} disabled={loading} />

          {cooldown > 0 ? (
            <Text style={[styles.resendMuted, { color: colors.outline }]}>
              {t.resendIn} {cooldown}s
            </Text>
          ) : (
            <Text style={[styles.resendLink, { color: colors.primary }]} onPress={handleResend}>
              {t.resendCode}
            </Text>
          )}

          <Text
            style={[styles.backLink, { color: colors.outline }]}
            onPress={() => navigation.navigate('Auth')}
          >
            {t.backToLogin}
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
    marginBottom: spacing.lg,
  },
  emailEmphasis: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  codeInput: {
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: RFValue(26),
    letterSpacing: moderateScale(8),
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(11),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resendLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resendMuted: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: spacing.md,
  },
  backLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
