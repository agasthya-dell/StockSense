import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

/**
 * Supabase redirects the browser here after:
 *  - Google OAuth sign-in
 *  - Email confirmation
 *  - Password reset
 *
 * Supabase JS automatically picks up the tokens from the URL hash/query,
 * exchanges them for a session, and fires onAuthStateChange.
 * We just need to wait for that and then send the user to the right place.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Exchange the code in the URL for a real session (PKCE flow)
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      // Successful — go to the app
      navigate({ to: "/" });
    });
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
