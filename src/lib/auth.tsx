import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// ─── Public user shape ──────────────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  defaultWarehouse: string;
  avatarInitials: string;
  provider: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (updates: Partial<Pick<User, "name" | "defaultWarehouse">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

function supabaseUserToUser(supaUser: SupabaseUser): User {
  const meta = supaUser.user_metadata ?? {};
  const name: string =
    meta.full_name ?? meta.name ?? meta.display_name ?? supaUser.email?.split("@")[0] ?? "User";
  const provider = supaUser.app_metadata?.provider ?? "email";
  return {
    id: supaUser.id,
    name,
    email: supaUser.email ?? "",
    role: (meta.role as string) ?? "Inventory Manager",
    defaultWarehouse: (meta.default_warehouse as string) ?? "All warehouses",
    avatarInitials: makeInitials(name),
    provider,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ? supabaseUserToUser(s.user) : null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ? supabaseUserToUser(s.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: "Inventory Manager", default_warehouse: "All warehouses" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    // Supabase sends a confirmation email — user needs to verify
    return { ok: true, needsVerification: true };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account", // forces account picker every time
        },
      },
    });
    if (error) return { ok: false, error: error.message };
    // Browser will redirect — this resolves only if something went wrong
    return { ok: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const updateUser = async (updates: Partial<Pick<User, "name" | "defaultWarehouse">>) => {
    const metaUpdates: Record<string, string> = {};
    if (updates.name) metaUpdates.full_name = updates.name;
    if (updates.defaultWarehouse) metaUpdates.default_warehouse = updates.defaultWarehouse;
    await supabase.auth.updateUser({ data: metaUpdates });
    // Optimistically update local state
    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...updates,
            avatarInitials: updates.name ? makeInitials(updates.name) : prev.avatarInitials,
          }
        : prev
    );
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signInWithGoogle, signOut, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
