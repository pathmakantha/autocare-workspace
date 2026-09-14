import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@/screens/SplashScreen';
import CountryScreen from '@/screens/CountryScreen';
import AuthScreen from '@/screens/AuthScreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import VerifyCodeScreen from '@/screens/VerifyCodeScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import SetPasswordScreen from '@/screens/SetPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import AddVehicleScreen from '@/screens/AddVehicleScreen';
import MaintenanceHistoryScreen from '@/screens/MaintenanceHistoryScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import AddDocumentScreen from '@/screens/AddDocumentScreen';
import InsuranceCardScreen from '@/screens/InsuranceCardScreen';
import RemindersScreen from '@/screens/RemindersScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import PermissionsScreen from '@/screens/PermissionsScreen';
import SubscriptionScreen from '@/screens/SubscriptionScreen';
import CostAnalyticsScreen from '@/screens/CostAnalyticsScreen';
import EmergencyScreen from '@/screens/EmergencyScreen';
import { useAppSelector } from '@/redux/hooks';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { screen, isAuthenticated, isGuest, mustSetPassword } = useAppSelector((s) => s.auth);
  const onboarded = useAppSelector((s) => s.settings.onboarded);
  const loggedIn = isAuthenticated || isGuest;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {screen === 'splash' && <Stack.Screen name="Splash" component={SplashScreen} />}
        {/* The country answer shapes emergency numbers, units and which features exist,
            so it is asked before anything else — signed in or not. */}
        {screen !== 'splash' && !onboarded && <Stack.Screen name="Country" component={CountryScreen} />}
        {screen !== 'splash' && onboarded && !loggedIn && (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
        {/* A Google account with no password yet sees only this — it is a hard gate,
            not a screen the rest of the app can be reached around. */}
        {onboarded && loggedIn && mustSetPassword && <Stack.Screen name="SetPassword" component={SetPasswordScreen} />}
        {onboarded && loggedIn && !mustSetPassword && (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="Maintenance" component={MaintenanceHistoryScreen} />
            <Stack.Screen name="Documents" component={DocumentVaultScreen} />
            <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
            <Stack.Screen name="InsuranceCard" component={InsuranceCardScreen} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Permissions" component={PermissionsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="CostAnalytics" component={CostAnalyticsScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
