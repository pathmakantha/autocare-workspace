import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { daysLeftLabel, getExpiringItems, reminderUrgency } from '@/utils/vehicleStatus';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Reminders'>;

export default function RemindersScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const items = useMemo(() => getExpiringItems(vehicles, t), [vehicles, t]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.upcomingReminders}</Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      <Text style={[styles.subtitle, { color: colors.outline }]}>{t.remindersNote}</Text>

      <FlatList
        data={items}
        keyExtractor={(item, idx) => `${item.vehicleId}-${item.field}-${idx}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.outline }]}>{t.nothingExpiring}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const urgency = reminderUrgency(item.daysLeft, colors);
          return (
            <Pressable
              style={[styles.row, { backgroundColor: colors.surface }, shadows.soft]}
              onPress={() => navigation.navigate('Main')}
            >
              <View style={styles.rowTop}>
                <Text style={[styles.vehicleName, { color: colors.text }]}>{item.vehicleName}</Text>
                <View style={[styles.pill, { backgroundColor: urgency.bg }]}>
                  <Text style={[styles.pillText, { color: urgency.color }]}>{daysLeftLabel(item.daysLeft, t)}</Text>
                </View>
              </View>
              <View style={styles.rowBottom}>
                <Text style={[styles.fieldLabel, { color: colors.secondary }]}>{item.label}</Text>
                <Text style={[styles.date, { color: colors.outline }]}>{item.date}</Text>
              </View>
            </Pressable>
          );
        }}
      />
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
  back: { fontFamily: 'Inter_500Medium', fontSize: RFValue(16) },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(20) },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  row: { paddingVertical: moderateScale(20), paddingHorizontal: spacing.lg, borderRadius: moderateScale(20), marginBottom: moderateScale(12) },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  vehicleName: { fontFamily: 'Inter_700Bold', fontSize: RFValue(14) },
  pill: { paddingVertical: moderateScale(4), paddingHorizontal: moderateScale(10), borderRadius: roundness.xl },
  pillText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(11) },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(14) },
  date: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11) },
  emptyState: { padding: moderateScale(80), alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(14) },
});
