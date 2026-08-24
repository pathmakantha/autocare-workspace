import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { toggleSetting } from '@/redux/slices/settingsSlice';
import { clearVehicles } from '@/redux/slices/vehicleSlice';
import { clearRecords } from '@/redux/slices/maintenanceSlice';
import CustomButton from '@/components/CustomButton';
import { colors, roundness, shadows, spacing } from '@/utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const settings = useAppSelector((s) => s.settings);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    dispatch(logout());
    dispatch(clearVehicles());
    dispatch(clearRecords());
  };

  const toggles: { key: keyof typeof settings; label: string }[] = [
    { key: 'thirtyDays', label: '30 Days Before Expiry' },
    { key: 'fourteenDays', label: '14 Days Before Expiry' },
    { key: 'sevenDays', label: '7 Days Before Expiry' },
    { key: 'oneDay', label: '1 Day Before Expiry' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.profileName}>{user?.name || (isGuest ? 'Guest' : 'User')}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Not signed in'}</Text>

          {confirmingLogout ? (
            <View style={styles.logoutRow}>
              <CustomButton label="Cancel" onPress={() => setConfirmingLogout(false)} variant="muted" style={{ flex: 1 }} />
              <CustomButton label="Confirm" onPress={handleLogout} variant="danger" style={{ flex: 1 }} />
            </View>
          ) : (
            <CustomButton label="Log Out" onPress={() => setConfirmingLogout(true)} variant="muted" />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notification Timings</Text>
        <View style={styles.togglesCard}>
          {toggles.map((t, idx) => (
            <View key={t.key} style={[styles.toggleRow, idx < toggles.length - 1 && styles.toggleRowBorder]}>
              <Text style={styles.toggleLabel}>{t.label}</Text>
              <Switch
                value={settings[t.key] as boolean}
                onValueChange={() => {
                  dispatch(toggleSetting(t.key));
                }}
                trackColor={{ true: colors.primary, false: colors.outline }}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>System</Text>
        <View style={styles.togglesCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => {
                dispatch(toggleSetting('pushEnabled'));
              }}
              trackColor={{ true: colors.primary, false: colors.outline }}
            />
          </View>
        </View>
      </View>

      <Text style={styles.version}>AutoCare Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, color: colors.primary, padding: spacing.lg, paddingTop: 60 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.outline, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: roundness.xl, borderWidth: 1, borderColor: colors.surfaceLow, ...shadows.soft },
  profileName: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, color: colors.text, marginBottom: 4 },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline, marginBottom: spacing.md },
  logoutRow: { flexDirection: 'row', gap: spacing.md },
  togglesCard: { backgroundColor: colors.surface, borderRadius: roundness.xl, borderWidth: 1, borderColor: colors.surfaceLow, paddingHorizontal: spacing.lg, ...shadows.soft },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surfaceLow },
  toggleLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.text },
  version: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline, textAlign: 'center', padding: 40 },
});
