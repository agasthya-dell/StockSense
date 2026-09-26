import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

/**
 * Supabase redirects here after Google OAuth / email confirmation.
 *
 * When using the implicit flow (hash-based tokens), Supabase JS picks up
 * the access_token from the URL hash automatically via onAuthStateChange.
 * We just wait for the session to be set, then redirect to the app.
 *
 * For PKCE (code in query string), we call exchangeCodeForSession.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const errorParam = url.searchParams.get("error");
    const errorDesc = url.searchParams.get("error_description");

    // Handle explicit error from provider
    if (errorParam) {
      setError(errorDesc ?? errorParam);
      return;
    }

    if (code) {
      // PKCE flow — exchange code for session
      supabase.auth.exchangeCodeForSession(window.location.href).then(({ error: err }) => {
        if (err) { setError(err.message); return; }
        navigate({ to: "/app" });
      });
    } else {
      // Implicit flow — tokens are in the hash, Supabase picks them up automatically
      // Just wait for onAuthStateChange to fire
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe();
          navigate({ to: "/app" });
        }
        if (event === "SIGNED_OUT") {
          subscription.unsubscribe();
          setError("Sign-in was cancelled.");
        }
      });

      // Fallback — if no auth event fires within 5s, something went wrong
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        // Check if we already have a session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) navigate({ to: "/app" });
          else setError("Sign-in timed out. Please try again.");
        });
      }, 5000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <div className="font-serif text-2xl text-foreground">Sign-in failed</div>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            className="mt-6 text-sm font-medium text-primary hover:underline"
            onClick={() => navigate({ to: "/login" })}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
