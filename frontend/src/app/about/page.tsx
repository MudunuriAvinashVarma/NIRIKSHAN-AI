"use client";

import Link from "next/link";
import {
  Database,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Scale,
  ArrowRight,
} from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="border-b border-brand-border pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>PROJECT MISSION & GOVERNANCE PROVENANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
            About NIRIKSHAN AI
          </h1>
          <p className="text-base text-brand-muted leading-relaxed">
            Intelligence Behind Every Public Fund — empowering researchers, auditors, and civil society
            with transparent, explainable pattern analytics across Indian parliamentary local development works.
          </p>
        </div>
      </FadeIn>

      {/* Purpose and Objectives */}
      <FadeIn direction="up" delay={0.1}>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-gold" />
            Purpose & Strategic Objectives
          </h2>
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/30 text-sm text-brand-muted leading-relaxed space-y-4 transition-colors"
          >
            <p>
              Under the Members of Parliament Local Area Development Scheme (MPLADS), each Member of Parliament (MP)
              recommends local community developmental works worth up to ₹5 Crore annually. Across 543 Lok Sabha
              and 245 Rajya Sabha constituencies, tens of thousands of works are proposed every fiscal year.
            </p>
            <p>
              Reviewing every sanction file manually is impossible with existing auditor bandwidth. <strong className="text-brand-text">NIRIKSHAN AI</strong> was
              created to serve as an intelligent, automated prioritization system. It surfaces projects exhibiting unusual
              delay profiles, abnormal funding ratios, or irregular execution statuses so oversight resources can be
              channeled where scrutiny is most warranted.
            </p>
          </motion.div>
        </section>
      </FadeIn>

      {/* Official Data Sources */}
      <FadeIn direction="up" delay={0.15}>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-gold" />
            Official Data Provenance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow space-y-3 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-brand-gold">PRIMARY REPOSITORY</span>
                <ExternalLink className="w-4 h-4 text-brand-muted" />
              </div>
              <h3 className="text-base font-bold text-brand-text">Open Government Data (OGD) Platform</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Official dataset published on <code className="text-brand-text">data.gov.in</code> containing sanctioned works
                under MPLADS, including recommendation dates, administrative sanction dates, costs, and current status.
              </p>
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-brand-gold hover:underline pt-1"
              >
                Visit data.gov.in →
              </a>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:shadow-goldGlow space-y-3 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-brand-goldLight">NODAL MINISTRY</span>
                <ExternalLink className="w-4 h-4 text-brand-muted" />
              </div>
              <h3 className="text-base font-bold text-brand-text">Ministry of Statistics and Programme Implementation</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                The nodal agency (MoSPI) administering MPLADS policy, fund releases, district nodal authority circulars,
                and online work monitoring guidelines.
              </p>
              <a
                href="https://mplads.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-brand-gold hover:underline pt-1"
              >
                Visit mplads.gov.in →
              </a>
            </motion.div>
          </div>
        </section>
      </FadeIn>

      {/* Technical Architecture */}
      <FadeIn direction="up" delay={0.2}>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <FileCode className="w-5 h-5 text-brand-gold" />
            Technology Stack
          </h2>
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-4 text-xs text-brand-muted">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <span className="text-[11px] font-mono text-brand-gold block">FRONTEND</span>
                <strong className="text-sm text-brand-text">Next.js 14 & TS</strong>
              </div>
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <span className="text-[11px] font-mono text-brand-gold block">STYLING</span>
                <strong className="text-sm text-brand-text">Tailwind CSS</strong>
              </div>
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <span className="text-[11px] font-mono text-brand-gold block">CHARTS</span>
                <strong className="text-sm text-brand-text">Recharts Analytics</strong>
              </div>
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/30 transition-colors">
                <span className="text-[11px] font-mono text-brand-gold block">BACKEND API</span>
                <strong className="text-sm text-brand-text">FastAPI Python ML</strong>
              </div>
            </div>
            <p className="leading-relaxed pt-2">
              The frontend communicates with a Python FastAPI server running the scikit-learn Isolation Forest
              and cohort-delay calculation pipeline. A verified data snapshot is bundled directly to guarantee zero-downtime
              deployments across production platforms like Vercel.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* Responsible AI Disclaimer */}
      <FadeIn direction="up" delay={0.25}>
        <section className="space-y-4">
          <div className="p-6 rounded-2xl bg-brand-warning/10 border border-brand-warning/30 space-y-3 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-brand-warning uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Mandatory Responsible AI Disclosure
            </h3>
            <p className="text-brand-text/90">
              NIRIKSHAN AI is a scientific decision-support system. It computes mathematical deviations from median
              cohort behavior. Under no circumstances should an anomaly score or review signal be construed as proof,
              accusation, or prima facie evidence of corruption, fraud, or administrative delinquency.
            </p>
            <p className="text-brand-muted">
              All interpretations must be corroborated through official administrative records, site inspections,
              and auditor verifications conducted in compliance with established statutory procedures.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* CTAs */}
      <div className="pt-6 border-t border-brand-border flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-semibold text-xs transition-colors shadow-sm hover:shadow-goldGlow"
          >
            <span>Launch National Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <Link
          href="/anomalies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-gold hover:underline"
        >
          <span>Examine Flagged Works →</span>
        </Link>
      </div>

    </div>
  );
}
