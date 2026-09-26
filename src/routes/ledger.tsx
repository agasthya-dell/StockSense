import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Section } from "@/components/page-kit";
import { useInventory, type LedgerEvent } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Stock Ledger — StockSense" },
      { name: "description", content: "Chronological audit trail of every inventory movement." },
    ],
  }),
  component: Page,
});

function exportCSV(rows: LedgerEvent[], products: { id: string; name: string }[]) {
  const headers = ["Timestamp", "Reference", "Product", "Operation", "From", "To", "Quantity", "User", "Result"];
  const lines = rows.map((e) => [
    e.timestamp,
    e.reference,
    products.find((p) => p.id === e.productId)?.name ?? e.productId,
    e.operation,
    e.from,
    e.to,
    e.quantity,
    e.user,
    e.result,
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stocksense-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const operationColors: Record<string, string> = {
  Receipt: "text-success",
  Delivery: "text-danger",
  Transfer: "text-info",
  Adjustment: "text-warning",
};

function Page() {
  const { ledger, products } = useInventory();
  const [opFilter, setOpFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  const filtered = ledger.filter((e) => {
    if (opFilter !== "all" && e.operation !== opFilter) return false;
    if (productFilter !== "all" && e.productId !== productFilter) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Stock Ledger"
        description="A chronological, immutable-style record of every inventory movement."
        actions={
          <Button variant="outline" onClick={() => exportCSV(filtered, products)}>
            <Download className="size-4 mr-1.5" /> Export CSV
          </Button>
        }
      />
      <Section>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 border-b p-4">
          <Select value={opFilter} onValueChange={setOpFilter}>
            <SelectTrigger className="w-40 shadow-none text-xs">
              <SelectValue placeholder="Operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All operations</SelectItem>
              <SelectItem value="Receipt">Receipt</SelectItem>
              <SelectItem value="Delivery">Delivery</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-48 shadow-none text-xs">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center text-xs text-muted-foreground ml-auto">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
                {["Timestamp", "Reference", "Product", "Operation", "From", "To", "Quantity", "User", "Result"].map((h) => (
                  <th className="px-4 py-3 font-semibold" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No entries match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((e, i) => (
                  <tr
                    key={e.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/25 transition-colors animate-fade-up",
                      i < 6 ? `stagger-${i + 1}` : ""
                    )}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{e.timestamp}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.reference}</td>
                    <td className="px-4 py-3 font-medium">{products.find((p) => p.id === e.productId)?.name ?? e.productId}</td>
                    <td className={cn("px-4 py-3 font-medium", operationColors[e.operation] ?? "")}>{e.operation}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.from}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.to}</td>
                    <td className={cn("px-4 py-3 font-semibold tabular-nums", e.quantity > 0 ? "text-success" : "text-danger")}>
                      {e.quantity > 0 ? "+" : ""}{e.quantity}
                    </td>
                    <td className="px-4 py-3">{e.user}</td>
                    <td className="px-4 py-3 text-success text-xs font-medium">{e.result}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
