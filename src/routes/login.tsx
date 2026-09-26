import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Archive, ArrowRight, Boxes, Check, Loader2, MapPin, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockSense" },
      { name: "description", content: "Sign in to the StockSense inventory workspace." },
      { property: "og:title", content: "Sign in — StockSense" },
      { property: "og:description", content: "Sign in to the StockSense inventory workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("agasthya@stocksense.io");
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If already signed in, redirect
  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.ok) {
      navigate({ to: "/" });
    } else {
      setError(result.error ?? "Sign in failed.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.ok) {
      navigate({ to: "/" });
    } else {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="grid min-h-screen bg-card lg:grid-cols-2">
      {/* Left panel — editorial */}
      <div
        className={cn(
          "relative hidden overflow-hidden lg:flex lg:flex-col bg-[oklch(0.175_0.032_255)]",
          "transition-opacity duration-700",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, oklch(0.4 0.1 248 / 0.15), transparent 60%), radial-gradient(ellipse at 80% 10%, oklch(0.35 0.12 270 / 0.12), transparent 50%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-white/10 text-white">
              <Archive className="size-5" />
            </div>
            <div className="font-serif text-[17px] font-normal text-white/90 tracking-wide">StockSense</div>
          </div>

          <div
            className={cn(
              "my-auto max-w-lg transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              Inventory Operating System
            </div>
            <h1 className="font-serif text-[42px] font-normal leading-[1.15] text-white">
              Know what you have.
              <br />
              <span className="italic text-white/55">Understand what happens next.</span>
            </h1>
            <p className="mt-6 text-base leading-7 text-white/40">
              One precise workspace for stock visibility, warehouse operations, and explainable decisions.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-3">
              <Mini icon={Boxes} label="Inventory" />
              <Mini icon={MapPin} label="Locations" />
              <Mini icon={PackageCheck} label="Operations" />
            </div>

            {/* Demo credentials hint */}
            <div className="mt-10 rounded-lg border border-white/8 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Demo credentials</div>
              <div className="text-xs text-white/50 space-y-1">
                <div>Email: <span className="font-mono text-white/70">agasthya@stocksense.io</span></div>
                <div>Password: <span className="font-mono text-white/70">demo1234</span></div>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/20">Built for inventory managers and warehouse teams.</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className={cn(
          "flex items-center justify-center p-6 bg-background transition-all duration-700 delay-100",
          mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
        )}
      >
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Archive className="size-4" />
            </div>
            <span className="font-serif text-lg text-foreground">StockSense</span>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">Welcome back</div>
          <h2 className="mt-2 font-serif text-3xl font-normal text-foreground">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Access your inventory operations workspace.</p>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full gap-2"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger animate-fade-up">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-medium text-foreground/80">Password</label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setError("Password reset not available in demo. Use: demo1234")}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                Remember me
              </label>
            </div>
            <Button type="submit" className="w-full gap-2 group" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New to StockSense?{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
              onClick={() => setError("Account creation is not available in the demo. Use the demo credentials.")}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Mini({ icon: Icon, label }: { icon: typeof Boxes; label: string }) {
  return (
    <div className="border border-white/8 bg-white/5 p-4 rounded-lg">
      <Icon className="size-4 text-white/60" />
      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-white/50">
        <Check className="size-3 text-white/40" />
        {label}
      </div>
    </div>
  );
}
