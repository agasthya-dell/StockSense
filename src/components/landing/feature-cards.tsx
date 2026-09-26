import {
  Activity, ArrowLeftRight, BrainCircuit, ClipboardCheck,
  History, PackageCheck, SlidersHorizontal, Sparkles,
  TriangleAlert, Warehouse,
} from "lucide-react";
import { FadeUp } from "./motion-primitives";

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    icon: Activity,
    title: "Live Inventory Overview",
    description: "See your entire stock across all warehouses in real time. Six live KPIs update the moment any operation is recorded.",
    tag: "Dashboard",
  },
  {
    icon: BrainCircuit,
    title: "Risk Monitor",
    description: "Explainable stock-out risk ranked by depletion rate. Know exactly which product runs out in how many days and why.",
    tag: "Intelligence",
  },
  {
    icon: Sparkles,
    title: "StockSense Intelligence",
    description: "AI-computed recommendations: balance inventory, reorder quantities, and redistribution opportunities — all explained.",
    tag: "AI",
  },
  {
    icon: ClipboardCheck,
    title: "What-if Simulator",
    description: "Stress-test your stock before conditions change. Model demand spikes, supplier delays, and warehouse outages instantly.",
    tag: "Simulation",
  },
  {
    icon: PackageCheck,
    title: "Receipts & Deliveries",
    description: "Record incoming and outgoing stock with a two-step review flow. Every operation creates an auditable ledger event.",
    tag: "Operations",
  },
  {
    icon: ArrowLeftRight,
    title: "Internal Transfers",
    description: "Move stock between locations with smart source selection. Company-wide totals stay unchanged — only distribution shifts.",
    tag: "Operations",
  },
  {
    icon: SlidersHorizontal,
    title: "Stock Adjustments",
    description: "Reconcile physical counts with recorded inventory. Every adjustment is stamped with a reason and logged permanently.",
    tag: "Operations",
  },
  {
    icon: Warehouse,
    title: "Multi-Warehouse View",
    description: "Four warehouse locations tracked simultaneously. See product distribution, rack labels, and per-location stock levels.",
    tag: "Locations",
  },
  {
    icon: TriangleAlert,
    title: "Anomaly Detection",
    description: "Automatic detection of unusual adjustment patterns. Flags repeated write-offs at a single location for review.",
    tag: "Intelligence",
  },
  {
    icon: History,
    title: "Stock Ledger",
    description: "A chronological, immutable-style record of every inventory movement. Export to CSV with one click.",
    tag: "Audit",
  },
];

const tagColors: Record<string, string> = {
  Dashboard: "bg-[oklch(0.5_0.12_248/0.15)] text-[oklch(0.7_0.10_248)]",
  Intelligence: "bg-[oklch(0.5_0.14_270/0.15)] text-[oklch(0.7_0.12_270)]",
  AI: "bg-[oklch(0.5_0.18_148/0.15)] text-[oklch(0.65_0.14_148)]",
  Simulation: "bg-[oklch(0.55_0.14_70/0.15)] text-[oklch(0.7_0.12_70)]",
  Operations: "bg-[oklch(0.5_0.10_255/0.15)] text-[oklch(0.68_0.08_255)]",
  Locations: "bg-[oklch(0.5_0.12_220/0.15)] text-[oklch(0.68_0.10_220)]",
  Audit: "bg-[oklch(0.5_0.10_0/0.15)] text-[oklch(0.68_0.08_0)]",
};

export function FeatureCards() {
  return (
    <section id="features" className="w-full bg-[oklch(0.10_0.03_255)] py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <FadeUp className="mb-16 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-3">
            Everything you need
          </p>
          <h2 className="font-serif text-[2.5rem] font-normal leading-tight tracking-tight text-white md:text-[3.2rem]">
            Built for inventory teams
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-[42ch] mx-auto">
            Every feature is designed around one goal: giving you the clarity to act before problems become crises.
          </p>
        </FadeUp>

        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={Math.min(i * 0.05, 0.25)} className="mb-5 break-inside-avoid">
              <FeatureCard feature={f} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <article className="project-card flex flex-col gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5 hover:border-white/14 hover:bg-white/[0.05] transition-colors duration-300">
      <header className="flex items-center justify-between">
        <div className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="size-4 text-white/70" />
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tagColors[feature.tag] ?? "bg-white/10 text-white/50"}`}>
          {feature.tag}
        </span>
      </header>
      <div>
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white">{feature.title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-white/45">{feature.description}</p>
      </div>
    </article>
  );
}
