export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  fuelType: string;
  litres: number;
  pricePerLitre: number;
  odometer: number;
}

export type FuelLogPayload = Omit<FuelLog, 'id'>;
