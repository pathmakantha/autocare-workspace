import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, roundness, spacing, typography } from '@/utils/theme';

interface Props extends TextInputProps {
  label?: string;
}

export default function CustomInput({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.outline}
        style={[styles.input, style]}
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
    color: colors.text,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    width: '100%',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    backgroundColor: colors.surfaceLow,
    borderRadius: roundness.md,
    padding: spacing.md,
    color: colors.text,
  },
});
