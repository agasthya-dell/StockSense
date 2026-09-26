import { createFileRoute } from "@tanstack/react-router";
import { Activity, TriangleAlert } from "lucide-react";
import { PageHeader, RiskRow, Section } from "@/components/page-kit";
import { detectAnomalies, statusFor, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk-monitor")({
  head: () => ({ meta: [{ title: "Risk Monitor — StockSense" }] }),
  component: Page,
});

function Page() {
  const { products, ledger } = useInventory();
  const riskProducts = products.filter((p) => ["At Risk", "Critical"].includes(statusFor(p)));
  const anomalies = detectAnomalies(products, ledger);

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="Risk Monitor"
        description="Explainable signals for stock-out exposure and unusual movement."
      />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Section title="Stock-out risk" description={`${riskProducts.length} product${riskProducts.length !== 1 ? "s" : ""} require attention`}>
          {riskProducts.length > 0
            ? riskProducts.map((p) => <RiskRow key={p.id} product={p} />)
            : <div className="p-8 text-center text-sm text-muted-foreground">No products at risk. All items are within safe thresholds.</div>}
        </Section>

        <Section title="Movement Anomalies" description="Neutral operational signals that require review.">
          {anomalies.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No anomalies detected in recent adjustment activity.</div>
          ) : (
            <div className="divide-y">
              {anomalies.map((a, i) => (
                <div
                  key={a.productId}
                  className={cn("p-5 animate-fade-up", i < 6 ? `stagger-${i + 1}` : "")}
                >
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="size-5 text-warning" />
                    <span className="text-xs font-semibold uppercase text-warning">Requires review</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{a.productName}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                  <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adjusted out</span>
                      <span className="font-semibold">{a.totalAdjusted} {a.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Events</span>
                      <span>{a.eventCount} adjustment{a.eventCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Pattern</span>
                      <span className="text-right">Repeated adjustments at one location</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-md bg-info-soft p-3 text-xs text-info">
                    <Activity className="mt-0.5 size-4 shrink-0" />
                    This signal identifies unusual activity only. It does not infer intent.
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
