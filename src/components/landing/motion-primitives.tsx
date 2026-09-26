import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FadeIn({ children, delay = 0, duration = 0.8, className }: {
  children: ReactNode; delay?: number; duration?: number; className?: string;
}): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleUnblur({ children, delay = 0, duration = 1, className }: {
  children: ReactNode; delay?: number; duration?: number; className?: string;
}): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, filter: "blur(16px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: EASE }}
      style={{ transformOrigin: "center" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, delay = 0, className }: {
  children: ReactNode; delay?: number; className?: string;
}): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
