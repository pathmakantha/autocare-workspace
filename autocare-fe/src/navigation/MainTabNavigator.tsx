import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@/screens/DashboardScreen';
import VehicleListScreen from '@/screens/VehicleListScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';
import { colors } from '@/utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
        tabBarStyle: { height: 60, paddingBottom: 8, backgroundColor: colors.surface },
        // The design reference's tab bar is text-only, no icons — suppress React
        // Navigation's default MissingIcon warning glyph rather than inventing artwork.
        tabBarIcon: () => null,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Vehicles" component={VehicleListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
