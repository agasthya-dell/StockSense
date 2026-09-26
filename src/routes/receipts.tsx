import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations";
import { PageHeader, Section } from "@/components/page-kit";
import { StatusBadge } from "@/components/status-badge";
import { useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — StockSense" },
      { name: "description", content: "Create and validate incoming inventory receipts." },
    ],
  }),
  component: Page,
});

function Page() {
  const { ledger, products } = useInventory();
  const formRef = useRef<HTMLDivElement>(null);

  const receipts = ledger.filter((e) => e.operation === "Receipt");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Receipts"
        description="Track expected stock and validate arrivals into inventory."
        actions={
          <Button onClick={scrollToForm}>
            <Plus className="size-4 mr-1" /> New receipt
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Section title="Receipt history" description={`${receipts.length} receipt${receipts.length !== 1 ? "s" : ""} recorded`}>
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No receipts yet. Create one using the form.</div>
          ) : (
            <OperationTable
              rows={receipts.map((e) => ({
                ref: e.reference,
                party: e.from,
                location: e.to,
                product: products.find((p) => p.id === e.productId)?.name ?? e.productId,
                quantity: `+${e.quantity}`,
                timestamp: e.timestamp,
                status: "Done" as const,
              }))}
            />
          )}
        </Section>
        <div ref={formRef}>
          <Section title="Create Receipt" description="Validate to increase inventory and create a ledger event.">
            <OperationForm type="receipt" />
          </Section>
        </div>
      </div>
    </>
  );
}

export type OperationRow = {
  ref: string;
  party: string;
  location: string;
  product: string;
  quantity: string;
  timestamp: string;
  status: "Done" | "Waiting" | "Draft";
};

export function OperationTable({ rows }: { rows: OperationRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold text-left">Reference</th>
            <th className="px-4 py-3 font-semibold text-left">Party</th>
            <th className="px-4 py-3 font-semibold text-left">Product</th>
            <th className="px-4 py-3 font-semibold text-left">Qty</th>
            <th className="px-4 py-3 font-semibold text-left">When</th>
            <th className="px-4 py-3 font-semibold text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.ref + i}
              className={cn(
                "border-b last:border-0 hover:bg-muted/25 transition-colors animate-fade-up",
                i < 6 ? `stagger-${i + 1}` : ""
              )}
            >
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.ref}</td>
              <td className="px-4 py-3 font-medium">{r.party}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.product}</td>
              <td className={cn("px-4 py-3 font-semibold tabular-nums", r.quantity.startsWith("+") ? "text-success" : "text-danger")}>{r.quantity}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{r.timestamp}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
