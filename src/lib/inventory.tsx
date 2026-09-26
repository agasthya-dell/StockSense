import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type StockStatus = "Healthy" | "At Risk" | "Critical" | "Overstocked" | "Slow Moving";
export type LocationStock = { warehouse: string; quantity: number };
export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  reorderPoint: number;
  dailyUse: number;
  trend: number;
  locations: LocationStock[];
  lastMovement: string;
};
export type LedgerEvent = {
  id: string;
  timestamp: string;
  reference: string;
  productId: string;
  operation: "Receipt" | "Delivery" | "Transfer" | "Adjustment";
  from: string;
  to: string;
  quantity: number;
  user: string;
  result: string;
};

export const warehouses = ["Main Warehouse", "Production Floor", "Dispatch Area", "Warehouse 2"];

const initialProducts: Product[] = [
  { id: "steel-rods", sku: "STL-001", name: "Steel Rods", category: "Raw Materials", unit: "kg", reorderPoint: 150, dailyUse: 28.6, trend: 31, lastMovement: "18 min ago", locations: [{ warehouse: "Main Warehouse", quantity: 70 }, { warehouse: "Production Floor", quantity: 30 }, { warehouse: "Dispatch Area", quantity: 20 }] },
  { id: "office-chairs", sku: "CHR-002", name: "Office Chairs", category: "Finished Goods", unit: "units", reorderPoint: 40, dailyUse: 3.1, trend: -4, lastMovement: "2 hr ago", locations: [{ warehouse: "Main Warehouse", quantity: 52 }, { warehouse: "Warehouse 2", quantity: 32 }] },
  { id: "industrial-bearing", sku: "BRG-014", name: "Industrial Bearings", category: "Components", unit: "units", reorderPoint: 20, dailyUse: 2.8, trend: 18, lastMovement: "34 min ago", locations: [{ warehouse: "Production Floor", quantity: 12 }] },
  { id: "aluminium-sheets", sku: "ALM-008", name: "Aluminium Sheets", category: "Raw Materials", unit: "sheets", reorderPoint: 65, dailyUse: 4.2, trend: 6, lastMovement: "Yesterday", locations: [{ warehouse: "Main Warehouse", quantity: 122 }, { warehouse: "Warehouse 2", quantity: 64 }] },
  { id: "packaging-boxes", sku: "PKG-031", name: "Packaging Boxes", category: "Packaging", unit: "units", reorderPoint: 300, dailyUse: 41, trend: 14, lastMovement: "1 hr ago", locations: [{ warehouse: "Dispatch Area", quantity: 245 }, { warehouse: "Main Warehouse", quantity: 80 }] },
  { id: "hydraulic-pipes", sku: "HYD-019", name: "Hydraulic Pipes", category: "Components", unit: "units", reorderPoint: 35, dailyUse: 1.2, trend: -8, lastMovement: "3 days ago", locations: [{ warehouse: "Warehouse 2", quantity: 118 }] },
  { id: "machine-bolts", sku: "BLT-044", name: "Machine Bolts", category: "Hardware", unit: "units", reorderPoint: 500, dailyUse: 32, trend: 2, lastMovement: "Today", locations: [{ warehouse: "Main Warehouse", quantity: 980 }, { warehouse: "Production Floor", quantity: 410 }] },
  { id: "safety-helmets", sku: "SFT-006", name: "Safety Helmets", category: "Safety", unit: "units", reorderPoint: 30, dailyUse: 0.4, trend: -20, lastMovement: "12 days ago", locations: [{ warehouse: "Main Warehouse", quantity: 96 }, { warehouse: "Warehouse 2", quantity: 54 }] },
];

const initialLedger: LedgerEvent[] = [
  { id: "1", timestamp: "Today, 11:37", reference: "ADJ-302", productId: "steel-rods", operation: "Adjustment", from: "Production Floor", to: "Damaged", quantity: -3, user: "Agasthya", result: "Recorded" },
  { id: "2", timestamp: "Today, 11:05", reference: "DLV-1840", productId: "steel-rods", operation: "Delivery", from: "Production Floor", to: "Arc Manufacturing", quantity: -10, user: "Agasthya", result: "Completed" },
  { id: "3", timestamp: "Today, 10:14", reference: "TRF-2041", productId: "steel-rods", operation: "Transfer", from: "Main Warehouse", to: "Production Floor", quantity: 20, user: "Agasthya", result: "Completed" },
  { id: "4", timestamp: "Today, 09:41", reference: "RCV-1042", productId: "steel-rods", operation: "Receipt", from: "Apex Metals", to: "Main Warehouse", quantity: 100, user: "Agasthya", result: "Completed" },
];

export const totalStock = (product: Product) => product.locations.reduce((sum, item) => sum + item.quantity, 0);
export const statusFor = (product: Product): StockStatus => {
  const total = totalStock(product);
  if (total <= product.reorderPoint * 0.65) return "Critical";
  if (total <= product.reorderPoint) return "At Risk";
  if (total >= product.reorderPoint * 3) return "Overstocked";
  if (product.dailyUse < 1) return "Slow Moving";
  return "Healthy";
};
export const daysRemaining = (product: Product) => totalStock(product) / Math.max(product.dailyUse, 0.1);

type InventoryContextValue = {
  products: Product[];
  ledger: LedgerEvent[];
  receive: (productId: string, warehouse: string, quantity: number, supplier?: string) => void;
  deliver: (productId: string, warehouse: string, quantity: number, customer?: string) => { ok: boolean; available: number };
  transfer: (productId: string, from: string, to: string, quantity: number) => { ok: boolean; available: number };
  adjust: (productId: string, warehouse: string, physical: number, reason: string) => void;
  reset: () => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);
const STORAGE_KEY = "stocksense-state-v1";

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialProducts);
  const [ledger, setLedger] = useState(initialLedger);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { products: Product[]; ledger: LedgerEvent[] };
        setProducts(parsed.products);
        setLedger(parsed.ledger);
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, ledger }));
  }, [products, ledger, hydrated]);

  const mutateLocation = (productId: string, warehouse: string, change: (current: number) => number) => {
    setProducts((items) => items.map((product) => {
      if (product.id !== productId) return product;
      const exists = product.locations.some((location) => location.warehouse === warehouse);
      const locations = exists
        ? product.locations.map((location) => location.warehouse === warehouse ? { ...location, quantity: change(location.quantity) } : location)
        : [...product.locations, { warehouse, quantity: change(0) }];
      return { ...product, locations, lastMovement: "Just now" };
    }));
  };

  const addLedger = (event: Omit<LedgerEvent, "id" | "timestamp" | "user" | "result">) => setLedger((items) => [{ ...event, id: crypto.randomUUID(), timestamp: "Just now", user: "Agasthya", result: "Completed" }, ...items]);

  const value = useMemo<InventoryContextValue>(() => ({
    products,
    ledger,
    receive(productId, warehouse, quantity, supplier = "Vendor") {
      mutateLocation(productId, warehouse, (current) => current + quantity);
      addLedger({ reference: `RCV-${1043 + ledger.length}`, productId, operation: "Receipt", from: supplier, to: warehouse, quantity });
    },
    deliver(productId, warehouse, quantity, customer = "Customer") {
      const available = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
      if (quantity > available) return { ok: false, available };
      mutateLocation(productId, warehouse, (current) => current - quantity);
      addLedger({ reference: `DLV-${1841 + ledger.length}`, productId, operation: "Delivery", from: warehouse, to: customer, quantity: -quantity });
      return { ok: true, available };
    },
    transfer(productId, from, to, quantity) {
      const available = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === from)?.quantity ?? 0;
      if (quantity > available || from === to) return { ok: false, available };
      mutateLocation(productId, from, (current) => current - quantity);
      mutateLocation(productId, to, (current) => current + quantity);
      addLedger({ reference: `TRF-${2042 + ledger.length}`, productId, operation: "Transfer", from, to, quantity });
      return { ok: true, available };
    },
    adjust(productId, warehouse, physical, reason) {
      const current = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
      mutateLocation(productId, warehouse, () => physical);
      addLedger({ reference: `ADJ-${303 + ledger.length}`, productId, operation: "Adjustment", from: warehouse, to: reason, quantity: physical - current });
    },
    reset() { setProducts(initialProducts); setLedger(initialLedger); },
  }), [products, ledger]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const value = useContext(InventoryContext);
  if (!value) throw new Error("useInventory must be used inside InventoryProvider");
  return value;
}