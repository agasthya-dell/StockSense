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

// ─── Realistic industrial manufacturing inventory ─────────────────────────
// Based on typical MRO + manufacturing warehouse product mix:
// Raw materials (steel, aluminium, copper), Components (bearings, valves,
// hydraulic fittings), Fasteners, Packaging, Safety & PPE, Finished goods.
// Reorder points follow the formula: (avg daily use × 7-day lead time) + safety stock.
// Daily use rates are based on published manufacturing consumption benchmarks.
const initialProducts: Product[] = [
  // ── Raw Materials ──────────────────────────────────────────────────────
  {
    id: "steel-rods-6mm",
    sku: "STL-006",
    name: "Steel Rods 6mm",
    category: "Raw Materials",
    unit: "kg",
    reorderPoint: 420,
    dailyUse: 42.5,
    trend: 18,
    lastMovement: "14 min ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 380 },
      { warehouse: "Production Floor", quantity: 90  },
      { warehouse: "Warehouse 2",      quantity: 55  },
    ],
  },
  {
    id: "hot-rolled-steel-coil",
    sku: "STL-102",
    name: "Hot-Rolled Steel Coil",
    category: "Raw Materials",
    unit: "kg",
    reorderPoint: 1200,
    dailyUse: 98.0,
    trend: 7,
    lastMovement: "2 hr ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 2240 },
      { warehouse: "Warehouse 2",      quantity: 860  },
    ],
  },
  {
    id: "aluminium-sheet-2mm",
    sku: "ALM-021",
    name: "Aluminium Sheet 2mm",
    category: "Raw Materials",
    unit: "sheets",
    reorderPoint: 200,
    dailyUse: 18.2,
    trend: 11,
    lastMovement: "1 hr ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 175 },
      { warehouse: "Production Floor", quantity: 48  },
      { warehouse: "Warehouse 2",      quantity: 92  },
    ],
  },
  {
    id: "copper-wire-1mm",
    sku: "CPR-018",
    name: "Copper Wire 1mm",
    category: "Raw Materials",
    unit: "m",
    reorderPoint: 5000,
    dailyUse: 320.0,
    trend: 24,
    lastMovement: "35 min ago",
    locations: [
      { warehouse: "Production Floor", quantity: 3200 },
      { warehouse: "Main Warehouse",   quantity: 1800 },
    ],
  },
  {
    id: "stainless-pipe-dn50",
    sku: "PIP-050",
    name: "Stainless Pipe DN50",
    category: "Raw Materials",
    unit: "units",
    reorderPoint: 80,
    dailyUse: 4.8,
    trend: -5,
    lastMovement: "Yesterday",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 142 },
      { warehouse: "Warehouse 2",      quantity: 38  },
    ],
  },

  // ── Components ─────────────────────────────────────────────────────────
  {
    id: "deep-groove-bearing-6205",
    sku: "BRG-6205",
    name: "Deep Groove Bearing 6205",
    category: "Components",
    unit: "units",
    reorderPoint: 60,
    dailyUse: 5.2,
    trend: 31,
    lastMovement: "28 min ago",
    locations: [
      { warehouse: "Production Floor", quantity: 38  },
      { warehouse: "Main Warehouse",   quantity: 20  },
    ],
  },
  {
    id: "hydraulic-cylinder-40mm",
    sku: "HYD-040",
    name: "Hydraulic Cylinder 40mm",
    category: "Components",
    unit: "units",
    reorderPoint: 25,
    dailyUse: 1.8,
    trend: -3,
    lastMovement: "4 hr ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 67  },
      { warehouse: "Warehouse 2",      quantity: 29  },
    ],
  },
  {
    id: "pneumatic-valve-14",
    sku: "VLV-114",
    name: "Pneumatic Valve 1/4\"",
    category: "Components",
    unit: "units",
    reorderPoint: 40,
    dailyUse: 2.9,
    trend: 9,
    lastMovement: "3 hr ago",
    locations: [
      { warehouse: "Production Floor", quantity: 22  },
      { warehouse: "Main Warehouse",   quantity: 31  },
    ],
  },
  {
    id: "electric-motor-0-75kw",
    sku: "MTR-075",
    name: "Electric Motor 0.75kW",
    category: "Components",
    unit: "units",
    reorderPoint: 12,
    dailyUse: 0.6,
    trend: -12,
    lastMovement: "3 days ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 41  },
      { warehouse: "Warehouse 2",      quantity: 18  },
    ],
  },

  // ── Fasteners & Hardware ────────────────────────────────────────────────
  {
    id: "hex-bolt-m12-40",
    sku: "BLT-M12",
    name: "Hex Bolt M12×40",
    category: "Fasteners",
    unit: "units",
    reorderPoint: 2000,
    dailyUse: 148.0,
    trend: 4,
    lastMovement: "Today",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 5800 },
      { warehouse: "Production Floor", quantity: 2100 },
      { warehouse: "Dispatch Area",    quantity: 650  },
    ],
  },
  {
    id: "stainless-nut-m10",
    sku: "NUT-M10",
    name: "Stainless Nut M10",
    category: "Fasteners",
    unit: "units",
    reorderPoint: 1500,
    dailyUse: 112.0,
    trend: 2,
    lastMovement: "Today",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 4200 },
      { warehouse: "Production Floor", quantity: 1650 },
    ],
  },
  {
    id: "spring-washer-m8",
    sku: "WSH-M08",
    name: "Spring Washer M8",
    category: "Fasteners",
    unit: "units",
    reorderPoint: 3000,
    dailyUse: 195.0,
    trend: 6,
    lastMovement: "1 hr ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 9800 },
      { warehouse: "Production Floor", quantity: 3200 },
    ],
  },

  // ── Packaging ──────────────────────────────────────────────────────────
  {
    id: "corrugated-box-600x400",
    sku: "PKG-604",
    name: "Corrugated Box 600×400mm",
    category: "Packaging",
    unit: "units",
    reorderPoint: 500,
    dailyUse: 68.0,
    trend: 19,
    lastMovement: "45 min ago",
    locations: [
      { warehouse: "Dispatch Area",    quantity: 380  },
      { warehouse: "Main Warehouse",   quantity: 120  },
    ],
  },
  {
    id: "stretch-wrap-500mm",
    sku: "PKG-SW5",
    name: "Stretch Wrap Film 500mm",
    category: "Packaging",
    unit: "rolls",
    reorderPoint: 80,
    dailyUse: 8.5,
    trend: 14,
    lastMovement: "2 hr ago",
    locations: [
      { warehouse: "Dispatch Area",    quantity: 62   },
      { warehouse: "Main Warehouse",   quantity: 24   },
    ],
  },

  // ── Safety & PPE ───────────────────────────────────────────────────────
  {
    id: "safety-helmet-class-e",
    sku: "PPE-SHE",
    name: "Safety Helmet Class E",
    category: "Safety & PPE",
    unit: "units",
    reorderPoint: 30,
    dailyUse: 0.5,
    trend: -18,
    lastMovement: "12 days ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 88  },
      { warehouse: "Production Floor", quantity: 22  },
      { warehouse: "Warehouse 2",      quantity: 35  },
    ],
  },
  {
    id: "nitrile-gloves-l",
    sku: "PPE-NGL",
    name: "Nitrile Gloves (L) Box",
    category: "Safety & PPE",
    unit: "boxes",
    reorderPoint: 40,
    dailyUse: 4.2,
    trend: 8,
    lastMovement: "6 hr ago",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 72  },
      { warehouse: "Production Floor", quantity: 28  },
    ],
  },
  {
    id: "dust-mask-ffp2",
    sku: "PPE-FFP",
    name: "Dust Mask FFP2",
    category: "Safety & PPE",
    unit: "boxes",
    reorderPoint: 25,
    dailyUse: 2.8,
    trend: 5,
    lastMovement: "Yesterday",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 18  },
      { warehouse: "Production Floor", quantity: 9   },
    ],
  },

  // ── Lubricants & Consumables ────────────────────────────────────────────
  {
    id: "iso-vg-46-hydraulic-oil",
    sku: "LUB-046",
    name: "ISO VG 46 Hydraulic Oil",
    category: "Lubricants",
    unit: "litres",
    reorderPoint: 200,
    dailyUse: 14.5,
    trend: 3,
    lastMovement: "Yesterday",
    locations: [
      { warehouse: "Main Warehouse",   quantity: 580  },
      { warehouse: "Production Floor", quantity: 120  },
    ],
  },
  {
    id: "anti-seize-compound",
    sku: "LUB-ASC",
    name: "Anti-Seize Compound 500g",
    category: "Lubricants",
    unit: "units",
    reorderPoint: 30,
    dailyUse: 1.4,
    trend: -7,
    lastMovement: "3 days ago",
    locations: [
      { warehouse: "Production Floor", quantity: 52  },
      { warehouse: "Main Warehouse",   quantity: 18  },
    ],
  },

  // ── Finished Goods ─────────────────────────────────────────────────────
  {
    id: "fabricated-bracket-a",
    sku: "FGB-001",
    name: "Fabricated Bracket Type A",
    category: "Finished Goods",
    unit: "units",
    reorderPoint: 50,
    dailyUse: 6.2,
    trend: 22,
    lastMovement: "1 hr ago",
    locations: [
      { warehouse: "Dispatch Area",    quantity: 28   },
      { warehouse: "Main Warehouse",   quantity: 14   },
    ],
  },
];

const initialLedger: LedgerEvent[] = [
  // Today — recent operations
  { id: "L001", timestamp: "Today, 11:42", reference: "ADJ-419", productId: "deep-groove-bearing-6205", operation: "Adjustment", from: "Production Floor", to: "Damaged / Worn", quantity: -6, user: "Agasthya", result: "Recorded" },
  { id: "L002", timestamp: "Today, 11:18", reference: "DLV-2084", productId: "fabricated-bracket-a",    operation: "Delivery",   from: "Dispatch Area",    to: "Meridian Engineering", quantity: -12, user: "Agasthya", result: "Completed" },
  { id: "L003", timestamp: "Today, 10:55", reference: "TRF-3107", productId: "aluminium-sheet-2mm",     operation: "Transfer",   from: "Main Warehouse",   to: "Production Floor",     quantity: 48,  user: "Agasthya", result: "Completed" },
  { id: "L004", timestamp: "Today, 10:30", reference: "RCV-1881", productId: "hex-bolt-m12-40",         operation: "Receipt",    from: "FastFix Supplies", to: "Main Warehouse",       quantity: 3000, user: "Agasthya", result: "Completed" },
  { id: "L005", timestamp: "Today, 09:45", reference: "DLV-2083", productId: "corrugated-box-600x400",  operation: "Delivery",   from: "Dispatch Area",    to: "Nova Industrial",      quantity: -180, user: "Agasthya", result: "Completed" },
  { id: "L006", timestamp: "Today, 09:20", reference: "TRF-3106", productId: "copper-wire-1mm",         operation: "Transfer",   from: "Main Warehouse",   to: "Production Floor",     quantity: 800, user: "Agasthya", result: "Completed" },
  { id: "L007", timestamp: "Today, 08:50", reference: "RCV-1880", productId: "steel-rods-6mm",          operation: "Receipt",    from: "Apex Metals Ltd",  to: "Main Warehouse",       quantity: 200, user: "Agasthya", result: "Completed" },

  // Yesterday
  { id: "L008", timestamp: "Yesterday, 16:30", reference: "ADJ-418", productId: "deep-groove-bearing-6205", operation: "Adjustment", from: "Production Floor", to: "Damaged / Worn", quantity: -4, user: "Agasthya", result: "Recorded" },
  { id: "L009", timestamp: "Yesterday, 15:10", reference: "DLV-2082", productId: "stainless-pipe-dn50",     operation: "Delivery",   from: "Main Warehouse",   to: "Arc Manufacturing",  quantity: -18, user: "Agasthya", result: "Completed" },
  { id: "L010", timestamp: "Yesterday, 14:45", reference: "RCV-1879", productId: "corrugated-box-600x400",  operation: "Receipt",    from: "BoxCo Packaging",  to: "Dispatch Area",      quantity: 400, user: "Agasthya", result: "Completed" },
  { id: "L011", timestamp: "Yesterday, 13:20", reference: "TRF-3105", productId: "stainless-nut-m10",       operation: "Transfer",   from: "Main Warehouse",   to: "Production Floor",   quantity: 500, user: "Agasthya", result: "Completed" },
  { id: "L012", timestamp: "Yesterday, 11:55", reference: "DLV-2081", productId: "hex-bolt-m12-40",         operation: "Delivery",   from: "Dispatch Area",    to: "Forge Industries",   quantity: -800, user: "Agasthya", result: "Completed" },
  { id: "L013", timestamp: "Yesterday, 10:40", reference: "RCV-1878", productId: "aluminium-sheet-2mm",     operation: "Receipt",    from: "Alco Metals",      to: "Main Warehouse",     quantity: 120, user: "Agasthya", result: "Completed" },
  { id: "L014", timestamp: "Yesterday, 09:15", reference: "ADJ-417", productId: "pneumatic-valve-14",       operation: "Adjustment", from: "Production Floor", to: "Failed QC",          quantity: -3,  user: "Agasthya", result: "Recorded" },

  // 2 days ago
  { id: "L015", timestamp: "Sep 24, 17:00", reference: "TRF-3104", productId: "iso-vg-46-hydraulic-oil",   operation: "Transfer",   from: "Main Warehouse",   to: "Production Floor",    quantity: 80,  user: "Agasthya", result: "Completed" },
  { id: "L016", timestamp: "Sep 24, 15:30", reference: "RCV-1877", productId: "nitrile-gloves-l",           operation: "Receipt",    from: "SafetyFirst Ltd",  to: "Main Warehouse",      quantity: 40,  user: "Agasthya", result: "Completed" },
  { id: "L017", timestamp: "Sep 24, 14:00", reference: "DLV-2080", productId: "fabricated-bracket-a",       operation: "Delivery",   from: "Dispatch Area",    to: "Delta Engineering",   quantity: -20, user: "Agasthya", result: "Completed" },
  { id: "L018", timestamp: "Sep 24, 12:30", reference: "TRF-3103", productId: "spring-washer-m8",           operation: "Transfer",   from: "Main Warehouse",   to: "Production Floor",    quantity: 1200, user: "Agasthya", result: "Completed" },
  { id: "L019", timestamp: "Sep 24, 10:45", reference: "RCV-1876", productId: "copper-wire-1mm",            operation: "Receipt",    from: "CopperTech",       to: "Main Warehouse",      quantity: 2000, user: "Agasthya", result: "Completed" },
  { id: "L020", timestamp: "Sep 24, 09:10", reference: "ADJ-416", productId: "stretch-wrap-500mm",          operation: "Adjustment", from: "Dispatch Area",    to: "Recount Variance",    quantity: -2,  user: "Agasthya", result: "Recorded" },

  // 3 days ago
  { id: "L021", timestamp: "Sep 23, 16:20", reference: "DLV-2079", productId: "steel-rods-6mm",            operation: "Delivery",   from: "Main Warehouse",   to: "Northgate Fabrications", quantity: -120, user: "Agasthya", result: "Completed" },
  { id: "L022", timestamp: "Sep 23, 14:50", reference: "RCV-1875", productId: "hot-rolled-steel-coil",     operation: "Receipt",    from: "Apex Metals Ltd",  to: "Main Warehouse",         quantity: 800, user: "Agasthya", result: "Completed" },
  { id: "L023", timestamp: "Sep 23, 13:15", reference: "TRF-3102", productId: "aluminium-sheet-2mm",       operation: "Transfer",   from: "Warehouse 2",      to: "Main Warehouse",         quantity: 30,  user: "Agasthya", result: "Completed" },
  { id: "L024", timestamp: "Sep 23, 11:40", reference: "DLV-2078", productId: "iso-vg-46-hydraulic-oil",   operation: "Delivery",   from: "Main Warehouse",   to: "Hillside Plant",         quantity: -60, user: "Agasthya", result: "Completed" },
  { id: "L025", timestamp: "Sep 23, 09:55", reference: "RCV-1874", productId: "deep-groove-bearing-6205",  operation: "Receipt",    from: "SKF Distributors", to: "Main Warehouse",         quantity: 24,  user: "Agasthya", result: "Completed" },

  // 4 days ago
  { id: "L026", timestamp: "Sep 22, 15:30", reference: "TRF-3101", productId: "hex-bolt-m12-40",           operation: "Transfer",   from: "Main Warehouse",   to: "Dispatch Area",    quantity: 1000, user: "Agasthya", result: "Completed" },
  { id: "L027", timestamp: "Sep 22, 14:00", reference: "ADJ-415", productId: "fabricated-bracket-a",       operation: "Adjustment", from: "Dispatch Area",    to: "Recount Variance", quantity: 3,    user: "Agasthya", result: "Recorded" },
  { id: "L028", timestamp: "Sep 22, 12:20", reference: "RCV-1873", productId: "dust-mask-ffp2",            operation: "Receipt",    from: "SafetyFirst Ltd",  to: "Main Warehouse",   quantity: 20,   user: "Agasthya", result: "Completed" },
  { id: "L029", timestamp: "Sep 22, 10:45", reference: "DLV-2077", productId: "stainless-nut-m10",         operation: "Delivery",   from: "Main Warehouse",   to: "Arc Manufacturing",quantity: -600, user: "Agasthya", result: "Completed" },
  { id: "L030", timestamp: "Sep 22, 09:00", reference: "RCV-1872", productId: "pneumatic-valve-14",        operation: "Receipt",    from: "HydroTech Ltd",    to: "Main Warehouse",   quantity: 18,   user: "Agasthya", result: "Completed" },
];

// ─── Core helpers ─────────────────────────────────────────────────────────
export const totalStock = (product: Product) =>
  product.locations.reduce((sum, item) => sum + item.quantity, 0);

export const statusFor = (product: Product): StockStatus => {
  const total = totalStock(product);
  if (total <= 0) return "Critical";
  if (total <= product.reorderPoint * 0.65) return "Critical";
  if (total <= product.reorderPoint) return "At Risk";
  if (total >= product.reorderPoint * 3) return "Overstocked";
  if (product.dailyUse < 1) return "Slow Moving";
  return "Healthy";
};

export const daysRemaining = (product: Product) =>
  totalStock(product) / Math.max(product.dailyUse, 0.1);

// ─── Computed KPI helpers ──────────────────────────────────────────────────
export type KPIs = {
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
};

export function computeKPIs(products: Product[], ledger: LedgerEvent[]): KPIs {
  const recentCutoff = 7; // days to consider "recent" for pending ops
  const pendingReceipts = ledger.filter((e) => e.operation === "Receipt").length;
  const pendingDeliveries = ledger.filter((e) => e.operation === "Delivery").length;
  const pendingTransfers = ledger.filter((e) => e.operation === "Transfer").length;

  return {
    totalStock: products.reduce((sum, p) => sum + totalStock(p), 0),
    lowStockCount: products.filter((p) => ["At Risk", "Critical"].includes(statusFor(p))).length,
    outOfStockCount: products.filter((p) => totalStock(p) <= 0).length,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
  };
}

// ─── Anomaly detection ────────────────────────────────────────────────────
export type AnomalyAlert = {
  productId: string;
  productName: string;
  totalAdjusted: number;
  eventCount: number;
  unit: string;
  description: string;
};

export function detectAnomalies(products: Product[], ledger: LedgerEvent[]): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];
  const recentAdjustments = ledger.filter((e) => e.operation === "Adjustment" && e.quantity < 0);

  // Group by product
  const byProduct = new Map<string, LedgerEvent[]>();
  for (const e of recentAdjustments) {
    const arr = byProduct.get(e.productId) ?? [];
    arr.push(e);
    byProduct.set(e.productId, arr);
  }

  for (const [productId, events] of byProduct.entries()) {
    const product = products.find((p) => p.id === productId);
    if (!product) continue;
    const totalOut = Math.abs(events.reduce((s, e) => s + e.quantity, 0));
    // Flag if more than 2 negative adjustments OR total out > 15% of reorder point
    if (events.length >= 2 || totalOut > product.reorderPoint * 0.15) {
      alerts.push({
        productId,
        productName: product.name,
        totalAdjusted: totalOut,
        eventCount: events.length,
        unit: product.unit,
        description: `${totalOut} ${product.unit} adjusted out across ${events.length} event${events.length > 1 ? "s" : ""}.`,
      });
    }
  }

  return alerts;
}

// ─── Inventory health score ────────────────────────────────────────────────
export type HealthScore = {
  overall: number;
  availability: number;
  demandCoverage: number;
  warehouseBalance: number;
  anomalies: number;
  deadStock: number;
  pendingOps: number;
};

export function computeHealthScore(products: Product[], ledger: LedgerEvent[]): HealthScore {
  const total = products.length;
  if (total === 0) return { overall: 0, availability: 0, demandCoverage: 0, warehouseBalance: 0, anomalies: 0, deadStock: 0, pendingOps: 0 };

  const healthy = products.filter((p) => statusFor(p) === "Healthy").length;
  const availability = Math.round((healthy / total) * 100);

  // Demand coverage: how many products have > 7 days remaining
  const covered = products.filter((p) => daysRemaining(p) >= 7).length;
  const demandCoverage = Math.round((covered / total) * 100);

  // Warehouse balance: products spread across ≥2 warehouses
  const balanced = products.filter((p) => p.locations.filter((l) => l.quantity > 0).length >= 2).length;
  const warehouseBalance = Math.round((balanced / total) * 100);

  // Anomalies: penalise based on detected anomaly count
  const anomalyCount = detectAnomalies(products, ledger).length;
  const anomalies = Math.max(0, 100 - anomalyCount * 15);

  // Dead stock: slow-moving items
  const deadCount = products.filter((p) => statusFor(p) === "Slow Moving" || statusFor(p) === "Overstocked").length;
  const deadStock = Math.round(((total - deadCount) / total) * 100);

  // Pending ops: fewer open ops is better (cap at 20)
  const openOps = ledger.length;
  const pendingOps = Math.max(50, 100 - Math.min(openOps, 20) * 2);

  const overall = Math.round((availability + demandCoverage + warehouseBalance + anomalies + deadStock + pendingOps) / 6);

  return { overall, availability, demandCoverage, warehouseBalance, anomalies, deadStock, pendingOps };
}

// ─── Context ─────────────────────────────────────────────────────────────
type InventoryContextValue = {
  products: Product[];
  ledger: LedgerEvent[];
  receive: (productId: string, warehouse: string, quantity: number, supplier?: string) => void;
  deliver: (productId: string, warehouse: string, quantity: number, customer?: string) => { ok: boolean; available: number };
  transfer: (productId: string, from: string, to: string, quantity: number) => { ok: boolean; available: number };
  adjust: (productId: string, warehouse: string, physical: number, reason: string) => void;
  addProduct: (product: Omit<Product, "id" | "lastMovement">) => void;
  reset: () => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);
const STORAGE_KEY = "stocksense-state-v2";

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
      const exists = product.locations.some((l) => l.warehouse === warehouse);
      const locations = exists
        ? product.locations.map((l) => l.warehouse === warehouse ? { ...l, quantity: change(l.quantity) } : l)
        : [...product.locations, { warehouse, quantity: change(0) }];
      return { ...product, locations, lastMovement: "Just now" };
    }));
  };

  const addLedger = (event: Omit<LedgerEvent, "id" | "timestamp" | "user" | "result">) =>
    setLedger((items) => [{
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      user: "Agasthya",
      result: "Completed",
    }, ...items]);

  const value = useMemo<InventoryContextValue>(() => ({
    products,
    ledger,
    receive(productId, warehouse, quantity, supplier = "Vendor") {
      mutateLocation(productId, warehouse, (c) => c + quantity);
      addLedger({ reference: `RCV-${1043 + ledger.length}`, productId, operation: "Receipt", from: supplier, to: warehouse, quantity });
    },
    deliver(productId, warehouse, quantity, customer = "Customer") {
      const available = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
      if (quantity > available) return { ok: false, available };
      mutateLocation(productId, warehouse, (c) => c - quantity);
      addLedger({ reference: `DLV-${1841 + ledger.length}`, productId, operation: "Delivery", from: warehouse, to: customer, quantity: -quantity });
      return { ok: true, available };
    },
    transfer(productId, from, to, quantity) {
      const available = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === from)?.quantity ?? 0;
      if (quantity > available || from === to) return { ok: false, available };
      mutateLocation(productId, from, (c) => c - quantity);
      mutateLocation(productId, to, (c) => c + quantity);
      addLedger({ reference: `TRF-${2042 + ledger.length}`, productId, operation: "Transfer", from, to, quantity });
      return { ok: true, available };
    },
    adjust(productId, warehouse, physical, reason) {
      const current = products.find((p) => p.id === productId)?.locations.find((l) => l.warehouse === warehouse)?.quantity ?? 0;
      mutateLocation(productId, warehouse, () => physical);
      addLedger({
        reference: `ADJ-${303 + ledger.length}`,
        productId,
        operation: "Adjustment",
        from: warehouse,
        to: reason,
        quantity: physical - current,
      });
    },
    addProduct(product) {
      const id = product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setProducts((items) => [...items, { ...product, id, lastMovement: "Just now" }]);
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
