import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import VehicleCard from '@/components/VehicleCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { deleteVehicle, removeVehicleLocal } from '@/redux/slices/vehicleSlice';
import { removeRecordsForVehicleLocal } from '@/redux/slices/maintenanceSlice';
import { getVehicleStatus } from '@/utils/vehicleStatus';
import { colors, spacing } from '@/utils/theme';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function VehicleListScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector((s) => s.vehicles.vehicles);
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (isGuest) {
        dispatch(removeVehicleLocal(id));
      } else {
        await dispatch(deleteVehicle(id)).unwrap();
      }
      dispatch(removeRecordsForVehicleLocal(id));
    } catch {
      // leave the vehicle in place; user can retry
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const emptyText =
    vehicles.length === 0 ? 'No vehicles found.' : 'No vehicles match your search.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Fleet</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddVehicle')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <CustomInput
          placeholder="Search by name, plate, or brand"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        }
        renderItem={({ item: v }) => {
          const st = getVehicleStatus(v);
          const confirming = deleteConfirmId === v.id;
          return (
            <View style={styles.cardBlock}>
              <VehicleCard
                name={v.name}
                registrationNumber={v.registrationNumber}
                brandModel={`${v.brand} ${v.model}`}
                status={st.status}
                statusText={st.label}
                statusColor={st.color}
                statusBg={st.bg}
                mileage={v.mileage}
                onPress={() => navigation.navigate('Maintenance', { vehicleId: v.id })}
              />
              <View style={styles.actionsRow}>
                <Text
                  style={styles.editLink}
                  onPress={() => navigation.navigate('AddVehicle', { vehicleId: v.id })}
                >
                  Edit Details
                </Text>
                {confirming ? (
                  <>
                    <Text style={styles.cancelLink} onPress={() => setDeleteConfirmId(null)}>
                      Cancel
                    </Text>
                    <Text style={styles.confirmLink} onPress={() => handleDelete(v.id)}>
                      {deletingId === v.id ? 'Removing...' : 'Confirm Remove'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.removeLink} onPress={() => setDeleteConfirmId(v.id)}>
                    Remove Machine
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, color: colors.primary },
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.white },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  cardBlock: { marginBottom: spacing.lg },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: -8,
    paddingRight: 8,
    paddingTop: 8,
  },
  editLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.primary },
  cancelLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.outline },
  confirmLink: { fontFamily: 'Inter_700Bold', fontSize: 11, color: colors.error },
  removeLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.error },
  emptyState: { padding: 100, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline },
});
