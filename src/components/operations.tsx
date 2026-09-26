import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { warehouses, useInventory } from "@/lib/inventory";

type Operation = "receipt" | "delivery" | "transfer" | "adjustment";

export function OperationForm({ type, preset }: { type: Operation; preset?: boolean }) {
  const { products, receive, deliver, transfer, adjust } = useInventory();
  const [productId, setProductId] = useState(preset ? "steel-rods" : products[0]?.id ?? "");
  const [warehouse, setWarehouse] = useState("Main Warehouse");
  const [destination, setDestination] = useState(type === "transfer" ? "Production Floor" : "");
  const [quantity, setQuantity] = useState(preset ? 20 : 50);
  const [reason, setReason] = useState("Damaged goods");
  const [review, setReview] = useState(false);
  const [error, setError] = useState<{ available: number } | null>(null);
  const product = products.find((p) => p.id === productId);
  const current = product?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
  const destinationCurrent = product?.locations.find((l) => l.warehouse === destination)?.quantity ?? 0;
  const title = { receipt: "Create Receipt", delivery: "New Delivery Order", transfer: "New Transfer", adjustment: "Record Adjustment" }[type];

  const summary = useMemo(() => {
    if (type === "receipt") return `${current} → ${current + quantity}`;
    if (type === "delivery") return `${current} → ${Math.max(0, current - quantity)}`;
    if (type === "adjustment") return `${current} → ${quantity}`;
    return `${warehouse}: ${current} → ${current - quantity} · ${destination}: ${destinationCurrent} → ${destinationCurrent + quantity}`;
  }, [current, destinationCurrent, destination, quantity, type, warehouse]);

  const submit = () => {
    setError(null);
    if (!review) { setReview(true); return; }
    if (type === "receipt") receive(productId, warehouse, quantity, "Apex Metals");
    if (type === "delivery") { const result = deliver(productId, warehouse, quantity, destination || "Customer"); if (!result.ok) { setError({ available: result.available }); return; } }
    if (type === "transfer") { const result = transfer(productId, warehouse, destination, quantity); if (!result.ok) { setError({ available: result.available }); return; } }
    if (type === "adjustment") adjust(productId, warehouse, quantity, reason);
    toast.success(type === "adjustment" ? "Adjustment recorded" : `${title} completed`, { description: `${product?.name}: ${summary}` });
    setReview(false);
  };

  return <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]"><div className="space-y-5 p-5"><div><label className="mb-1.5 block text-xs font-medium">Product</label><Select value={productId} onValueChange={setProductId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.sku}</SelectItem>)}</SelectContent></Select></div><div><label className="mb-1.5 block text-xs font-medium">{type === "transfer" ? "From warehouse" : "Warehouse"}</label><Select value={warehouse} onValueChange={setWarehouse}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>{(type === "transfer" || type === "delivery") && <div><label className="mb-1.5 block text-xs font-medium">{type === "transfer" ? "To warehouse" : "Destination / customer"}</label>{type === "transfer" ? <Select value={destination} onValueChange={setDestination}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{warehouses.filter(w => w !== warehouse).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select> : <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Arc Manufacturing" />}</div>}<div><label className="mb-1.5 block text-xs font-medium">{type === "adjustment" ? "Physical count" : `Quantity (${product?.unit ?? "units"})`}</label><Input type="number" min="0" value={quantity} onChange={e => setQuantity(Math.max(0, Number(e.target.value)))} /></div>{type === "adjustment" && <div><label className="mb-1.5 block text-xs font-medium">Reason</label><Input value={reason} onChange={e => setReason(e.target.value)} /></div>}<div className="flex flex-wrap gap-2">{type === "transfer" && <Button variant="outline" onClick={() => { setWarehouse("Main Warehouse"); toast.info("Best source found", { description: "Main Warehouse remains above its safety threshold." }); }}><Lightbulb /> Find best source</Button>}<Button onClick={submit}>{review ? <><CheckCircle2 /> Confirm {type}</> : `Review ${type}`}</Button></div>{error && <div className="rounded-md border border-danger/30 bg-danger-soft p-4 text-sm"><div className="flex items-center gap-2 font-semibold text-danger"><TriangleAlert className="size-4" /> Insufficient available stock.</div><div className="mt-2 text-foreground">Available: {error.available} · Requested: {quantity} · Shortfall: {quantity - error.available}</div>{type === "delivery" && <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.info("Other locations checked", { description: "Warehouse 2 can cover part of this request." })}>Check other locations</Button>}</div>}</div><div className="border-l bg-muted/20 p-5"><div className="text-[11px] font-semibold uppercase text-muted-foreground">{review ? "Review action" : "Live impact"}</div><h3 className="mt-2 text-lg font-semibold">{product?.name}</h3><div className="mt-6 rounded-md border bg-card p-4"><div className="text-xs text-muted-foreground">Inventory change</div><div className="mt-2 text-lg font-semibold">{summary}</div>{type === "transfer" && <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">Overall company stock remains unchanged.</div>}</div>{type === "adjustment" && <div className="mt-4 text-xs text-muted-foreground">Recorded: {current}<br />Difference: {quantity - current}<br />Reason: {reason}</div>}</div></div>;
}