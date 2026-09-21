const AUTH_SESSION_KEY = "kiwihire-auth-session";
const AUTH_MESSAGE_KEY = "kiwihire-auth-message";

export type AuthSession = {
  userId: number;
  email: string;
  token: string;
};

// The session lives in localStorage (not sessionStorage) so logging in
// once carries across tabs and across closing/reopening the browser -
// the JWT's own expiry (see backend application.properties,
// app.jwt.expiration-ms) is still what actually ends the session, not
// where the token happens to be stored.
export function loadAuthSession(): AuthSession | null {
  const storedSession = localStorage.getItem(AUTH_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
  );
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getAuthToken(): string | null {
  return loadAuthSession()?.token ?? null;
}

// The post-redirect flash message ("your session expired...") only
// needs to survive the single navigation that sets then reads it, so it
// stays in sessionStorage rather than lingering in localStorage.
export function saveAuthMessage(message: string) {
  sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
}

export function consumeAuthMessage(): string {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY) ?? "";
  sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  return message;
}
