export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** False for accounts created via Google that have not chosen a password yet. */
  hasPassword?: boolean;
}
