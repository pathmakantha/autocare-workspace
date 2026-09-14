import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

type Nav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, shadows } = useTheme();
  const t = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t.fillFields);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: trimmed });
      // The API deliberately answers the same way whether or not the address is
      // registered, so we always move on to the code screen.
      navigation.navigate('VerifyCode', { email: trimmed });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDeep }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>AutoCare</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.forgotPasswordT}</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>{t.forgotPasswordDesc}</Text>

          <CustomInput
            label={t.email}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

          <CustomButton label={t.sendCode} onPress={handleSend} loading={loading} disabled={loading} />

          <Text style={[styles.backLink, { color: colors.primary }]} onPress={() => navigation.goBack()}>
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
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(11),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  backLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
