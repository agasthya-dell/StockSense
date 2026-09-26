import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Archive } from "lucide-react";
import { FadeIn, ScaleUnblur } from "./motion-primitives";
import { ShaderFlow } from "./shader-flow";
import { supabase } from "@/lib/supabase";

async function goToLogin(navigate: ReturnType<typeof useNavigate>) {
  // Sign out any existing session so the login page always shows
  await supabase.auth.signOut();
  navigate({ to: "/login" });
}

export function Hero() {
  const navigate = useNavigate();
  return (
    <section id="product" className="relative w-full min-h-screen flex items-center overflow-hidden bg-[oklch(0.10_0.03_255)]">
      {/* WebGL backdrop */}
      <ShaderFlow
        className="absolute inset-0 h-full w-full"
        flowSpeed={[0.08, 0.14]}
        iterations={14}
        scale={5}
        brightness={0.85}
        colorLowA={[0.07, 0.09, 0.20]}
        colorHighA={[0.16, 0.22, 0.50]}
        fadeRx={1.6}
        fadeRy={0.8}
        fadeCx={0.5}
        fadeCy={0.05}
      />

      {/* Gradient fade to bottom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.10_0.03_255)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-36 pb-32 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left — copy */}
          <FadeIn className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[oklch(0.6_0.18_148)]" />
              Inventory Operating System
            </div>

            <h1 className="font-serif text-[2.8rem] font-normal leading-[1.08] tracking-tight text-white md:text-[3.2rem] lg:text-[4rem]">
              <span className="block">Know what you have.</span>
              <span className="block italic text-white/50">Understand what</span>
              <span className="block italic text-white/50">happens next.</span>
            </h1>

            <p className="max-w-[38ch] text-lg leading-relaxed text-white/45">
              One precise workspace for stock visibility, warehouse operations, and explainable inventory decisions — built for teams that need clarity, not chaos.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => goToLogin(navigate)}
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[oklch(0.13_0.03_255)] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5"
              >
                Enter StockSense
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
              >
                See features
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap items-center gap-6 text-[11px] font-medium text-white/30">
              <span>✓ Real-time inventory tracking</span>
              <span>✓ 4 warehouse locations</span>
              <span>✓ AI-powered risk detection</span>
            </div>
          </FadeIn>

          {/* Right — dashboard preview card */}
          <ScaleUnblur delay={0.15} className="flex justify-stretch md:justify-end">
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1.5 shadow-2xl backdrop-blur-sm md:max-w-lg">
              <div className="overflow-hidden rounded-[1.4rem] bg-[oklch(0.12_0.03_255)]">
                {/* Mock dashboard header */}
                <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                  <div className="grid size-6 place-items-center rounded-md bg-white/10">
                    <Archive className="size-3.5 text-white/70" />
                  </div>
                  <span className="font-serif text-sm text-white/70">StockSense</span>
                  <div className="ml-auto flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-white/10" />
                    <div className="size-2.5 rounded-full bg-white/10" />
                    <div className="size-2.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Mock KPI grid */}
                <div className="grid grid-cols-3 gap-px bg-white/5 p-px">
                  {[
                    { label: "Total stock", value: "14,820", trend: "+2.8%" },
                    { label: "Low stock", value: "3", trend: "⚠ Urgent" },
                    { label: "Transfers", value: "5", trend: "Active" },
                  ].map((k) => (
                    <div key={k.label} className="bg-[oklch(0.12_0.03_255)] px-4 py-4">
                      <div className="text-[9px] uppercase tracking-widest text-white/30">{k.label}</div>
                      <div className="mt-2 font-serif text-2xl font-normal text-white">{k.value}</div>
                      <div className="mt-1 text-[10px] text-white/35">{k.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Mock chart bar */}
                <div className="border-t border-white/8 px-4 py-4">
                  <div className="mb-2 text-[9px] uppercase tracking-widest text-white/30">Stock trajectory · 7 days</div>
                  <div className="flex items-end gap-1 h-14">
                    {[65, 72, 68, 58, 45, 38, 30].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: `oklch(${0.45 + i * 0.02} 0.12 ${248 + i * 3} / ${0.3 + i * 0.05})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mock alert row */}
                <div className="border-t border-white/8 flex items-center gap-3 px-4 py-3">
                  <div className="size-2 rounded-full bg-[oklch(0.55_0.19_25)] animate-pulse" />
                  <span className="text-[11px] text-white/40">Steel Rods — projected stock-out in 4.2 days</span>
                  <span className="ml-auto text-[10px] font-medium text-[oklch(0.6_0.12_248)]">Review →</span>
                </div>
              </div>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
