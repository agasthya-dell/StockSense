import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  defaultWarehouse: string;
  avatarInitials: string;
  provider: "email" | "google";
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = "stocksense-auth-v1";

const DEMO_ACCOUNTS: { email: string; password: string; user: User }[] = [
  {
    email: "agasthya@stocksense.io",
    password: "demo1234",
    user: {
      id: "usr-001",
      name: "Agasthya",
      email: "agasthya@stocksense.io",
      role: "Inventory Manager",
      defaultWarehouse: "All warehouses",
      avatarInitials: "AS",
      provider: "email",
    },
  },
  {
    email: "admin@stocksense.io",
    password: "admin123",
    user: {
      id: "usr-002",
      name: "Admin User",
      email: "admin@stocksense.io",
      role: "Administrator",
      defaultWarehouse: "Main Warehouse",
      avatarInitials: "AU",
      provider: "email",
    },
  },
];

function makeInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const signIn = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 700));
    const match = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!match) {
      return { ok: false, error: "Invalid email or password. Try agasthya@stocksense.io / demo1234" };
    }
    persist(match.user);
    return { ok: true };
  };

  const signInWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 900));
    // Simulate Google OAuth — auto-signs in as the demo user
    const googleUser: User = {
      id: "usr-google-001",
      name: "Agasthya S.",
      email: "agasthya@gmail.com",
      role: "Inventory Manager",
      defaultWarehouse: "All warehouses",
      avatarInitials: "AS",
      provider: "google",
    };
    persist(googleUser);
    return { ok: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = {
      ...user,
      ...updates,
      avatarInitials: updates.name ? makeInitials(updates.name) : user.avatarInitials,
    };
    persist(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogle, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
