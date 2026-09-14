import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path } from 'react-native-svg';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addDocumentLocal, createDocument } from '@/redux/slices/documentsSlice';
import { DocumentType, VehicleDocument } from '@/types/document';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { generateLocalId } from '@/utils/localId';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddDocument'>;
type R = RouteProp<RootStackParamList, 'AddDocument'>;

const TYPES: DocumentType[] = ['INSURANCE', 'LICENSE', 'REGISTRATION', 'EMISSION', 'OTHER'];

interface CapturedPhoto {
  uri: string;
  base64: string;
  mimeType: string;
}

export default function AddDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
  const { vehicleId } = route.params;
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const [type, setType] = useState<DocumentType>('INSURANCE');
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [expiry, setExpiry] = useState('');
  const [issuer, setIssuer] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function typeLabel(dt: DocumentType) {
    return {
      INSURANCE: t.docTypeInsurance,
      LICENSE: t.docTypeLicense,
      REGISTRATION: t.docTypeRegistration,
      EMISSION: t.docTypeEmission,
      OTHER: t.docTypeOther,
    }[dt];
  }

  // There is no OCR provider wired up yet (see src/utils/ocr.ts on the backend — it's a
  // deliberate no-op stub for now), so this screen never claims to "read" the document.
  // It's an honest manual-entry form with an optional attached photo for the record.
  async function capture(fromLibrary: boolean) {
    const perm = fromLibrary
      ? await ImagePicker.requestMediaLibraryPermissionsAsync()
      : await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setFormError(t.cameraPermissionDenied);
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      base64: true,
      quality: 0.6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    };
    const result = fromLibrary
      ? await ImagePicker.launchImageLibraryAsync(options)
      : await ImagePicker.launchCameraAsync(options);
    if (!result.canceled && result.assets?.[0]?.base64) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, base64: asset.base64!, mimeType: asset.mimeType || 'image/jpeg' });
      setFormError('');
    }
  }

  const handleSave = async () => {
    if (!photo) {
      setFormError(t.fillRequired);
      return;
    }
    setFormError('');
    setSaving(true);
    const fileData = `data:${photo.mimeType};base64,${photo.base64}`;
    try {
      if (isGuest) {
        const doc: VehicleDocument = {
          id: generateLocalId('doc'),
          vehicleId,
          type,
          mimeType: photo.mimeType,
          extractedExpiry: expiry || null,
          extractedIssuer: issuer || null,
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          createdAt: new Date().toISOString(),
          fileData,
        };
        dispatch(addDocumentLocal(doc));
      } else {
        await dispatch(
          createDocument({
            vehicleId,
            type,
            fileData,
            mimeType: photo.mimeType,
            expiry: expiry || null,
            issuer: issuer || null,
            referenceNumber: referenceNumber || null,
            notes: notes || null,
          })
        ).unwrap();
      }
      navigation.goBack();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Could not save document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.back, { color: colors.primary }]} onPress={() => navigation.goBack()}>
          {t.back}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t.addDocumentT}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {photo ? (
          <View style={styles.photoWrap}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t.capturedPhoto}</Text>
            <Image source={{ uri: photo.uri }} style={[styles.photoPreview, { borderColor: colors.border }]} />
            <Pressable style={[styles.retakeBtn, { backgroundColor: colors.surfaceLow }]} onPress={() => capture(false)}>
              <Text style={[styles.retakeText, { color: colors.primary }]}>{t.retakePhoto}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceLow, borderColor: colors.border }]}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 8a2 2 0 0 1 2-2h1.2l.8-1.4A1 1 0 0 1 8.86 4h6.28a1 1 0 0 1 .86.6L16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"
                stroke={colors.outline}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="12" cy="13" r="3.2" stroke={colors.outline} strokeWidth={1.6} />
            </Svg>
            <View style={styles.photoBtnRow}>
              <CustomButton label={t.takePhoto} onPress={() => capture(false)} variant="muted" style={{ flex: 1 }} />
              <CustomButton label={t.chooseFromLibrary} onPress={() => capture(true)} variant="muted" style={{ flex: 1 }} />
            </View>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t.documentType}</Text>
        <View style={styles.chipsRow}>
          {TYPES.map((dt) => {
            const active = dt === type;
            return (
              <Pressable
                key={dt}
                onPress={() => setType(dt)}
                style={[styles.chip, { backgroundColor: active ? colors.primaryContainer : colors.surfaceLow }]}
              >
                <Text style={[styles.chipText, { color: active ? colors.onBrand : colors.text }]}>{typeLabel(dt)}</Text>
              </Pressable>
            );
          })}
        </View>

        <CustomInput label={t.expiryDate} placeholder="YYYY-MM-DD" value={expiry} onChangeText={setExpiry} />
        <CustomInput label={t.referenceNumber} value={referenceNumber} onChangeText={setReferenceNumber} />
        <CustomInput label={t.issuer} value={issuer} onChangeText={setIssuer} />
        <CustomInput label={t.notes} placeholder={t.notesPh} value={notes} onChangeText={setNotes} />

        {!!formError && <Text style={[styles.error, { color: colors.error }]}>{formError}</Text>}

        <CustomButton label={t.saveDocument} onPress={handleSave} loading={saving} disabled={saving} />
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
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: RFValue(18) },
  headerSpacer: { width: moderateScale(40) },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  photoPlaceholder: {
    borderRadius: roundness.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, width: '100%' },
  photoWrap: { marginBottom: spacing.lg },
  photoPreview: { width: '100%', height: moderateScale(200), borderRadius: roundness.lg, borderWidth: 1, marginTop: spacing.xs },
  retakeBtn: { alignSelf: 'center', borderRadius: moderateScale(20), paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(16), marginTop: spacing.sm },
  retakeText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: RFValue(12), marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(14), borderRadius: moderateScale(20) },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: RFValue(12) },
  error: { fontFamily: 'Inter_400Regular', fontSize: RFValue(11), textAlign: 'center', marginBottom: spacing.md },
});
