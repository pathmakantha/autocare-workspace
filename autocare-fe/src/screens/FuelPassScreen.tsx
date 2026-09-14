import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addFuelLog } from '@/redux/slices/fuelSlice';
import { toggleSetting } from '@/redux/slices/settingsSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { fmtMoney, fmtMoneyShort, fmtRate } from '@/utils/currency';
import { REGIONS } from '@/utils/regions';
import { generateLocalId } from '@/utils/localId';
import QrCode from '@/components/QrCode';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type WalletPlatform = 'apple' | 'google' | null;

export default function FuelPassScreen() {
  const dispatch = useAppDispatch();
  const { colors, dark } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const fuelLogs = useAppSelector((s) => s.fuel.logs);
  const settings = useAppSelector((s) => s.settings);
  const unit = settings.distanceUnit === 'km' ? 'km' : 'mi';
  const toDisplayDistance = (km: number) => (settings.distanceUnit === 'km' ? km : km * 0.621371);

  // What this screen shows depends on the country: the National Fuel Pass and its quota
  // are a Sri Lankan scheme, and pump prices are only listed where we have real figures
  // rather than invented ones. Fill logging and efficiency stats are useful everywhere.
  const regionInfo = REGIONS[settings.region] || REGIONS.OTHER;
  const hasFuelPass = regionInfo.features.fuelPass;
  const fuelPrices = regionInfo.fuelPrices ?? [];
  const fuelTypeOptions: [string, number | null][] = fuelPrices.length
    ? fuelPrices.map(([name, price]) => [name, price] as [string, number | null])
    : [['Petrol', null], ['Diesel', null]];
  const defaultFuelName = fuelTypeOptions[0][0].replace(' Octane', '');
  const defaultFuelPrice = fuelTypeOptions[0][1] != null ? String(fuelTypeOptions[0][1]) : '';

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicles[0]?.id ?? null);
  const [qrRevealed, setQrRevealed] = useState(false);
  const [walletSheet, setWalletSheet] = useState<WalletPlatform>(null);
  const [walletAdded, setWalletAdded] = useState<{ apple: boolean; google: boolean }>({ apple: false, google: false });

  const [fillModalVisible, setFillModalVisible] = useState(false);
  const [fFuelType, setFFuelType] = useState(defaultFuelName);
  const [fLitres, setFLitres] = useState('');
  const [fPrice, setFPrice] = useState(defaultFuelPrice);
  const [fOdo, setFOdo] = useState('');
  const [fError, setFError] = useState('');

  const fuelVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const vehicleFuelLogs = useMemo(
    () =>
      fuelVehicle
        ? fuelLogs
            .filter((f) => f.vehicleId === fuelVehicle.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [],
    [fuelLogs, fuelVehicle]
  );

  const { costPerKm, kmPerL } = useMemo(() => {
    if (vehicleFuelLogs.length < 2) return { costPerKm: null as number | null, kmPerL: null as number | null };
    const newest = vehicleFuelLogs[0];
    const oldest = vehicleFuelLogs[vehicleFuelLogs.length - 1];
    const distKm = newest.odometer - oldest.odometer;
    const consumed = vehicleFuelLogs.slice(0, -1).reduce((sum, f) => sum + f.litres, 0);
    const spent = vehicleFuelLogs.slice(0, -1).reduce((sum, f) => sum + f.litres * f.pricePerLitre, 0);
    if (distKm > 0 && consumed > 0) {
      const dist = toDisplayDistance(distKm);
      return { costPerKm: spent / dist, kmPerL: dist / consumed };
    }
    return { costPerKm: null, kmPerL: null };
  }, [vehicleFuelLogs, settings.distanceUnit]);

  const fuelThisMonth = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return vehicleFuelLogs
      .filter((f) => new Date(f.date) >= monthStart)
      .reduce((sum, f) => sum + f.litres * f.pricePerLitre, 0);
  }, [vehicleFuelLogs]);

  const lastFill = vehicleFuelLogs[0];
  const qrHidden = settings.privacyMode && !qrRevealed;
  const quotaLabel = regionInfo.fuelQuota
    ? `${regionInfo.fuelQuota.litres} L · ${
        regionInfo.fuelQuota.period === 'week' ? t.quotaPerWeek : t.quotaPerMonth
      }`
    : '—';

  const openFillModal = () => {
    setFFuelType(defaultFuelName);
    setFLitres('');
    setFPrice(defaultFuelPrice);
    setFOdo(fuelVehicle ? String(fuelVehicle.mileage) : '');
    setFError('');
    setFillModalVisible(true);
  };

  const fillTotal = (parseFloat(fLitres) || 0) * (parseFloat(fPrice) || 0);

  const handleSaveFill = () => {
    const litres = parseFloat(fLitres);
    const price = parseFloat(fPrice);
    const odo = parseInt(fOdo, 10);
    if (!litres || !price || !odo || !fuelVehicle) {
      setFError(t.fillRequired);
      return;
    }
    dispatch(
      addFuelLog({
        id: generateLocalId('f'),
        vehicleId: fuelVehicle.id,
        date: new Date().toISOString().split('T')[0],
        litres,
        pricePerLitre: price,
        odometer: odo,
        fuelType: fFuelType,
      })
    );
    setFillModalVisible(false);
  };

  const walletTitle = walletSheet === 'google' ? t.googleSheetTitle : t.appleSheetTitle;
  const walletDesc = walletSheet === 'google' ? t.googleSheetDesc : t.appleSheetDesc;
  const walletDone = walletSheet ? walletAdded[walletSheet] : false;

  if (!fuelVehicle) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.primary }]}>{t.fuelPass}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>{t.noVehiclesYet}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.primary }]}>{hasFuelPass ? t.fuelPass : t.fuel}</Text>
          <Text style={[styles.subtitle, { color: colors.outline }]}>
            {hasFuelPass ? t.fuelPassSub : t.fuelLogSub}
          </Text>
        </View>

        <View style={styles.chipsRow}>
          {vehicles.map((v) => {
            const active = v.id === fuelVehicle.id;
            return (
              <Pressable
                key={v.id}
                onPress={() => {
                  setSelectedVehicleId(v.id);
                  setQrRevealed(false);
                }}
                style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surfaceLow }]}
              >
                <Text style={[styles.chipText, { color: active ? colors.onBrand : colors.outline }]}>{v.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {hasFuelPass && (
        <>
        <View style={[styles.passCard, { backgroundColor: colors.brandDeep }]}>
          <View style={styles.passHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.passEyebrow}>{t.nationalFuelPass}</Text>
              <Text style={styles.passReg}>{fuelVehicle.registrationNumber}</Text>
              <Text style={styles.passVehicleLine}>
                {fuelVehicle.brand} {fuelVehicle.model} &middot; {fuelVehicle.year}
              </Text>
            </View>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>{t.worksOffline}</Text>
            </View>
          </View>

          <View style={styles.qrPanel}>
            <View style={{ position: 'relative' }}>
              <View style={{ opacity: qrHidden ? 0.15 : 1 }}>
                <QrCode seed={`${fuelVehicle.registrationNumber}|${fuelVehicle.id}`} color={colors.primary} />
              </View>
              {qrHidden && (
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrRevealed(true)}>
                  <View style={styles.revealOverlay}>
                    <View style={styles.revealPill}>
                      <Text style={styles.revealPillText}>{t.tapToReveal}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
            </View>
            <Text style={styles.qrCaption}>{t.scanAtPumpFull}</Text>
          </View>

          <View style={styles.passStatsRow}>
            <View>
              <Text style={styles.passStatLabel}>{t.quotaRemaining}</Text>
              <Text style={styles.passStatValue}>{quotaLabel}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.passStatLabel}>{t.lastFill}</Text>
              <Text style={styles.passStatValue}>{lastFill ? `${lastFill.litres} L` : '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.privacyRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.privacyLabel, { color: colors.text }]}>{t.privacyMode}</Text>
            <Text style={[styles.privacyDesc, { color: colors.outline }]}>{t.privacyModeDesc}</Text>
          </View>
          <Pressable
            onPress={() => {
              dispatch(toggleSetting('privacyMode'));
              setQrRevealed(false);
            }}
            style={[styles.toggleTrack, { backgroundColor: settings.privacyMode ? colors.primary : colors.surfaceLow }]}
          >
            <View style={[styles.toggleThumb, { left: settings.privacyMode ? moderateScale(20) : moderateScale(2) }]} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.addToWallet}</Text>
          <View style={{ gap: moderateScale(10) }}>
            <Pressable style={[styles.walletBtn, { backgroundColor: '#000000' }]} onPress={() => setWalletSheet('apple')}>
              <Text style={styles.walletBtnText}>{walletAdded.apple ? t.inAppleWallet : t.addToAppleWallet}</Text>
              <Text style={styles.walletBtnGlyph}>{walletAdded.apple ? '✓' : '›'}</Text>
            </Pressable>
            <Pressable
              style={[styles.walletBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => setWalletSheet('google')}
            >
              <Text style={[styles.walletBtnText, { color: colors.text }]}>
                {walletAdded.google ? t.inGoogleWallet : t.addToGoogleWallet}
              </Text>
              <Text style={[styles.walletBtnGlyph, { color: colors.outline }]}>{walletAdded.google ? '✓' : '›'}</Text>
            </Pressable>
          </View>
          <Text style={[styles.walletNote, { color: colors.outline }]}>{t.walletNote}</Text>
        </View>
        </>
        )}

        {fuelPrices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.fuelPrices}</Text>
            <Text style={[styles.indicative, { color: colors.outline }]}>{t.indicative}</Text>
          </View>
          <View style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {fuelPrices.map(([name, price], i) => (
              <View
                key={name}
                style={[
                  styles.priceRow,
                  i < fuelPrices.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.priceName, { color: colors.text }]}>{name}</Text>
                <Text style={[styles.priceValue, { color: colors.secondary }]}>{fmtMoney(price, settings.currency)} / L</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.recentFills}</Text>
            <Pressable style={[styles.addFillBtn, { backgroundColor: colors.primaryBtn }]} onPress={openFillModal}>
              <Text style={[styles.addFillBtnText, { color: colors.onBrand }]}>{t.addFill}</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statTile, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{costPerKm ? fmtRate(costPerKm, settings.currency) : '—'}</Text>
              <Text style={[styles.statLabel, { color: colors.outline }]}>{t.costPerKm}</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{kmPerL ? `${kmPerL.toFixed(1)} ${unit}/L` : '—'}</Text>
              <Text style={[styles.statLabel, { color: colors.outline }]}>{t.efficiency}</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{fmtMoneyShort(fuelThisMonth, settings.currency)}</Text>
              <Text style={[styles.statLabel, { color: colors.outline }]}>{t.thisMonth}</Text>
            </View>
          </View>

          {vehicleFuelLogs.length === 0 ? (
            <View style={styles.emptyLogsState}>
              <Text style={[styles.emptyText, { color: colors.outline }]}>{t.noFills}</Text>
            </View>
          ) : (
            vehicleFuelLogs.map((f) => (
              <View key={f.id} style={[styles.fillRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.fillTopRow}>
                  <Text style={[styles.fillLitres, { color: colors.text }]}>{f.litres} L</Text>
                  <Text style={[styles.fillCost, { color: colors.secondary }]}>{fmtMoney(f.litres * f.pricePerLitre, settings.currency)}</Text>
                </View>
                <View style={styles.fillBottomRow}>
                  <Text style={[styles.fillMeta, { color: colors.outline }]}>
                    {f.date} &middot; {f.fuelType}
                  </Text>
                  <Text style={[styles.fillMeta, { color: colors.outline }]}>
                    {Math.round(toDisplayDistance(f.odometer)).toLocaleString()} {unit}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={fillModalVisible} animationType="slide" transparent onRequestClose={() => setFillModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{t.addFillTitle}</Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>{t.fuelType}</Text>
            <View style={styles.fuelTypeRow}>
              {fuelTypeOptions.map(([name, price]) => {
                const short = name.replace(' Octane', '');
                const active = fFuelType === short;
                return (
                  <Pressable
                    key={name}
                    onPress={() => {
                      setFFuelType(short);
                      if (price != null) setFPrice(String(price));
                    }}
                    style={[
                      styles.fuelTypeChip,
                      { backgroundColor: active ? colors.primary : 'transparent', borderColor: active ? colors.primary : colors.outline },
                    ]}
                  >
                    <Text style={[styles.fuelTypeChipText, { color: active ? colors.onBrand : colors.outline }]}>{short}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput label={t.litres} placeholder="e.g. 35" value={fLitres} onChangeText={setFLitres} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput label={t.pricePerLitre} placeholder="e.g. 341" value={fPrice} onChangeText={setFPrice} keyboardType="numeric" />
              </View>
            </View>
            <CustomInput label={t.odometer} placeholder="e.g. 32600" value={fOdo} onChangeText={setFOdo} keyboardType="numeric" />

            <View style={[styles.totalRow, { backgroundColor: colors.surfaceLow }]}>
              <Text style={[styles.totalLabel, { color: colors.outline }]}>{t.totalCost}</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{fmtMoney(fillTotal, settings.currency)}</Text>
            </View>

            {!!fError && <Text style={[styles.error, { color: colors.error }]}>{fError}</Text>}

            <View style={styles.row}>
              <CustomButton label={t.cancel} onPress={() => setFillModalVisible(false)} variant="muted" style={{ flex: 1 }} />
              <CustomButton label={t.save} onPress={handleSaveFill} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!walletSheet} animationType="slide" transparent onRequestClose={() => setWalletSheet(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text, textAlign: 'center' }]}>{walletTitle}</Text>
            <Text style={[styles.walletSheetDesc, { color: colors.outline }]}>{walletDesc}</Text>

            <View style={[styles.walletPreview, { backgroundColor: colors.brandDeep }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.walletPreviewEyebrow}>AutoCare &middot; {t.nationalFuelPass}</Text>
                <Text style={styles.walletPreviewReg}>{fuelVehicle.registrationNumber}</Text>
                <Text style={styles.walletPreviewQuota}>{quotaLabel}</Text>
              </View>
              <View style={styles.walletPreviewQr}>
                <QrCode seed={`${fuelVehicle.registrationNumber}|${fuelVehicle.id}`} color={colors.primary} cellSize={2} />
              </View>
            </View>

            {!walletDone ? (
              <View style={styles.walletSteps}>
                {[t.step1, t.step2, t.step3].map((step, i) => (
                  <View key={i} style={styles.walletStepRow}>
                    <View style={[styles.walletStepNum, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.walletStepNumText, { color: colors.primary }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.walletStepText, { color: colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.walletAddedBlock}>
                <Text style={[styles.walletAddedText, { color: colors.success }]}>
                  {walletSheet === 'google' ? t.addedGoogle : t.addedApple}
                </Text>
                <Text style={[styles.walletAddedNote, { color: colors.outline }]}>{t.walletAddedNote}</Text>
              </View>
            )}

            <View style={styles.row}>
              <CustomButton
                label={walletDone ? t.done : t.cancel}
                onPress={() => setWalletSheet(null)}
                variant="muted"
                style={{ flex: 1 }}
              />
              {!walletDone && (
                <CustomButton
                  label={t.addPass}
                  onPress={() => walletSheet && setWalletAdded((w) => ({ ...w, [walletSheet]: true }))}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: moderateScale(40) },
  headerBlock: { marginBottom: spacing.lg },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(24) },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginTop: moderateScale(4) },
  chipsRow: { flexDirection: 'row', gap: moderateScale(8), flexWrap: 'wrap', marginBottom: spacing.lg },
  chip: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20) },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  passCard: { borderRadius: moderateScale(28), padding: spacing.lg, marginBottom: spacing.lg },
  passHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: moderateScale(10), marginBottom: moderateScale(20) },
  passEyebrow: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10), color: '#ffffff', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.4 },
  passReg: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(26), color: '#ffffff', letterSpacing: 1.5, marginTop: moderateScale(4) },
  passVehicleLine: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), color: '#ffffff', opacity: 0.7, marginTop: moderateScale(2) },
  offlineBadge: { paddingVertical: moderateScale(5), paddingHorizontal: moderateScale(10), borderRadius: moderateScale(20), backgroundColor: 'rgba(255,255,255,0.14)' },
  offlineBadgeText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(9), color: '#ffffff', letterSpacing: 0.6 },
  qrPanel: { backgroundColor: '#ffffff', borderRadius: moderateScale(20), padding: moderateScale(18), alignItems: 'center' },
  revealOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  revealPill: { paddingVertical: moderateScale(10), paddingHorizontal: moderateScale(16), borderRadius: moderateScale(20), backgroundColor: '#000666' },
  revealPillText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(11), color: '#ffffff' },
  qrCaption: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), color: '#1a1c1c', opacity: 0.55, marginTop: moderateScale(14), textAlign: 'center' },
  passStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(20), gap: moderateScale(12) },
  passStatLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10), color: '#ffffff', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 },
  passStatValue: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(17), color: '#ffffff', marginTop: moderateScale(3) },
  privacyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: moderateScale(12), paddingHorizontal: moderateScale(4), gap: moderateScale(12) },
  privacyLabel: { fontFamily: 'Inter_500Medium', fontSize: RFValue(13) },
  privacyDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(2) },
  toggleTrack: { width: moderateScale(44), height: moderateScale(26), borderRadius: moderateScale(13), flexShrink: 0 },
  toggleThumb: { width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), backgroundColor: '#ffffff', position: 'absolute', top: moderateScale(2) },
  section: { marginTop: spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(12), gap: moderateScale(10) },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: RFValue(14) },
  indicative: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10) },
  walletBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(12), paddingVertical: moderateScale(15), paddingHorizontal: moderateScale(18), borderRadius: moderateScale(16) },
  walletBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14), color: '#ffffff' },
  walletBtnGlyph: { fontFamily: 'Inter_400Regular', fontSize: RFValue(15), color: '#ffffff', opacity: 0.75 },
  walletNote: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(10), lineHeight: RFValue(16) },
  priceCard: { borderRadius: moderateScale(20), borderWidth: 1, paddingHorizontal: moderateScale(20) },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: moderateScale(14), gap: moderateScale(10) },
  priceName: { fontFamily: 'Inter_400Regular', fontSize: RFValue(13) },
  priceValue: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13) },
  addFillBtn: { borderRadius: moderateScale(12), paddingVertical: moderateScale(7), paddingHorizontal: moderateScale(14) },
  addFillBtnText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(11) },
  statsRow: { flexDirection: 'row', gap: moderateScale(10), marginBottom: moderateScale(14) },
  statTile: { flex: 1, borderRadius: moderateScale(16), paddingVertical: moderateScale(14), paddingHorizontal: moderateScale(10), alignItems: 'center' },
  statValue: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(15) },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(10), marginTop: moderateScale(2) },
  fillRow: { borderRadius: moderateScale(18), padding: moderateScale(16), marginBottom: moderateScale(10), borderWidth: 1 },
  fillTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: moderateScale(10) },
  fillLitres: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13) },
  fillCost: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14) },
  fillBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(6), gap: moderateScale(10) },
  fillMeta: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11) },
  emptyLogsState: { paddingVertical: moderateScale(40), alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(13) },
  emptyState: { padding: moderateScale(100), alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), padding: spacing.lg, maxHeight: '90%' },
  sheetTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(20), marginBottom: moderateScale(18) },
  fieldLabel: { fontFamily: 'Inter_500Medium', fontSize: RFValue(12), marginBottom: moderateScale(8), marginLeft: moderateScale(4) },
  fuelTypeRow: { flexDirection: 'row', gap: moderateScale(8), flexWrap: 'wrap', marginBottom: spacing.md },
  fuelTypeChip: { paddingVertical: moderateScale(9), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20), borderWidth: 1 },
  fuelTypeChipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(11) },
  row: { flexDirection: 'row', gap: moderateScale(10) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', padding: moderateScale(14), borderRadius: moderateScale(14), marginBottom: spacing.md, gap: moderateScale(10) },
  totalLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12) },
  totalValue: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(18) },
  error: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), textAlign: 'center', marginBottom: spacing.sm },
  walletSheetDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), textAlign: 'center', marginBottom: moderateScale(22), lineHeight: RFValue(18) },
  walletPreview: { borderRadius: moderateScale(20), padding: moderateScale(18), marginBottom: moderateScale(20), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: moderateScale(14) },
  walletPreviewEyebrow: { fontFamily: 'Inter_400Regular', fontSize: RFValue(9), color: '#ffffff', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2 },
  walletPreviewReg: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(20), color: '#ffffff', letterSpacing: 1.2, marginTop: moderateScale(4) },
  walletPreviewQuota: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), color: '#ffffff', opacity: 0.7, marginTop: moderateScale(2) },
  walletPreviewQr: { backgroundColor: '#ffffff', borderRadius: moderateScale(10), padding: moderateScale(6) },
  walletSteps: { gap: moderateScale(12), marginBottom: moderateScale(22) },
  walletStepRow: { flexDirection: 'row', gap: moderateScale(12), alignItems: 'flex-start' },
  walletStepNum: { width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  walletStepNumText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(10) },
  walletStepText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), lineHeight: RFValue(18), flex: 1 },
  walletAddedBlock: { alignItems: 'center', paddingVertical: moderateScale(10), marginBottom: moderateScale(22) },
  walletAddedText: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(16) },
  walletAddedNote: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(6), lineHeight: RFValue(16), textAlign: 'center' },
});
