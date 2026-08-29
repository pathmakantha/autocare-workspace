export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  AddVehicle: { vehicleId?: string } | undefined;
  Maintenance: { vehicleId: string };
  Reminders: undefined;
  EditProfile: undefined;
  Permissions: undefined;
  Subscription: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Settings: undefined;
};
