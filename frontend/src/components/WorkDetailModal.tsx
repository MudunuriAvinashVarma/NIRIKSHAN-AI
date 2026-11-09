"use client";

import { useEffect, useState } from "react";
import { AnomalyRecord } from "@/types";
import {
  X,
  ShieldAlert,
  Clock,
  IndianRupee,
  Calendar,
  MapPin,
  Building2,
  TrendingUp,
  Layers,
  Copy,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignalBadge from "./SignalBadge";
import CountUp from "./animations/CountUp";

interface WorkDetailModalProps {
  record: AnomalyRecord | null;
  onClose: () => void;
}

export default function WorkDetailModal({ record, onClose }: WorkDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} Lakh`;
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  const copySummary = () => {
    const text = `NIRIKSHAN AI Investigation Dossier
Ref: ${record.workName}
State: ${record.state} | Constituency: ${record.constituency}
Category: ${record.category}
Amount: ₹${record.sanctionAmount.toLocaleString("en-IN")}
Sanction Delay: ${record.sanctionDelayDays} Days
Isolation Score: ${record.isolationScore ?? "N/A"}
Signals: ${record.reviewSignals.join(", ")}
Explanation: ${record.reviewExplanation}
Notice: ${record.interpretationNotice}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Animated Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Animated Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.98 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-surface border border-brand-border shadow-2xl p-6 sm:p-8 z-10"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-5 border-b border-brand-border">
            <div className="space-y-1.5 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-brand-gold px-2 py-0.5 rounded bg-brand-gold/15 border border-brand-gold/30">
                  Work Record #{record.id}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-card text-brand-muted border border-brand-border">
                  {record.workStatus}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text leading-snug">
                {record.workName}
              </h2>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-cardHover transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Restrained Interpretation Notice Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="my-5 p-4 rounded-xl bg-brand-warning/10 border border-brand-warning/30 flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-warning">
                Analytical Review Signal Notice
              </h4>
              <p className="text-xs text-brand-text/90 leading-relaxed">
                {record.interpretationNotice}
              </p>
            </div>
          </motion.div>

          {/* Quick KPI Strip with Animated CountUp */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-3.5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-colors"
            >
              <span className="text-[11px] text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-brand-gold" /> Sanction Amount
              </span>
              <p className="text-lg font-bold font-mono text-brand-text mt-1">
                {formatCurrency(record.sanctionAmount)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3.5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-warning/30 transition-colors"
            >
              <span className="text-[11px] text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-warning" /> Sanction Delay
              </span>
              <p className="text-lg font-bold font-mono text-brand-warning mt-1">
                <CountUp value={record.sanctionDelayDays} suffix=" Days" />
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-3.5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-colors"
            >
              <span className="text-[11px] text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-goldLight" /> Isolation Score
              </span>
              <p className="text-lg font-bold font-mono text-brand-goldLight mt-1">
                {record.isolationScore !== null ? record.isolationScore.toFixed(3) : "N/A"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3.5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-critical/30 transition-colors"
            >
              <span className="text-[11px] text-brand-muted uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-brand-critical" /> Anomaly Percentile
              </span>
              <p className="text-lg font-bold font-mono text-brand-critical mt-1">
                {record.anomalyPercentile !== null ? (
                  <CountUp value={Number(record.anomalyPercentile.toFixed(1))} suffix="%" />
                ) : (
                  "N/A"
                )}
              </p>
            </motion.div>
          </div>

          {/* Detailed Breakdown Sections */}
          <div className="space-y-6 my-6">
            
            {/* Work Description & Geolocation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border space-y-3"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-gold" /> Work Description & Constituency
              </h4>
              <p className="text-sm text-brand-text leading-relaxed bg-brand-surface/70 p-3 rounded-lg border border-brand-border">
                {record.description || "No granular description recorded in the source repository."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-brand-muted">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <span>
                    <strong className="text-brand-text">State:</strong> {record.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-brand-muted">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <span>
                    <strong className="text-brand-text">Constituency:</strong> {record.constituency}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-brand-muted">
                  <Layers className="w-4 h-4 text-brand-gold" />
                  <span>
                    <strong className="text-brand-text">Category:</strong> {record.category}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border space-y-3"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-gold" /> Timeline & Approval Stages
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-brand-surface border border-brand-border">
                  <p className="text-brand-muted">Recommended Date</p>
                  <p className="font-mono text-sm font-semibold text-brand-text mt-1">{record.recommendedDate}</p>
                </div>
                <div className="p-3 rounded-lg bg-brand-surface border border-brand-border">
                  <p className="text-brand-muted">Sanction Date</p>
                  <p className="font-mono text-sm font-semibold text-brand-text mt-1">{record.sanctionDate}</p>
                </div>
                <div className="p-3 rounded-lg bg-brand-surface border border-brand-border">
                  <p className="text-brand-muted">Delay Between Stages</p>
                  <p className="font-mono text-sm font-semibold text-brand-warning mt-1">{record.sanctionDelayDays} days</p>
                </div>
              </div>
            </motion.div>

            {/* ML Review Signals & Sequential Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-gold" /> Analytical Review Signals Triggered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {record.reviewSignals.map((sig, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.45 + idx * 0.1 }}
                    >
                      <SignalBadge signal={sig} />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-2">
                <p className="text-xs text-brand-muted uppercase font-mono">Statistical Explanation</p>
                <p className="text-sm text-brand-text leading-relaxed">
                  {record.reviewExplanation}
                </p>
              </div>

              {/* Animated Percentile Cohort Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* State Peer Cohort */}
                <div className="p-3.5 rounded-lg bg-brand-surface border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted font-medium">State Cohort Percentile:</span>
                    <span className="text-sm font-bold font-mono text-brand-text">
                      {record.statePeerPercentile !== null ? `${record.statePeerPercentile.toFixed(1)}%` : "N/A"}
                    </span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-1.5 rounded-full bg-brand-card overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.statePeerPercentile ?? 0}%` }}
                      transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full bg-brand-gold"
                    />
                  </div>
                  <span className="text-[10px] text-brand-muted font-mono block">
                    Cohort size: {record.statePeerGroupSize ?? "N/A"} works
                  </span>
                </div>

                {/* Category Peer Cohort */}
                <div className="p-3.5 rounded-lg bg-brand-surface border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted font-medium">Category Cohort Percentile:</span>
                    <span className="text-sm font-bold font-mono text-brand-goldLight">
                      {record.categoryPeerPercentile !== null ? `${record.categoryPeerPercentile.toFixed(1)}%` : "N/A"}
                    </span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-1.5 rounded-full bg-brand-card overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.categoryPeerPercentile ?? 0}%` }}
                      transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
                      className="h-full rounded-full bg-brand-goldLight"
                    />
                  </div>
                  <span className="text-[10px] text-brand-muted font-mono block">
                    Cohort size: {record.categoryPeerGroupSize ?? "N/A"} works
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-brand-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copySummary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-card border border-brand-border text-brand-text hover:text-brand-gold hover:border-brand-gold/40 text-xs font-medium transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-brand-success" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Dossier Copied!" : "Copy Investigation Dossier"}</span>
            </motion.button>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-card border border-brand-border text-brand-text hover:bg-brand-cardHover text-xs font-medium transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-brand-muted" />
                <span>Print / Export Dossier</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldLight text-brand-bg text-xs font-semibold transition-all shadow-sm hover:shadow-goldGlow"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
