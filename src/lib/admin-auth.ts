const AUTH_KEY = "itel.admin.auth";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function loginAdmin(password: string): boolean {
  const valid = password === (import.meta.env.VITE_ADMIN_PASSWORD || "AdminPassword1");
  if (valid) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
