import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/page-kit";
import { StatusBadge } from "@/components/status-badge";
import { daysRemaining, statusFor, totalStock, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/low-stock")({
  head: () => ({ meta: [{ title: "Low Stock — StockSense" }] }),
  component: Page,
});

function Page() {
  const { products } = useInventory();
  const lowStock = products
    .filter((p) => ["At Risk", "Critical"].includes(statusFor(p)))
    .sort((a, b) => daysRemaining(a) - daysRemaining(b)); // most urgent first

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Low Stock"
        description={`${lowStock.length} product${lowStock.length !== 1 ? "s" : ""} below or approaching their configured reorder point.`}
      />
      <Section>
        {lowStock.length === 0 ? (
          <div className="p-12 text-center">
            <div className="font-serif text-2xl text-success">All clear</div>
            <p className="mt-2 text-sm text-muted-foreground">No products are currently below their reorder threshold.</p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/products" search={{}}>View all products</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Available</th>
                  <th className="px-4 py-3 font-semibold">Reorder point</th>
                  <th className="px-4 py-3 font-semibold">Days remaining</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p, i) => {
                  const days = daysRemaining(p);
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/25 transition-colors animate-fade-up",
                        i < 6 ? `stagger-${i + 1}` : ""
                      )}
                    >
                      <td className="px-5 py-3">
                        <Link to="/products/$productId" params={{ productId: p.id }} className="font-medium hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{totalStock(p).toLocaleString()} {p.unit}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.reorderPoint} {p.unit}</td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", days < 3 ? "text-danger" : days < 7 ? "text-warning" : "text-foreground")}>
                        {days.toFixed(1)} days
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={statusFor(p)} /></td>
                      <td className="px-4 py-3">
                        <Button asChild variant="outline" size="sm" className="group">
                          <Link to="/products/$productId" params={{ productId: p.id }}>
                            Review <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
