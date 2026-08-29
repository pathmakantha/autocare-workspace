import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'outline' | 'muted' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function CustomButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const { colors } = useTheme();

  const variantStyle: ViewStyle = {
    primary: { backgroundColor: colors.primaryBtn },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.white },
    muted: { backgroundColor: colors.surfaceLow },
    danger: { backgroundColor: colors.error },
  }[variant];

  const textColor = {
    primary: colors.onBrand,
    outline: colors.white,
    muted: colors.primary,
    danger: colors.onBrand,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        style,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: roundness.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
