import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@/screens/DashboardScreen';
import VehicleListScreen from '@/screens/VehicleListScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';
import { colors } from '@/utils/theme';
import { DashboardIcon, SettingsIcon, VehiclesIcon } from '@/components/icons/TabIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 8, backgroundColor: colors.surface },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehicleListScreen}
        options={{ tabBarIcon: ({ color, size }) => <VehiclesIcon color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
