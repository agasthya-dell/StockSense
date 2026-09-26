import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations";
import { PageHeader, Section } from "@/components/page-kit";
import { useInventory } from "@/lib/inventory";
import { OperationTable } from "./receipts";

export const Route = createFileRoute("/adjustments")({
  head: () => ({
    meta: [
      { title: "Adjustments — StockSense" },
      { name: "description", content: "Record verified physical stock counts and reasons." },
    ],
  }),
  component: Page,
});

function Page() {
  const { ledger, products } = useInventory();
  const formRef = useRef<HTMLDivElement>(null);

  const adjustments = ledger.filter((e) => e.operation === "Adjustment");

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Stock Adjustments"
        description="Reconcile recorded inventory with verified physical counts."
        actions={
          <Button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <Plus className="size-4 mr-1" /> New adjustment
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Section title="Adjustment history" description={`${adjustments.length} adjustment${adjustments.length !== 1 ? "s" : ""} recorded`}>
          {adjustments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No adjustments yet. Create one using the form.</div>
          ) : (
            <OperationTable
              rows={adjustments.map((e) => ({
                ref: e.reference,
                party: e.to,
                location: e.from,
                product: products.find((p) => p.id === e.productId)?.name ?? e.productId,
                quantity: `${e.quantity >= 0 ? "+" : ""}${e.quantity}`,
                timestamp: e.timestamp,
                status: "Done" as const,
              }))}
            />
          )}
        </Section>
        <div ref={formRef}>
          <Section title="Record Adjustment" description="Every change creates an auditable ledger event.">
            <OperationForm type="adjustment" />
          </Section>
        </div>
      </div>
    </>
  );
}
