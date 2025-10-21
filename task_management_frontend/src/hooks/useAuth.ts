import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

export interface AuthState {
  loading: boolean;
  user: any | null;
  error: string | null;
}

// PUBLIC_INTERFACE
export function useAuth(): {
  loading: boolean;
  user: any | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  configured: boolean;
} {
  /**
   * Manages Supabase auth state and exposes signIn/signUp/signOut helpers.
   * If Supabase is not configured, exposes configured=false.
   */
  const [state, setState] = useState<AuthState>({ loading: true, user: null, error: null });
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setState({ loading: false, user: null, error: "Supabase not configured" });
      return;
    }
    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setState({ loading: false, user: session?.user ?? null, error: error?.message ?? null });
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setState((s) => ({ ...s, user: session?.user ?? null }));
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setState((s) => ({ ...s, loading: false, error: error?.message ?? null }));
  };

  const signUp = async (email: string, password: string) => {
    if (!configured) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin, // Uses final SITE URL at deploy
      },
    });
    setState((s) => ({ ...s, loading: false, error: error?.message ?? null }));
  };

  const signOut = async () => {
    if (!configured) return;
    await supabase.auth.signOut();
  };

  return { loading: state.loading, user: state.user, error: state.error, signIn, signUp, signOut, configured };
}
