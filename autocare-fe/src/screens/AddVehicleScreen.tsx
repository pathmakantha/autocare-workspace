import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addVehicleLocal, createVehicle, updateVehicle, updateVehicleLocal } from '@/redux/slices/vehicleSlice';
import { colors, roundness, shadows, spacing } from '@/utils/theme';
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
      setError('Please fill all required fields');
      return;
    }
    if (isGuest && vehicles.length >= 1 && !editingVehicleId) {
      setError('Guest mode only allows 1 vehicle. Please login to add more.');
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.headerTitle}>{editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Info</Text>
          <CustomInput label="Vehicle Name" placeholder="e.g. My Daily Car" value={form.name} onChangeText={(t) => setField('name', t)} />
          <CustomInput label="Registration Number" placeholder="e.g. ABC-1234" value={form.registrationNumber} onChangeText={(t) => setField('registrationNumber', t)} />
          <CustomInput label="Vehicle Type" placeholder="e.g. Sedan, SUV, Bike" value={form.vehicleType} onChangeText={(t) => setField('vehicleType', t)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Model Details</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <CustomInput label="Brand" placeholder="Toyota" value={form.brand} onChangeText={(t) => setField('brand', t)} />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput label="Model" placeholder="Camry" value={form.model} onChangeText={(t) => setField('model', t)} />
            </View>
          </View>
          <CustomInput label="Year" placeholder="2023" value={form.year} onChangeText={(t) => setField('year', t)} keyboardType="numeric" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Odometer</Text>
          <CustomInput label="Current Mileage" placeholder="e.g. 32000" value={form.mileage} onChangeText={(t) => setField('mileage', t)} keyboardType="numeric" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expiry Dates (YYYY-MM-DD)</Text>
          <CustomInput label="License Expiry" placeholder="2024-12-31" value={form.licenseExpiry} onChangeText={(t) => setField('licenseExpiry', t)} />
          <CustomInput label="Insurance Expiry" placeholder="2024-12-31" value={form.insuranceExpiry} onChangeText={(t) => setField('insuranceExpiry', t)} />
          <CustomInput label="Emission Test Expiry" placeholder="2024-12-31" value={form.emissionTestExpiry} onChangeText={(t) => setField('emissionTestExpiry', t)} />
          <CustomInput label="Service Reminder" placeholder="2024-06-30" value={form.serviceReminderDate} onChangeText={(t) => setField('serviceReminderDate', t)} />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <CustomButton label="Save Machine" onPress={handleSave} loading={saving} disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  back: { fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.primary },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    borderColor: colors.surfaceLow,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.primary, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: 10 },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
});
