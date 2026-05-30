"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LoginCard({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="w-full max-w-[420px] overflow-hidden rounded-xl bg-blush-50 shadow-[0_4px_24px_rgba(153,53,86,0.08)]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
