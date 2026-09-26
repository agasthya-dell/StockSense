import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Archive, ArrowLeftRight, Bell, Boxes, BrainCircuit, Building2,
  ChevronLeft, ChevronRight, ClipboardCheck, Gauge, History, Menu,
  PackageCheck, Search, Settings, SlidersHorizontal, Sparkles,
  TriangleAlert, Truck, UserRound, Warehouse, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryProvider, statusFor, useInventory, warehouses as WAREHOUSES } from "@/lib/inventory";
import { AuthProvider, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ─── Global warehouse filter context ───────────────────────────────────────
type WarehouseCtx = { warehouse: string; setWarehouse: (w: string) => void };
const WarehouseContext = createContext<WarehouseCtx>({ warehouse: "all", setWarehouse: () => {} });
export function useWarehouseFilter() { return useContext(WarehouseContext); }

// ─── Nav groups ────────────────────────────────────────────────────────────
const groups = [
  { label: "", items: [{ label: "Overview", to: "/app", icon: Gauge }] },
  { label: "Inventory", items: [{ label: "Products", to: "/products", icon: Boxes }, { label: "Stock by Location", to: "/locations", icon: Warehouse }, { label: "Low Stock", to: "/low-stock", icon: TriangleAlert }] },
  { label: "Operations", items: [{ label: "Receipts", to: "/receipts", icon: PackageCheck }, { label: "Deliveries", to: "/deliveries", icon: Truck }, { label: "Transfers", to: "/transfers", icon: ArrowLeftRight }, { label: "Adjustments", to: "/adjustments", icon: SlidersHorizontal }, { label: "Stock Ledger", to: "/ledger", icon: History }] },
  { label: "Intelligence", items: [{ label: "StockSense Intelligence", to: "/intelligence", icon: Sparkles }, { label: "Risk Monitor", to: "/risk-monitor", icon: BrainCircuit }, { label: "What-if Simulator", to: "/what-if", icon: ClipboardCheck }] },
  { label: "Administration", items: [{ label: "Warehouses", to: "/warehouses", icon: Building2 }, { label: "Settings", to: "/settings", icon: Settings }] },
] as const;

const staggerClasses = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"];

// ─── Inner shell (needs inventory context) ─────────────────────────────────
function InnerShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { products, ledger } = useInventory();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCommandOpen(true); }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Live notifications from inventory
  const riskProducts = products.filter((p) => ["At Risk", "Critical"].includes(statusFor(p)));
  const pendingReceipts = ledger.filter((e) => e.operation === "Receipt").length;
  const recentTransfers = ledger.filter((e) => e.operation === "Transfer").slice(0, 1);
  const hasNotifications = riskProducts.length > 0;

  const runCommand = (text: string) => {
    const lower = text.toLowerCase();
    setCommandOpen(false);
    if (lower.includes("move") || lower.includes("transfer")) navigate({ to: "/transfers", search: { preset: "steel" } });
    else if (lower.includes("unusual") || lower.includes("anomal")) navigate({ to: "/risk-monitor" });
    else if (lower.includes("receipt")) navigate({ to: "/receipts" });
    else if (lower.includes("low") || lower.includes("run out") || lower.includes("reorder")) navigate({ to: "/products", search: { status: "risk" } });
    else if (lower.includes("ledger") || lower.includes("history")) navigate({ to: "/ledger" });
    else if (lower.includes("deliver")) navigate({ to: "/deliveries" });
    else navigate({ to: "/products", search: { q: text } });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const displayName = user?.name ?? "User";
  const initials = user?.avatarInitials ?? "??";

  let staggerIdx = 0;

  const sidebar = (
    <aside className={cn("flex h-full flex-col bg-sidebar transition-[width] duration-300 ease-in-out", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className={cn("flex h-16 items-center gap-3 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-white/10 text-white">
          <Archive className="size-4" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-serif text-[15px] font-normal tracking-wide text-sidebar-foreground leading-none">StockSense</div>
            <div className="text-[10px] text-sidebar-foreground/40 mt-0.5 tracking-widest uppercase">Inventory OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {groups.map((group) => (
          <div className="mb-3" key={group.label || "overview"}>
            {!collapsed && group.label && (
              <div className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/35">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const staggerClass = staggerClasses[staggerIdx++ % staggerClasses.length];
                const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    search={{}}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md text-sm transition-all duration-150 animate-slide-in-left pl-[10px] border-l-2 rounded-l-none",
                      staggerClass,
                      isActive
                        ? "bg-white/12 text-sidebar-foreground font-medium border-white/50"
                        : "text-sidebar-foreground/55 hover:bg-white/8 hover:text-sidebar-foreground border-transparent"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("size-4 shrink-0", isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/50")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <Link
          to="/profile"
          className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground/55 hover:bg-white/8 hover:text-sidebar-foreground transition-colors"
        >
          <UserRound className="size-4 shrink-0" />
          {!collapsed && <span className="truncate">{displayName}</span>}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-white/8"
          onClick={handleSignOut}
        >
          {collapsed ? <ChevronRight className="size-4" /> : "Sign out"}
        </Button>
      </div>
    </aside>
  );

  return (
    <WarehouseContext.Provider value={{ warehouse, setWarehouse }}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              {sidebar}
              <Button variant="ghost" size="icon" className="absolute right-2 top-3 text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X />
              </Button>
            </div>
          </>
        )}

        {/* Main */}
        <div className={cn("min-w-0 flex-1 transition-[margin] duration-300 ease-in-out", collapsed ? "lg:ml-16" : "lg:ml-64")}>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/96 px-4 backdrop-blur-md md:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
              onClick={() => setCollapsed((v) => !v)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft />
            </Button>

            <div className="relative hidden max-w-xl flex-1 md:block">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCommand(query)}
                className="bg-muted/60 pl-9 pr-14 shadow-none border-transparent focus:border-border focus:bg-white transition-all duration-200"
                placeholder="Search products, orders, warehouses…"
              />
              <kbd className="absolute right-2 top-2 rounded border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">/</kbd>
            </div>

            <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 text-xs" onClick={() => setCommandOpen(true)}>
              <Sparkles className="size-3.5" /> Command
              <kbd className="ml-1 text-[10px] opacity-70">Ctrl K</kbd>
            </Button>

            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className="hidden w-44 shadow-none xl:flex text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(true)} aria-label="Notifications" className="relative">
              <Bell className="size-4" />
              {hasNotifications && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />}
            </Button>

            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-primary/20">
                {initials}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-medium leading-tight">{displayName}</div>
                <div className="text-[10px] text-muted-foreground">{user?.role ?? "User"}</div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] p-4 md:p-6 lg:p-8 animate-fade-up">
            {children}
          </main>
        </div>
      </div>

      {/* Command palette */}
      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent className="top-[18%] max-w-xl translate-y-0 p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Command center</DialogTitle>
            <DialogDescription>Search or run a StockSense command</DialogDescription>
          </DialogHeader>
          <div className="border-b p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Search className="size-5 text-muted-foreground" />
              <Input
                autoFocus
                className="border-0 text-base shadow-none focus-visible:ring-0 bg-transparent"
                placeholder="What do you want to do?"
                onKeyDown={(e) => { if (e.key === "Enter") runCommand(e.currentTarget.value); }}
              />
            </div>
          </div>
          <div className="p-3">
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested</div>
            {[
              "Show items that may run out this week",
              "Move 20 Steel Rods to Production Floor",
              "Show unusual adjustments",
              "Show today's receipts",
              "Open stock ledger",
              "View delivery orders",
            ].map((command, i) => (
              <Button
                key={command}
                variant="ghost"
                className={cn("w-full justify-start font-normal text-sm animate-fade-up", staggerClasses[i])}
                onClick={() => runCommand(command)}
              >
                {command}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">Notifications</DialogTitle>
            <DialogDescription>Live signals from your inventory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {riskProducts.map((p) => (
              <NotificationItem
                key={p.id}
                tone={statusFor(p) === "Critical" ? "danger" : "warning"}
                title={`${p.name} stock is ${statusFor(p).toLowerCase()}`}
                detail={`${Math.round(p.locations.reduce((s, l) => s + l.quantity, 0))} ${p.unit} remaining — reorder point is ${p.reorderPoint} ${p.unit}.`}
                onClick={() => { setNotificationsOpen(false); }}
              />
            ))}
            {pendingReceipts > 0 && (
              <NotificationItem
                tone="info"
                title={`${pendingReceipts} receipt${pendingReceipts > 1 ? "s" : ""} recorded in ledger`}
                detail="Check the stock ledger for the full movement history."
              />
            )}
            {recentTransfers.map((t) => (
              <NotificationItem
                key={t.id}
                tone="info"
                title={`Transfer ${t.reference} completed`}
                detail={`${t.from} → ${t.to} · Stock distribution updated.`}
              />
            ))}
            {!hasNotifications && pendingReceipts === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No active alerts.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </WarehouseContext.Provider>
  );
}

function NotificationItem({
  tone, title, detail, onClick,
}: { tone: string; title: string; detail: string; onClick?: () => void }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-3 cursor-default",
        tone === "danger" ? "border-danger/20 bg-danger-soft/30" :
        tone === "warning" ? "border-warning/20 bg-warning-soft/30" :
        "border-info/20 bg-info-soft/30"
      )}
      onClick={onClick}
    >
      <span className={cn("mt-1 size-2 shrink-0 rounded-full", tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-info")} />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

// ─── Auth gate ──────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isPublic = pathname === "/" || pathname === "/login" || pathname.startsWith("/auth/");

  useEffect(() => {
    if (!isLoading && !user && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, isPublic, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  if (!user) return null;

  return <>{children}</>;
}

// ─── Public AppShell ────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = pathname === "/" || pathname === "/login" || pathname.startsWith("/auth/");

  return (
    <AuthProvider>
      <InventoryProvider>
        <AuthGate>
          {isPublic ? children : <InnerShell>{children}</InnerShell>}
        </AuthGate>
      </InventoryProvider>
    </AuthProvider>
  );
}
