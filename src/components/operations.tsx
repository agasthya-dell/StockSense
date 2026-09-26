import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { warehouses, useInventory, type Product } from "@/lib/inventory";

type Operation = "receipt" | "delivery" | "transfer" | "adjustment";

/** Find the warehouse with the most stock for this product that keeps it above reorder point */
function findBestSource(product: Product, excludeWarehouse?: string): string | null {
  const candidates = product.locations
    .filter((l) => l.warehouse !== excludeWarehouse && l.quantity > product.reorderPoint)
    .sort((a, b) => b.quantity - a.quantity);
  return candidates[0]?.warehouse ?? null;
}

/** Find warehouses that could partially cover a delivery shortage */
function findAlternativeSources(product: Product, excludeWarehouse: string): { warehouse: string; available: number }[] {
  return product.locations
    .filter((l) => l.warehouse !== excludeWarehouse && l.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .map((l) => ({ warehouse: l.warehouse, available: l.quantity }));
}

export function OperationForm({ type, preset }: { type: Operation; preset?: boolean }) {
  const { products, receive, deliver, transfer, adjust } = useInventory();
  const [productId, setProductId] = useState(preset ? "steel-rods" : (products[0]?.id ?? ""));
  const [warehouse, setWarehouse] = useState("Main Warehouse");
  const [destination, setDestination] = useState(type === "transfer" ? "Production Floor" : "");
  const [quantity, setQuantity] = useState(preset ? 20 : 50);
  const [reason, setReason] = useState("Damaged goods");
  const [review, setReview] = useState(false);
  const [error, setError] = useState<{ available: number } | null>(null);
  const [altSources, setAltSources] = useState<{ warehouse: string; available: number }[]>([]);

  const product = products.find((p) => p.id === productId);
  const current = product?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
  const destinationCurrent = product?.locations.find((l) => l.warehouse === destination)?.quantity ?? 0;
  const title = {
    receipt: "Create Receipt",
    delivery: "New Delivery Order",
    transfer: "New Transfer",
    adjustment: "Record Adjustment",
  }[type];

  const summary = useMemo(() => {
    if (type === "receipt") return `${current} → ${current + quantity}`;
    if (type === "delivery") return `${current} → ${Math.max(0, current - quantity)}`;
    if (type === "adjustment") return `${current} → ${quantity}`;
    return `${warehouse}: ${current} → ${current - quantity} · ${destination}: ${destinationCurrent} → ${destinationCurrent + quantity}`;
  }, [current, destinationCurrent, destination, quantity, type, warehouse]);

  const handleFindBestSource = () => {
    if (!product) return;
    const best = findBestSource(product, destination);
    if (best) {
      setWarehouse(best);
      const available = product.locations.find((l) => l.warehouse === best)?.quantity ?? 0;
      toast.success("Best source selected", {
        description: `${best} has ${available} ${product.unit} — stays above safety threshold after transfer.`,
      });
    } else {
      toast.warning("No ideal source found", {
        description: "No warehouse has enough stock to cover this transfer while staying above its reorder point.",
      });
    }
  };

  const handleCheckOtherLocations = () => {
    if (!product) return;
    const alts = findAlternativeSources(product, warehouse);
    setAltSources(alts);
    if (alts.length > 0) {
      toast.info("Alternative locations found", {
        description: `${alts.length} other location${alts.length > 1 ? "s" : ""} have stock for ${product.name}.`,
      });
    } else {
      toast.warning("No alternative locations", {
        description: `${product.name} is only stocked at ${warehouse}.`,
      });
    }
  };

  const submit = () => {
    setError(null);
    setAltSources([]);
    if (!review) { setReview(true); return; }
    if (type === "receipt") receive(productId, warehouse, quantity, "Apex Metals");
    if (type === "delivery") {
      const result = deliver(productId, warehouse, quantity, destination || "Customer");
      if (!result.ok) { setError({ available: result.available }); setReview(false); return; }
    }
    if (type === "transfer") {
      const result = transfer(productId, warehouse, destination, quantity);
      if (!result.ok) { setError({ available: result.available }); setReview(false); return; }
    }
    if (type === "adjustment") adjust(productId, warehouse, quantity, reason);
    toast.success(type === "adjustment" ? "Adjustment recorded" : `${title} completed`, {
      description: `${product?.name}: ${summary}`,
    });
    setReview(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      {/* Form fields */}
      <div className="space-y-5 p-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium">Product</label>
          <Select value={productId} onValueChange={(v) => { setProductId(v); setError(null); setAltSources([]); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} · {p.sku}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium">
            {type === "transfer" ? "From warehouse" : "Warehouse"}
          </label>
          <Select value={warehouse} onValueChange={(v) => { setWarehouse(v); setError(null); setAltSources([]); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {product && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Current stock: <span className="font-medium">{current} {product.unit}</span>
              {current < product.reorderPoint && (
                <span className="ml-2 text-warning">· Below reorder point</span>
              )}
            </p>
          )}
        </div>

        {(type === "transfer" || type === "delivery") && (
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              {type === "transfer" ? "To warehouse" : "Destination / customer"}
            </label>
            {type === "transfer" ? (
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.filter((w) => w !== warehouse).map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Arc Manufacturing"
              />
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium">
            {type === "adjustment" ? "Physical count" : `Quantity (${product?.unit ?? "units"})`}
          </label>
          <Input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => { setQuantity(Math.max(0, Number(e.target.value))); setError(null); }}
          />
        </div>

        {type === "adjustment" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium">Reason</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {type === "transfer" && (
            <Button variant="outline" type="button" onClick={handleFindBestSource}>
              <Lightbulb className="size-4 mr-1" /> Find best source
            </Button>
          )}
          <Button type="button" onClick={submit}>
            {review ? (
              <><CheckCircle2 className="size-4 mr-1" /> Confirm {type}</>
            ) : (
              `Review ${type}`
            )}
          </Button>
          {review && (
            <Button type="button" variant="ghost" onClick={() => setReview(false)}>
              Cancel
            </Button>
          )}
        </div>

        {/* Insufficient stock error */}
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm animate-fade-up">
            <div className="flex items-center gap-2 font-semibold text-danger">
              <TriangleAlert className="size-4" /> Insufficient available stock.
            </div>
            <div className="mt-2 text-foreground">
              Available: <strong>{error.available}</strong> · Requested: <strong>{quantity}</strong> · Shortfall: <strong>{quantity - error.available}</strong>
            </div>
            {type === "delivery" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                type="button"
                onClick={handleCheckOtherLocations}
              >
                Check other locations
              </Button>
            )}
          </div>
        )}

        {/* Alternative sources panel */}
        {altSources.length > 0 && (
          <div className="rounded-lg border bg-info-soft/30 border-info/20 p-4 text-sm animate-fade-up">
            <div className="text-xs font-semibold uppercase tracking-wide text-info mb-3">
              Alternative locations for {product?.name}
            </div>
            <div className="space-y-2">
              {altSources.map((src) => (
                <div key={src.warehouse} className="flex items-center justify-between">
                  <span className="font-medium">{src.warehouse}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{src.available} {product?.unit}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      type="button"
                      onClick={() => { setWarehouse(src.warehouse); setAltSources([]); setError(null); }}
                    >
                      Use this
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live impact panel */}
      <div className="border-l bg-muted/20 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {review ? "Review action" : "Live impact"}
        </div>
        <h3 className="mt-2 text-lg font-semibold">{product?.name ?? "—"}</h3>

        <div className="mt-6 rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Inventory change</div>
          <div className="mt-2 text-lg font-semibold">{summary}</div>
          {type === "transfer" && (
            <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              Overall company stock remains unchanged.
            </div>
          )}
        </div>

        {type === "adjustment" && product && (
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <div>Recorded count: <span className="font-medium text-foreground">{current} {product.unit}</span></div>
            <div>Physical count: <span className="font-medium text-foreground">{quantity} {product.unit}</span></div>
            <div className={quantity - current >= 0 ? "text-success" : "text-danger"}>
              Difference: {quantity - current >= 0 ? "+" : ""}{quantity - current} {product.unit}
            </div>
            <div>Reason: {reason}</div>
          </div>
        )}

        {product && type === "transfer" && (
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Distribution after transfer
            </div>
            {product.locations.map((l) => {
              const projected =
                l.warehouse === warehouse ? l.quantity - quantity :
                l.warehouse === destination ? l.quantity + quantity :
                l.quantity;
              const isChanged = l.warehouse === warehouse || l.warehouse === destination;
              return (
                <div key={l.warehouse} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{l.warehouse}</span>
                  <span className={isChanged ? "font-semibold" : "text-muted-foreground"}>
                    {l.quantity} → {Math.max(0, projected)} {product.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
