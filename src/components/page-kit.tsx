import { Link } from "@tanstack/react-router";
import { ArrowRight, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daysRemaining, statusFor, totalStock, useInventory, type Product } from "@/lib/inventory";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-blur-in">
      <div>
        {eyebrow && <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{eyebrow}</div>}
        <h1 className="font-serif font-normal text-3xl text-foreground md:text-[34px] leading-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-[0_1px_3px_oklch(0_0_0/0.06),0_1px_2px_oklch(0_0_0/0.04)] animate-fade-up", className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// Spotlight card hook — tracks mouse position for the CSS radial gradient effect
export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);
  return ref;
}

export function ProductTable({ products, compact = false }: { products: Product[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-semibold">SKU</th>
            <th className="px-4 py-3 font-semibold">Product</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Available</th>
            <th className="px-4 py-3 font-semibold">Locations</th>
            <th className="px-4 py-3 font-semibold">Reorder point</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            {!compact && <><th className="px-4 py-3 font-semibold">Last movement</th><th className="px-4 py-3" /></>}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className={cn("border-b last:border-0 hover:bg-muted/25 transition-colors duration-100 animate-fade-up", `stagger-${Math.min(i + 1, 6)}`)}
            >
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
              <td className="px-4 py-3">
                <Link to="/products/$productId" params={{ productId: p.id }} className="font-medium hover:text-primary transition-colors">{p.name}</Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
              <td className="px-4 py-3 font-medium">{totalStock(p).toLocaleString()} {p.unit}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.locations.filter(l => l.quantity > 0).length} locations</td>
              <td className="px-4 py-3 text-muted-foreground">{p.reorderPoint} {p.unit}</td>
              <td className="px-4 py-3"><StatusBadge status={statusFor(p)} /></td>
              {!compact && (
                <>
                  <td className="px-4 py-3 text-muted-foreground">{p.lastMovement}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="icon"><MoreHorizontal /></Button></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductFilters({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2 border-b p-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => onQuery(e.target.value)} className="pl-9 shadow-none" placeholder="Search product or SKU" />
      </div>
      {["Category", "Warehouse", "Status", "Sort: Updated"].map((value) => (
        <Select key={value} defaultValue="all">
          <SelectTrigger className="w-full shadow-none md:w-40"><SelectValue placeholder={value} /></SelectTrigger>
          <SelectContent><SelectItem value="all">{value}</SelectItem><SelectItem value="secondary">All options</SelectItem></SelectContent>
        </Select>
      ))}
    </div>
  );
}

export function RiskRow({ product }: { product: Product }) {
  return (
    <div className="grid gap-4 border-b p-5 last:border-0 md:grid-cols-[1.4fr_.7fr_.7fr_1fr_auto] md:items-center hover:bg-muted/20 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/products/$productId" params={{ productId: product.id }} className="font-semibold hover:text-primary transition-colors">{product.name}</Link>
          <StatusBadge status={statusFor(product)} />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{product.locations[0]?.warehouse}</div>
      </div>
      <Metric label="Current" value={`${totalStock(product)} ${product.unit}`} />
      <Metric label="Depletion" value={`${daysRemaining(product).toFixed(1)} days`} />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Why it matters</div>
        <div className="mt-1 text-xs">Usage increased {product.trend}% in 7 days.</div>
      </div>
      <Button asChild variant="outline" size="sm" className="group">
        <Link to="/products/$productId" params={{ productId: product.id }}>
          Review <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="p-10 text-center text-sm text-muted-foreground">{children}</div>;
}

export function useProduct(productId: string) {
  return useInventory().products.find((p) => p.id === productId);
}
