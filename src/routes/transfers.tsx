import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations";
import { PageHeader, Section } from "@/components/page-kit";
import { useInventory } from "@/lib/inventory";
import { OperationTable } from "./receipts";

type Search = { preset?: string };

export const Route = createFileRoute("/transfers")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["preset"] === "string" ? { preset: s["preset"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Transfers — StockSense" },
      { name: "description", content: "Rebalance stock between warehouse locations." },
    ],
  }),
  component: Page,
});

function Page() {
  const { preset } = Route.useSearch();
  const { ledger, products } = useInventory();
  const formRef = useRef<HTMLDivElement>(null);

  const transfers = ledger.filter((e) => e.operation === "Transfer");

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Internal Transfers"
        description="Move stock between locations while company-wide inventory remains unchanged."
        actions={
          <Button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <Plus className="size-4 mr-1" /> New transfer
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Section title="Transfer history" description={`${transfers.length} transfer${transfers.length !== 1 ? "s" : ""} recorded`}>
          {transfers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No transfers yet. Create one using the form.</div>
          ) : (
            <OperationTable
              rows={transfers.map((e) => ({
                ref: e.reference,
                party: `${e.from} → ${e.to}`,
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
          <Section title="New Transfer" description="Review the before-and-after distribution before confirming.">
            <OperationForm type="transfer" preset={Boolean(preset)} />
          </Section>
        </div>
      </div>
    </>
  );
}
