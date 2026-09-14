export type RootStackParamList = {
  Splash: undefined;
  Country: undefined;
  Auth: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string; resetToken: string };
  SetPassword: undefined;
  Main: undefined;
  AddVehicle: { vehicleId?: string } | undefined;
  Maintenance: { vehicleId: string };
  Documents: { vehicleId: string };
  AddDocument: { vehicleId: string };
  InsuranceCard: { vehicleId: string };
  Reminders: undefined;
  EditProfile: undefined;
  Permissions: undefined;
  Subscription: undefined;
  CostAnalytics: undefined;
  Emergency: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Fuel: undefined;
  Settings: undefined;
};
