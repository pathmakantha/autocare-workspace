import React, { useCallback, useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenExpo from 'expo-splash-screen';
import { useFonts, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { store } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import AppNavigator from '@/navigation/AppNavigator';

SplashScreenExpo.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const screen = useAppSelector((s) => s.auth.screen);
  const dark = useAppSelector((s) => s.settings.darkMode);
  const isDarkStatusBar = screen === 'splash' || screen === 'auth' || dark;

  return (
    <>
      <StatusBar style={isDarkStatusBar ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreenExpo.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppShell />
      </Provider>
    </SafeAreaProvider>
  );
}
