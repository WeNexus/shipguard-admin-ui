export const DEFAULT_SUSPEND_REASON = `Your account has been temporarily <b class="text-red-800">suspended</b> due to a ShipGuard policy violation. <br/>If you believe this is a mistake, please <b><u><a href="https://google.com" target="_blank">contact</a></u></b> our support team.`;

/**
 * Backend host. The `/api/v1` prefix is NOT part of this — it lives in `lib/api-client.ts` so it is
 * written exactly once.
 *
 * Override per environment with `VITE_API_BASE_URL` (e.g. a Cloudflare tunnel during development);
 * production is the fallback. Only the public API host may be a `VITE_*` var — anything secret
 * (notably ADMIN_JWT_SECRET) stays server-side and must never reach this bundle.
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://shipguard.app";
