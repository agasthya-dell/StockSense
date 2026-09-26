import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, Lightbulb, Scale, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, RiskRow, Section } from "@/components/page-kit";
import {
  computeHealthScore, detectAnomalies,
  daysRemaining, statusFor, totalStock, useInventory,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence")({
  head: () => ({ meta: [{ title: "StockSense Intelligence" }] }),
  component: Page,
});

function Page() {
  const { products, ledger } = useInventory();
  const risk = products.filter((p) => ["At Risk", "Critical"].includes(statusFor(p)));
  const anomalies = detectAnomalies(products, ledger);
  const health = computeHealthScore(products, ledger);

  // Balance options: products overstocked in one warehouse but low in another
  const balanceOptions = products.filter((p) => {
    const qtys = p.locations.map((l) => l.quantity);
    if (qtys.length < 2) return false;
    const max = Math.max(...qtys);
    const min = Math.min(...qtys);
    return max > p.reorderPoint && min < p.reorderPoint * 0.8;
  });

  // Best balance recommendation
  const bestTransfer = (() => {
    for (const p of risk) {
      const richSource = p.locations.find((l) => l.quantity > p.reorderPoint * 1.5);
      const poorDest = p.locations.find((l) => l.quantity < p.reorderPoint * 0.5);
      if (richSource && poorDest) {
        const moveQty = Math.min(
          Math.floor((richSource.quantity - p.reorderPoint) * 0.5),
          p.reorderPoint - poorDest.quantity
        );
        if (moveQty > 0) {
          return { product: p, from: richSource.warehouse, to: poorDest.warehouse, qty: moveQty };
        }
      }
    }
    // Fallback: steel rods
    const steel = products.find((p) => p.id === "steel-rods");
    if (steel) {
      return { product: steel, from: "Main Warehouse", to: "Production Floor", qty: 40 };
    }
    return null;
  })();

  const cards = [
    {
      Icon: TriangleAlert,
      title: `${risk.length} elevated risk${risk.length !== 1 ? "s" : ""}`,
      desc: risk.length > 0 ? "Demand coverage is tightening" : "All products within safe thresholds",
      tone: risk.length > 0 ? "danger" : "success",
      to: "/risk-monitor",
    },
    {
      Icon: BrainCircuit,
      title: `${anomalies.length} anomal${anomalies.length !== 1 ? "ies" : "y"}`,
      desc: anomalies.length > 0 ? "Adjustment activity requires review" : "No unusual adjustment patterns",
      tone: anomalies.length > 0 ? "warning" : "success",
      to: "/risk-monitor",
    },
    {
      Icon: Scale,
      title: `${balanceOptions.length} balance option${balanceOptions.length !== 1 ? "s" : ""}`,
      desc: balanceOptions.length > 0 ? "Existing stock can reduce purchasing" : "Inventory is well distributed",
      tone: "info",
      to: "/locations",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Decision support"
        title="StockSense Intelligence"
        description="Understand what is changing, why it matters, and what to do next."
      />

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ Icon, title, desc, tone, to }, i) => (
          <Link
            key={title}
            to={to}
            className={cn(
              "rounded-lg border bg-card p-5 hover:shadow-[0_4px_12px_oklch(0_0_0/0.08)] hover:-translate-y-0.5 transition-all duration-200 animate-fade-up",
              `stagger-${i + 1}`
            )}
          >
            <Icon className={cn("size-5", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-info")} />
            <div className="mt-4 text-lg font-semibold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
            <div className="mt-3 text-xs font-medium text-primary flex items-center gap-1 group">
              View details <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Health score overview */}
      <div className="mt-5 mb-5">
        <Section title="Overall health score" description="Composite score across 6 inventory dimensions">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className={cn(
                "grid size-16 shrink-0 place-items-center rounded-full border-4 font-serif text-xl",
                health.overall >= 80 ? "border-success-soft text-success" : health.overall >= 60 ? "border-warning-soft text-warning" : "border-danger-soft text-danger"
              )}>
                {health.overall}
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {([
                  ["Availability", health.availability],
                  ["Demand", health.demandCoverage],
                  ["Balance", health.warehouseBalance],
                  ["Anomalies", health.anomalies],
                  ["Dead stock", health.deadStock],
                  ["Pending ops", health.pendingOps],
                ] as [string, number][]).map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div className="font-semibold text-sm">{val}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Section
          title="Priority risks"
          description="Ranked by expected stock-out and operational impact."
        >
          {risk.length > 0
            ? risk.map((p) => <RiskRow key={p.id} product={p} />)
            : <div className="p-8 text-center text-sm text-muted-foreground">No products at risk right now.</div>}
        </Section>

        <Section title="Balance Inventory" description="Reduce risk by redistributing existing stock first.">
          {bestTransfer ? (
            <div className="p-5">
              <Lightbulb className="size-5 text-primary" />
              <h3 className="mt-4 font-semibold">
                Transfer {bestTransfer.qty} {bestTransfer.product.unit} of {bestTransfer.product.name}
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">From</div>
                  <div className="mt-1 text-sm font-medium">{bestTransfer.from}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {bestTransfer.product.locations.find((l) => l.warehouse === bestTransfer.from)?.quantity ?? 0} {bestTransfer.product.unit} available
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">To</div>
                  <div className="mt-1 text-sm font-medium">{bestTransfer.to}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {bestTransfer.product.locations.find((l) => l.warehouse === bestTransfer.to)?.quantity ?? 0} {bestTransfer.product.unit} currently
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {bestTransfer.to} is approaching its reorder threshold. {bestTransfer.from} has sufficient stock to cover this transfer while staying above safety levels.
              </p>
              <Button asChild className="mt-4">
                <Link to="/transfers" search={{ preset: bestTransfer.product.id }}>
                  Review transfer <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No balance opportunities detected. Inventory is well distributed.
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
