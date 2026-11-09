"use client";

import Link from "next/link";
import {
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import PcaScatterPlot from "@/components/PcaScatterPlot";
import FadeIn from "@/components/animations/FadeIn";
import { motion } from "framer-motion";

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="border-b border-brand-border pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-brand-gold" />
            <span>MATHEMATICAL & ALGORITHMIC SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
            Machine Learning Methodology & Transparency
          </h1>
          <p className="text-base text-brand-muted leading-relaxed max-w-3xl">
            NIRIKSHAN AI employs unsupervised anomaly detection and cohort-aware peer benchmarking
            specifically designed for public finance oversight where ground-truth corruption labels do not exist.
          </p>
        </div>
      </FadeIn>

      {/* 1. Problem Framing */}
      <FadeIn direction="up" delay={0.1}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-gold">
              01
            </span>
            <h2 className="text-xl font-bold text-brand-text">Problem Framing: Why Unsupervised Learning?</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border text-sm text-brand-muted leading-relaxed space-y-3 hover:border-brand-gold/30 transition-colors">
            <p>
              In government fund allocation datasets like MPLADS, there are virtually no verified historic labels
              of impropriety or wrongdoing. Supervised learning models (e.g. classification networks or logistic regressions)
              cannot be trained without introducing severe confirmation bias or hallucinating guilt.
            </p>
            <p>
              Instead, NIRIKSHAN AI treats the challenge purely as <strong className="text-brand-text">multidimensional statistical outlier detection</strong>.
              A flag indicates that a given project takes significantly longer, costs significantly more, or exhibits
              divergent approval dynamics compared to thousands of similar peer works.
            </p>
            <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-goldLight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Guiding Axiom: An anomaly is a mathematical outlier statement, never an accusation of wrongdoing.</span>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 2. Isolation Forest Algorithm */}
      <FadeIn direction="up" delay={0.15}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-gold">
              02
            </span>
            <h2 className="text-xl font-bold text-brand-text">Global Isolation Forest (iForest)</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border text-sm text-brand-muted leading-relaxed space-y-4 hover:border-brand-gold/30 transition-colors">
            <p>
              The Isolation Forest algorithm is an ensemble of randomized decision trees. Rather than profiling
              normal instances (which is vulnerable to high dimensionality), it exploits two quantitative properties of anomalies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <h4 className="font-semibold text-brand-text mb-1">Few in Number</h4>
                <p>Anomalies represent a tiny fraction (typically 1% to 5%) of the total universe of works.</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <h4 className="font-semibold text-brand-text mb-1">Attribute Separation</h4>
                <p>Outlier records have attribute values noticeably distant from the cluster mode.</p>
              </div>
            </div>
            <p>
              In an Isolation Tree, unusual observations require far fewer random splits to isolate into leaf nodes.
              The shorter the average path length across all isolation trees, the higher the anomaly score (calibrated
              between 0.0 and 1.0).
            </p>
          </div>
        </section>
      </FadeIn>

      {/* 3. Cohort-Aware Peer Grouping */}
      <FadeIn direction="up" delay={0.2}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-gold">
              03
            </span>
            <h2 className="text-xl font-bold text-brand-text">Cohort-Aware Peer Benchmarking</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border text-sm text-brand-muted leading-relaxed space-y-4 hover:border-brand-gold/30 transition-colors">
            <p>
              A common failure of naive machine learning in public governance is ignoring regional context and project complexity.
              For instance, constructing a flood-resilient bridge in mountainous terrain naturally takes more calendar days
              than installing solar street lights.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <span className="font-mono text-brand-gold text-[11px] uppercase">State-Year Cohort</span>
                <h4 className="font-semibold text-brand-text mt-1 mb-1">State Administration Baseline</h4>
                <p>
                  Evaluates delay against works approved within the same state and recommended in the same financial year,
                  accounting for state-level bureaucratic procedures and monsoon cycles.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <span className="font-mono text-brand-goldLight text-[11px] uppercase">Category-Year Cohort</span>
                <h4 className="font-semibold text-brand-text mt-1 mb-1">Sectoral Work Type Baseline</h4>
                <p>
                  Evaluates delay against works in the exact same infrastructure category (e.g. Roads, Animal Shelters,
                  Classrooms) across comparable peers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 4. PCA Supporting Analysis & Live Scatter Plot */}
      <FadeIn direction="up" delay={0.25}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-gold">
              04
            </span>
            <h2 className="text-xl font-bold text-brand-text">Principal Component Analysis (PCA)</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border text-sm text-brand-muted leading-relaxed space-y-4 hover:border-brand-gold/30 transition-colors">
            <p>
              Principal Component Analysis (PCA) is applied to standardized feature matrices to project multidimensional
              financial and duration metrics into 2-D orthogonal coordinates. This captures over{" "}
              <strong className="text-brand-gold font-mono">69.3%</strong> of total dataset variance across the first two components.
            </p>

            {/* Interactive Scatter Plot */}
            <PcaScatterPlot />
          </div>
        </section>
      </FadeIn>

      {/* 5. Natural Language Explanation Generation */}
      <FadeIn direction="up" delay={0.3}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-gold">
              05
            </span>
            <h2 className="text-xl font-bold text-brand-text">Explainable AI (XAI) Signal Generation</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border text-sm text-brand-muted leading-relaxed space-y-3 hover:border-brand-gold/30 transition-colors">
            <p>
              Opaque &quot;black box&quot; scores are useless to public oversight committees. For every candidate surfaced,
              NIRIKSHAN AI computes its relative percentile rank within its state and sectoral cohort, generating
              transparent human-readable explanations such as:
            </p>
            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border font-mono text-xs text-brand-goldLight">
              &quot;The sanction delay of 457 days has a within-group percentile rank of 97.51% among 14,136 eligible works in the same work category and recommendation year.&quot;
            </div>
            <p className="text-xs">
              This immediately tells an investigator whether a flag is driven by sanction latency, abnormal allocation sizing,
              or multivariate feature combination.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* 6. Model Limitations & Responsible Interpretation */}
      <FadeIn direction="up" delay={0.35}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-mono font-bold text-sm text-brand-warning">
              06
            </span>
            <h2 className="text-xl font-bold text-brand-text">Model Limitations & Responsible Interpretation</h2>
          </div>
          <div className="p-6 rounded-2xl bg-brand-warning/10 border border-brand-warning/30 text-xs text-brand-text leading-relaxed space-y-3">
            <div className="flex items-center gap-2 text-brand-warning font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Essential Analytical Boundaries for Auditors & Oversight Bodies</span>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-brand-muted">
              <li>
                <strong className="text-brand-text">No Fraud Assertion:</strong> Mathematical outlier status does NOT equate
                to corruption, misappropriation, or illegality. Legitimate reasons for high delay include litigation,
                forest clearances, contractor re-tendering, or natural disasters.
              </li>
              <li>
                <strong className="text-brand-text">Reporting Lag Sensitivity:</strong> Delays are calculated based on dates
                entered into the central MoSPI portal. If a district authority entered historical sanctions retroactively,
                the delay may reflect data-entry batching rather than real-world project stall.
              </li>
              <li>
                <strong className="text-brand-text">Decision-Support Only:</strong> NIRIKSHAN AI is designed strictly to prioritize
                dockets for human review, conserving limited auditor bandwidth.
              </li>
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* Navigation action */}
      <div className="pt-6 border-t border-brand-border flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-gold hover:underline"
        >
          ← Return to National Dashboard
        </Link>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/anomalies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-semibold text-xs transition-colors shadow-sm hover:shadow-goldGlow"
          >
            <span>Examine Flagged Works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
