import { FadeUp } from "./motion-primitives";

const STEPS = [
  {
    number: "01",
    title: "Sign in with Google or email",
    description: "Authenticate securely via Supabase. Your session persists across refreshes with real OAuth.",
  },
  {
    number: "02",
    title: "See your live inventory",
    description: "The overview dashboard shows all KPIs, health scores, and risk signals computed from your actual stock data.",
  },
  {
    number: "03",
    title: "Run operations",
    description: "Record receipts, deliveries, transfers, and adjustments. Each one creates an auditable ledger event instantly.",
  },
  {
    number: "04",
    title: "Act on intelligence",
    description: "StockSense Intelligence surfaces reorder recommendations, balance opportunities, and anomaly alerts — all explained.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="w-full bg-[oklch(0.095_0.03_255)] py-24 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <FadeUp className="mb-16 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-3">
            How it works
          </p>
          <h2 className="font-serif text-[2.5rem] font-normal leading-tight tracking-tight text-white md:text-[3.2rem]">
            From zero to clarity in minutes
          </h2>
        </FadeUp>

        <div className="grid gap-px bg-white/5 rounded-3xl overflow-hidden md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.1}>
              <div className="flex flex-col gap-4 bg-[oklch(0.10_0.03_255)] p-8 h-full">
                <div className="font-serif text-[2.5rem] font-normal leading-none text-white/10">{step.number}</div>
                <div className="h-px w-8 bg-white/10" />
                <h3 className="text-[15px] font-semibold text-white leading-snug">{step.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{step.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
