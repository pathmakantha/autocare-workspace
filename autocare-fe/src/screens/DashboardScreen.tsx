import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import VehicleCard from '@/components/VehicleCard';
import { useAppSelector } from '@/redux/hooks';
import { getExpiringItems, getVehicleStatus } from '@/utils/vehicleStatus';
import { computeServiceForecast } from '@/utils/serviceForecast';
import { fmtMoneyShort, REGIONS } from '@/utils/currency';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList, MainTabParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const vehiclesStatus = useAppSelector((s) => s.vehicles.status);
  const user = useAppSelector((s) => s.auth.user);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const records = useAppSelector((s) => s.maintenance.records);
  const fuelLogs = useAppSelector((s) => s.fuel.logs);
  const documents = useAppSelector((s) => s.documents.documents);
  const region = useAppSelector((s) => s.settings.region);
  const currency = useAppSelector((s) => s.settings.currency);

  const expiringItems = useMemo(() => getExpiringItems(vehicles, t), [vehicles, t]);
  const dashboardVehicles = vehicles.slice(0, 3);

  const userName = user?.name || (isGuest ? t.guestUser : 'there');
  const nextItem = expiringItems[0];

  const forecast = useMemo(() => computeServiceForecast(vehicles[0], records), [vehicles, records]);
  const distanceUnit = useAppSelector((s) => s.settings.distanceUnit);
  const toDisplayDistance = (km: number) => (distanceUnit === 'km' ? km : km * 0.621371);
  const forecastBarColor = forecast ? (forecast.pct >= 90 ? colors.error : forecast.pct >= 70 ? colors.warning : colors.success) : colors.success;

  const tco = useMemo(
    () => records.reduce((sum, r) => sum + r.cost, 0) + fuelLogs.reduce((sum, f) => sum + f.litres * f.pricePerLitre, 0),
    [records, fuelLogs]
  );

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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.quickActions}</Text>
        <View style={styles.quickGrid}>
          <Pressable
            style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => navigation.navigate('Fuel')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.primaryContainer }]}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                <Rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                <Rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                <Path d="M14 14h3M20.5 14v3M14 17.5v3M17.5 20.5h3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={[styles.quickTitle, { color: colors.text }]}>
              {REGIONS[region].features.fuelPass ? t.fuelPass : t.fuel}
            </Text>
            <Text style={[styles.quickSub, { color: colors.outline }]}>
              {REGIONS[region].features.fuelPass ? t.scanAtPump : t.fuelLogSub}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => vehicles[0] && navigation.navigate('Documents', { vehicleId: vehicles[0].id })}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.secondary + '30' }]}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Path d="M9 4h6v3H9z" stroke={colors.secondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <Rect x="6" y="6" width="12" height="15" rx="1.5" stroke={colors.secondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M9 11h6M9 14h6M9 17h4" stroke={colors.secondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={[styles.quickTitle, { color: colors.text }]}>{t.documents}</Text>
            <Text style={[styles.quickSub, { color: colors.outline }]}>
              {documents.length} {t.documents.toLowerCase()}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => vehicles[0] && navigation.navigate('InsuranceCard', { vehicleId: vehicles[0].id })}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.warning + '30' }]}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
                  stroke={colors.warning}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path d="M9 12l2 2 4-4" stroke={colors.warning} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={[styles.quickTitle, { color: colors.text }]}>{t.insuranceCard}</Text>
            <Text style={[styles.quickSub, { color: colors.outline }]}>
              {vehicles[0]?.insuranceExpiry || t.notOnFile}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => navigation.navigate('CostAnalytics')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.success + '30' }]}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Path d="M4 20V4" stroke={colors.success} strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M4 20h16" stroke={colors.success} strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M8.5 20v-5.5M13 20V9M17.5 20v-8" stroke={colors.success} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={[styles.quickTitle, { color: colors.text }]}>{t.costAnalytics}</Text>
            <Text style={[styles.quickSub, { color: colors.outline }]}>{fmtMoneyShort(tco, currency)}</Text>
          </Pressable>

          <Pressable
            style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => navigation.navigate('Emergency')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.error + '30' }]}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M10.3 3.9 2.6 17.2A1.6 1.6 0 0 0 4 19.6h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z"
                  stroke={colors.error}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path d="M12 9v4" stroke={colors.error} strokeWidth={1.8} strokeLinecap="round" />
                <Circle cx="12" cy="16.2" r="1" fill={colors.error} />
              </Svg>
            </View>
            <Text style={[styles.quickTitle, { color: colors.text }]}>{t.emergency}</Text>
            <Text style={[styles.quickSub, { color: colors.outline }]}>{REGIONS[region].label}</Text>
          </Pressable>
        </View>
      </View>

      {forecast && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.nextServiceDue}</Text>
          <Pressable
            style={[styles.forecastCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            onPress={() => navigation.navigate('Maintenance', { vehicleId: forecast.vehicle.id })}
          >
            <View style={styles.forecastTopRow}>
              <Text style={[styles.forecastDistance, { color: colors.primary }]}>
                {forecast.remaining <= 0
                  ? t.dueNow
                  : `${Math.round(toDisplayDistance(forecast.remaining)).toLocaleString()} ${distanceUnit} ${t.kmToService}`}
              </Text>
              {forecast.etaDays != null && forecast.remaining > 0 && (
                <Text style={[styles.forecastEta, { color: colors.outline }]}>
                  ~{forecast.etaDays} {t.dLeft}
                </Text>
              )}
            </View>
            <View style={[styles.forecastTrack, { backgroundColor: colors.surfaceLow }]}>
              <View style={[styles.forecastFill, { width: `${Math.round(forecast.pct)}%`, backgroundColor: forecastBarColor }]} />
            </View>
            <Text style={[styles.forecastBasis, { color: colors.outline }]}>
              {t.forecastBasis} {forecast.perDay.toFixed(1)} {t.perDay}
            </Text>
          </Pressable>
        </View>
      )}

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
  hello: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(28) },
  subhead: { fontFamily: 'Inter_400Regular', fontSize: RFValue(14), letterSpacing: 1 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: RFValue(18), marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: 'Inter_700Bold', fontSize: RFValue(12) },
  overviewRow: { flexDirection: 'row', gap: spacing.md },
  overviewTile: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewNumberLight: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(36), color: '#ffffff' },
  overviewLabelLight: { fontFamily: 'Inter_500Medium', fontSize: RFValue(12), color: '#ffffff', opacity: 0.8, marginTop: moderateScale(4), textAlign: 'center' },
  overviewNumberDark: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(36) },
  overviewLabelDark: { fontFamily: 'Inter_500Medium', fontSize: RFValue(12), opacity: 0.8, marginTop: moderateScale(4), textAlign: 'center' },
  callout: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: roundness.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  calloutText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), flexShrink: 1 },
  calloutLink: { fontFamily: 'Inter_700Bold', fontSize: RFValue(11) },
  emptyState: {
    padding: spacing.xl,
    borderRadius: roundness.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(14), marginBottom: spacing.sm },
  emptyAction: { fontFamily: 'Inter_700Bold', fontSize: RFValue(18) },
  addNewTile: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  addNewTitle: { fontFamily: 'Inter_400Regular', fontSize: RFValue(18), marginBottom: moderateScale(4) },
  addNewSub: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11) },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickTile: { width: '47%', padding: moderateScale(18), borderRadius: roundness.xl, borderWidth: 1 },
  quickIconWrap: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(17), alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(10) },
  quickTitle: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13) },
  quickSub: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(2) },
  forecastCard: { borderRadius: roundness.xl, borderWidth: 1, padding: spacing.lg },
  forecastTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: moderateScale(10), marginBottom: moderateScale(12) },
  forecastDistance: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(22) },
  forecastEta: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11) },
  forecastTrack: { height: moderateScale(6), borderRadius: moderateScale(3), overflow: 'hidden', marginBottom: moderateScale(10) },
  forecastFill: { height: moderateScale(6), borderRadius: moderateScale(3) },
  forecastBasis: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), lineHeight: RFValue(16) },
});
