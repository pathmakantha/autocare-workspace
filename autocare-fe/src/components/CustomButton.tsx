import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, roundness, spacing, typography } from '@/utils/theme';

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
  const variantStyle = styles[variant];
  const textVariantStyle = textStyles[variant];
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
        <ActivityIndicator color={variant === 'outline' || variant === 'muted' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, textVariantStyle]}>{label}</Text>
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
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.white },
  muted: { backgroundColor: colors.surfaceLow },
  danger: { backgroundColor: colors.error },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.white },
  outline: { color: colors.white },
  muted: { color: colors.primary },
  danger: { color: colors.white },
});
