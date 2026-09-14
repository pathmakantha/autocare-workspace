import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { applyCountry, Region } from '@/redux/slices/settingsSlice';
import { REGION_ORDER, REGIONS } from '@/utils/regions';
import { CURRENCIES } from '@/utils/currency';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * First-run country picker. It is what decides the emergency numbers, the currency and
 * units, and which country-specific features (Sri Lanka's fuel pass, national insurance
 * verification) appear at all — so it is asked before anything else, and is changeable
 * later from Settings.
 */
export default function CountryScreen() {
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const currentRegion = useAppSelector((s) => s.settings.region);
  const [selected, setSelected] = useState<Region>(currentRegion);

  const handleContinue = () => {
    const info = REGIONS[selected];
    dispatch(
      applyCountry({
        region: selected,
        currency: info.currency,
        distanceUnit: info.distanceUnit,
        // Only set on first run — changing country later must not silently change the
        // language someone deliberately picked.
        language: info.defaultLanguage,
      })
    );
  };

  const featureSummary = (region: Region) => {
    const { features } = REGIONS[region];
    const enabled: string[] = [];
    if (features.fuelPass) enabled.push(t.fuelPass);
    if (features.insuranceVerification) enabled.push(t.insuranceCard);
    return enabled.join(' · ');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDeep }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>AutoCare</Text>
          <Text style={styles.brandSub}>{t.tagline.toUpperCase()}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.selectCountry}</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>{t.selectCountryDesc}</Text>

          {REGION_ORDER.map((code) => {
            const info = REGIONS[code];
            const active = selected === code;
            const features = featureSummary(code);
            return (
              <Pressable
                key={code}
                onPress={() => setSelected(code)}
                style={[
                  styles.countryRow,
                  {
                    backgroundColor: active ? colors.primaryContainer : colors.surfaceLow,
                    borderColor: active ? colors.primaryContainer : 'transparent',
                  },
                ]}
              >
                <Text style={styles.flag}>{info.flag}</Text>
                <View style={styles.countryBody}>
                  <Text style={[styles.countryName, { color: active ? colors.onBrand : colors.text }]}>
                    {code === 'OTHER' ? t.countryOther : info.label}
                  </Text>
                  <Text
                    style={[styles.countryMeta, { color: active ? colors.onBrand : colors.outline }]}
                    numberOfLines={1}
                  >
                    {CURRENCIES[info.currency].code} · {info.distanceUnit}
                    {features ? ` · ${features}` : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: active ? colors.onBrand : colors.outline },
                    active && { backgroundColor: colors.onBrand },
                  ]}
                />
              </Pressable>
            );
          })}

          <CustomButton label={t.continueBtn} onPress={handleContinue} style={{ marginTop: spacing.md }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  brandBlock: { alignItems: 'center', marginBottom: spacing.lg },
  brand: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(36), color: '#ffffff', marginBottom: moderateScale(4) },
  brandSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(12),
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  card: { padding: spacing.lg, borderRadius: roundness.xl, borderWidth: 1 },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: RFValue(22),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: roundness.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  flag: { fontSize: RFValue(24) },
  countryBody: { flex: 1, minWidth: 0 },
  countryName: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14) },
  countryMeta: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(2) },
  radio: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 2,
    flexShrink: 0,
  },
});
