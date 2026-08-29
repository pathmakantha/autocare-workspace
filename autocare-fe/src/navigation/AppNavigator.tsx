import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@/screens/SplashScreen';
import AuthScreen from '@/screens/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import AddVehicleScreen from '@/screens/AddVehicleScreen';
import MaintenanceHistoryScreen from '@/screens/MaintenanceHistoryScreen';
import RemindersScreen from '@/screens/RemindersScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import PermissionsScreen from '@/screens/PermissionsScreen';
import SubscriptionScreen from '@/screens/SubscriptionScreen';
import { useAppSelector } from '@/redux/hooks';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { screen, isAuthenticated, isGuest } = useAppSelector((s) => s.auth);
  const loggedIn = isAuthenticated || isGuest;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {screen === 'splash' && <Stack.Screen name="Splash" component={SplashScreen} />}
        {screen !== 'splash' && !loggedIn && <Stack.Screen name="Auth" component={AuthScreen} />}
        {loggedIn && (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="Maintenance" component={MaintenanceHistoryScreen} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Permissions" component={PermissionsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
