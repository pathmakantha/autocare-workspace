import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { roundness, spacing } from '@/utils/theme';
import { useTheme } from '@/hooks/useTheme';

interface Props extends TextInputProps {
  label?: string;
}

export default function CustomInput({ label, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.outline}
        style={[styles.input, { backgroundColor: colors.surfaceLow, color: colors.text }, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    width: '100%',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    borderRadius: roundness.md,
    padding: spacing.md,
  },
});
