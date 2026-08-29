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
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList, MainTabParamList } from '@/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const vehiclesStatus = useAppSelector((s) => s.vehicles.status);
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const expiringItems = useMemo(() => getExpiringItems(vehicles, t), [vehicles, t]);
  const dashboardVehicles = vehicles.slice(0, 3);

  const userName = user?.name || (isGuest ? t.guestUser : 'there');
  const nextItem = expiringItems[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={[styles.hello, { color: colors.primary }]}>
          {t.hello}, {userName}
        </Text>
        <Text style={[styles.subhead, { color: colors.outline }]}>{t.fleetToday}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.overview}</Text>
        <View style={styles.overviewRow}>
          <View style={[styles.overviewTile, { backgroundColor: colors.primaryContainer }]}>
            <Text style={styles.overviewNumberLight}>{vehicles.length}</Text>
            <Text style={styles.overviewLabelLight}>{t.vehicles}</Text>
          </View>
          <Pressable
            style={[styles.overviewTile, { backgroundColor: colors.surfaceLow }]}
            onPress={() => navigation.navigate('Reminders')}
          >
            <Text style={[styles.overviewNumberDark, { color: colors.error }]}>{expiringItems.length}</Text>
            <Text style={[styles.overviewLabelDark, { color: colors.text }]}>{t.expiringSoon}</Text>
          </Pressable>
        </View>

        {expiringItems.length > 0 && nextItem && (
          <Pressable
            style={[styles.callout, { backgroundColor: colors.warningTint }]}
            onPress={() => navigation.navigate('Reminders')}
          >
            <Text style={[styles.calloutText, { color: colors.text }]}>
              {t.next}: {nextItem.label} · {nextItem.vehicleName} ·{' '}
              {nextItem.daysLeft === 0 ? t.today : `${nextItem.daysLeft}${t.dLeft}`}
            </Text>
            <Text style={[styles.calloutLink, { color: colors.warning }]}>{t.view} ›</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.recentVehicles}</Text>
          <Text style={[styles.seeAll, { color: colors.primary }]} onPress={() => navigation.navigate('Vehicles')}>
            {t.seeAll}
          </Text>
        </View>

        {vehiclesStatus === 'loading' && dashboardVehicles.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : dashboardVehicles.length > 0 ? (
          dashboardVehicles.map((v) => {
            const st = getVehicleStatus(v, colors, t);
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
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <Text style={[styles.emptyText, { color: colors.outline }]}>{t.noVehiclesYet}</Text>
            <Text style={[styles.emptyAction, { color: colors.primary }]} onPress={() => navigation.navigate('AddVehicle')}>
              {t.addVehicleShort}
            </Text>
          </View>
        )}
      </View>

      <Pressable style={[styles.addNewTile, { backgroundColor: colors.surfaceLow }]} onPress={() => navigation.navigate('AddVehicle')}>
        <Text style={[styles.addNewTitle, { color: colors.primary }]}>{t.addNewVehicle}</Text>
        <Text style={[styles.addNewSub, { color: colors.outline }]}>{t.registerNew}</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  headerBlock: { marginBottom: spacing.xl },
  hello: { fontFamily: 'Manrope_700Bold', fontSize: 28 },
  subhead: { fontFamily: 'Inter_400Regular', fontSize: 14, letterSpacing: 1 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  overviewRow: { flexDirection: 'row', gap: spacing.md },
  overviewTile: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewNumberLight: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: '#ffffff' },
  overviewLabelLight: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#ffffff', opacity: 0.8, marginTop: 4, textAlign: 'center' },
  overviewNumberDark: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36 },
  overviewLabelDark: { fontFamily: 'Inter_500Medium', fontSize: 12, opacity: 0.8, marginTop: 4, textAlign: 'center' },
  callout: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: roundness.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  calloutText: { fontFamily: 'Inter_400Regular', fontSize: 12, flexShrink: 1 },
  calloutLink: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  emptyState: {
    padding: spacing.xl,
    borderRadius: roundness.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: spacing.sm },
  emptyAction: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  addNewTile: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  addNewTitle: { fontFamily: 'Inter_400Regular', fontSize: 18, marginBottom: 4 },
  addNewSub: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});
