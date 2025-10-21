import React, { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../supabaseClient";

// PUBLIC_INTERFACE
export default function SignIn({
  title = "Kavia AI Task Management System",
  onSignedIn,
}: {
  title?: string;
  onSignedIn?: () => void;
}): JSX.Element {
  /** Minimalist, accessible sign-in/sign-up form using Supabase Auth. */
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [mode]);

  const canSubmit = useMemo(() => {
    return configured && email.trim().length > 3 && password.trim().length >= 6 && !submitting;
  }, [configured, email, password, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.");
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        onSignedIn?.();
      } else {
        const { error: signUpErr, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpErr) throw signUpErr;

        // If email confirmation is enabled, Supabase may require verification
        if (!data.session) {
          setInfo(
            "Sign-up successful. Please check your email for a confirmation link before signing in."
          );
          setMode("signin");
        } else {
          onSignedIn?.();
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setInfo(null);
      // Attempt; if provider not configured, Supabase returns an error. We'll handle gracefully.
      const { data, error: provErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (provErr) {
        // Graceful no-op with message
        setInfo(
          "Google sign-in is not configured yet. Please configure the Google provider in Supabase Project Settings > Authentication > Providers."
        );
        return;
      }
      if (!data?.url) {
        setInfo(
          "Unable to initiate Google sign-in. Ensure provider is correctly configured in Supabase."
        );
      }
      // If data.url exists, Supabase will redirect. No further action here.
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="main" style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--color-surface)" }}>
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,.04)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>{title}</div>
          <div className="helper" aria-live="polite">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: "1fr", gap: 12 }}>
          <div className="full">
            <label htmlFor="email" className="helper">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="full">
            <label htmlFor="password" className="helper">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
            />
          </div>

          {error && (
            <div className="helper" style={{ color: "var(--color-error)" }} role="alert">
              {error}
            </div>
          )}
          {info && (
            <div className="helper" style={{ color: "var(--color-primary)" }} role="status" aria-live="polite">
              {info}
            </div>
          )}

          <button className="btn primary" type="submit" disabled={!canSubmit} aria-busy={submitting}>
            {submitting ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign In" : "Create account"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 1, background: "#E5E7EB", flex: 1 }} />
            <span className="helper" aria-hidden="true">or</span>
            <div style={{ height: 1, background: "#E5E7EB", flex: 1 }} />
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleGoogle}
            disabled={submitting || !configured}
            aria-label="Continue with Google"
            title="Continue with Google"
          >
            <span aria-hidden="true" style={{
              width: 16, height: 16, borderRadius: 2, background: "#EA4335", display: "inline-block"
            }} />
            Continue with Google
          </button>

          <div className="helper" style={{ textAlign: "center" }}>
            {mode === "signin" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="btn ghost"
                  style={{ height: "auto", padding: 0, border: "none", color: "var(--color-primary)" }}
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="btn ghost"
                  style={{ height: "auto", padding: 0, border: "none", color: "var(--color-primary)" }}
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        <div className="helper" style={{ marginTop: 12, textAlign: "center", color: "var(--color-secondary)" }}>
          © {new Date().getFullYear()} Kavia. All rights reserved.
        </div>
      </div>
    </div>
  );
}
