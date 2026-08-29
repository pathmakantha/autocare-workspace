import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { PermissionKey, togglePermission } from '@/redux/slices/settingsSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

export default function PermissionsScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
  const permissions = useAppSelector((s) => s.settings.permissions);

  const rows: { key: PermissionKey; label: string; desc: string }[] = [
    { key: 'notifications', label: t.permNotif, desc: t.permNotifDesc },
    { key: 'location', label: t.permLocation, desc: t.permLocationDesc },
    { key: 'camera', label: t.permCamera, desc: t.permCameraDesc },
    { key: 'storage', label: t.permStorage, desc: t.permStorageDesc },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.appPermissions}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.note, { color: colors.outline }]}>{t.permNote}</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {rows.map((row, i) => {
            const on = permissions[row.key];
            return (
              <View
                key={row.key}
                style={[styles.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.label, { color: colors.text }]}>{row.label}</Text>
                  <Text style={[styles.desc, { color: colors.outline }]}>{row.desc}</Text>
                  <Text style={[styles.state, { color: on ? colors.success : colors.outline }]}>
                    {on ? t.allowed : t.denied}
                  </Text>
                </View>
                <Pressable
                  onPress={() => dispatch(togglePermission(row.key))}
                  style={[styles.toggle, { backgroundColor: on ? colors.primary : colors.surfaceLow }]}
                >
                  <View style={[styles.knob, { left: on ? 20 : 2 }]} />
                </Pressable>
              </View>
            );
          })}
        </View>
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
  note: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginBottom: spacing.lg },
  card: { borderRadius: roundness.xl, borderWidth: 1, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, gap: 12 },
  rowText: { flex: 1, minWidth: 0 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  state: { fontFamily: 'Inter_700Bold', fontSize: 10, marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  toggle: { width: 44, height: 26, borderRadius: 13, flexShrink: 0 },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});
