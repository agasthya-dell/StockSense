import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Section } from "@/components/page-kit";
import { StatusBadge } from "@/components/status-badge";
import { statusFor, totalStock, useInventory, warehouses } from "@/lib/inventory";
import { cn } from "@/lib/utils";

const productsRoute = getRouteApi("/products");

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [{ title: "Products — StockSense" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, addProduct } = useInventory();
  const search = productsRoute.useSearch();
  const [query, setQuery] = useState(search.q ?? "");
  const [category, setCategory] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(search.status ? "risk" : "all");
  const [sortBy, setSortBy] = useState("name");
  const [addOpen, setAddOpen] = useState(false);

  // Add product form state
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("Raw Materials");
  const [newUnit, setNewUnit] = useState("units");
  const [newReorder, setNewReorder] = useState(50);
  const [newDailyUse, setNewDailyUse] = useState(5);
  const [newQty, setNewQty] = useState(100);
  const [newWarehouse, setNewWarehouse] = useState<string>(warehouses[0] ?? "Main Warehouse");

  const categories = [...new Set(products.map((p) => p.category))];

  let filtered = products.filter((p) => {
    const text = `${p.name} ${p.sku} ${p.category}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (category !== "all" && p.category !== category) return false;
    if (warehouseFilter !== "all" && !p.locations.some((l) => l.warehouse === warehouseFilter && l.quantity > 0)) return false;
    if (statusFilter === "risk" && !["At Risk", "Critical"].includes(statusFor(p))) return false;
    if (statusFilter === "healthy" && statusFor(p) !== "Healthy") return false;
    if (statusFilter === "overstocked" && statusFor(p) !== "Overstocked") return false;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stock-asc") return totalStock(a) - totalStock(b);
    if (sortBy === "stock-desc") return totalStock(b) - totalStock(a);
    if (sortBy === "status") return statusFor(a).localeCompare(statusFor(b));
    return 0;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim()) return;
    addProduct({
      sku: newSku,
      name: newName,
      category: newCategory,
      unit: newUnit,
      reorderPoint: newReorder,
      dailyUse: newDailyUse,
      trend: 0,
      locations: [{ warehouse: newWarehouse, quantity: newQty }],
    });
    setAddOpen(false);
    setNewName(""); setNewSku(""); setNewQty(100); setNewReorder(50);
  };

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        description={`${filtered.length} of ${products.length} products shown`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" /> Add product
          </Button>
        }
      />

      <Section>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 shadow-none"
              placeholder="Search product or SKU"
            />
            <svg className="absolute left-3 top-2.5 size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 shadow-none text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-44 shadow-none text-xs"><SelectValue placeholder="Warehouse" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 shadow-none text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="risk">At Risk / Critical</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="overstocked">Overstocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 shadow-none text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name A–Z</SelectItem>
              <SelectItem value="stock-desc">Sort: Stock ↓</SelectItem>
              <SelectItem value="stock-asc">Sort: Stock ↑</SelectItem>
              <SelectItem value="status">Sort: Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Available</th>
                <th className="px-4 py-3 font-semibold">Locations</th>
                <th className="px-4 py-3 font-semibold">Reorder point</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last movement</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No products match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={cn("border-b last:border-0 hover:bg-muted/25 transition-colors animate-fade-up", i < 6 ? `stagger-${i + 1}` : "")}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3">
                      <Link to="/products/$productId" params={{ productId: p.id }} className="font-medium hover:text-primary transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">{totalStock(p).toLocaleString()} {p.unit}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.locations.filter((l) => l.quantity > 0).length} locations</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.reorderPoint} {p.unit}</td>
                    <td className="px-4 py-3"><StatusBadge status={statusFor(p)} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.lastMovement}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/products/$productId" params={{ productId: p.id }}>View details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/transfers" search={{ preset: p.id }}>Transfer stock</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/adjustments">Adjust count</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/receipts">Create receipt</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Add product dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">Add product</DialogTitle>
            <DialogDescription>Create a new product and set its initial stock level.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Product name *</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Copper Wire" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">SKU *</label>
                <Input value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="e.g. CPW-001" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Raw Materials", "Components", "Finished Goods", "Packaging", "Hardware", "Safety"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Unit</label>
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["units", "kg", "sheets", "packs", "boxes", "m", "litres"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Initial qty</label>
                <Input type="number" min="0" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Reorder point</label>
                <Input type="number" min="0" value={newReorder} onChange={(e) => setNewReorder(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Daily use</label>
                <Input type="number" min="0" step="0.1" value={newDailyUse} onChange={(e) => setNewDailyUse(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Initial warehouse</label>
              <Select value={newWarehouse} onValueChange={setNewWarehouse}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Add product</Button>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
