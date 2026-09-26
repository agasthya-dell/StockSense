import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, PackagePlus, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric, PageHeader, Section } from "@/components/page-kit";
import { StockChart } from "@/components/stock-chart";
import { StatusBadge } from "@/components/status-badge";
import { daysRemaining, statusFor, totalStock, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$productId")({
  head: () => ({
    meta: [{ title: "Product Workspace — StockSense" }],
  }),
  component: ProductPage,
});

function computeRiskReasons(product: ReturnType<typeof useInventory>["products"][0]): string[] {
  const reasons: string[] = [];
  const total = totalStock(product);
  const days = daysRemaining(product);
  const status = statusFor(product);

  if (product.trend > 15) reasons.push(`Daily consumption increased — +${product.trend}% in the last 7 days`);
  if (total < product.reorderPoint) reasons.push(`Current stock (${total} ${product.unit}) is below the reorder threshold (${product.reorderPoint} ${product.unit})`);
  if (days < 7) reasons.push(`Stock-out projected within ${days.toFixed(1)} days at current consumption rate`);
  if (product.locations.filter((l) => l.quantity > 0).length === 1) reasons.push("Stock is concentrated in a single warehouse — no backup location available");
  if (status === "Overstocked") reasons.push(`Stock exceeds 3× the reorder point — consider redistributing or pausing orders`);
  if (product.dailyUse < 1) reasons.push("Very low daily usage — item may be obsolete or demand has shifted");
  if (reasons.length === 0) reasons.push("No active risk factors — item is within healthy thresholds");

  return reasons.slice(0, 4);
}

function ProductPage() {
  const { productId } = Route.useParams();
  const { products, ledger } = useInventory();
  const [dismissed, setDismissed] = useState(false);

  const p = products.find((x) => x.id === productId);
  if (!p) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="font-serif text-2xl text-foreground">Product not found</div>
      <p className="mt-2 text-sm text-muted-foreground">This product may have been removed or the URL is incorrect.</p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/products" search={{}}>← Back to products</Link>
      </Button>
    </div>
  );

  const total = totalStock(p);
  const days = daysRemaining(p);
  const status = statusFor(p);
  const productLedger = ledger.filter((e) => e.productId === p.id);
  const riskReasons = computeRiskReasons(p);
  const recommendedReorder = Math.max(0, Math.ceil((p.dailyUse * 14 + p.reorderPoint - total) / 10) * 10);
  const maxQty = Math.max(...p.locations.map((l) => l.quantity), 1);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/products" search={{}}><ArrowLeft className="size-4 mr-1" />Products</Link>
      </Button>

      <PageHeader
        eyebrow={`SKU: ${p.sku}`}
        title={p.name}
        description={`${p.category} · ${p.locations.filter((l) => l.quantity > 0).length} active location${p.locations.filter((l) => l.quantity > 0).length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/transfers" search={{ preset: p.id }}>
                <ArrowRight className="size-4 mr-1" />Transfer
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/adjustments">
                <SlidersHorizontal className="size-4 mr-1" />Adjust
              </Link>
            </Button>
            <Button asChild>
              <Link to="/receipts">
                <PackagePlus className="size-4 mr-1" />Create receipt
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        {/* Left column */}
        <div className="space-y-5">
          <Section title="Current Stock">
            <div className="p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-serif text-4xl font-normal">
                    {total.toLocaleString()} <span className="text-base text-muted-foreground font-sans">{p.unit}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Reorder point: {p.reorderPoint} {p.unit} · {days.toFixed(1)} days remaining
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>
            </div>
          </Section>

          <Section title="Warehouse Distribution" description="Available inventory by operating location.">
            <div className="divide-y">
              {p.locations.map((l) => (
                <div className="flex items-center justify-between px-5 py-4" key={l.warehouse}>
                  <div>
                    <div className="text-sm font-medium">{l.warehouse}</div>
                    <div className="mt-2 h-1.5 w-40 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", l.quantity > 0 ? "bg-primary" : "bg-muted-foreground/30")}
                        style={{ width: `${Math.min(100, (l.quantity / maxQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{l.quantity} {p.unit}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Movement History" description={`${productLedger.length} recorded event${productLedger.length !== 1 ? "s" : ""}`}>
            {productLedger.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No movements recorded yet.</div>
            ) : (
              <div className="divide-y max-h-80 overflow-y-auto">
                {productLedger.map((e, i) => (
                  <div
                    key={e.id}
                    className={cn("grid grid-cols-[8px_1fr_auto] gap-3 p-4 animate-fade-up", i < 6 ? `stagger-${i + 1}` : "")}
                  >
                    <span className={cn("mt-1.5 size-2 rounded-full shrink-0", e.operation === "Receipt" ? "bg-success" : e.operation === "Delivery" ? "bg-danger" : e.operation === "Transfer" ? "bg-info" : "bg-warning")} />
                    <div>
                      <div className="text-sm font-medium">{e.operation} · {e.reference}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{e.from} → {e.to}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className={cn("font-semibold", e.quantity > 0 ? "text-success" : "text-danger")}>
                        {e.quantity > 0 ? "+" : ""}{e.quantity} {p.unit}
                      </div>
                      <div className="mt-1 text-muted-foreground">{e.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Section title="Stock Intelligence" description="Deterministic projection based on recent movement and configured safety levels.">
            <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
              {([
                ["Estimated remaining", `${days.toFixed(1)} days`],
                ["Reorder point", `${p.reorderPoint} ${p.unit}`],
                ["Daily consumption", `${p.dailyUse} ${p.unit}`],
                ["Projected stock-out", days < 7 ? "Within 7 days" : days < 14 ? "Within 14 days" : "Beyond 14 days"],
                ["Recommended reorder", `${recommendedReorder} ${p.unit}`],
                ["Demand change", `${p.trend > 0 ? "+" : ""}${p.trend}%`],
              ] as [string, string][]).map(([a, b]) => (
                <div className="bg-card p-4" key={a}>
                  <Metric label={a} value={b} />
                </div>
              ))}
            </div>
            <div className="p-4">
              <StockChart current={total} dailyUse={p.dailyUse} reorderPoint={p.reorderPoint} />
            </div>
          </Section>

          <Section
            title={status === "Healthy" ? "Why this item is healthy" : "Why is this item at risk?"}
            description="The signals behind the current StockSense assessment."
          >
            <ol className="divide-y">
              {riskReasons.map((x, i) => (
                <li className="flex gap-3 p-4 text-sm" key={x}>
                  <span className={cn("font-semibold shrink-0", status === "Healthy" ? "text-success" : "text-primary")}>
                    0{i + 1}
                  </span>
                  {x}
                </li>
              ))}
            </ol>
            {(status === "At Risk" || status === "Critical") && (
              <div className="border-t bg-danger-soft px-5 py-4 text-sm font-semibold text-danger rounded-b-lg">
                Projected stock-out in {days.toFixed(1)} days.
              </div>
            )}
          </Section>

          {!dismissed && recommendedReorder > 0 && (
            <Section title="Recommended Reorder">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-serif text-2xl font-normal">{recommendedReorder} {p.unit}</div>
                    <div className="mt-1 text-xs font-semibold text-warning">Suggested within 24 hours</div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setDismissed(true)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Covers approximately 14 days of projected demand while maintaining the configured safety buffer.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button asChild>
                    <Link to="/receipts">Create receipt</Link>
                  </Button>
                  <Button variant="outline" onClick={() => setDismissed(true)}>Dismiss</Button>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
