import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateProfile, updateProfileLocal } from '@/redux/slices/authSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

function initialsFor(name: string) {
  return (name || 'G')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t.fillRequired);
      return;
    }
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      if (isGuest) {
        dispatch(updateProfileLocal({ id: user?.id || 'guest', name, email, phone }));
      } else {
        await dispatch(updateProfile({ name, email, phone })).unwrap();
      }
      setSaved(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.editProfile}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
            <Text style={styles.avatarText}>{initialsFor(name)}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <CustomInput label={t.name} placeholder={t.enterName} value={name} onChangeText={setName} />
          <CustomInput
            label={t.email}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <CustomInput label={t.phone} placeholder="+94 77 123 4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        {saved && <Text style={[styles.saved, { color: colors.success }]}>{t.savedMsg}</Text>}
        {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <CustomButton label={t.saveChanges} onPress={handleSave} loading={saving} disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  back: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 20 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 32, color: '#ffffff' },
  card: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  saved: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', marginBottom: spacing.md },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginBottom: spacing.md },
});
