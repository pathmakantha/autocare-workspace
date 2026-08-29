import { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { darkColors, lightColors, shadowsFor } from '@/utils/theme';

export function useTheme() {
  const dark = useAppSelector((s) => s.settings.darkMode);
  return useMemo(
    () => ({ colors: dark ? darkColors : lightColors, shadows: shadowsFor(dark), dark }),
    [dark]
  );
}
