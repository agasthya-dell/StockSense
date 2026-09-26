import { FadeUp } from "./motion-primitives";

const STATS = [
  { value: "8+", label: "Product types tracked" },
  { value: "4", label: "Warehouse locations" },
  { value: "Real-time", label: "Inventory updates" },
  { value: "100%", label: "Operations auditable" },
  { value: "6", label: "Intelligence dimensions" },
  { value: "Zero", label: "Latency on mutations" },
];

export function StatsBar() {
  return (
    <section className="w-full border-y border-white/5 bg-[oklch(0.105_0.03_255)] py-14">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <FadeUp>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl font-normal text-white">{s.value}</div>
                <div className="mt-1.5 text-[11px] text-white/35 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
