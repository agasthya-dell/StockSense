import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations";
import { PageHeader, Section } from "@/components/page-kit";
import { useInventory } from "@/lib/inventory";
import { OperationTable } from "./receipts";

export const Route = createFileRoute("/deliveries")({
  head: () => ({
    meta: [
      { title: "Deliveries — StockSense" },
      { name: "description", content: "Prepare and validate outgoing inventory orders." },
    ],
  }),
  component: Page,
});

function Page() {
  const { ledger, products } = useInventory();
  const formRef = useRef<HTMLDivElement>(null);

  const deliveries = ledger.filter((e) => e.operation === "Delivery");

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Delivery Orders"
        description="Pick, pack and validate outgoing stock without allowing shortages."
        actions={
          <Button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <Plus className="size-4 mr-1" /> New delivery
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Section title="Delivery history" description={`${deliveries.length} deliver${deliveries.length !== 1 ? "ies" : "y"} recorded`}>
          {deliveries.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No deliveries yet. Create one using the form.</div>
          ) : (
            <OperationTable
              rows={deliveries.map((e) => ({
                ref: e.reference,
                party: e.to,
                location: e.from,
                product: products.find((p) => p.id === e.productId)?.name ?? e.productId,
                quantity: `${e.quantity}`,
                timestamp: e.timestamp,
                status: "Done" as const,
              }))}
            />
          )}
        </Section>
        <div ref={formRef}>
          <Section title="New Delivery Order" description="Validation decreases inventory and records the movement.">
            <OperationForm type="delivery" />
          </Section>
        </div>
      </div>
    </>
  );
}
