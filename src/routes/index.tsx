import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowRight, CalendarDays, PackageCheck,
  RefreshCw, TriangleAlert, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, RiskRow, Section } from "@/components/page-kit";
import { StockChart } from "@/components/stock-chart";
import {
  computeHealthScore, computeKPIs,
  statusFor, totalStock, useInventory,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — StockSense" },
      { name: "description", content: "Live inventory health, risks, and recommended actions." },
    ],
  }),
  component: Overview,
});

// ─── CountUp animation ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── KPI card with spotlight + count-up ──────────────────────────────────
function KpiCard({
  label, rawValue, detail, to, icon: Icon, delay, tone,
}: {
  label: string; rawValue: number; detail: string; to: string;
  icon: React.ElementType; delay: number; tone?: "danger" | "warning" | "info" | undefined;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const animated = useCountUp(rawValue, 1000 + delay);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Link
      ref={cardRef}
      to={to}
      search={{}}
      className="spotlight-card group rounded-lg border bg-card p-4 shadow-[0_1px_3px_oklch(0_0_0/0.06)] transition-all duration-200 hover:shadow-[0_4px_12px_oklch(0_0_0/0.1)] hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <Icon className={cn("size-3.5", tone === "danger" ? "text-danger/60" : tone === "warning" ? "text-warning/60" : "text-muted-foreground/60")} />
      </div>
      <div className={cn("mt-3 font-serif text-3xl font-normal", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-foreground")}>
        {animated.toLocaleString()}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{detail}</div>
    </Link>
  );
}

function Overview() {
  const { products, ledger } = useInventory();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const steel = products.find((p) => p.id === "steel-rods") ?? products[0];
  const risk = products.filter((p) => ["At Risk", "Critical"].includes(statusFor(p)));
  const kpis = computeKPIs(products, ledger);
  const health = computeHealthScore(products, ledger);

  const kpiCards = [
    { label: "Total stock", rawValue: kpis.totalStock, detail: `${products.length} products tracked`, to: "/products", icon: Activity, tone: undefined },
    { label: "Low stock", rawValue: kpis.lowStockCount, detail: kpis.lowStockCount > 0 ? "Needs attention" : "All healthy", to: "/low-stock", icon: TriangleAlert, tone: kpis.lowStockCount > 0 ? "warning" as const : undefined },
    { label: "Out of stock", rawValue: kpis.outOfStockCount, detail: kpis.outOfStockCount > 0 ? "Immediate action" : "None", to: "/low-stock", icon: TriangleAlert, tone: kpis.outOfStockCount > 0 ? "danger" as const : undefined },
    { label: "Receipts", rawValue: kpis.pendingReceipts, detail: "Recorded in ledger", to: "/receipts", icon: PackageCheck, tone: undefined },
    { label: "Deliveries", rawValue: kpis.pendingDeliveries, detail: "Completed deliveries", to: "/deliveries", icon: Truck, tone: undefined },
    { label: "Transfers", rawValue: kpis.pendingTransfers, detail: "Completed transfers", to: "/transfers", icon: ArrowRight, tone: undefined },
  ];

  const healthMetrics: [string, number, string][] = [
    ["Stock availability", health.availability, "/products"],
    ["Demand coverage", health.demandCoverage, "/low-stock"],
    ["Warehouse balance", health.warehouseBalance, "/locations"],
    ["Movement anomalies", health.anomalies, "/risk-monitor"],
    ["Dead stock", health.deadStock, "/products"],
    ["Pending operations", health.pendingOps, "/ledger"],
  ];

  const recommendedActions = [
    ...risk.slice(0, 2).map((p) => `Reorder ${p.name} — ${Math.ceil((p.dailyUse * 10 + p.reorderPoint - totalStock(p)) / 10) * 10} ${p.unit}`),
    ...(kpis.pendingTransfers > 0 ? [`Review ${kpis.pendingTransfers} pending transfer${kpis.pendingTransfers > 1 ? "s" : ""} in ledger`] : []),
    "Validate open receipts against physical stock",
  ].slice(0, 3);

  const actionRoutes: Record<string, string> = {
    "Validate open receipts against physical stock": "/receipts",
  };

  if (!steel) return null;

  return (
    <>
      <PageHeader
        title="Good morning, Agasthya"
        description="Here's what is happening across your inventory."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1.5">
              <CalendarDays className="size-4" /> {period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : "Last 90 days"}
            </Button>
            <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => window.location.reload()}>
              <RefreshCw className="size-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((k, i) => (
          <KpiCard key={k.label} {...k} delay={i * 60} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1.45fr]">
        <Section title="Inventory Health" description="Calculated from availability, demand, balance, anomalies, aging and pending work.">
          <div className="grid gap-6 p-5 md:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center justify-center">
              <div className={cn(
                "grid size-32 place-items-center rounded-full border-[10px]",
                health.overall >= 80 ? "border-success-soft" : health.overall >= 60 ? "border-warning-soft" : "border-danger-soft"
              )}>
                <div className="text-center">
                  <span className="font-serif text-3xl font-normal">{health.overall}</span>
                  <span className="text-sm text-muted-foreground"> / 100</span>
                </div>
              </div>
              <div className={cn("mt-3 text-sm font-medium", health.overall >= 80 ? "text-success" : health.overall >= 60 ? "text-warning" : "text-danger")}>
                {health.overall >= 80 ? "Healthy position" : health.overall >= 60 ? "Needs attention" : "Critical state"}
              </div>
            </div>
            <div className="space-y-3">
              {healthMetrics.map(([label, value, route], i) => (
                <Link
                  to={route}
                  key={label}
                  className={cn("grid grid-cols-[140px_1fr_28px] items-center gap-3 text-xs group animate-fade-up", `stagger-${i + 1}`)}
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                  <Progress value={value} className="h-1.5" />
                  <span className="text-right text-muted-foreground">{value}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t px-5 py-3 text-xs text-muted-foreground bg-muted/20 rounded-b-lg">
            {risk.length > 0
              ? `${risk.length} product${risk.length > 1 ? "s" : ""} require attention · stock-out risk detected`
              : "All products are within safe thresholds"}
          </div>
        </Section>

        <Section
          title="Needs Attention"
          description="Prioritized by depletion risk and operational impact."
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1 group">
              <Link to="/risk-monitor">View all <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" /></Link>
            </Button>
          }
        >
          {risk.length > 0
            ? risk.slice(0, 3).map((p) => <RiskRow key={p.id} product={p} />)
            : <div className="p-8 text-center text-sm text-muted-foreground">All products are within safe thresholds.</div>}
        </Section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Section
          title="Stock Trajectory"
          description={`${steel.name} · projected from current daily usage`}
          action={
            <div className="flex rounded-md border p-0.5 text-xs overflow-hidden">
              <span className="rounded-sm bg-primary px-2.5 py-1 text-primary-foreground font-medium">7 days</span>
              <span className="px-2.5 py-1 text-muted-foreground">14 days</span>
              <span className="px-2.5 py-1 text-muted-foreground">30 days</span>
            </div>
          }
        >
          <div className="p-4">
            <StockChart current={totalStock(steel)} dailyUse={steel.dailyUse} reorderPoint={steel.reorderPoint} />
          </div>
        </Section>

        <Section title="Recommended next actions" description="Ordered by urgency and impact.">
          <div className="divide-y">
            {recommendedActions.map((text, i) => (
              <button
                key={text}
                type="button"
                className={cn("flex w-full items-center gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer group text-left animate-fade-up", `stagger-${i + 1}`)}
                onClick={() => {
                  const route = actionRoutes[text];
                  if (route) navigate({ to: route as "/" });
                  else if (text.toLowerCase().includes("reorder") || text.toLowerCase().includes("transfer")) navigate({ to: "/risk-monitor" });
                  else navigate({ to: "/ledger" });
                }}
              >
                <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{text}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0" />
              </button>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
