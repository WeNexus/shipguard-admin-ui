import { BASE_URL } from '../config';
import { clearAuth, getToken } from './auth-storage';

/**
 * The single place every backend call goes through.
 *
 * Two things this fixes, both of which used to be spread across 13 inline `fetch()` calls:
 *  - the backend mounts everything under a `api/v1` global prefix, which none of the old URLs had
 *  - the admin JWT has to ride on every request, and there was nowhere to put it
 */

/** `/api/v1` is written exactly once in this codebase. */
export const API_BASE = `${BASE_URL}/api/v1`;

export type QueryValue = string | number | boolean | null | undefined;

/**
 * Loose response shape for endpoints whose payload isn't typed yet.
 *
 * Declared once, deliberately, so the 16 call sites that consume untyped admin responses don't each
 * need their own `any`. Replace with real response types as the Plan-29 phases firm up each contract.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiJson = any;

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Serialized to a query string; `null`/`undefined` entries are dropped. */
  query?: Record<string, QueryValue>;
  /** Plain object → JSON. `FormData` → sent as-is (see the Content-Type note below). */
  body?: unknown;
  signal?: AbortSignal;
  /**
   * Set for requests the user did not initiate — a background poll or prefetch.
   *
   * A 401 still clears the stored auth and still throws, but does NOT navigate. Otherwise the logs
   * page's 60s poll could fire while an admin is mid-form (typing a suspension reason, filling the
   * uninstall confirmation) and yank them to the login screen, losing the input. The next thing they
   * actually click will 401 and redirect then, which is the right moment.
   */
  background?: boolean;
}

/** Thrown for any non-2xx response. `payload` is the parsed body when the server sent one. */
export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(message ?? extractMessage(payload) ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

/** Pull the most human-readable string out of a Nest error body. */
function extractMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }
  return undefined;
}

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    // Drop null/undefined so an unset filter doesn't become the literal string "undefined" —
    // which is exactly what the old template-string URLs used to send.
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Redirect to login after an auth failure.
 *
 * Uses a hash-only assignment so it works with `createHashRouter` and preserves the GitHub Pages
 * base path (`/shipguard-admin-ui/`) — replacing `location.href` with an absolute path would break
 * one or the other. Guarded so a burst of parallel 401s can't fight over the location.
 */
let redirecting = false;
function redirectToLogin(): void {
  if (redirecting) {
    return;
  }
  if (window.location.hash.startsWith('#/login')) {
    return; // already there — never loop
  }
  redirecting = true;
  window.location.hash = '#/login';
}

export async function apiFetch<T = ApiJson>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', query, body, signal, background = false } = options;
  const url = `${API_BASE}/${path.replace(/^\/+/, '')}${buildQuery(query)}`;

  const headers: Record<string, string> = { Accept: 'application/json' };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    // Deliberately NO Content-Type: the browser must set it so the multipart boundary is included.
    // Setting it by hand produces a body the server cannot parse.
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(url, { method, headers, body: payload, signal });

  // 204 and empty bodies are valid; don't try to parse them.
  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Always drop the dead credential; only navigate for user-initiated requests.
      clearAuth();
      if (!background) {
        redirectToLogin();
      }
    }
    // Still throw after redirecting, so callers stop instead of rendering a half state.
    throw new ApiError(response.status, parsed);
  }

  return parsed as T;
}
