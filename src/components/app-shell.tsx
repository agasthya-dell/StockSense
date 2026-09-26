import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Archive, ArrowLeftRight, Bell, Boxes, BrainCircuit, Building2, ChevronLeft, ChevronRight, ClipboardCheck, Gauge, History, Menu, PackageCheck, Search, Settings, SlidersHorizontal, Sparkles, TriangleAlert, Truck, UserRound, Warehouse, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryProvider } from "@/lib/inventory";
import { cn } from "@/lib/utils";

const groups = [
  { label: "", items: [{ label: "Overview", to: "/", icon: Gauge }] },
  { label: "Inventory", items: [{ label: "Products", to: "/products", icon: Boxes }, { label: "Stock by Location", to: "/locations", icon: Warehouse }, { label: "Low Stock", to: "/low-stock", icon: TriangleAlert }] },
  { label: "Operations", items: [{ label: "Receipts", to: "/receipts", icon: PackageCheck }, { label: "Deliveries", to: "/deliveries", icon: Truck }, { label: "Transfers", to: "/transfers", icon: ArrowLeftRight }, { label: "Adjustments", to: "/adjustments", icon: SlidersHorizontal }, { label: "Stock Ledger", to: "/ledger", icon: History }] },
  { label: "Intelligence", items: [{ label: "StockSense Intelligence", to: "/intelligence", icon: Sparkles }, { label: "Risk Monitor", to: "/risk-monitor", icon: BrainCircuit }, { label: "What-if Simulator", to: "/what-if", icon: ClipboardCheck }] },
  { label: "Administration", items: [{ label: "Warehouses", to: "/warehouses", icon: Building2 }, { label: "Settings", to: "/settings", icon: Settings }] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const isLogin = pathname === "/login";

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); }
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (isLogin) return <InventoryProvider>{children}</InventoryProvider>;

  const runCommand = (text: string) => {
    const lower = text.toLowerCase();
    setCommandOpen(false);
    if (lower.includes("move") || lower.includes("transfer")) navigate({ to: "/transfers", search: { preset: "steel" } });
    else if (lower.includes("unusual") || lower.includes("anomal")) navigate({ to: "/risk-monitor" });
    else if (lower.includes("receipt")) navigate({ to: "/receipts" });
    else if (lower.includes("low") || lower.includes("run out") || lower.includes("reorder")) navigate({ to: "/products", search: { status: "risk" } });
    else navigate({ to: "/products", search: { q: text } });
  };

  const sidebar = <aside className={cn("flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200", collapsed ? "w-16" : "w-60")}>
    <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Archive className="size-4" /></div>
      {!collapsed && <div><div className="text-sm font-bold tracking-wide text-sidebar-foreground">STOCKSENSE</div><div className="text-[10px] text-muted-foreground">Inventory operations</div></div>}
    </div>
    <nav className="flex-1 overflow-y-auto px-2 py-4">
      {groups.map((group) => <div className="mb-4" key={group.label || "overview"}>
        {!collapsed && group.label && <div className="mb-1 px-2 text-[10px] font-semibold uppercase text-muted-foreground">{group.label}</div>}
        <div className="space-y-0.5">{group.items.map((item) => <Link key={item.to} to={item.to} search={{}} onClick={() => setMobileOpen(false)} className={cn("flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors", pathname === item.to ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground")} title={collapsed ? item.label : undefined}><item.icon className="size-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}</Link>)}</div>
      </div>)}
    </nav>
    <div className="border-t border-sidebar-border p-2">
      <Link to="/profile" className="flex h-10 items-center gap-3 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent"><UserRound className="size-4" />{!collapsed && "Agasthya"}</Link>
      <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={() => navigate({ to: "/login" })}>{collapsed ? <ChevronRight /> : "Logout"}</Button>
    </div>
  </aside>;

  return <InventoryProvider>
    <div className="flex min-h-screen w-full bg-background">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && <><div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} /><div className="fixed inset-y-0 left-0 z-50 lg:hidden">{sidebar}<Button variant="ghost" size="icon" className="absolute right-2 top-3" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></Button></div></>}
      <div className={cn("min-w-0 flex-1 transition-[margin] duration-200", collapsed ? "lg:ml-16" : "lg:ml-60")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((v) => !v)} aria-label="Collapse sidebar">{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button>
          <div className="relative hidden max-w-xl flex-1 md:block"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCommand(query)} className="bg-muted/50 pl-9 pr-14 shadow-none" placeholder="Search products, orders, warehouses…" /><kbd className="absolute right-2 top-2 rounded border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">/</kbd></div>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setCommandOpen(true)}><Sparkles /> Command <kbd className="ml-2 text-[10px] text-muted-foreground">Ctrl K</kbd></Button>
          <Select defaultValue="all"><SelectTrigger className="hidden w-44 shadow-none xl:flex"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All warehouses</SelectItem>{["Main Warehouse", "Production Floor", "Dispatch Area", "Warehouse 2"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select>
          <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(true)} aria-label="Notifications" className="relative"><Bell /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" /></Button>
          <div className="hidden items-center gap-2 sm:flex"><div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">AS</div><div className="hidden xl:block"><div className="text-xs font-medium">Agasthya</div><div className="text-[10px] text-muted-foreground">Inventory Manager</div></div></div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}><DialogContent className="top-[18%] max-w-xl translate-y-0 p-0"><DialogHeader className="sr-only"><DialogTitle>Command center</DialogTitle><DialogDescription>Search or run a StockSense command</DialogDescription></DialogHeader><div className="border-b p-4"><div className="flex items-center gap-3"><Search className="size-5 text-muted-foreground" /><Input autoFocus className="border-0 text-base shadow-none focus-visible:ring-0" placeholder="What do you want to do?" onKeyDown={(e) => { if (e.key === "Enter") runCommand(e.currentTarget.value); }} /></div></div><div className="p-3"><div className="px-2 pb-2 text-[11px] font-semibold uppercase text-muted-foreground">Suggested commands</div>{["Show items that may run out this week", "Move 20 Steel Rods to Production Floor", "Show unusual adjustments", "Show today's receipts"].map((command) => <Button key={command} variant="ghost" className="w-full justify-start font-normal" onClick={() => runCommand(command)}>{command}</Button>)}</div></DialogContent></Dialog>
    <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Notifications</DialogTitle><DialogDescription>Operational changes requiring your attention.</DialogDescription></DialogHeader><div className="space-y-2"><Notification tone="danger" title="Steel Rods may stock out in 4 days" detail="Review reorder or transfer options." /><Notification tone="warning" title="7 receipts are pending" detail="Two are expected today." /><Notification tone="info" title="Transfer TRF-2041 completed" detail="Stock distribution is now updated." /></div></DialogContent></Dialog>
  </InventoryProvider>;
}

function Notification({ tone, title, detail }: { tone: string; title: string; detail: string }) {
  return <div className="flex gap-3 rounded-md border p-3"><span className={cn("mt-1 size-2 rounded-full", tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-info")} /><div><div className="text-sm font-medium">{title}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div></div>;
}