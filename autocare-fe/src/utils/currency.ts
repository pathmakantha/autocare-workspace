import { Currency, Region } from '@/redux/slices/settingsSlice';

export const CURRENCIES: Record<Currency, { code: Currency; symbol: string }> = {
  LKR: { code: 'LKR', symbol: 'Rs' },
  INR: { code: 'INR', symbol: '₹' },
  RUB: { code: 'RUB', symbol: '₽' },
  USD: { code: 'USD', symbol: '$' },
  EUR: { code: 'EUR', symbol: '€' },
};

export function fmtMoney(n: number, currency: Currency): string {
  const c = CURRENCIES[currency] || CURRENCIES.LKR;
  return `${c.symbol} ${Math.round(n).toLocaleString()}`;
}

export function fmtMoneyShort(n: number, currency: Currency): string {
  const c = CURRENCIES[currency] || CURRENCIES.LKR;
  if (n >= 1000) return `${c.symbol}${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${c.symbol}${Math.round(n)}`;
}

// Per-distance rates are small numbers — keep decimals instead of rounding to "Rs 1".
export function fmtRate(n: number, currency: Currency): string {
  const c = CURRENCIES[currency] || CURRENCIES.LKR;
  if (!isFinite(n)) return `${c.symbol} 0`;
  return `${c.symbol} ${n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2)}`;
}

// Country configuration now lives in utils/regions.ts — re-exported here so the
// existing `import { REGIONS } from '@/utils/currency'` call sites keep working.
export { REGIONS, REGION_ORDER, regionInfo } from './regions';
export type { RegionInfo, EmergencyContact, ContactKey, RegionFeatures } from './regions';
