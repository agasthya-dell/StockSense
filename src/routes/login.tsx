import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Archive, ArrowRight, Boxes, Check, Loader2, MapPin, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import GhostFibers from "@/components/ghost-fibers";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockSense" },
      { name: "description", content: "Sign in to StockSense." },
    ],
  }),
  component: Page,
});

type Mode = "signin" | "signup" | "forgot";

function Page() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const clearMessages = () => { setError(null); setInfo(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // ── Forgot password ──────────────────────────────────────────────────
    if (mode === "forgot") {
      if (!email) { setError("Enter your email address."); return; }
      setLoading(true);
      const result = await resetPassword(email);
      setLoading(false);
      if (!result.ok) { setError(result.error ?? "Failed to send reset email."); return; }
      setInfo("Check your inbox — we sent a password reset link.");
      return;
    }

    // ── Sign up ──────────────────────────────────────────────────────────
    if (mode === "signup") {
      if (!name.trim()) { setError("Enter your full name."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
      setLoading(true);
      const result = await signUp(name.trim(), email, password);
      setLoading(false);
      if (!result.ok) { setError(result.error ?? "Sign up failed."); return; }
      setInfo("Account created! Check your email to confirm your address, then sign in.");
      setMode("signin");
      return;
    }

    // ── Sign in ──────────────────────────────────────────────────────────
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Sign in failed."); return; }
    navigate({ to: "/" });
  };

  const handleGoogle = async () => {
    clearMessages();
    setGoogleLoading(true);
    // This triggers a real browser redirect to Google's account picker
    await signInWithGoogle();
    // If we get here the redirect didn't happen (error case)
    setGoogleLoading(false);
  };

  const titles: Record<Mode, string> = {
    signin: "Sign in",
    signup: "Create account",
    forgot: "Reset password",
  };

  const subtitles: Record<Mode, string> = {
    signin: "Access your inventory operations workspace.",
    signup: "Set up your StockSense account.",
    forgot: "We'll send a reset link to your email.",
  };

  return (
    <div className="grid min-h-screen bg-card lg:grid-cols-2">
      {/* ── Left editorial panel ── */}
      <div
        className={cn(
          "relative hidden overflow-hidden lg:flex lg:flex-col",
          "transition-opacity duration-700",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        {/* GhostFibers WebGL background — fills entire left panel */}
        <div className="absolute inset-0 z-0">
          <GhostFibers
            lineColor="#140E35"
            glowColor="#3437A0"
            speed={0.2}
            scale={2}
            rotation={0}
            rotationSpeed={0.25}
            layers={4}
            waveAmplitude={0.015}
            waveFrequency={3}
            waveSpeed={0.15}
            layerSpeed={0.08}
            twist={0.1}
            twistFrequency={5}
            twistSpeed={1.2}
            lineFrequency={5}
            lineSpacing={2}
            lineSharpness={16}
            glowFalloff={10}
            glowIntensity={1.6}
            brightness={2}
            blueBoost={1.25}
            vignette={0.8}
            grain={0.05}
            dpr={1}
          />
        </div>

        {/* Dark overlay so text stays readable over the fibers */}
        <div className="absolute inset-0 z-10 bg-[oklch(0.10_0.03_255/0.72)]" />
        <div className="relative z-20 flex flex-col h-full p-12">
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
              Know what you have.<br />
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
          </div>

          <div className="text-xs text-white/20">Built for inventory managers and warehouse teams.</div>
        </div>
      </div>

      {/* ── Right form panel ── */}
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

          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Get started" : "Account recovery"}
          </div>
          <h2 className="mt-2 font-serif text-3xl font-normal text-foreground">{titles[mode]}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitles[mode]}</p>

          {/* Google button — only on signin / signup */}
          {mode !== "forgot" && (
            <>
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
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* Error / info banners */}
          {error && (
            <div className="mb-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger animate-fade-up">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-sm text-success animate-fade-up">
              {info}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            {/* Name — signup only */}
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/80">Full name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearMessages(); }}
                  placeholder="Agasthya"
                  required
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password — not on forgot */}
            {mode !== "forgot" && (
              <div>
                <div className="mb-1.5 flex justify-between items-center">
                  <label className="text-xs font-medium text-foreground/80">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={() => { setMode("forgot"); clearMessages(); }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  disabled={loading}
                />
              </div>
            )}

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/80">Confirm password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); clearMessages(); }}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            )}

            {/* Remember me — signin only */}
            {mode === "signin" && (
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
            )}

            {/* Submit */}
            <Button type="submit" className="w-full gap-2 group" disabled={loading || googleLoading}>
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> {mode === "signin" ? "Signing in…" : mode === "signup" ? "Creating account…" : "Sending…"}</>
              ) : (
                <>{titles[mode]} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </Button>
          </div>

          {/* Mode switcher */}
          <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
            {mode === "signin" && (
              <div>
                New to StockSense?{" "}
                <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors" onClick={() => { setMode("signup"); clearMessages(); }}>
                  Create account
                </button>
              </div>
            )}
            {mode === "signup" && (
              <div>
                Already have an account?{" "}
                <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors" onClick={() => { setMode("signin"); clearMessages(); }}>
                  Sign in
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <div>
                <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors" onClick={() => { setMode("signin"); clearMessages(); }}>
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
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
