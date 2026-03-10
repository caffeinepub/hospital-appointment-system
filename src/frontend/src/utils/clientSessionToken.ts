/**
 * Client session token utility for pseudo-identity profile flows
 * Generates and persists a stable session token for the current browser session
 */

const SESSION_TOKEN_KEY = "client_session_token";

/**
 * Generates a new random session token
 */
function generateSessionToken(): Uint8Array {
  const token = new Uint8Array(32);
  crypto.getRandomValues(token);
  return token;
}

/**
 * Serializes Uint8Array to base64 string for storage
 */
function serializeToken(token: Uint8Array): string {
  return btoa(String.fromCharCode(...token));
}

/**
 * Deserializes base64 string back to Uint8Array
 */
function deserializeToken(serialized: string): Uint8Array {
  const binary = atob(serialized);
  const token = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    token[i] = binary.charCodeAt(i);
  }
  return token;
}

/**
 * Gets or creates a stable client session token for the current session
 * Token is stored in sessionStorage and persists for the browser session
 */
export function getClientSessionToken(): Uint8Array {
  try {
    // Try to retrieve existing token from sessionStorage
    const stored = sessionStorage.getItem(SESSION_TOKEN_KEY);

    if (stored) {
      return deserializeToken(stored);
    }

    // Generate new token if none exists
    const newToken = generateSessionToken();
    sessionStorage.setItem(SESSION_TOKEN_KEY, serializeToken(newToken));
    return newToken;
  } catch (error) {
    console.error("Error managing session token:", error);
    // Fallback: generate ephemeral token (won't persist across page reloads)
    return generateSessionToken();
  }
}

/**
 * Clears the current session token
 * Should be called on logout to prevent token reuse
 */
export function clearClientSessionToken(): void {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing session token:", error);
  }
}
