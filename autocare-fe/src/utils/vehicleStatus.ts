import { Vehicle } from '@/types/vehicle';
import { ThemeColors } from './theme';
import { Strings } from '@/i18n/translations';

export type StatusKind = 'ok' | 'warning' | 'error';

export type Status = {
  status: StatusKind;
  label: string;
  color: string;
  bg: string;
};

const EXPIRY_FIELDS = [
  'licenseExpiry',
  'insuranceExpiry',
  'emissionTestExpiry',
  'serviceReminderDate',
] as const;

/** Days until the nearest upcoming expiry field on a vehicle, or Infinity if none set. */
export function nearestExpiryDays(vehicle: Vehicle): number {
  const today = new Date();
  let minDays = Infinity;
  EXPIRY_FIELDS.forEach((f) => {
    const v = vehicle[f];
    if (!v) return;
    const days = Math.ceil((new Date(v).getTime() - today.getTime()) / 86400000);
    if (days >= 0 && days < minDays) minDays = days;
  });
  return minDays;
}

export function getVehicleStatus(vehicle: Vehicle, colors: ThemeColors, t: Strings): Status {
  const minDays = nearestExpiryDays(vehicle);
  if (minDays <= 7) {
    return { status: 'error', label: t.urgent.toUpperCase(), color: colors.error, bg: colors.error + '20' };
  }
  if (minDays <= 30) {
    return { status: 'warning', label: t.dueSoon.toUpperCase(), color: colors.warning, bg: colors.warning + '20' };
  }
  return { status: 'ok', label: t.healthy.toUpperCase(), color: colors.success, bg: colors.success + '20' };
}

export type ExpiringItem = {
  vehicleId: string;
  vehicleName: string;
  field: (typeof EXPIRY_FIELDS)[number];
  label: string;
  date: string;
  daysLeft: number;
};

function fieldLabels(t: Strings): Record<(typeof EXPIRY_FIELDS)[number], string> {
  return {
    licenseExpiry: t.licenseExpiry,
    insuranceExpiry: t.insuranceExpiry,
    emissionTestExpiry: t.emissionTest,
    serviceReminderDate: t.serviceReminder,
  };
}

/** Every (vehicle x expiry field) pair due within 0-30 days, soonest first. */
export function getExpiringItems(vehicles: Vehicle[], t: Strings): ExpiringItem[] {
  const today = new Date();
  const labels = fieldLabels(t);
  const items: ExpiringItem[] = [];
  vehicles.forEach((v) => {
    EXPIRY_FIELDS.forEach((field) => {
      const dateVal = v[field];
      if (!dateVal) return;
      const days = Math.ceil((new Date(dateVal).getTime() - today.getTime()) / 86400000);
      if (days >= 0 && days <= 30) {
        items.push({
          vehicleId: v.id,
          vehicleName: v.name,
          field,
          label: labels[field],
          date: dateVal,
          daysLeft: days,
        });
      }
    });
  });
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Finer 7/14/30 urgency cut used for the reminder pill (distinct from the 7/30 status badge). */
export function reminderUrgency(daysLeft: number, colors: ThemeColors): { color: string; bg: string } {
  if (daysLeft <= 7) return { color: colors.error, bg: colors.error + '20' };
  if (daysLeft <= 14) return { color: colors.warning, bg: colors.warning + '20' };
  return { color: colors.success, bg: colors.success + '20' };
}

export function daysLeftLabel(daysLeft: number, t: Strings): string {
  return daysLeft === 0 ? t.today : `${daysLeft} ${t.dLeft}`;
}
