import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import VehicleCard from '@/components/VehicleCard';
import { useAppSelector } from '@/redux/hooks';
import { getExpiringItems, getVehicleStatus } from '@/utils/vehicleStatus';
import { colors, roundness, spacing } from '@/utils/theme';
import { RootStackParamList, MainTabParamList } from '@/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const vehiclesStatus = useAppSelector((s) => s.vehicles.status);
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const expiringItems = useMemo(() => getExpiringItems(vehicles), [vehicles]);
  const dashboardVehicles = vehicles.slice(0, 3);

  const userName = user?.name || (isGuest ? 'Guest' : 'there');
  const nextItem = expiringItems[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.hello}>Hello, {userName}</Text>
        <Text style={styles.subhead}>How is your fleet today?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewRow}>
          <View style={[styles.overviewTile, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.overviewNumberLight}>{vehicles.length}</Text>
            <Text style={styles.overviewLabelLight}>Vehicles</Text>
          </View>
          <Pressable
            style={[styles.overviewTile, { backgroundColor: colors.surfaceLow }]}
            onPress={() => navigation.navigate('Reminders')}
          >
            <Text style={styles.overviewNumberDark}>{expiringItems.length}</Text>
            <Text style={styles.overviewLabelDark}>Expiring Soon</Text>
          </Pressable>
        </View>

        {expiringItems.length > 0 && nextItem && (
          <Pressable style={styles.callout} onPress={() => navigation.navigate('Reminders')}>
            <Text style={styles.calloutText}>
              Next: {nextItem.label} · {nextItem.vehicleName} ·{' '}
              {nextItem.daysLeft === 0 ? 'Today' : `${nextItem.daysLeft}d left`}
            </Text>
            <Text style={styles.calloutLink}>View ›</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Vehicles</Text>
          <Text style={styles.seeAll} onPress={() => navigation.navigate('Vehicles')}>
            See All
          </Text>
        </View>

        {vehiclesStatus === 'loading' && dashboardVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : dashboardVehicles.length > 0 ? (
          dashboardVehicles.map((v) => {
            const st = getVehicleStatus(v);
            return (
              <VehicleCard
                key={v.id}
                name={v.name}
                registrationNumber={v.registrationNumber}
                brandModel={`${v.brand} ${v.model}`}
                status={st.status}
                statusText={st.label}
                statusColor={st.color}
                statusBg={st.bg}
                mileage={v.mileage}
                onPress={() => navigation.navigate('Maintenance', { vehicleId: v.id })}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vehicles added yet.</Text>
            <Text style={styles.emptyAction} onPress={() => navigation.navigate('AddVehicle')}>
              + Add Vehicle
            </Text>
          </View>
        )}
      </View>

      <Pressable style={styles.addNewTile} onPress={() => navigation.navigate('AddVehicle')}>
        <Text style={styles.addNewTitle}>Add New Vehicle</Text>
        <Text style={styles.addNewSub}>Register a new machine to your fleet</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  headerBlock: { marginBottom: spacing.xl },
  hello: { fontFamily: 'Manrope_700Bold', fontSize: 28, color: colors.primary },
  subhead: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline, letterSpacing: 1 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.text, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.primary },
  overviewRow: { flexDirection: 'row', gap: spacing.md },
  overviewTile: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewNumberLight: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: colors.white },
  overviewLabelLight: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.white, opacity: 0.8, marginTop: 4 },
  overviewNumberDark: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: colors.error },
  overviewLabelDark: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.text, opacity: 0.8, marginTop: 4 },
  callout: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: roundness.lg,
    backgroundColor: colors.warning + '10',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.text, flexShrink: 1 },
  calloutLink: { fontFamily: 'Inter_700Bold', fontSize: 11, color: colors.warning },
  emptyState: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: roundness.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderStyle: 'dashed',
  },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline, marginBottom: spacing.sm },
  emptyAction: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.primary },
  addNewTile: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  addNewTitle: { fontFamily: 'Inter_400Regular', fontSize: 18, color: colors.primary, marginBottom: 4 },
  addNewSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline },
});
