import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HealthieLockup, HealthieWordmark } from "@/components/lumen/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    return <Navigate to="/you" />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Lab",
          callbackURL: "/you",
        });
        if (res.error) throw new Error(res.error.message || "Couldn’t create the account.");
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/you",
        });
        if (res.error) throw new Error(res.error.message || "Email or password didn’t match.");
      }
      await navigate({ to: "/you" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in didn’t work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-bg px-5 pb-16 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" aria-label="Healthie home" className="inline-flex min-h-11 items-center">
          <HealthieWordmark />
        </Link>
        <HealthieLockup className="mx-auto mt-8 w-48 sm:w-56" />
        <p className="kicker mt-8">Your notes, any phone</p>
        <h1 className="mt-2 font-display text-[2.15rem] font-bold leading-[1.05] tracking-[-0.04em]">
          History follows you.
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          Sign in and scans, saved packs, and your notes sync. The next phone is the same — not a blank slate.
        </p>

        {!authEnabled ? (
          <p className="mt-8 text-sm text-muted">Sign-in is disabled in this build.</p>
        ) : (
          <>
            <div className="mt-8 space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  className="h-12 w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/you" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>

            <div className="my-8 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">or email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={(e) => void onEmail(e)} className="space-y-2">
              {mode === "up" ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="A name, if you like"
                  autoComplete="name"
                  aria-label="Name"
                />
              ) : null}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
                aria-label="Email"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "up" ? "Password (8+ characters)" : "Password"}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                minLength={8}
                required
                aria-label="Password"
              />
              {error ? <p className="text-sm text-score-poor">{error}</p> : null}
              <Button type="submit" className="h-12 w-full" disabled={busy || email.trim().length < 3}>
                {busy ? "Working…" : mode === "up" ? "Create account" : "Sign in with email"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setError(null);
              }}
            >
              {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        )}

        <p className="mt-10 text-sm text-muted">
          <Link to="/" className="font-medium text-accent underline-offset-4 hover:underline">
            Continue without an account
          </Link>
          {" — "}
          notes stay on this phone until you sign in.
        </p>
      </div>
    </main>
  );
}
