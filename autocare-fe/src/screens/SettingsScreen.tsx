import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { setLanguage, toggleSetting } from '@/redux/slices/settingsSlice';
import { clearVehicles } from '@/redux/slices/vehicleSlice';
import { clearRecords } from '@/redux/slices/maintenanceSlice';
import CustomButton from '@/components/CustomButton';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { LANG_LABELS, LANG_ORDER } from '@/i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PLAN_NAME_KEY = { free: 'planFree', pro: 'planPro', fleet: 'planFleet' } as const;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const settings = useAppSelector((s) => s.settings);
  const language = useAppSelector((s) => s.settings.language);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    dispatch(logout());
    dispatch(clearVehicles());
    dispatch(clearRecords());
  };

  const displayName = user?.name || (isGuest ? t.guestUser : 'User');
  const initials = (user?.name || 'G')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const grantedCount = Object.values(settings.permissions).filter(Boolean).length;
  const currentPlanName = t[PLAN_NAME_KEY[settings.plan]];

  const reminderToggles: { key: 'thirtyDays' | 'fourteenDays' | 'sevenDays' | 'oneDay'; label: string }[] = [
    { key: 'thirtyDays', label: t.days30 },
    { key: 'fourteenDays', label: t.days14 },
    { key: 'sevenDays', label: t.days7 },
    { key: 'oneDay', label: t.day1 },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.primary }]}>{t.settings}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.profile}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.profileEmail, { color: colors.outline }]}>{user?.email || 'Not signed in'}</Text>
            </View>
          </View>

          {confirmingLogout ? (
            <View style={styles.logoutRow}>
              <CustomButton label={t.cancel} onPress={() => setConfirmingLogout(false)} variant="muted" style={{ flex: 1 }} />
              <CustomButton label={t.confirm} onPress={handleLogout} variant="danger" style={{ flex: 1 }} />
            </View>
          ) : (
            <CustomButton label={t.logout} onPress={() => setConfirmingLogout(true)} variant="muted" />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.account}</Text>
        <View style={[styles.togglesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={[styles.navRow, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.navRowLabel, { color: colors.text }]}>{t.editProfile}</Text>
            <Text style={[styles.navRowChevron, { color: colors.outline }]}>›</Text>
          </Pressable>
          <Pressable
            style={[styles.navRow, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('Permissions')}
          >
            <Text style={[styles.navRowLabel, { color: colors.text }]}>{t.appPermissions}</Text>
            <View style={styles.navRowRight}>
              <Text style={[styles.navRowMeta, { color: colors.outline }]}>
                {grantedCount} {t.ofFour}
              </Text>
              <Text style={[styles.navRowChevron, { color: colors.outline }]}>›</Text>
            </View>
          </Pressable>
          <Pressable style={styles.navRowLast} onPress={() => navigation.navigate('Subscription')}>
            <Text style={[styles.navRowLabel, { color: colors.text }]}>{t.subscription}</Text>
            <View style={styles.navRowRight}>
              <View style={[styles.planBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.planBadgeText, { color: colors.primary }]}>{currentPlanName.toUpperCase()}</Text>
              </View>
              <Text style={[styles.navRowChevron, { color: colors.outline }]}>›</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.language}</Text>
        <View style={[styles.langCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {LANG_ORDER.map((code) => {
            const active = language === code;
            return (
              <Pressable
                key={code}
                onPress={() => dispatch(setLanguage(code))}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: active ? colors.primary : 'transparent',
                    borderColor: active ? colors.primary : colors.outline,
                  },
                ]}
              >
                <Text style={[styles.langChipText, { color: active ? colors.onBrand : colors.outline }]}>
                  {LANG_LABELS[code]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.appearance}</Text>
        <View style={[styles.togglesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>{t.darkMode}</Text>
              <Text style={[styles.toggleDesc, { color: colors.outline }]}>{t.darkModeDesc}</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => { dispatch(toggleSetting('darkMode')); }}
              trackColor={{ true: colors.primary, false: colors.outline }}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.notificationTimings}</Text>
        <View style={[styles.togglesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {reminderToggles.map((row, idx) => (
            <View
              key={row.key}
              style={[styles.toggleRow, idx < reminderToggles.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Text style={[styles.toggleLabel, { color: colors.text }]}>{row.label}</Text>
              <Switch
                value={settings[row.key]}
                onValueChange={() => { dispatch(toggleSetting(row.key)); }}
                trackColor={{ true: colors.primary, false: colors.outline }}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.outline }]}>{t.system}</Text>
        <View style={[styles.togglesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t.pushNotifications}</Text>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => { dispatch(toggleSetting('pushEnabled')); }}
              trackColor={{ true: colors.primary, false: colors.outline }}
            />
          </View>
        </View>
      </View>

      <Text style={[styles.version, { color: colors.outline }]}>AutoCare 1.0.0</Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 40 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, padding: spacing.lg },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: spacing.md },
  card: { padding: spacing.lg, borderRadius: roundness.xl, borderWidth: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 22, color: '#ffffff' },
  profileTextWrap: { minWidth: 0, flex: 1 },
  profileName: { fontFamily: 'Manrope_600SemiBold', fontSize: 22 },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  logoutRow: { flexDirection: 'row', gap: spacing.md },
  togglesCard: { borderRadius: roundness.xl, borderWidth: 1, paddingHorizontal: spacing.lg },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, gap: 10 },
  navRowLast: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, gap: 10 },
  navRowLabel: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  navRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navRowMeta: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  navRowChevron: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  planBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 20 },
  planBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  langCard: { borderRadius: roundness.xl, borderWidth: 1, padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  langChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, gap: 10 },
  toggleTextWrap: { flex: 1, minWidth: 0 },
  toggleLabel: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  toggleDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  version: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', padding: 40 },
});
