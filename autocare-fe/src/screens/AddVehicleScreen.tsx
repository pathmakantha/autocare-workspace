import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addVehicleLocal, createVehicle, updateVehicle, updateVehicleLocal } from '@/redux/slices/vehicleSlice';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';
import { VehicleFormData, VehiclePayload } from '@/types/vehicle';
import { generateLocalId } from '@/utils/localId';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddVehicle'>;
type R = RouteProp<RootStackParamList, 'AddVehicle'>;

const emptyForm: VehicleFormData = {
  name: '',
  registrationNumber: '',
  vehicleType: '',
  brand: '',
  model: '',
  year: '',
  mileage: '',
  licenseExpiry: '',
  insuranceExpiry: '',
  emissionTestExpiry: '',
  serviceReminderDate: '',
};

export default function AddVehicleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { colors, shadows } = useTheme();
  const t = useTranslation();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const editingVehicleId = route.params?.vehicleId ?? null;
  const editingVehicle = editingVehicleId ? vehicles.find((v) => v.id === editingVehicleId) : null;

  const [form, setForm] = useState<VehicleFormData>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setForm({
        name: editingVehicle.name,
        registrationNumber: editingVehicle.registrationNumber,
        vehicleType: editingVehicle.vehicleType,
        brand: editingVehicle.brand,
        model: editingVehicle.model,
        year: String(editingVehicle.year),
        mileage: editingVehicle.mileage?.toString() || '',
        licenseExpiry: editingVehicle.licenseExpiry,
        insuranceExpiry: editingVehicle.insuranceExpiry,
        emissionTestExpiry: editingVehicle.emissionTestExpiry,
        serviceReminderDate: editingVehicle.serviceReminderDate,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingVehicleId]);

  const setField = (field: keyof VehicleFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.registrationNumber || !form.vehicleType) {
      setError(t.fillRequired);
      return;
    }
    if (isGuest && vehicles.length >= 1 && !editingVehicleId) {
      setError(t.guestLimit);
      return;
    }
    const payload: VehiclePayload = {
      name: form.name,
      registrationNumber: form.registrationNumber,
      vehicleType: form.vehicleType,
      brand: form.brand,
      model: form.model,
      year: parseInt(form.year, 10) || new Date().getFullYear(),
      mileage: parseInt(form.mileage, 10) || 0,
      licenseExpiry: form.licenseExpiry,
      insuranceExpiry: form.insuranceExpiry,
      emissionTestExpiry: form.emissionTestExpiry,
      serviceReminderDate: form.serviceReminderDate,
    };

    setError('');
    setSaving(true);
    try {
      if (isGuest) {
        // Guest mode has no backend account — keep everything local (persisted to AsyncStorage).
        if (editingVehicleId) {
          dispatch(updateVehicleLocal({ id: editingVehicleId, ...payload }));
        } else {
          dispatch(addVehicleLocal({ id: generateLocalId('v'), ...payload }));
        }
      } else if (editingVehicleId) {
        await dispatch(updateVehicle({ id: editingVehicleId, ...payload })).unwrap();
      } else {
        await dispatch(createVehicle(payload)).unwrap();
      }
      navigation.goBack();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not save vehicle. Please try again.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {editingVehicleId ? t.editVehicleT : t.addVehicleT}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>{t.basicInfo}</Text>
          <CustomInput label={t.vehicleName} placeholder={t.vehicleNamePh} value={form.name} onChangeText={(v) => setField('name', v)} />
          <CustomInput label={t.regNumber} placeholder="e.g. ABC-1234" value={form.registrationNumber} onChangeText={(v) => setField('registrationNumber', v)} />
          <CustomInput label={t.vehicleType} placeholder={t.typePh} value={form.vehicleType} onChangeText={(v) => setField('vehicleType', v)} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>{t.modelDetails}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <CustomInput label={t.brand} placeholder="Toyota" value={form.brand} onChangeText={(v) => setField('brand', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput label={t.model} placeholder="Camry" value={form.model} onChangeText={(v) => setField('model', v)} />
            </View>
          </View>
          <CustomInput label={t.year} placeholder="2023" value={form.year} onChangeText={(v) => setField('year', v)} keyboardType="numeric" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>{t.odometer}</Text>
          <CustomInput label={t.currentMileage} placeholder="e.g. 32000" value={form.mileage} onChangeText={(v) => setField('mileage', v)} keyboardType="numeric" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>{t.expiryDates}</Text>
          <CustomInput label={t.licenseExpiry} placeholder="2027-12-31" value={form.licenseExpiry} onChangeText={(v) => setField('licenseExpiry', v)} />
          <CustomInput label={t.insuranceExpiry} placeholder="2027-12-31" value={form.insuranceExpiry} onChangeText={(v) => setField('insuranceExpiry', v)} />
          <CustomInput label={t.emissionTest} placeholder="2027-12-31" value={form.emissionTestExpiry} onChangeText={(v) => setField('emissionTestExpiry', v)} />
          <CustomInput label={t.serviceReminder} placeholder="2027-06-30" value={form.serviceReminderDate} onChangeText={(v) => setField('serviceReminderDate', v)} />
        </View>

        {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <CustomButton label={t.saveMachine} onPress={handleSave} loading={saving} disabled={saving} />
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
  back: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 20 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  card: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: 10 },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginBottom: spacing.md },
});
