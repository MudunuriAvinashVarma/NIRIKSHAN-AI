"use client";

import { AlertTriangle, Clock, Layers, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SignalBadgeProps {
  signal: string;
  size?: "sm" | "md";
}

export default function SignalBadge({ signal, size = "md" }: SignalBadgeProps) {
  const isGlobalIF = signal.toLowerCase().includes("isolation forest");
  const isStateDelay = signal.toLowerCase().includes("state-year delay");
  const isCategoryDelay = signal.toLowerCase().includes("category-year delay");

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  if (isGlobalIF) {
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30 hover:border-brand-gold/60 transition-colors shadow-sm ${sizeClasses}`}
        title="Flagged by multidimensional Global Isolation Forest outlier detector"
      >
        <Sparkles className="w-3 h-3 text-brand-gold shrink-0 animate-pulse" />
        <span>Global Isolation Forest</span>
      </motion.span>
    );
  }

  if (isStateDelay) {
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-900/20 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-colors shadow-sm ${sizeClasses}`}
        title="Extreme sanction delay relative to other works in the same state and recommendation year"
      >
        <Clock className="w-3 h-3 text-blue-400 shrink-0" />
        <span>State-Year Delay</span>
      </motion.span>
    );
  }

  if (isCategoryDelay) {
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-900/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-colors shadow-sm ${sizeClasses}`}
        title="Sanction delay ranked in top percentiles within identical work category cohort"
      >
        <Layers className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Category-Year Delay</span>
      </motion.span>
    );
  }

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold/40 transition-colors ${sizeClasses}`}
    >
      <AlertTriangle className="w-3 h-3 text-brand-warning shrink-0" />
      <span>{signal}</span>
    </motion.span>
  );
}
