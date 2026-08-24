export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: number;
  mileage: number; // current odometer reading, miles
  licenseExpiry: string; // YYYY-MM-DD
  insuranceExpiry: string; // YYYY-MM-DD
  emissionTestExpiry: string; // YYYY-MM-DD
  serviceReminderDate: string; // YYYY-MM-DD
}

export type VehiclePayload = Omit<Vehicle, 'id'>;

export type VehicleFormData = {
  name: string;
  registrationNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  licenseExpiry: string;
  insuranceExpiry: string;
  emissionTestExpiry: string;
  serviceReminderDate: string;
};
