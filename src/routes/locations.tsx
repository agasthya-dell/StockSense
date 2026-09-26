import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/page-kit";
import { StatusBadge } from "@/components/status-badge";
import { statusFor, warehouses, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/locations")({
  head: () => ({ meta: [{ title: "Stock by Location — StockSense" }] }),
  component: Page,
});

// Map category to a meaningful rack label
function rackLabel(category: string, index: number): string {
  const labels: Record<string, string> = {
    "Raw Materials": "Raw Mat.",
    "Components": "Components",
    "Finished Goods": "Finished",
    "Packaging": "Packing",
    "Hardware": "Hardware",
    "Safety": "Safety",
  };
  return labels[category] ?? `Rack ${String.fromCharCode(65 + (index % 26))}`;
}

function Page() {
  const { products } = useInventory();

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Stock by Location"
        description="A visual operating view of inventory across each warehouse."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {warehouses.map((w) => {
          const warehouseProducts = products.filter((p) =>
            p.locations.some((l) => l.warehouse === w && l.quantity > 0)
          );
          const total = warehouseProducts.reduce(
            (sum, p) => sum + (p.locations.find((l) => l.warehouse === w)?.quantity ?? 0),
            0
          );
          return (
            <Section
              key={w}
              title={w}
              description={`${warehouseProducts.length} product line${warehouseProducts.length !== 1 ? "s" : ""} · ${total.toLocaleString()} units on hand`}
            >
              {warehouseProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No stock at this location.</div>
              ) : (
                <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
                  {warehouseProducts.map((p, i) => {
                    const qty = p.locations.find((l) => l.warehouse === w)?.quantity ?? 0;
                    const status = statusFor(p);
                    return (
                      <Link
                        key={p.id}
                        to="/products/$productId"
                        params={{ productId: p.id }}
                        className={cn(
                          "min-h-28 bg-card p-4 hover:bg-muted/30 transition-colors group animate-fade-up",
                          i < 6 ? `stagger-${i + 1}` : ""
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {rackLabel(p.category, i)}
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <div className="mt-3 text-sm font-semibold group-hover:text-primary transition-colors">{p.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {qty.toLocaleString()} {p.unit}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Section>
          );
        })}
      </div>
    </>
  );
}
