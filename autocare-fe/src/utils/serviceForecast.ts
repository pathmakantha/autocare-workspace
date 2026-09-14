import { Vehicle } from '@/types/vehicle';
import { MaintenanceRecord } from '@/types/maintenanceRecord';

// The backend doesn't model a per-vehicle service interval yet, so every vehicle is
// forecast against this fleet-wide default (matches the design's own placeholder value).
export const DEFAULT_SERVICE_INTERVAL_KM = 5000;

export interface ServiceForecast {
  vehicle: Vehicle;
  kmSince: number;
  remaining: number;
  perDay: number;
  etaDays: number | null;
  pct: number;
}

/** Forecasts when `vehicle` is next due for service, based on its most recent record. */
export function computeServiceForecast(vehicle: Vehicle | undefined, records: MaintenanceRecord[]): ServiceForecast | null {
  if (!vehicle) return null;
  const recs = records
    .filter((r) => r.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  const last = recs[0];
  if (!last) return null;

  const kmSince = Math.max(0, vehicle.mileage - last.mileage);
  const daysSince = Math.max(1, Math.round((Date.now() - new Date(last.serviceDate).getTime()) / 86400000));
  const perDay = kmSince / daysSince;
  const remaining = Math.max(0, DEFAULT_SERVICE_INTERVAL_KM - kmSince);
  const etaDays = perDay > 0 ? Math.round(remaining / perDay) : null;

  return {
    vehicle,
    kmSince,
    remaining,
    perDay,
    etaDays,
    pct: Math.min(100, (kmSince / DEFAULT_SERVICE_INTERVAL_KM) * 100),
  };
}
