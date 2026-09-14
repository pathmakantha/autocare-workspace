// Fuel prices and quotas are country-specific and now live in the region registry, so
// there is exactly one place to edit them: utils/regions.ts. These aliases remain for
// convenience and point at the Sri Lankan entry, which is where they originally came from.
import { REGIONS } from './regions';

export const FUEL_PRICE_DEFS = REGIONS.LK.fuelPrices ?? [];
export const DEFAULT_FUEL_QUOTA = REGIONS.LK.fuelQuota ?? { litres: 0, period: 'week' as const };
