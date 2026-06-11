import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-auth";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin/login")({
  head: () => [{ title: "Admin Login — Itel Energy" }],
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (isAdminAuthenticated()) {
    router.navigate({ to: "/admin" });
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loginAdmin(password)) {
      router.navigate({ to: "/admin" });
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-accent px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-center text-lg font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-1 text-center text-xs text-muted-foreground">Enter the admin password to continue</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {error && <p className="mt-1 text-xs text-red-500">Incorrect password</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Sign in
            </button>
          </form>
          <p className="mt-6 text-center text-[10px] text-muted-foreground">
            <a href="/" className="underline hover:text-foreground">Back to site</a>
          </p>
        </div>
      </div>
    </div>
  );
}
