import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addRecordLocal, createRecord, deleteRecord, fetchRecords, removeRecordLocal } from '@/redux/slices/maintenanceSlice';
import { colors, roundness, shadows, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';
import { generateLocalId } from '@/utils/localId';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Maintenance'>;
type R = RouteProp<RootStackParamList, 'Maintenance'>;

export default function MaintenanceHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const dispatch = useAppDispatch();
  const { vehicleId } = route.params;

  const vehicle = useAppSelector((s) => s.vehicles.vehicles.find((v) => v.id === vehicleId));
  const allRecords = useAppSelector((s) => s.maintenance.records);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const recordsStatus = useAppSelector((s) => s.maintenance.status);

  useEffect(() => {
    if (!isGuest) dispatch(fetchRecords(vehicleId));
  }, [dispatch, vehicleId, isGuest]);

  const records = useMemo(
    () =>
      allRecords
        .filter((r) => r.vehicleId === vehicleId)
        .slice()
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()),
    [allRecords, vehicleId]
  );

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const total = records.reduce((sum, r) => sum + r.cost, 0);
    return {
      total: total.toFixed(2),
      count: records.length,
      avg: (total / records.length).toFixed(2),
    };
  }, [records]);

  const [modalVisible, setModalVisible] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openModal = () => {
    setServiceType('');
    setServiceDate(new Date().toISOString().split('T')[0]);
    setMileage('');
    setCost('');
    setNotes('');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!serviceType || !mileage || !cost) {
      setFormError('Please fill all required fields');
      return;
    }
    const payload = {
      serviceType,
      serviceDate,
      mileage: parseInt(mileage, 10) || 0,
      cost: parseFloat(cost) || 0,
      notes,
    };
    setFormError('');
    setSaving(true);
    try {
      if (isGuest) {
        dispatch(addRecordLocal({ id: generateLocalId('r'), vehicleId, ...payload }));
      } else {
        await dispatch(createRecord({ vehicleId, ...payload })).unwrap();
      }
      setModalVisible(false);
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Could not save record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    setDeletingId(recordId);
    try {
      if (isGuest) {
        dispatch(removeRecordLocal(recordId));
      } else {
        await dispatch(deleteRecord({ vehicleId, id: recordId })).unwrap();
      }
    } catch {
      // leave the record in place; user can retry
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.headerTitle}>{vehicle?.name ?? 'Vehicle'}</Text>
        <Pressable style={styles.addBtn} onPress={openModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>${stats.total}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>${stats.avg}</Text>
            <Text style={styles.statLabel}>Avg Cost</Text>
          </View>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {recordsStatus === 'loading' ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.emptyText}>No service records yet.</Text>
            )}
          </View>
        }
        renderItem={({ item: r }) => (
          <View style={styles.recordCard}>
            <View style={styles.recordRow}>
              <Text style={styles.recordType}>{r.serviceType}</Text>
              <Text style={styles.recordCost}>${r.cost.toFixed(2)}</Text>
            </View>
            <View style={styles.recordRow}>
              <Text style={styles.recordMeta}>{r.serviceDate}</Text>
              <Text style={styles.recordMeta}>{r.mileage.toLocaleString()} mi</Text>
            </View>
            {!!r.notes && <Text style={styles.recordNotes}>{r.notes}</Text>}
            <Text style={styles.deleteLink} onPress={() => handleDelete(r.id)}>
              {deletingId === r.id ? 'Removing...' : 'Delete'}
            </Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Service Record</Text>
            <CustomInput label="Service Type" placeholder="e.g. Oil Change" value={serviceType} onChangeText={setServiceType} />
            <CustomInput label="Service Date" placeholder="YYYY-MM-DD" value={serviceDate} onChangeText={setServiceDate} />
            <CustomInput label="Mileage" placeholder="e.g. 5000" value={mileage} onChangeText={setMileage} keyboardType="numeric" />
            <CustomInput label="Cost ($)" placeholder="e.g. 50.00" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
            <CustomInput label="Notes (Optional)" placeholder="Additional details..." value={notes} onChangeText={setNotes} />
            {!!formError && <Text style={styles.error}>{formError}</Text>}
            <View style={styles.modalActions}>
              <CustomButton label="Cancel" onPress={() => setModalVisible(false)} variant="muted" style={{ flex: 1 }} disabled={saving} />
              <CustomButton label="Save" onPress={handleSave} style={{ flex: 1 }} loading={saving} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  back: { fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.primary },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: colors.primary },
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.white },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.lg, paddingBottom: 20 },
  statChip: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14, alignItems: 'center', ...shadows.soft },
  statValue: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.primary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.outline, marginTop: 2 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  recordCard: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: roundness.xl, marginBottom: spacing.md, ...shadows.soft },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  recordType: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.primary },
  recordCost: { fontFamily: 'Inter_400Regular', fontSize: 18, color: colors.secondary },
  recordMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline },
  recordNotes: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.text, fontStyle: 'italic', marginTop: spacing.sm },
  deleteLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.error, textAlign: 'right', marginTop: spacing.sm },
  emptyState: { padding: 100, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '85%' },
  modalTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
