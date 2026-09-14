export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  password?: string | null;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  /**
   * Whether this account can log in with a password at all. Accounts created through
   * Google sign-in start without one, and the app uses this flag to force the
   * "create a password" step before letting them into the app.
   */
  hasPassword: boolean;
}

/** Never leak the password hash — this is the only shape a user is sent to a client in. */
export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    hasPassword: Boolean(user.password),
  };
}
