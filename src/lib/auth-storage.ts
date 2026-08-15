/**
 * Admin auth state, persisted in localStorage.
 *
 * The JWT under `adminToken` is the only thing the backend trusts. `userEmail` is kept purely for
 * display (the topbar) — it proves nothing and must never gate anything.
 *
 * Every access is wrapped: `localStorage` throws in Safari private mode and when a site is running
 * with cookies/storage blocked, and an uncaught throw here would take down app boot.
 */
const TOKEN_KEY = 'adminToken';
const EMAIL_KEY = 'userEmail';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the session simply won't survive a reload */
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing we can do, and nothing worth crashing over */
  }
}

export const getToken = (): string | null => read(TOKEN_KEY);
export const setToken = (token: string): void => write(TOKEN_KEY, token);

export const getEmail = (): string | null => read(EMAIL_KEY);
export const setEmail = (email: string): void => write(EMAIL_KEY, email);

/** Drop every trace of the session. Used by logout and by any 401 from the API client. */
export function clearAuth(): void {
  remove(TOKEN_KEY);
  remove(EMAIL_KEY);
}

/**
 * True when the stored token exists and its `exp` claim is still in the future.
 *
 * This is a convenience check for routing only — it reads the payload **without verifying the
 * signature**, which is impossible in the browser and pointless anyway: the backend is the only
 * authority. Its job is to avoid rendering the app with a token we already know is dead. Anything
 * unparseable counts as logged out.
 */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }
  const exp = readExpiry(token);
  if (exp === null) {
    return false;
  }
  return exp * 1000 > Date.now();
}

function readExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    // JWT uses base64url; atob needs plain base64.
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}
