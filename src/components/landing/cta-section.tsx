import { Link } from "@tanstack/react-router";
import { ArrowRight, Archive } from "lucide-react";
import { ShaderFlow } from "./shader-flow";
import { FadeUp } from "./motion-primitives";

export function CTASection() {
  return (
    <section className="relative w-full overflow-hidden bg-[oklch(0.10_0.03_255)] py-32">
      {/* Background shader */}
      <ShaderFlow
        className="absolute inset-0 h-full w-full opacity-60"
        flowSpeed={[0.06, 0.10]}
        iterations={10}
        scale={4}
        brightness={0.7}
        colorLowA={[0.08, 0.10, 0.22]}
        colorHighA={[0.20, 0.28, 0.60]}
        fadeRx={1.2}
        fadeRy={0.5}
        fadeCx={0.5}
        fadeCy={0.5}
      />
      <div className="pointer-events-none absolute inset-0 bg-[oklch(0.10_0.03_255/0.5)]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center sm:px-10">
        <FadeUp>
          <div className="mx-auto mb-8 grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <Archive className="size-7 text-white/70" />
          </div>

          <h2 className="font-serif text-[2.8rem] font-normal leading-tight tracking-tight text-white md:text-[3.5rem]">
            Ready to see your inventory clearly?
          </h2>

          <p className="mx-auto mt-5 max-w-[40ch] text-lg leading-relaxed text-white/45">
            Sign in with Google or email. Your dashboard is ready in seconds — no setup, no data entry required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[oklch(0.13_0.03_255)] shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Enter StockSense
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-white/20">
            Demo credentials available on the sign-in page · No credit card required
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
