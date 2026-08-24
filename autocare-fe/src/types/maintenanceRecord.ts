export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  serviceDate: string; // YYYY-MM-DD
  mileage: number;
  cost: number;
  notes?: string;
}

export type MaintenanceRecordPayload = Omit<MaintenanceRecord, 'id' | 'vehicleId'>;
