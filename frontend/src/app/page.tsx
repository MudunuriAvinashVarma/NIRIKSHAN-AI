"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  ShieldAlert,
  Search,
} from "lucide-react";
import { getNationalMetrics } from "@/lib/api";
import { motion } from "framer-motion";
import CountUp from "@/components/animations/CountUp";
import FadeIn from "@/components/animations/FadeIn";

export default function LandingPage() {
  const metrics = getNationalMetrics();

  const titleWordsLine1 = ["Intelligence", "Behind"];
  const titleWordsLine2 = ["Every", "Public", "Fund."];

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Animated Ambient Glow with Subtle Drift */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[25%] w-[500px] h-[500px] bg-brand-gold/15 rounded-full blur-[140px] animate-ambient-drift" />
        <div className="absolute top-[20%] right-[20%] w-[420px] h-[420px] bg-brand-surface rounded-full blur-[120px]" />
      </div>

      {/* Subtle Floating Decorative Geometric Elements */}
      <div className="absolute top-36 left-12 w-6 h-6 border border-brand-gold/20 rounded-lg rotate-12 pointer-events-none animate-float-slow hidden lg:block" />
      <div className="absolute top-72 right-16 w-8 h-8 border border-brand-gold/15 rounded-full pointer-events-none animate-float-slow hidden lg:block" style={{ animationDelay: "2s" }} />
      <div className="absolute top-96 left-1/4 w-3 h-3 bg-brand-gold/20 rounded-sm rotate-45 pointer-events-none animate-float-slow hidden md:block" style={{ animationDelay: "4s" }} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Intelligence Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-gold/30 text-xs font-mono text-brand-goldLight shadow-goldGlow"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span>Public Finance Intelligence Platform</span>
            <span className="w-1 h-1 rounded-full bg-brand-gold" />
            <span className="text-brand-muted">MPLADS Analytical Engine</span>
          </motion.div>

          {/* Staggered Hero Heading Entrance */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-brand-text leading-[1.1] select-none">
            {/* Line 1 */}
            <span className="inline-block overflow-hidden mr-2">
              {titleWordsLine1.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.1 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <br className="hidden sm:inline" />

            {/* Line 2 with Gold Gradient */}
            <span className="gold-gradient-text inline-block overflow-hidden">
              {titleWordsLine2.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.3 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subtitle Fades in Slightly After Heading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed"
          >
            NIRIKSHAN AI analyzes parliamentary sanctioned works to identify unusual financial
            and execution patterns—surfacing actionable review signals with mathematical transparency.
          </motion.p>

          {/* Call to Actions with Smooth Hover and Press Micro-interactions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.025, boxShadow: "0 0 25px rgba(201, 154, 85, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto rounded-xl"
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-bold text-sm transition-all shadow-lg"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Launch National Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto rounded-xl"
            >
              <Link
                href="/anomalies"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-card hover:bg-brand-cardHover border border-brand-border text-brand-text font-semibold text-sm transition-all hover:border-brand-gold/40"
              >
                <Search className="w-4 h-4 text-brand-gold" />
                <span>Explore Anomaly Signals</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Statutory Disclaimer Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="pt-2"
          >
            <p className="text-[11px] text-brand-muted/80 max-w-xl mx-auto font-mono">
              * Non-accusatory analytical signals based on unsupervised outlier detection. Never indicates corruption or culpability.
            </p>
          </motion.div>
        </div>

        {/* Viewport Animated Platform Statistics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          
          <FadeIn delay={0.1} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow transition-all duration-300 h-full"
            >
              <p className="text-xs font-mono text-brand-muted uppercase">Sanctioned Works</p>
              <p className="text-3xl font-bold font-mono text-brand-text mt-1">
                <CountUp value={metrics.totalWorksAnalyzed} suffix="+" />
              </p>
              <p className="text-[11px] text-brand-muted mt-1">From official MoSPI records</p>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow transition-all duration-300 h-full"
            >
              <p className="text-xs font-mono text-brand-muted uppercase">Sanctioned Capital</p>
              <p className="text-3xl font-bold font-mono text-brand-gold mt-1">
                ₹<CountUp value={Math.round(metrics.allWorksSanctionedAmountCr || 2031)} suffix=" Cr" />
              </p>
              <p className="text-[11px] text-brand-muted mt-1">Total sanctions under analysis</p>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.3} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-warning/40 transition-all duration-300 h-full"
            >
              <p className="text-xs font-mono text-brand-muted uppercase">Max Delay Detected</p>
              <p className="text-3xl font-bold font-mono text-brand-warning mt-1">
                <CountUp value={metrics.maxSanctionDelayDays} suffix=" Days" />
              </p>
              <p className="text-[11px] text-brand-muted mt-1">Recommendation to sanction lag</p>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow transition-all duration-300 h-full"
            >
              <p className="text-xs font-mono text-brand-muted uppercase">Benchmarked States</p>
              <p className="text-3xl font-bold font-mono text-brand-goldLight mt-1">
                <CountUp value={metrics.statesCount} suffix=" States" />
              </p>
              <p className="text-[11px] text-brand-muted mt-1">State & Category peer cohorts</p>
            </motion.div>
          </FadeIn>

        </div>

        {/* Interactive Feature Spotlight Card */}
        <FadeIn delay={0.3} direction="up" className="mt-16 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="rounded-2xl bg-brand-card/90 border border-brand-gold/30 hover:border-brand-gold/50 p-6 sm:p-8 shadow-card relative overflow-hidden transition-colors"
          >
            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-brand-gold/15 border-b border-l border-brand-gold/30 text-[11px] font-mono text-brand-goldLight">
              Sample Live Intelligence Card
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-surface text-brand-gold border border-brand-border">
                  DAHOD(ST), Gujarat
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30">
                  Category-Year Delay Comparison
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-warning/15 text-brand-warning border border-brand-warning/30">
                  Delay: 447 Days
                </span>
              </div>

              <h3 className="text-lg font-bold text-brand-text">
                Construction of roads, link roads, pathways or any other road with or without drainage system
              </h3>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted leading-relaxed">
                <strong className="text-brand-text">Statistical Explanation:</strong> The sanction delay of 447 days has a
                within-group percentile rank of <span className="text-brand-gold font-mono font-semibold">97.32%</span> among
                14,136 eligible works in the identical work category and recommendation year.
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-brand-muted pt-2 border-t border-brand-border">
                <span>Sanction Amount: <strong className="text-brand-text font-mono">₹2.45 Lakh</strong></span>
                <span className="text-brand-warning font-mono">Interpretation Notice Verified</span>
                <Link href="/anomalies" className="text-brand-gold hover:underline font-medium">
                  View all 3,487 candidates →
                </Link>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </section>

      {/* How It Works Section with Staggered Steps */}
      <section className="py-20 bg-brand-surface border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-mono text-brand-gold uppercase tracking-wider">Analytical Pipeline</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">How NIRIKSHAN AI Works</h2>
            <p className="text-sm text-brand-muted">
              Unsupervised machine learning designed specifically for public fund oversight where ground-truth labels do not exist.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Ingestion & Audit", desc: "Raw official records from MoSPI and OGD are validated, date-parsed, and audited for reporting fidelity." },
              { num: "02", title: "Feature Modeling", desc: "Transforms timelines into standardized features: delay durations, sanction amounts, and project completion milestones." },
              { num: "03", title: "Cohort & IF Scoring", desc: "Isolation Forest tree-partitioning combined with State-Year and Category-Year peer group percentile rankings." },
              { num: "04", title: "Explainable Signals", desc: "Flags are decoded into plain-language statistical reasons comparing the outlier against its cohort median." },
            ].map((step, idx) => (
              <FadeIn key={step.num} delay={idx * 0.1} direction="up">
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-all space-y-4 h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-gold font-mono font-bold">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-brand-text">{step.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{step.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features with Hover Elevation */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono text-brand-gold uppercase tracking-wider">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">Built for Oversight & Research</h2>
          <p className="text-sm text-brand-muted">
            Engineered to empower auditors, researchers, and public policy analysts.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={0.1} direction="up">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-all space-y-4 h-full"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-surface border border-brand-border text-brand-gold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-text">Cohort-Aware Peer Benchmarking</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Prevents unfair bias by ensuring road projects are evaluated against road projects, and Gujarat works against Gujarat timelines.
              </p>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-all space-y-4 h-full"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-surface border border-brand-border text-brand-gold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-text">Multi-Signal Review Logic</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Combines Global Isolation Forest scores with localized delay percentiles so high-confidence review candidates stand out.
              </p>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.3} direction="up">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-all space-y-4 h-full"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-surface border border-brand-border text-brand-gold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-text">Ethical Non-Accusatory AI</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Every flag is clearly labeled as an analytical review candidate—protecting public integrity and avoiding reckless claims.
              </p>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Banner with Subtle Glow */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="rounded-3xl bg-gradient-to-r from-brand-card via-brand-surface to-brand-card border border-brand-gold/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-text">
                Ready to explore public fund patterns?
              </h2>
              <p className="text-sm text-brand-muted">
                Access the live intelligence dashboard or inspect granular candidate dossiers.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-bold text-sm transition-all shadow-md hover:shadow-goldGlow"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Open National Dashboard</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text font-medium text-sm transition-all"
                >
                  <span>Read Full ML Methodology</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
