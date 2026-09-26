import { Archive } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-[oklch(0.095_0.03_255)] py-10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-md bg-white/8">
              <Archive className="size-3.5 text-white/60" />
            </div>
            <span className="font-serif text-sm text-white/50">StockSense</span>
          </div>
          <p className="text-[11px] text-white/20">
            Inventory Operating System · Built for warehouse teams
          </p>
          <p className="text-[11px] text-white/20">© 2026 StockSense</p>
        </div>
      </div>
    </footer>
  );
}
