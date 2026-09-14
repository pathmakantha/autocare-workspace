import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDocumentFile } from '@/redux/slices/documentsSlice';
import { VehicleDocument } from '@/types/document';
import { roundness, spacing } from '@/utils/theme';
import { channelUrl, isChannelAvailable, verificationFor, ChannelKind } from '@/utils/insuranceVerification';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'InsuranceCard'>;
type R = RouteProp<RootStackParamList, 'InsuranceCard'>;

/** Masks all but the last four characters, so a shoulder-surfer gets nothing useful. */
function maskReference(value: string) {
  const tail = value.slice(-4);
  return `${'•'.repeat(Math.max(value.length - 4, 3))} ${tail}`;
}

export default function InsuranceCardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();

  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const allDocuments = useAppSelector((s) => s.documents.documents);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const region = useAppSelector((s) => s.settings.region);
  const privacyMode = useAppSelector((s) => s.settings.privacyMode);

  const [selectedVehicleId, setSelectedVehicleId] = useState(route.params.vehicleId);
  const [revealed, setRevealed] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // The newest insurance document on file is the one worth showing.
  const document: VehicleDocument | undefined = useMemo(() => {
    if (!vehicle) return undefined;
    return allDocuments
      .filter((d) => d.vehicleId === vehicle.id && d.type === 'INSURANCE')
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [allDocuments, vehicle]);

  // List responses omit fileData to stay light, so pull the full record once when we
  // actually need the image. Guest documents already carry it locally.
  useEffect(() => {
    if (!isGuest && vehicle && document && !document.fileData) {
      dispatch(fetchDocumentFile({ vehicleId: vehicle.id, id: document.id }));
    }
  }, [dispatch, isGuest, vehicle, document]);

  useEffect(() => {
    setRevealed(false);
  }, [selectedVehicleId]);

  const verification = verificationFor(region);
  const availableChannels = (verification?.channels ?? []).filter((c) => isChannelAvailable(c.kind));
  const ussdHidden = !!verification && verification.channels.some((c) => c.kind === 'ussd') &&
    !availableChannels.some((c) => c.kind === 'ussd');

  const expiry = document?.extractedExpiry || vehicle?.insuranceExpiry || null;

  const status = useMemo(() => {
    if (!expiry) return { label: t.notOnFile, color: colors.outline, bg: colors.outline + '30' };
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: t.expiredLabel, color: colors.error, bg: colors.error + '25' };
    if (days <= 7) return { label: t.urgent.toUpperCase(), color: colors.error, bg: colors.error + '25' };
    if (days <= 30) return { label: t.dueSoon.toUpperCase(), color: colors.warning, bg: colors.warning + '25' };
    return { label: t.validLabel, color: colors.success, bg: colors.success + '25' };
  }, [expiry, colors, t]);

  const openChannel = async (kind: ChannelKind) => {
    const channel = availableChannels.find((c) => c.kind === kind);
    if (!channel || !vehicle) return;
    try {
      await Linking.openURL(channelUrl(channel, vehicle.registrationNumber));
    } catch {
      // The dialler/SMS app refused or isn't present — nothing useful to recover to.
    }
  };

  const channelLabel = (kind: ChannelKind) =>
    kind === 'ussd' ? t.dialUssd : kind === 'sms' ? t.smsVerify : t.callVerify;

  if (!vehicle) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
            {t.back}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.insuranceCard}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>{t.noVehiclesYet}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const referenceValue = document?.referenceNumber || null;
  const referenceHidden = privacyMode && !revealed && !!referenceValue;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.insuranceCard}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: colors.outline }]}>{t.insuranceCardSub}</Text>

        {vehicles.length > 1 && (
          <View style={styles.chipsRow}>
            {vehicles.map((v) => {
              const active = v.id === vehicle.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVehicleId(v.id)}
                  style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surfaceLow }]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.onBrand : colors.outline }]}>{v.name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.brandDeep }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.cardEyebrow}>{t.docTypeInsurance}</Text>
              <Text style={styles.cardReg}>{vehicle.registrationNumber}</Text>
              <Text style={styles.cardVehicleLine}>
                {vehicle.brand} {vehicle.model} &middot; {vehicle.year}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.cardPanel}>
            <View style={styles.panelRow}>
              <Text style={styles.panelLabel}>{t.validUntil}</Text>
              <Text style={styles.panelValueStrong}>{expiry || t.notOnFile}</Text>
            </View>
            <View style={styles.panelDivider} />
            <View style={styles.panelRow}>
              <Text style={styles.panelLabel}>{t.insurerLabel}</Text>
              <Text style={styles.panelValue} numberOfLines={1}>
                {document?.extractedIssuer || t.notOnFile}
              </Text>
            </View>
            <View style={styles.panelDivider} />
            <Pressable
              style={styles.panelRow}
              onPress={() => referenceHidden && setRevealed(true)}
              disabled={!referenceHidden}
            >
              <Text style={styles.panelLabel}>{t.policyNo}</Text>
              {referenceValue ? (
                <Text style={styles.panelValue} numberOfLines={1}>
                  {referenceHidden ? maskReference(referenceValue) : referenceValue}
                </Text>
              ) : (
                <Text style={styles.panelValue}>{t.notOnFile}</Text>
              )}
            </Pressable>
            {referenceHidden && <Text style={styles.revealHint}>{t.tapToReveal}</Text>}
          </View>

          {document?.fileData ? (
            <Pressable style={styles.viewDocBtn} onPress={() => setImageOpen(true)}>
              <Text style={styles.viewDocBtnText}>{t.viewDocument}</Text>
            </Pressable>
          ) : null}
        </View>

        {!document && (
          <Pressable
            style={[styles.addCta, { backgroundColor: colors.surfaceLow }]}
            onPress={() => navigation.navigate('AddDocument', { vehicleId: vehicle.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.addCtaTitle, { color: colors.primary }]}>{t.addInsuranceCard}</Text>
              <Text style={[styles.addCtaSub, { color: colors.outline }]}>{t.noInsuranceCard}</Text>
            </View>
            <Text style={[styles.addCtaChevron, { color: colors.outline }]}>›</Text>
          </Pressable>
        )}

        {verification && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.officialVerification}</Text>
            <View style={[styles.verifyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.verifyHeaderRow}>
                <View style={[styles.verifyIconWrap, { backgroundColor: colors.success + '25' }]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
                      stroke={colors.success}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path d="M9 12l2 2 4-4" stroke={colors.success} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={[styles.verifyAuthority, { color: colors.text }]}>{verification.authority}</Text>
              </View>
              <Text style={[styles.verifyDesc, { color: colors.outline }]}>{t.verifyDesc}</Text>

              <View style={styles.verifyBtnRow}>
                {availableChannels.map((c) => (
                  <Pressable
                    key={c.kind}
                    onPress={() => openChannel(c.kind)}
                    style={[styles.verifyBtn, { backgroundColor: colors.primaryBtn }]}
                  >
                    <Text style={[styles.verifyBtnText, { color: colors.onBrand }]}>{channelLabel(c.kind)}</Text>
                  </Pressable>
                ))}
              </View>

              {ussdHidden && <Text style={[styles.verifyNote, { color: colors.outline }]}>{t.ussdIosNote}</Text>}
            </View>
          </View>
        )}

        <Text style={[styles.disclaimer, { color: colors.outline }]}>{t.cardIssuerNote}</Text>
      </ScrollView>

      <Modal visible={imageOpen} transparent animationType="fade" onRequestClose={() => setImageOpen(false)}>
        <View style={styles.imageBackdrop}>
          <Image source={{ uri: document?.fileData }} style={styles.fullImage} resizeMode="contain" />
          <View style={styles.imageCloseWrap}>
            <CustomButton label={t.cancel} onPress={() => setImageOpen(false)} variant="muted" />
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing.sm,
  },
  back: { fontFamily: 'Inter_500Medium', fontSize: RFValue(16) },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(18) },
  headerSpacer: { width: moderateScale(40) },
  content: { paddingHorizontal: spacing.lg, paddingBottom: moderateScale(40) },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginBottom: spacing.lg },
  chipsRow: { flexDirection: 'row', gap: moderateScale(8), flexWrap: 'wrap', marginBottom: spacing.md },
  chip: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20) },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  card: { borderRadius: moderateScale(28), padding: spacing.lg },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: moderateScale(10), marginBottom: moderateScale(20) },
  cardEyebrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(10),
    color: '#ffffff',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  cardReg: { fontFamily: 'Manrope_800ExtraBold', fontSize: RFValue(26), color: '#ffffff', letterSpacing: 1.5, marginTop: moderateScale(4) },
  cardVehicleLine: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), color: '#ffffff', opacity: 0.7, marginTop: moderateScale(2) },
  statusBadge: { paddingVertical: moderateScale(6), paddingHorizontal: moderateScale(11), borderRadius: moderateScale(20), flexShrink: 0 },
  statusBadgeText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(10), letterSpacing: 0.6 },
  cardPanel: { backgroundColor: '#ffffff', borderRadius: moderateScale(20), paddingHorizontal: moderateScale(18), paddingVertical: moderateScale(6) },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: moderateScale(12), paddingVertical: moderateScale(13) },
  panelDivider: { height: moderateScale(1), backgroundColor: '#f3f3f3' },
  panelLabel: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), color: '#1a1c1c', opacity: 0.55, flexShrink: 0 },
  panelValue: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13), color: '#1a1c1c', flexShrink: 1, textAlign: 'right' },
  panelValueStrong: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(15), color: '#1a1c1c', flexShrink: 1, textAlign: 'right' },
  revealHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: RFValue(10),
    color: '#1a1c1c',
    opacity: 0.45,
    textAlign: 'right',
    paddingBottom: moderateScale(10),
  },
  viewDocBtn: {
    marginTop: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  viewDocBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13), color: '#ffffff' },
  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: roundness.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  addCtaTitle: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(15) },
  addCtaSub: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginTop: moderateScale(2) },
  addCtaChevron: { fontFamily: 'Inter_400Regular', fontSize: RFValue(20) },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: RFValue(14), marginBottom: moderateScale(12) },
  verifyCard: { borderRadius: moderateScale(20), borderWidth: 1, padding: spacing.lg },
  verifyHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), marginBottom: moderateScale(10) },
  verifyIconWrap: { width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(16), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  verifyAuthority: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13), flex: 1 },
  verifyDesc: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), lineHeight: RFValue(18) },
  verifyBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8), marginTop: moderateScale(16) },
  verifyBtn: { flexGrow: 1, paddingVertical: moderateScale(12), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(14), alignItems: 'center' },
  verifyBtnText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(12) },
  verifyNote: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), marginTop: moderateScale(12), lineHeight: RFValue(16) },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), lineHeight: RFValue(16), marginTop: spacing.lg, textAlign: 'center' },
  emptyState: { padding: moderateScale(100), alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(13) },
  imageBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', padding: spacing.lg },
  fullImage: { flex: 1, width: '100%' },
  imageCloseWrap: { paddingTop: spacing.lg },
});
