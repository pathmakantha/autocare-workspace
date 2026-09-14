import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import apiClient from '@/api/client';
import { useAppDispatch } from '@/redux/hooks';
import { loginSuccess } from '@/redux/slices/authSlice';
import { fetchVehicles } from '@/redux/slices/vehicleSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type R = RouteProp<RootStackParamList, 'ResetPassword'>;

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const { resetToken } = route.params;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
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
      const { data } = await apiClient.post('/auth/reset-password', { resetToken, password });
      // The API hands back a fresh session, so a successful reset logs them straight in.
      await AsyncStorage.setItem('authToken', data.token);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      dispatch(fetchVehicles());
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
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.newPasswordT}</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>{t.newPasswordDesc}</Text>

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

          <CustomButton label={t.updatePassword} onPress={handleReset} loading={loading} disabled={loading} />

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
