import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { fmtMoney, fmtMoneyShort, fmtRate } from '@/utils/currency';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CostAnalytics'>;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CostAnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const records = useAppSelector((s) => s.maintenance.records);
  const fuelLogs = useAppSelector((s) => s.fuel.logs);
  const settings = useAppSelector((s) => s.settings);
  const [reportGenerated, setReportGenerated] = useState(false);

  const toDisplayDistance = (km: number) => (settings.distanceUnit === 'km' ? km : km * 0.621371);

  const totals = useMemo(() => {
    const totalService = records.reduce((sum, r) => sum + r.cost, 0);
    const totalFuel = fuelLogs.reduce((sum, f) => sum + f.litres * f.pricePerLitre, 0);
    const tco = totalService + totalFuel;
    const catDefs: [string, number, string][] = [
      [t.history, totalService, colors.primary],
      [t.catFuel, totalFuel, colors.warning],
    ];
    const maxCat = Math.max(1, ...catDefs.map((c) => c[1]));
    const costCategories = catDefs.map(([label, amount, color]) => ({
      label,
      amount,
      color,
      width: `${Math.round((amount / maxCat) * 100)}%`,
    }));
    return { totalService, totalFuel, tco, costCategories };
  }, [records, fuelLogs, colors, t]);

  const monthlySpend = useMemo(() => {
    const today = new Date();
    const buckets: { label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      const recSum = records.filter((r) => new Date(r.serviceDate) >= d && new Date(r.serviceDate) < end).reduce((sum, r) => sum + r.cost, 0);
      const fuelSum = fuelLogs.filter((f) => new Date(f.date) >= d && new Date(f.date) < end).reduce((sum, f) => sum + f.litres * f.pricePerLitre, 0);
      buckets.push({ label: MONTH_NAMES[d.getMonth()], amount: recSum + fuelSum });
    }
    const maxBucket = Math.max(1, ...buckets.map((b) => b.amount));
    return buckets.map((b) => ({
      label: b.label,
      amountShort: b.amount > 0 ? fmtMoneyShort(b.amount, settings.currency) : '',
      height: Math.max(4, Math.round((b.amount / maxBucket) * 86)),
      isPeak: b.amount === maxBucket && b.amount > 0,
    }));
  }, [records, fuelLogs, settings.currency]);

  const { totalKmDisplay, monthsOwned } = useMemo(() => {
    const trackedKm = vehicles.reduce((sum, v) => {
      const odos = [
        ...records.filter((r) => r.vehicleId === v.id).map((r) => r.mileage),
        ...fuelLogs.filter((f) => f.vehicleId === v.id).map((f) => f.odometer),
        v.mileage,
      ];
      if (odos.length < 2) return sum;
      return sum + (Math.max(...odos) - Math.min(...odos));
    }, 0);
    const oldestRecord = [...records].sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())[0];
    const monthsOwned = oldestRecord
      ? Math.max(1, Math.round((Date.now() - new Date(oldestRecord.serviceDate).getTime()) / (86400000 * 30)))
      : 1;
    return { totalKmDisplay: Math.max(1, toDisplayDistance(trackedKm)), monthsOwned };
  }, [vehicles, records, fuelLogs, settings.distanceUnit]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.costAnalytics}</Text>
        <View style={{ width: moderateScale(34) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.tcoCard, { backgroundColor: colors.primaryContainer }]}>
          <Text style={styles.tcoEyebrow}>{t.totalCostOwnership}</Text>
          <Text style={styles.tcoValue}>{fmtMoney(totals.tco, settings.currency)}</Text>
          <View style={styles.tcoStatsRow}>
            <View>
              <Text style={styles.tcoStatLabel}>{t.costPerKm}</Text>
              <Text style={styles.tcoStatValue}>{fmtRate(totals.tco / totalKmDisplay, settings.currency)}</Text>
            </View>
            <View>
              <Text style={styles.tcoStatLabel}>{t.perMonthLabel}</Text>
              <Text style={styles.tcoStatValue}>{fmtMoneyShort(totals.tco / monthsOwned, settings.currency)}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.byCategory}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {totals.costCategories.map((c) => (
            <View key={c.label} style={styles.catRow}>
              <View style={styles.catTopRow}>
                <Text style={[styles.catLabel, { color: colors.text }]}>{c.label}</Text>
                <Text style={[styles.catAmount, { color: colors.text }]}>{fmtMoney(c.amount, settings.currency)}</Text>
              </View>
              <View style={[styles.catTrack, { backgroundColor: colors.surfaceLow }]}>
                <View style={[styles.catFill, { width: c.width as any, backgroundColor: c.color }]} />
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.last6Months}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.barsRow}>
            {monthlySpend.map((m, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barAmount, { color: colors.outline }]}>{m.amountShort}</Text>
                <View
                  style={[
                    styles.bar,
                    { height: m.height, backgroundColor: m.isPeak ? colors.primary : colors.secondary },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.outline }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={[styles.exportRow, { backgroundColor: colors.surfaceLow }]} onPress={() => setReportGenerated(true)}>
          <View style={[styles.exportIcon, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.exportIconText, { color: colors.success }]}>PDF</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.exportLabel, { color: colors.primary }]}>{reportGenerated ? t.exportReportGen : t.exportReport}</Text>
            <Text style={[styles.exportDesc, { color: colors.outline }]}>{t.exportReportDesc}</Text>
          </View>
        </Pressable>
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
    paddingBottom: spacing.md,
  },
  back: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14) },
  headerTitle: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(18) },
  content: { paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  tcoCard: { borderRadius: roundness.xl, padding: spacing.lg, marginBottom: spacing.xl },
  tcoEyebrow: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10), color: '#ffffff', opacity: 0.65, textTransform: 'uppercase', letterSpacing: 1.2 },
  tcoValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(32), color: '#ffffff', marginTop: moderateScale(6) },
  tcoStatsRow: { flexDirection: 'row', gap: moderateScale(20), marginTop: moderateScale(14) },
  tcoStatLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10), color: '#ffffff', opacity: 0.6 },
  tcoStatValue: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14), color: '#ffffff', marginTop: moderateScale(2) },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: RFValue(14), marginBottom: moderateScale(14) },
  card: { borderRadius: roundness.xl, borderWidth: 1, padding: moderateScale(20), marginBottom: spacing.xl },
  catRow: { marginBottom: moderateScale(16) },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: moderateScale(6), gap: moderateScale(10) },
  catLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12) },
  catAmount: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  catTrack: { height: moderateScale(8), borderRadius: moderateScale(4), overflow: 'hidden' },
  catFill: { height: moderateScale(8), borderRadius: moderateScale(4) },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: moderateScale(8), height: moderateScale(120) },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: moderateScale(6) },
  barAmount: { fontFamily: 'Inter_400Regular', fontSize: RFValue(9) },
  bar: { width: '100%', borderTopLeftRadius: moderateScale(6), borderTopRightRadius: moderateScale(6) },
  barLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10) },
  exportRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(14), padding: moderateScale(20), borderRadius: roundness.xl },
  exportIcon: { width: moderateScale(42), height: moderateScale(42), borderRadius: moderateScale(21), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  exportIconText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(12) },
  exportLabel: { fontFamily: 'Inter_700Bold', fontSize: RFValue(14) },
  exportDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(2), lineHeight: RFValue(16) },
});
