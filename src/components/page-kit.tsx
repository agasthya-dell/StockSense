import { Link } from "@tanstack/react-router";
import { ArrowRight, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daysRemaining, statusFor, totalStock, useInventory, type Product } from "@/lib/inventory";
import { StatusBadge } from "@/components/status-badge";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <div className="mb-1 text-[11px] font-semibold uppercase text-primary">{eyebrow}</div>}<h1 className="text-2xl font-semibold text-foreground md:text-[28px]">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}

export function Section({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-md border bg-card shadow-[0_1px_2px_var(--border)] ${className}`}><div className="flex items-start justify-between gap-4 border-b px-5 py-4"><div>{title && <h2 className="text-sm font-semibold">{title}</h2>}{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>{action}</div>{children}</section>;
}

export function ProductTable({ products, compact = false }: { products: Product[]; compact?: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b bg-muted/35 text-[10px] uppercase text-muted-foreground"><th className="px-5 py-3 font-semibold">SKU</th><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Available</th><th className="px-4 py-3 font-semibold">Locations</th><th className="px-4 py-3 font-semibold">Reorder point</th><th className="px-4 py-3 font-semibold">Status</th>{!compact && <><th className="px-4 py-3 font-semibold">Last movement</th><th className="px-4 py-3" /></>}</tr></thead><tbody>{products.map((p) => <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td><td className="px-4 py-3"><Link to="/products/$productId" params={{ productId: p.id }} className="font-medium hover:text-primary">{p.name}</Link></td><td className="px-4 py-3 text-muted-foreground">{p.category}</td><td className="px-4 py-3 font-medium">{totalStock(p).toLocaleString()} {p.unit}</td><td className="px-4 py-3 text-muted-foreground">{p.locations.filter(l => l.quantity > 0).length} locations</td><td className="px-4 py-3 text-muted-foreground">{p.reorderPoint} {p.unit}</td><td className="px-4 py-3"><StatusBadge status={statusFor(p)} /></td>{!compact && <><td className="px-4 py-3 text-muted-foreground">{p.lastMovement}</td><td className="px-4 py-3"><Button variant="ghost" size="icon"><MoreHorizontal /></Button></td></>}</tr>)}</tbody></table></div>;
}

export function ProductFilters({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  return <div className="flex flex-col gap-2 border-b p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={query} onChange={(e) => onQuery(e.target.value)} className="pl-9 shadow-none" placeholder="Search product or SKU" /></div>{["Category", "Warehouse", "Status", "Sort: Updated"].map((value) => <Select key={value} defaultValue="all"><SelectTrigger className="w-full shadow-none md:w-40"><SelectValue placeholder={value} /></SelectTrigger><SelectContent><SelectItem value="all">{value}</SelectItem><SelectItem value="secondary">All options</SelectItem></SelectContent></Select>)}</div>;
}

export function RiskRow({ product }: { product: Product }) {
  return <div className="grid gap-4 border-b p-5 last:border-0 md:grid-cols-[1.4fr_.7fr_.7fr_1fr_auto] md:items-center"><div><div className="flex items-center gap-2"><Link to="/products/$productId" params={{ productId: product.id }} className="font-semibold hover:text-primary">{product.name}</Link><StatusBadge status={statusFor(product)} /></div><div className="mt-1 text-xs text-muted-foreground">{product.locations[0]?.warehouse}</div></div><Metric label="Current" value={`${totalStock(product)} ${product.unit}`} /><Metric label="Depletion" value={`${daysRemaining(product).toFixed(1)} days`} /><div><div className="text-[10px] uppercase text-muted-foreground">Why it matters</div><div className="mt-1 text-xs">Usage increased {product.trend}% in 7 days.</div></div><Button asChild variant="outline" size="sm"><Link to="/products/$productId" params={{ productId: product.id }}>Review <ArrowRight /></Link></Button></div>;
}

export function Metric({ label, value }: { label: string; value: string }) { return <div><div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>; }

export function EmptyState({ children }: { children: React.ReactNode }) { return <div className="p-10 text-center text-sm text-muted-foreground">{children}</div>; }

export function useProduct(productId: string) { return useInventory().products.find((p) => p.id === productId); }