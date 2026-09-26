import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/inventory";

const tones: Record<StockStatus | "High" | "Medium" | "Done" | "Waiting" | "Draft", string> = {
  Healthy: "bg-success-soft text-success",
  "At Risk": "bg-warning-soft text-warning",
  Critical: "bg-danger-soft text-danger",
  Overstocked: "bg-info-soft text-info",
  "Slow Moving": "bg-muted text-muted-foreground",
  High: "bg-danger-soft text-danger",
  Medium: "bg-warning-soft text-warning",
  Done: "bg-success-soft text-success",
  Waiting: "bg-warning-soft text-warning",
  Draft: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: keyof typeof tones }) {
  return <span className={cn("inline-flex rounded-sm px-2 py-1 text-[11px] font-semibold uppercase", tones[status])}>{status}</span>;
}