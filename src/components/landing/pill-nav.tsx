import { motion } from "motion/react";
import { Archive } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function PillNav() {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [pillRect, setPillRect] = useState<{ x: number; width: number } | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const list = listRef.current;
    const el = itemRefs.current[active];
    if (!list || !el) { setPillRect(null); return; }
    const lr = list.getBoundingClientRect();
    const ir = el.getBoundingClientRect();
    setPillRect({ x: ir.left - lr.left, width: ir.width });
  }, [active]);

  useEffect(() => {
    if (!pillRect) return;
    const id = requestAnimationFrame(() => setHasMeasured(true));
    return () => cancelAnimationFrame(id);
  }, [pillRect]);

  const scrollTo = (href: string, idx: number) => {
    setActive(idx);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Landing" className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[oklch(0.13_0.03_255/0.85)] px-2 py-1.5 shadow-lg backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-2 pl-2 pr-3">
          <div className="grid size-6 place-items-center rounded-md bg-white/10">
            <Archive className="size-3.5 text-white/80" />
          </div>
          <span className="font-serif text-sm font-normal text-white/80 tracking-wide">StockSense</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Nav items */}
        <ul ref={listRef} className="relative flex items-center gap-0.5">
          {pillRect && (
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ x: pillRect.x, width: pillRect.width }}
              transition={hasMeasured ? { type: "spring", stiffness: 380, damping: 32 } : { duration: 0 }}
              style={{ left: 0, top: 0, bottom: 0 }}
              className="absolute rounded-full bg-white/10 ring-1 ring-white/10"
            />
          )}
          {NAV_ITEMS.map((item, i) => (
            <li key={item.label} ref={(el) => { itemRefs.current[i] = el; }} className="relative">
              <button
                type="button"
                onClick={() => scrollTo(item.href, i)}
                className="relative inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200"
              >
                <span className={active === i ? "relative z-10 text-white" : "relative z-10 text-white/50 hover:text-white/80"}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="h-4 w-px bg-white/10" />

        {/* CTA */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-[oklch(0.13_0.03_255)] transition-all hover:bg-white hover:shadow-md mr-1"
        >
          Enter StockSense →
        </Link>
      </div>
    </nav>
  );
}
