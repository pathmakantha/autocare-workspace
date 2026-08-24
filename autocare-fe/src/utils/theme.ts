// Design tokens extracted from the AutoCare design handoff (AutoCare.dc.html).
// Treat every value here as final / ground truth for styling across the app.

export const colors = {
  primary: '#000666',
  primaryDark: '#1a237e',
  secondary: '#4858ab',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#ba1a1a',
  outline: '#c6c5d4',
  surface: '#ffffff',
  surfaceLow: '#f3f3f3',
  background: '#f9f9f9',
  text: '#1a1c1c',
  white: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const roundness = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadows = {
  soft: {
    shadowColor: '#1a1c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  },
};

export const typography = {
  headline: { fontFamily: 'Manrope_700Bold', fontSize: 28, color: colors.primary },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: colors.text },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.text },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.text },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.outline },
};

const theme = { colors, spacing, roundness, shadows, typography };
export default theme;
