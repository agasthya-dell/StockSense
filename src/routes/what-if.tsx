import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, RotateCcw, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Section } from "@/components/page-kit";
import { daysRemaining, statusFor, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/what-if")({
  head: () => ({ meta: [{ title: "What-if Simulator — StockSense" }] }),
  component: Page,
});

function Page() {
  const { products } = useInventory();
  const navigate = useNavigate();
  const [demand, setDemand] = useState(20);
  const [delay, setDelay] = useState(3);
  const [outage, setOutage] = useState(false);

  // Show all products sorted by impact
  const focus = products.slice().sort((a, b) => daysRemaining(a) - daysRemaining(b)).slice(0, 6);

  // Compute projected days remaining with the scenario applied
  const projectedDays = (p: ReturnType<typeof useInventory>["products"][0]) => {
    const base = daysRemaining(p);
    // Demand increase compresses days remaining
    const afterDemand = base / (1 + demand / 100);
    // Supplier delay: if stocked out before delay expires, no restock arrives in time
    const afterDelay = Math.max(0, afterDemand - delay * (p.dailyUse / Math.max(p.dailyUse, 0.1)) * 0.3);
    // Outage: if the product has stock in >1 location, one location becomes unavailable
    const activeLocations = p.locations.filter((l) => l.quantity > 0).length;
    const outageMultiplier = outage && activeLocations > 1 ? 0.65 : 1;
    return Math.max(0, afterDelay * outageMultiplier);
  };

  // Generate dynamic actions based on simulation results
  const actions: { text: string; productId: string }[] = [];
  for (const p of focus) {
    const before = daysRemaining(p);
    const after = projectedDays(p);
    if (after < 7 && before >= 7) {
      actions.push({ text: `Reorder ${p.name} — drops to ${after.toFixed(1)} days`, productId: p.id });
    }
    if (after < 3) {
      actions.push({ text: `Urgent: ${p.name} stocks out in ${after.toFixed(1)} days under this scenario`, productId: p.id });
    }
  }
  if (outage) {
    actions.push({ text: "Redistribute stock from affected warehouse before outage", productId: "" });
  }
  if (delay > 7) {
    actions.push({ text: `Increase safety stock levels to cover ${delay}-day supplier delay`, productId: "" });
  }
  if (actions.length === 0) {
    actions.push({ text: "Inventory is resilient under current scenario — no urgent actions needed", productId: "" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="What If?"
        description="Stress-test inventory decisions before conditions change."
        actions={
          <Button variant="outline" onClick={() => { setDemand(20); setDelay(3); setOutage(false); }}>
            <RotateCcw className="size-4 mr-1" /> Reset
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <Section title="Scenario controls" description="Changes recalculate results immediately.">
          <div className="space-y-7 p-5">
            <Control label="Demand increase" value={`+${demand}%`}>
              <Slider value={[demand]} onValueChange={(v) => setDemand(v[0] ?? 0)} max={80} step={5} />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span><span>+80%</span>
              </div>
            </Control>
            <Control label="Supplier delay" value={`+${delay} day${delay !== 1 ? "s" : ""}`}>
              <Slider value={[delay]} onValueChange={(v) => setDelay(v[0] ?? 0)} max={14} />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0 days</span><span>14 days</span>
              </div>
            </Control>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Warehouse outage</div>
                <div className="mt-1 text-xs text-muted-foreground">One location becomes unavailable</div>
              </div>
              <Switch checked={outage} onCheckedChange={setOutage} />
            </div>
          </div>
        </Section>

        <div className="space-y-5">
          <Section
            title="Projected impact"
            description={`Demand +${demand}% · Supplier delay +${delay} days${outage ? " · 1 location unavailable" : ""}`}
          >
            <div className="divide-y">
              {focus.map((p) => {
                const before = daysRemaining(p);
                const after = projectedDays(p);
                const degraded = after < before * 0.7;
                const critical = after < 7;
                return (
                  <div
                    key={p.id}
                    className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{statusFor(p)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Before: <span className="font-medium text-foreground">{before.toFixed(1)} days</span>
                    </div>
                    <div className={cn("flex items-center gap-1 text-sm font-semibold", critical ? "text-danger" : degraded ? "text-warning" : "text-success")}>
                      {degraded && <TrendingDown className="size-3.5" />}
                      {after.toFixed(1)} days
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => navigate({ to: "/products/$productId", params: { productId: p.id } })}
                    >
                      Review
                    </Button>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Recommended actions" description="Generated from simulation results.">
            <div className="divide-y">
              {actions.slice(0, 4).map((action, i) => (
                <button
                  key={action.text}
                  type="button"
                  className={cn("flex w-full items-center gap-3 p-4 text-left text-sm hover:bg-muted/20 transition-colors group animate-fade-up", `stagger-${i + 1}`)}
                  onClick={() => {
                    if (action.productId) navigate({ to: "/products/$productId", params: { productId: action.productId } });
                    else navigate({ to: "/intelligence" });
                  }}
                >
                  <ArrowRight className="size-4 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  {action.text}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Control({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold text-primary">{value}</span>
      </div>
      {children}
    </div>
  );
}
