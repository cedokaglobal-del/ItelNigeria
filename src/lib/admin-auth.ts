const AUTH_KEY = "itel.admin.auth";
const ADMIN_PASSWORD = "admin123";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem(AUTH_KEY);
}
