import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Region, setRegion } from '@/redux/slices/settingsSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { REGIONS, REGION_ORDER } from '@/utils/currency';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Emergency'>;

const CONTACT_LABEL_KEY = {
  police: 'police',
  ambulance: 'ambulance',
  fire: 'fire',
  towing: 'towing',
} as const;

export default function EmergencyScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
  const region = useAppSelector((s) => s.settings.region);
  const [callingKey, setCallingKey] = useState<string | null>(null);

  const info = REGIONS[region] || REGIONS.OTHER;

  const handleCall = (key: string, number: string) => {
    setCallingKey(key);
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.emergency}</Text>
        <View style={{ width: moderateScale(34) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.desc, { color: colors.outline }]}>{t.emergencyDesc}</Text>

        <View style={styles.regionRow}>
          {REGION_ORDER.map((code) => {
            const active = region === code;
            return (
              <Pressable
                key={code}
                onPress={() => dispatch(setRegion(code))}
                style={[
                  styles.regionChip,
                  { backgroundColor: active ? colors.primary : 'transparent', borderColor: active ? colors.primary : colors.outline },
                ]}
              >
                <Text style={[styles.regionChipText, { color: active ? colors.onBrand : colors.outline }]}>{REGIONS[code].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {info.contacts.map((c) => {
          const urgent = c.key === 'police' || c.key === 'ambulance';
          return (
            <Pressable
              key={c.key}
              onPress={() => handleCall(c.key, c.number)}
              style={[styles.contactRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>{t[CONTACT_LABEL_KEY[c.key]]}</Text>
                <Text style={[styles.contactDesc, { color: colors.outline }]}>{t[`${c.key}Desc` as keyof typeof t]}</Text>
              </View>
              <View style={[styles.numberBadge, { backgroundColor: urgent ? colors.error + '20' : colors.surfaceLow }]}>
                <Text style={[styles.numberText, { color: urgent ? colors.error : colors.primary }]}>{c.number}</Text>
              </View>
            </Pressable>
          );
        })}

        {info.emergencyNote && (
          <Text style={[styles.emergencyNote, { color: colors.warning }]}>{t.emergencyGenericNote}</Text>
        )}

        {!!callingKey && <Text style={[styles.calling, { color: colors.success }]}>{t.calling}…</Text>}
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
  desc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginBottom: moderateScale(18), lineHeight: RFValue(18) },
  emergencyNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
    marginTop: moderateScale(16),
  },
  regionRow: { flexDirection: 'row', gap: moderateScale(8), flexWrap: 'wrap', marginBottom: moderateScale(22) },
  regionChip: { paddingVertical: moderateScale(9), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20), borderWidth: 1 },
  regionChipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(12),
    borderRadius: roundness.xl,
    padding: moderateScale(20),
    marginBottom: moderateScale(12),
    borderWidth: 1,
  },
  contactLabel: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14) },
  contactDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(2) },
  numberBadge: { paddingVertical: moderateScale(9), paddingHorizontal: moderateScale(16), borderRadius: moderateScale(20), flexShrink: 0 },
  numberText: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(14) },
  calling: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), textAlign: 'center', marginTop: moderateScale(16) },
});
