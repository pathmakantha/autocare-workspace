import { Currency, DistanceUnit, Region } from '@/redux/slices/settingsSlice';
import { Lang } from '@/i18n/translations';

export type ContactKey = 'police' | 'ambulance' | 'fire' | 'towing';

export interface EmergencyContact {
  key: ContactKey;
  number: string;
}

export interface RegionFeatures {
  /** Sri Lanka's National Fuel Pass QR/quota scheme — it has no meaning elsewhere. */
  fuelPass: boolean;
  /**
   * A national insurance-verification service exists for this country. The channels
   * themselves live in utils/insuranceVerification.ts; this flag is what the UI reads.
   */
  insuranceVerification: boolean;
}

export interface RegionInfo {
  label: string;
  flag: string;
  currency: Currency;
  distanceUnit: DistanceUnit;
  defaultLanguage: Lang;
  contacts: EmergencyContact[];
  /**
   * Set where the listed numbers need a caveat shown beneath them. Safety-critical
   * information should never look more certain than it is.
   */
  emergencyNote: boolean;
  features: RegionFeatures;
  /**
   * Indicative pump prices. Null where we have no reliable figures — an empty section
   * is honest, invented numbers are not.
   */
  fuelPrices: [name: string, pricePerLitre: number][] | null;
  fuelQuota: { litres: number; period: 'week' | 'month' } | null;
}

/** The order countries are offered in during onboarding. */
export const REGION_ORDER: Region[] = ['LK', 'IN', 'RU', 'OTHER'];

// One place that defines what picking a country actually means. Adding a country is a
// matter of adding an entry here (plus its language to the i18n dictionary if it needs one).
export const REGIONS: Record<Region, RegionInfo> = {
  LK: {
    label: 'Sri Lanka',
    flag: '🇱🇰',
    currency: 'LKR',
    distanceUnit: 'km',
    defaultLanguage: 'si',
    contacts: [
      { key: 'police', number: '119' },
      { key: 'ambulance', number: '1990' },
      { key: 'fire', number: '110' },
      { key: 'towing', number: '011 2691111' },
    ],
    emergencyNote: false,
    features: { fuelPass: true, insuranceVerification: true },
    fuelPrices: [
      ['Petrol 92 Octane', 341],
      ['Petrol 95 Octane', 366],
      ['Auto Diesel', 309],
      ['Super Diesel', 366],
    ],
    fuelQuota: { litres: 20, period: 'week' },
  },
  IN: {
    label: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    distanceUnit: 'km',
    defaultLanguage: 'hi',
    contacts: [
      { key: 'police', number: '112' },
      { key: 'ambulance', number: '108' },
      { key: 'fire', number: '101' },
      { key: 'towing', number: '1073' },
    ],
    emergencyNote: false,
    features: { fuelPass: false, insuranceVerification: false },
    fuelPrices: null,
    fuelQuota: null,
  },
  RU: {
    label: 'Russia',
    flag: '🇷🇺',
    currency: 'RUB',
    distanceUnit: 'km',
    defaultLanguage: 'ru',
    contacts: [
      { key: 'police', number: '102' },
      { key: 'ambulance', number: '103' },
      { key: 'fire', number: '101' },
      { key: 'towing', number: '112' },
    ],
    emergencyNote: false,
    features: { fuelPass: false, insuranceVerification: false },
    fuelPrices: null,
    fuelQuota: null,
  },
  // The catch-all, so someone outside the three supported countries is never forced to
  // claim one of them. 112 reaches emergency services on most mobile networks but is
  // carrier-dependent and in some countries reaches police only — hence emergencyNote.
  OTHER: {
    label: 'Other / International',
    flag: '🌍',
    currency: 'USD',
    distanceUnit: 'km',
    defaultLanguage: 'en',
    contacts: [
      { key: 'police', number: '112' },
      { key: 'ambulance', number: '112' },
    ],
    emergencyNote: true,
    features: { fuelPass: false, insuranceVerification: false },
    fuelPrices: null,
    fuelQuota: null,
  },
};

export function regionInfo(region: Region): RegionInfo {
  return REGIONS[region] || REGIONS.OTHER;
}
