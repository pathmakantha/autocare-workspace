import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '@/components/CustomInput';
import VehicleCard from '@/components/VehicleCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { deleteVehicle, removeVehicleLocal } from '@/redux/slices/vehicleSlice';
import { removeRecordsForVehicleLocal } from '@/redux/slices/maintenanceSlice';
import { getVehicleStatus } from '@/utils/vehicleStatus';
import { spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function VehicleListScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const t = useTranslation();
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

  const emptyText = vehicles.length === 0 ? t.noVehiclesFound : t.noMatch;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>{t.yourFleet}</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primaryBtn }]} onPress={() => navigation.navigate('AddVehicle')}>
          <Text style={[styles.addBtnText, { color: colors.onBrand }]}>{t.add}</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <CustomInput placeholder={t.searchPh} value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.outline }]}>{emptyText}</Text>
          </View>
        }
        renderItem={({ item: v }) => {
          const st = getVehicleStatus(v, colors, t);
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
                  style={[styles.editLink, { color: colors.primary }]}
                  onPress={() => navigation.navigate('AddVehicle', { vehicleId: v.id })}
                >
                  {t.editDetails}
                </Text>
                {confirming ? (
                  <>
                    <Text style={[styles.cancelLink, { color: colors.outline }]} onPress={() => setDeleteConfirmId(null)}>
                      {t.cancel}
                    </Text>
                    <Text style={[styles.confirmLink, { color: colors.error }]} onPress={() => handleDelete(v.id)}>
                      {deletingId === v.id ? '...' : t.confirmRemove}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.removeLink, { color: colors.error }]} onPress={() => setDeleteConfirmId(v.id)}>
                    {t.removeMachine}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 24 },
  addBtn: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
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
  editLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  cancelLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  confirmLink: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  removeLink: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  emptyState: { padding: 100, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});
