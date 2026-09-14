import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { deleteDocument, fetchDocuments, removeDocumentLocal, updateDocument, updateDocumentLocal } from '@/redux/slices/documentsSlice';
import { DocumentType, VehicleDocument } from '@/types/document';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Documents'>;
type R = RouteProp<RootStackParamList, 'Documents'>;

const FILTERS: (DocumentType | 'ALL')[] = ['ALL', 'INSURANCE', 'LICENSE', 'REGISTRATION', 'EMISSION', 'OTHER'];

function typeLabel(t: ReturnType<typeof useTranslation>, type: DocumentType) {
  return {
    INSURANCE: t.docTypeInsurance,
    LICENSE: t.docTypeLicense,
    REGISTRATION: t.docTypeRegistration,
    EMISSION: t.docTypeEmission,
    OTHER: t.docTypeOther,
  }[type];
}

// Types with no natural expiry (registration paperwork, misc receipts) are reference-only —
// they get the neutral "On File" badge instead of a health status.
const HAS_EXPIRY: Record<DocumentType, boolean> = {
  INSURANCE: true,
  LICENSE: true,
  EMISSION: true,
  REGISTRATION: false,
  OTHER: false,
};

function DocIcon({ type, color, size = 20 }: { type: DocumentType; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'INSURANCE') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" {...stroke} />
      </Svg>
    );
  }
  if (type === 'LICENSE') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
        <Circle cx="8.5" cy="12" r="2" {...stroke} />
        <Path d="M13 10h5M13 14h3" {...stroke} />
      </Svg>
    );
  }
  if (type === 'EMISSION') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z" {...stroke} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4h6v3H9z" {...stroke} />
      <Rect x="6" y="6" width="12" height="15" rx="1.5" {...stroke} />
      <Path d="M9 11h6M9 14h6M9 17h4" {...stroke} />
    </Svg>
  );
}

export default function DocumentVaultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const { vehicleId } = route.params;

  const vehicle = useAppSelector((s) => s.vehicles.vehicles.find((v) => v.id === vehicleId));
  const allDocuments = useAppSelector((s) => s.documents.documents);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const docsStatus = useAppSelector((s) => s.documents.status);

  const [filter, setFilter] = useState<(DocumentType | 'ALL')>('ALL');
  const [editing, setEditing] = useState<VehicleDocument | null>(null);
  const [expiry, setExpiry] = useState('');
  const [issuer, setIssuer] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isGuest) dispatch(fetchDocuments(vehicleId));
  }, [dispatch, vehicleId, isGuest]);

  const documents = useMemo(() => {
    const forVehicle = allDocuments.filter((d) => d.vehicleId === vehicleId);
    return filter === 'ALL' ? forVehicle : forVehicle.filter((d) => d.type === filter);
  }, [allDocuments, vehicleId, filter]);

  const openEdit = (doc: VehicleDocument) => {
    setEditing(doc);
    setExpiry(doc.extractedExpiry || '');
    setIssuer(doc.extractedIssuer || '');
    setReferenceNumber(doc.referenceNumber || '');
    setNotes(doc.notes || '');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      expiry: expiry || null,
      issuer: issuer || null,
      referenceNumber: referenceNumber || null,
      notes: notes || null,
    };
    try {
      if (isGuest) {
        dispatch(updateDocumentLocal({ ...editing, extractedExpiry: payload.expiry, extractedIssuer: payload.issuer, referenceNumber: payload.referenceNumber, notes: payload.notes }));
      } else {
        await dispatch(updateDocument({ vehicleId, id: editing.id, ...payload })).unwrap();
      }
      setEditing(null);
    } catch {
      // leave the modal open; user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (isGuest) {
        dispatch(removeDocumentLocal(id));
      } else {
        await dispatch(deleteDocument({ vehicleId, id })).unwrap();
      }
      setEditing(null);
    } catch {
      // leave the document in place; user can retry
    } finally {
      setDeletingId(null);
    }
  };

  const badgeFor = (doc: VehicleDocument) => {
    if (!HAS_EXPIRY[doc.type] || !doc.extractedExpiry) {
      return { label: t.onFile, color: colors.text, bg: colors.outline + '40' };
    }
    const days = Math.ceil((new Date(doc.extractedExpiry).getTime() - Date.now()) / 86400000);
    if (days <= 7) return { label: t.urgent.toUpperCase(), color: colors.error, bg: colors.error + '20' };
    if (days <= 30) return { label: t.dueSoon.toUpperCase(), color: colors.warning, bg: colors.warning + '20' };
    return { label: t.healthy.toUpperCase(), color: colors.success, bg: colors.success + '20' };
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.documents}</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primaryBtn }]}
          onPress={() => navigation.navigate('AddDocument', { vehicleId })}
        >
          <Text style={[styles.addBtnText, { color: colors.onBrand }]}>{t.add}</Text>
        </Pressable>
      </View>
      {vehicle && (
        <Text style={[styles.subhead, { color: colors.outline }]}>
          {vehicle.name.toUpperCase()} &middot; {vehicle.registrationNumber}
        </Text>
      )}

      <Pressable
        style={[styles.insuranceLink, { backgroundColor: colors.surfaceLow }]}
        onPress={() => navigation.navigate('InsuranceCard', { vehicleId })}
      >
        <Text style={[styles.insuranceLinkText, { color: colors.primary }]}>{t.insuranceCard}</Text>
        <Text style={[styles.insuranceLinkChevron, { color: colors.outline }]}>›</Text>
      </Pressable>

      <View style={styles.chipsRow}>
        {FILTERS.map((f) => {
          const active = f === filter;
          const label = f === 'ALL' ? t.filterAll : typeLabel(t, f);
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, { backgroundColor: active ? colors.primaryContainer : colors.surfaceLow }]}
            >
              <Text style={[styles.chipText, { color: active ? colors.onBrand : colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={documents}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {docsStatus === 'loading' ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.emptyText, { color: colors.outline }]}>{t.noDocuments}</Text>
            )}
          </View>
        }
        renderItem={({ item: d }) => {
          const badge = badgeFor(d);
          return (
            <Pressable
              onPress={() => openEdit(d)}
              style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
            >
              <View style={styles.docRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '20' }]}>
                  <DocIcon type={d.type} color={colors.secondary} />
                </View>
                <View style={styles.docBody}>
                  <Text style={[styles.docType, { color: colors.text }]}>{typeLabel(t, d.type)}</Text>
                  <Text style={[styles.docMeta, { color: colors.outline }]} numberOfLines={1}>
                    {[d.extractedIssuer, d.referenceNumber].filter(Boolean).join(' · ') || d.createdAt}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
              <View style={[styles.docFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.expiryText, { color: colors.outline }]}>
                  {d.extractedExpiry ? `${t.expires} ${d.extractedExpiry}` : t.noExpiryRef}
                </Text>
                <Text style={[styles.viewLink, { color: colors.secondary }]}>{t.view} ›</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={[styles.scanCta, { backgroundColor: colors.surfaceLow }]}
        onPress={() => navigation.navigate('AddDocument', { vehicleId })}
      >
        <View style={[styles.scanIconWrap, { backgroundColor: colors.primaryContainer + '20' }]}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 8a2 2 0 0 1 2-2h1.2l.8-1.4A1 1 0 0 1 8.86 4h6.28a1 1 0 0 1 .86.6L16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"
              stroke={colors.primaryContainer}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="13" r="3.4" stroke={colors.primaryContainer} strokeWidth={1.8} />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.scanTitle, { color: colors.primary }]}>{t.scanDocument}</Text>
          <Text style={[styles.scanSub, { color: colors.outline }]}>{t.scanDocumentDesc}</Text>
        </View>
      </Pressable>

      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editing ? typeLabel(t, editing.type) : ''}
            </Text>
            <CustomInput label={t.expiryDate} placeholder="YYYY-MM-DD" value={expiry} onChangeText={setExpiry} />
            <CustomInput label={t.referenceNumber} value={referenceNumber} onChangeText={setReferenceNumber} />
            <CustomInput label={t.issuer} value={issuer} onChangeText={setIssuer} />
            <CustomInput label={t.notes} placeholder={t.notesPh} value={notes} onChangeText={setNotes} />
            <View style={styles.modalActions}>
              <CustomButton label={t.cancel} onPress={() => setEditing(null)} variant="muted" style={{ flex: 1 }} disabled={saving} />
              <CustomButton label={t.save} onPress={handleSave} style={{ flex: 1 }} loading={saving} disabled={saving} />
            </View>
            {editing && (
              <Text
                style={[styles.deleteLink, { color: colors.error }]}
                onPress={() => handleDelete(editing.id)}
              >
                {deletingId === editing.id ? '...' : 'Delete'}
              </Text>
            )}
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
    paddingBottom: moderateScale(4),
  },
  back: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(14) },
  headerTitle: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(18) },
  addBtn: { borderRadius: moderateScale(20), paddingVertical: moderateScale(9), paddingHorizontal: moderateScale(18) },
  addBtnText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(13) },
  subhead: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, fontFamily: 'Inter_400Regular', fontSize: RFValue(13), letterSpacing: 0.3 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  insuranceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: roundness.lg,
    paddingVertical: moderateScale(12),
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  insuranceLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(13) },
  insuranceLinkChevron: { fontFamily: 'Inter_400Regular', fontSize: RFValue(18) },
  chip: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20) },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  docCard: { padding: spacing.md, borderRadius: roundness.xl, borderWidth: 1, marginBottom: spacing.md },
  docRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconCircle: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), alignItems: 'center', justifyContent: 'center' },
  docBody: { flex: 1 },
  docType: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(15) },
  docMeta: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginTop: moderateScale(2) },
  badge: { paddingVertical: moderateScale(4), paddingHorizontal: moderateScale(9), borderRadius: moderateScale(20) },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: RFValue(10), letterSpacing: 0.5, textTransform: 'uppercase' },
  docFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.sm },
  expiryText: { fontFamily: 'Inter_500Medium', fontSize: RFValue(12) },
  viewLink: { fontFamily: 'Inter_700Bold', fontSize: RFValue(12) },
  emptyState: { padding: moderateScale(80), alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: RFValue(14) },
  scanCta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: roundness.xl, padding: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.xl },
  scanIconWrap: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontFamily: 'Manrope_700Bold', fontSize: RFValue(15) },
  scanSub: { fontFamily: 'Inter_400Regular', fontSize: RFValue(12), marginTop: moderateScale(2), lineHeight: RFValue(17) },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), padding: spacing.lg, maxHeight: '85%' },
  modalTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(20), textAlign: 'center', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  deleteLink: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12), textAlign: 'center', marginTop: spacing.lg },
});
