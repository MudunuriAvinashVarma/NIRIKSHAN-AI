"use client";

import Link from "next/link";
import {
  BarChart3,
  Building,
  Clock,
  Layers,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle,
} from "lucide-react";
import { getNationalMetrics } from "@/lib/api";
import StatCard from "@/components/StatCard";
import DashboardCharts from "@/components/DashboardCharts";
import FadeIn from "@/components/animations/FadeIn";
import CountUp from "@/components/animations/CountUp";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const metrics = getNationalMetrics();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Page Header */}
        <FadeIn direction="down" duration={0.4}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30">
                  NATIONAL OVERSIGHT VIEW
                </span>
                <span className="text-xs text-brand-muted font-mono">
                  Dataset: Official MoSPI Works Sanctioned
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
                National Finance & Execution Dashboard
              </h1>
              <p className="text-sm text-brand-muted mt-1">
                Macro-level patterns across MPLADS allocations, delay clusters, and peer-group outliers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/anomalies"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-semibold text-xs transition-all shadow-sm hover:shadow-goldGlow"
                >
                  <span>Explore {metrics.reviewRecordsCount.toLocaleString("en-IN")} Candidates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* Primary KPI Grid: Audited Populations A & B with Staggered FadeUp and Animated CountUp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FadeIn delay={0.05} direction="up">
            <StatCard
              title="Total Works Analyzed"
              value={metrics.allWorksCount.toLocaleString("en-IN")}
              numericValue={metrics.allWorksCount}
              subtitle="Complete sanctioned-work dataset (Population A)"
              icon={Building}
              badge="National Baseline"
              badgeColor="gold"
            />
          </FadeIn>

          <FadeIn delay={0.12} direction="up">
            <StatCard
              title="All Works Sanctioned Amount"
              value={`₹${metrics.allWorksSanctionedAmountCr.toLocaleString("en-IN")} Cr`}
              subtitle={`Review records: ₹${metrics.reviewRecordsSanctionedAmountCr.toLocaleString("en-IN")} Cr sanctioned`}
              icon={IndianRupee}
              badge="Sanctioned Capital"
              badgeColor="success"
            />
          </FadeIn>

          <FadeIn delay={0.19} direction="up">
            <StatCard
              title="Average Sanction Delay"
              value={metrics.allWorksAvgDelayDays}
              numericValue={metrics.allWorksAvgDelayDays}
              suffix=" Days"
              subtitle={`Review records avg: ${metrics.reviewRecordsAvgDelayDays}d (Max: ${metrics.reviewRecordsMaxDelayDays}d)`}
              icon={Clock}
              badge="National Average"
              badgeColor="warning"
            />
          </FadeIn>

          <FadeIn delay={0.26} direction="up">
            <StatCard
              title="Combined Review Records"
              value={metrics.reviewRecordsCount.toLocaleString("en-IN")}
              numericValue={metrics.reviewRecordsCount}
              subtitle="Statistical anomaly candidates flagged for review (Population B)"
              icon={ShieldAlert}
              badge="Review Cohort"
              badgeColor="critical"
            />
          </FadeIn>
        </div>

        {/* Secondary ML Signal Breakdown Strip with Micro-hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FadeIn delay={0.1} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow flex items-center justify-between transition-all duration-300"
            >
              <div>
                <p className="text-xs text-brand-muted font-mono uppercase">Isolation Forest Candidates</p>
                <p className="text-2xl font-bold font-mono text-brand-gold mt-1">
                  <CountUp value={metrics.isolationForestCandidatesCount} suffix=" Works" />
                </p>
                <p className="text-[11px] text-brand-muted mt-1">Unsupervised tree ensemble outlier candidates</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-surface border border-brand-border text-brand-gold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.18} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-warning/40 flex items-center justify-between transition-all duration-300"
            >
              <div>
                <p className="text-xs text-brand-muted font-mono uppercase">Cohort Delay Candidates</p>
                <p className="text-2xl font-bold font-mono text-brand-warning mt-1">
                  <CountUp value={metrics.cohortDelayCandidatesCount} suffix=" Works" />
                </p>
                <p className="text-[11px] text-brand-muted mt-1">Severe delay relative to peer state/category groups</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-surface border border-brand-border text-brand-warning">
                <Clock className="w-5 h-5" />
              </div>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.26} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-xl bg-brand-card border border-brand-border hover:border-brand-gold/40 flex items-center justify-between transition-all duration-300"
            >
              <div>
                <p className="text-xs text-brand-muted font-mono uppercase">Peer-Group Review Signals</p>
                <p className="text-2xl font-bold font-mono text-brand-goldLight mt-1">
                  <CountUp value={metrics.peerGroupReviewSignalsCount} suffix=" Works" />
                </p>
                <p className="text-[11px] text-brand-muted mt-1">Surfacing high-percentile state/category review signals</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-surface border border-brand-border text-brand-goldLight">
                <Layers className="w-5 h-5" />
              </div>
            </motion.div>
          </FadeIn>
        </div>

        {/* Interactive Charts Section with Animated Viewport Entrance */}
        <div className="space-y-4">
          <FadeIn direction="up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-gold" />
                Empirical Pattern Distributions
              </h2>
              <span className="text-xs text-brand-muted font-mono">
                Interactive Visualizations
              </span>
            </div>
          </FadeIn>

          <DashboardCharts metrics={metrics} />
        </div>

        {/* Explanation of What the Numbers Represent */}
        <FadeIn direction="up">
          <div className="rounded-2xl bg-brand-card p-6 sm:p-8 border border-brand-border space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border">
              <Info className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-text">
                Analytical Primer: What These Numbers Represent
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-muted leading-relaxed">
              <div className="space-y-2 p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <h4 className="font-semibold text-sm text-brand-text flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-gold" />
                  1. Sanction Delay Metric
                </h4>
                <p>
                  Sanction delay measures the elapsed calendar days between the date a Member of Parliament
                  formally recommends a scheme and the date the competent administrative authority grants
                  sanction. Across the complete universe of 39,000 works, the average sanction delay is 127.27 days.
                  For the 3,487 review candidates, the average delay is 375.14 days (with a maximum observed delay of 793 days).
                  Delays exceeding 365 days often indicate administrative friction, land clearance bottlenecks, or revised estimate requirements.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <h4 className="font-semibold text-sm text-brand-text flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-gold" />
                  2. Peer Group Percentiles
                </h4>
                <p>
                  Comparing a rural irrigation canal directly with an urban smart classroom creates false anomalies.
                  NIRIKSHAN AI normalizes delays within cohort groups: comparing projects against peers in the
                  same work category and administrative jurisdiction. A 97th percentile score means only 3%
                  of comparable works took longer to sanction.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <h4 className="font-semibold text-sm text-brand-text flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-gold" />
                  3. Unsupervised Outlier Logic
                </h4>
                <p>
                  Because public finance lacks labeled training data of wrongdoing, NIRIKSHAN AI deploys
                  Isolation Forest with a configured 5% contamination rate—an unsupervised tree ensemble that isolates data points based on feature
                  path lengths. Outliers require fewer splits to partition, signaling rare structural behavior.
                  Scores are structural outlier metrics, not probabilities of fraud.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-warning/10 border border-brand-warning/30 text-xs text-brand-text flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
              <p>
                <strong className="text-brand-warning font-semibold">Responsible Governance Protocol:</strong>{" "}
                Statistical anomalies are decision-support indicators meant to guide internal audits and physical inspections.
                They must never be used to allege impropriety without independent investigative substantiation.
                Sanctioned amounts represent authorized public funding allocations, not actual expenditure or fund utilisation.
              </p>
            </div>
          </div>
        </FadeIn>

      </div>
    </ProtectedRoute>
  );
}
