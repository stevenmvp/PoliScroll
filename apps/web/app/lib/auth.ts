export type Role = "admin" | "profesor" | "estudiante";

export type Session = {
  isAuthenticated: boolean;
  role: Role | null;
  name: string;
  email: string;
};

export const STORAGE_KEY = "poliscroll-session";

export const defaultSession: Session = {
  isAuthenticated: false,
  role: null,
  name: "",
  email: "",
};

export const getStoredSession = (): Session => {
  if (typeof window === "undefined") return defaultSession;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSession;

  try {
    const parsed = JSON.parse(raw) as Session;
    return {
      ...defaultSession,
      ...parsed,
      isAuthenticated: Boolean(parsed.isAuthenticated),
    };
  } catch {
    return defaultSession;
  }
};

export const saveSession = (session: Session) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const isRoleAllowed = (role: Role, allowed: Role[]) => allowed.includes(role);
