export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  AddVehicle: { vehicleId?: string } | undefined;
  Maintenance: { vehicleId: string };
  Reminders: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Settings: undefined;
};
