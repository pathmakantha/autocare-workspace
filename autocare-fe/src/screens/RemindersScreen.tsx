import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { daysLeftLabel, getExpiringItems, reminderUrgency } from '@/utils/vehicleStatus';
import { colors, roundness, shadows, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Reminders'>;

export default function RemindersScreen() {
  const navigation = useNavigation<Nav>();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const items = useMemo(() => getExpiringItems(vehicles), [vehicles]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.headerTitle}>Upcoming Reminders</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        License, insurance, emission &amp; service dates due within 30 days.
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item, idx) => `${item.vehicleId}-${item.field}-${idx}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nothing expiring in the next 30 days.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const urgency = reminderUrgency(item.daysLeft);
          return (
            <Pressable style={styles.row} onPress={() => navigation.navigate('Main')}>
              <View style={styles.rowTop}>
                <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                <View style={[styles.pill, { backgroundColor: urgency.bg }]}>
                  <Text style={[styles.pillText, { color: urgency.color }]}>{daysLeftLabel(item.daysLeft)}</Text>
                </View>
              </View>
              <View style={styles.rowBottom}>
                <Text style={styles.fieldLabel}>{item.label}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  back: { fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.primary },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: colors.text },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.outline, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  row: { backgroundColor: colors.surface, paddingVertical: 20, paddingHorizontal: spacing.lg, borderRadius: 20, marginBottom: 12, ...shadows.soft },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  vehicleName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.text },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: roundness.xl },
  pillText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.secondary },
  date: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline },
  emptyState: { padding: 80, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline },
});
