import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { colors, shadows } = useTheme();
  const t = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.reg, { color: colors.outline }]}>{registrationNumber}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>
      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.brandModel, { color: colors.secondary }]}>{brandModel}</Text>
        {mileage != null ? (
          <Text style={[styles.mileage, { color: colors.outline }]}>
            {mileage.toLocaleString()} {t.mi}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: roundness.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: { fontFamily: 'Manrope_600SemiBold', fontSize: 24 },
  reg: { fontFamily: 'Inter_400Regular', fontSize: 14, letterSpacing: 1.2 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: roundness.xl },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, textTransform: 'uppercase' },
  footerRow: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandModel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  mileage: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});
