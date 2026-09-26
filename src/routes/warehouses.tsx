import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Section } from "@/components/page-kit";
import { warehouses as WAREHOUSES, useInventory } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/warehouses")({
  head: () => ({ meta: [{ title: "Warehouses — StockSense" }] }),
  component: Page,
});

const warehouseRoles = [
  "Primary receiving hub",
  "Production support",
  "Dispatch & fulfilment",
  "Secondary storage",
];

function Page() {
  const { products } = useInventory();
  const [configOpen, setConfigOpen] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [transfersEnabled, setTransfersEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Warehouses"
        description={`${WAREHOUSES.length} active locations connected to one inventory view.`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" /> Add warehouse
          </Button>
        }
      />

      {/* Warehouse cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WAREHOUSES.map((w, i) => {
          const lines = products.filter((p) =>
            p.locations.some((l) => l.warehouse === w && l.quantity > 0)
          );
          const total = lines.reduce(
            (s, p) => s + (p.locations.find((l) => l.warehouse === w)?.quantity ?? 0),
            0
          );
          return (
            <div
              key={w}
              className={cn(
                "rounded-lg border bg-card p-5 shadow-[0_1px_3px_oklch(0_0_0/0.06)] animate-fade-up",
                `stagger-${i + 1}`
              )}
            >
              <div className="flex justify-between items-start">
                <div className="grid size-9 place-items-center rounded-md bg-info-soft text-info">
                  <Building2 className="size-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase text-success">Active</span>
              </div>
              <h2 className="mt-5 font-semibold">{w}</h2>
              <div className="mt-1 text-xs text-muted-foreground">{warehouseRoles[i] ?? "Operating location"}</div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <div className="font-serif text-xl font-normal">{lines.length}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Product lines</div>
                </div>
                <div>
                  <div className="font-serif text-xl font-normal">{total.toLocaleString()}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">On hand</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full gap-1.5"
                onClick={() => setConfigOpen(w)}
              >
                <Settings2 className="size-3.5" /> Configure
              </Button>
            </div>
          );
        })}
      </div>

      {/* Configuration panel */}
      <div className="mt-5">
        <Section title="Warehouse configuration">
          <div className="divide-y">
            {WAREHOUSES.map((w, i) => (
              <div className="flex items-center justify-between p-4" key={w}>
                <div>
                  <div className="text-sm font-medium">{w}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {warehouseRoles[i] ?? "Operating location"} · Inventory tracking and internal transfers enabled
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setConfigOpen(w)}>
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Configure dialog */}
      <Dialog open={!!configOpen} onOpenChange={() => setConfigOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">Configure {configOpen}</DialogTitle>
            <DialogDescription>Manage settings for this warehouse location.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Warehouse name</label>
              <Input defaultValue={configOpen ?? ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Role</label>
              <Input defaultValue={warehouseRoles[WAREHOUSES.indexOf(configOpen ?? "")] ?? "Operating location"} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Inventory tracking</div>
                <div className="text-xs text-muted-foreground">Track stock levels at this location</div>
              </div>
              <Switch checked={trackingEnabled} onCheckedChange={setTrackingEnabled} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Internal transfers</div>
                <div className="text-xs text-muted-foreground">Allow stock to be moved to/from this location</div>
              </div>
              <Switch checked={transfersEnabled} onCheckedChange={setTransfersEnabled} />
            </div>
            <Button className="w-full" onClick={() => setConfigOpen(null)}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add warehouse dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">Add warehouse</DialogTitle>
            <DialogDescription>Register a new warehouse location.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4 mt-2"
            onSubmit={(e) => { e.preventDefault(); setAddOpen(false); setNewName(""); }}
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium">Warehouse name *</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Warehouse 3" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Role</label>
              <Input placeholder="e.g. Cold storage facility" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Add warehouse</Button>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
