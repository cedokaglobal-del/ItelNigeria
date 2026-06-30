import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-auth";
import { Logo } from "@/components/site/Logo";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAdminAuthenticated()) throw redirect({ to: "/admin" });
  },
  head: () => ({ meta: [{ title: "Admin Login — ItelNigeria" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    const ok = loginAdmin(password);
    if (ok) {
      router.navigate({ to: "/admin" });
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-surface to-accent px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="rounded-2xl border bg-card p-6 shadow-lg md:p-8">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-center text-lg font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Enter the admin password to continue
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {error && (
                <p className="mt-1.5 animate-fade-in flex items-center gap-1.5 text-xs text-red-500">
                  <ShieldAlert className="h-3 w-3 shrink-0" /> Incorrect password — try again
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-[10px] text-muted-foreground/60">
            Default password: <span className="font-mono text-muted-foreground">AdminPassword1</span>
          </p>
          <p className="mt-6 text-center text-[10px] text-muted-foreground">
            <a href="/" className="underline transition-colors hover:text-foreground">
              &larr; Back to site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
