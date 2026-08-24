import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, roundness, shadows, spacing } from '@/utils/theme';

export type CardStatus = 'ok' | 'warning' | 'error';

interface Props {
  name: string;
  registrationNumber: string;
  brandModel: string;
  status: CardStatus;
  statusText: string;
  statusColor: string;
  statusBg: string;
  mileage?: number;
  onPress?: () => void;
}

export default function VehicleCard({
  name,
  registrationNumber,
  brandModel,
  statusText,
  statusColor,
  statusBg,
  mileage,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.reg}>{registrationNumber}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.brandModel}>{brandModel}</Text>
        {mileage != null ? (
          <Text style={styles.mileage}>{mileage.toLocaleString()} mi</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    borderColor: colors.surfaceLow,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: { fontFamily: 'Manrope_600SemiBold', fontSize: 24, color: colors.text },
  reg: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.outline, letterSpacing: 1.2 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: roundness.xl },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, textTransform: 'uppercase' },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLow,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandModel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.secondary },
  mileage: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline },
});
