const AUTH_SESSION_KEY = "kiwihire-auth-session";

export type AuthSession = {
  userId: number;
  email: string;
  token: string;
};

export function loadAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
  );
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function getAuthToken(): string | null {
  return loadAuthSession()?.token ?? null;
}
