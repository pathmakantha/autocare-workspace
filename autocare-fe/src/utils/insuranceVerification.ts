import { Platform } from 'react-native';
import { Region } from '@/redux/slices/settingsSlice';

export type ChannelKind = 'ussd' | 'sms' | 'call';

export interface VerificationChannel {
  kind: ChannelKind;
  /** The code exactly as the motorist would key it in, e.g. "*1338#" or "1338". */
  display: string;
}

export interface InsuranceVerification {
  /** The official scheme cover is checked against — named so the user can see the source. */
  authority: string;
  channels: VerificationChannel[];
}

// Sri Lanka: IRCSL Direction No. 06 of 2026 retired physical motor insurance cards from
// 1 May 2026. Insurers now issue a digital card, and cover is confirmed against the
// National Insurance Verification System on 1338 using the vehicle's registration number.
//
// AutoCare deliberately does NOT assert cover itself — it displays the card the insurer
// issued and hands off to the official channels for anything authoritative. Other regions
// have no entry here yet, so the verification block simply doesn't render for them.
export const INSURANCE_VERIFICATION: Partial<Record<Region, InsuranceVerification>> = {
  LK: {
    authority: 'National Insurance Verification System',
    channels: [
      { kind: 'ussd', display: '*1338#' },
      { kind: 'sms', display: '1338' },
      { kind: 'call', display: '1338' },
    ],
  },
};

export function verificationFor(region: Region): InsuranceVerification | null {
  return INSURANCE_VERIFICATION[region] ?? null;
}

/**
 * iOS does not let an app dial a USSD string (the `*` and `#` are rejected), so that
 * channel is Android-only. SMS and voice calls work on both platforms.
 */
export function isChannelAvailable(kind: ChannelKind): boolean {
  return kind === 'ussd' ? Platform.OS === 'android' : true;
}

/** Builds the dialler/SMS deep link for a channel, pre-filling the plate where it helps. */
export function channelUrl(channel: VerificationChannel, registrationNumber: string): string {
  if (channel.kind === 'ussd') return `tel:${encodeURIComponent(channel.display)}`;
  if (channel.kind === 'call') return `tel:${channel.display}`;
  // iOS wants `&body=`, Android wants `?body=`.
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${channel.display}${separator}body=${encodeURIComponent(registrationNumber)}`;
}
