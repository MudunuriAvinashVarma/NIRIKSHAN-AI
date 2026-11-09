"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "./animations/CountUp";

interface StatCardProps {
  title: string;
  value: string | number;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: "gold" | "warning" | "critical" | "success" | "muted";
  className?: string;
}

export default function StatCard({
  title,
  value,
  numericValue,
  prefix = "",
  suffix = "",
  subtitle,
  icon: Icon,
  badge,
  badgeColor = "gold",
  className = "",
}: StatCardProps) {
  const badgeColors = {
    gold: "bg-brand-gold/15 text-brand-goldLight border-brand-gold/30",
    warning: "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
    critical: "bg-brand-critical/15 text-brand-critical border-brand-critical/30",
    success: "bg-brand-success/15 text-brand-success border-brand-success/30",
    muted: "bg-brand-card text-brand-muted border-brand-border",
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`relative overflow-hidden rounded-xl bg-brand-card p-6 border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow transition-all duration-300 group shadow-card ${className}`}
    >
      {/* Subtle ambient background glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/15 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-brand-text mt-2 font-mono tracking-tight">
            {numericValue !== undefined ? (
              <CountUp value={numericValue} prefix={prefix} suffix={suffix} />
            ) : typeof value === "number" ? (
              <CountUp value={value} prefix={prefix} suffix={suffix} />
            ) : (
              value
            )}
          </h3>
          {subtitle && (
            <p className="text-xs text-brand-muted mt-2 flex items-center gap-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="p-3 rounded-lg bg-brand-surface border border-brand-border text-brand-gold group-hover:border-brand-gold/40 group-hover:text-brand-goldLight group-hover:scale-105 transition-all duration-300">
            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-3" />
          </div>
          {badge && (
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border transition-colors ${badgeColors[badgeColor]}`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
