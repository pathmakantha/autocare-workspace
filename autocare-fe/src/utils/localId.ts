/** Generates a client-side id for guest-mode records, which never touch the backend. */
export function generateLocalId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
