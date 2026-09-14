import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Plan, setPlan } from '@/redux/slices/settingsSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Subscription'>;

const PLAN_LIMITS: Record<Plan, number> = { free: 1, pro: 5, fleet: Infinity };

export default function SubscriptionScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
  const plan = useAppSelector((s) => s.settings.plan);
  const vehicleCount = useAppSelector((s) => s.vehicles.vehicles.length);
  const [changed, setChanged] = useState(false);

  const plans: { key: Plan; name: string; desc: string; price: string; priceNote: string }[] = [
    { key: 'free', name: t.planFree, desc: t.freeDesc, price: '$0', priceNote: t.forever },
    { key: 'pro', name: t.planPro, desc: t.proDesc, price: '$4.99', priceNote: t.perMonth },
    { key: 'fleet', name: t.planFleet, desc: t.fleetDesc, price: '$12.99', priceNote: t.perMonth },
  ];

  const current = plans.find((p) => p.key === plan) || plans[0];
  const limit = PLAN_LIMITS[plan];
  const usageText = `${vehicleCount} / ${limit === Infinity ? '∞' : limit} ${t.vehiclesUsed}`;

  const choose = (key: Plan) => {
    dispatch(setPlan(key));
    setChanged(true);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.subscription}</Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.currentCard, { backgroundColor: colors.primaryContainer }]}>
          <Text style={styles.currentLabel}>{t.currentPlan.toUpperCase()}</Text>
          <Text style={styles.currentName}>{current.name}</Text>
          <Text style={styles.currentDesc}>{current.desc}</Text>
          <Text style={styles.usage}>{usageText}</Text>
        </View>

        {plans.map((p) => {
          const isCurrent = p.key === plan;
          return (
            <Pressable
              key={p.key}
              onPress={() => choose(p.key)}
              style={[
                styles.planCard,
                { backgroundColor: colors.surface, borderColor: isCurrent ? colors.primary : 'transparent' },
              ]}
            >
              <View style={styles.planRow}>
                <View style={styles.planLeft}>
                  <View style={styles.planNameRow}>
                    <Text style={[styles.planName, { color: colors.text }]}>{p.name}</Text>
                    {isCurrent && (
                      <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>{t.currentLabel}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planDesc, { color: colors.outline }]}>{p.desc}</Text>
                </View>
                <View style={styles.planRight}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>{p.price}</Text>
                  <Text style={[styles.planPriceNote, { color: colors.outline }]}>{p.priceNote}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {changed && <Text style={[styles.changed, { color: colors.success }]}>{t.planChanged}</Text>}
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
  back: { fontFamily: 'Inter_500Medium', fontSize: RFValue(16) },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(20) },
  content: { paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  currentCard: { borderRadius: roundness.xl, padding: spacing.lg, marginBottom: spacing.xl },
  currentLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), color: '#ffffff', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: moderateScale(6) },
  currentName: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(28), color: '#ffffff' },
  currentDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), color: '#ffffff', opacity: 0.8, marginTop: moderateScale(6), lineHeight: RFValue(18) },
  usage: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), color: '#ffffff', opacity: 0.6, marginTop: moderateScale(12) },
  planCard: { borderRadius: roundness.lg, padding: spacing.md, marginBottom: moderateScale(14), borderWidth: 2 },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: moderateScale(10) },
  planLeft: { flex: 1, minWidth: moderateScale(0) },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) },
  planName: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(19) },
  planDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginTop: moderateScale(6), lineHeight: RFValue(17) },
  badge: { paddingVertical: moderateScale(2), paddingHorizontal: moderateScale(8), borderRadius: moderateScale(20) },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(9), letterSpacing: 0.5 },
  planRight: { alignItems: 'flex-end', flexShrink: 0 },
  planPrice: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(18) },
  planPriceNote: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10) },
  changed: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), textAlign: 'center', marginTop: moderateScale(12) },
});
