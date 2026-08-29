// Design tokens extracted from the AutoCare design handoff (AutoCare.dc.html).
// Treat every value here as final / ground truth for styling across the app.
// Colors are theme-aware (light/dark) — use the useTheme() hook to read the
// active palette rather than importing a static `colors` object.

export interface ThemeColors {
  primary: string;
  primaryBtn: string;
  primaryContainer: string;
  secondary: string;
  success: string;
  warning: string;
  warningTint: string;
  error: string;
  outline: string;
  surface: string;
  surfaceLow: string;
  background: string;
  pageBg: string;
  text: string;
  white: string;
  border: string;
  brandDeep: string;
  onBrand: string;
}

export const lightColors: ThemeColors = {
  primary: '#000666',
  primaryBtn: '#000666',
  primaryContainer: '#1a237e',
  secondary: '#4858ab',
  success: '#2e7d32',
  warning: '#ed6c02',
  warningTint: '#fff3e0',
  error: '#ba1a1a',
  outline: '#c6c5d4',
  surface: '#ffffff',
  surfaceLow: '#f3f3f3',
  background: '#f9f9f9',
  pageBg: '#eef0f3',
  text: '#1a1c1c',
  white: '#ffffff',
  border: '#f3f3f3',
  brandDeep: '#000666',
  onBrand: '#ffffff',
};

export const darkColors: ThemeColors = {
  primary: '#a9b2ff',
  primaryBtn: '#3b47cf',
  primaryContainer: '#2a3178',
  secondary: '#8f9ae0',
  success: '#6fcf7a',
  warning: '#ffab5e',
  warningTint: '#3a2a12',
  error: '#ff6b6b',
  outline: '#70768c',
  surface: '#171a24',
  surfaceLow: '#232734',
  background: '#0e1016',
  pageBg: '#08090d',
  text: '#e9eaf0',
  white: '#ffffff',
  border: '#262a36',
  brandDeep: '#0a0c26',
  onBrand: '#ffffff',
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

export function shadowsFor(dark: boolean) {
  return {
    soft: {
      shadowColor: dark ? '#000000' : '#1a1c1c',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: dark ? 0.35 : 0.04,
      shadowRadius: 24,
      elevation: 3,
    },
  };
}

export const typography = {
  headline: { fontFamily: 'Manrope_700Bold', fontSize: 28 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 20 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 11 },
};
