import { hasValidToken } from "../lib/auth-storage";

/**
 * Is there a usable admin session?
 *
 * Backed by the JWT's `exp` claim, not by the presence of `userEmail`. The old check read a display
 * flag that anyone could set by hand, and it kept reporting "logged in" long after the token had
 * expired — so the app rendered and then every request 401'd.
 *
 * Routing convenience only: the backend verifies the signature. This just avoids rendering the app
 * with a token we already know is dead.
 */
export default function useAuth(): boolean {
  return hasValidToken();
}
