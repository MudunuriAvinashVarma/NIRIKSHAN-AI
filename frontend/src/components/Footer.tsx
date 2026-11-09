import Link from "next/link";
import { ShieldAlert, ExternalLink, Database, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface/80 text-brand-muted text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-brand-text tracking-wider">NIRIKSHAN</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30">
                AI
              </span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed max-w-md">
              A high-precision public finance intelligence platform engineered to analyze MPLADS
              (Members of Parliament Local Area Development Scheme) fund sanctions and surface statistical outliers
              through unsupervised machine learning and cohort-aware peer benchmarking.
            </p>
            <div className="p-3 rounded-lg bg-brand-card/80 border border-brand-border text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
              <p className="text-[11px] leading-tight text-brand-muted">
                <span className="font-semibold text-brand-text">Statistical Notice:</span> Flagged works represent
                mathematical outliers based on sanction delays, amounts, and execution patterns. Flags are analytical
                review signals, not evidence of wrongdoing or irregularities.
              </p>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-brand-gold transition-colors">
                  National Dashboard
                </Link>
              </li>
              <li>
                <Link href="/anomalies" className="hover:text-brand-gold transition-colors">
                  Anomaly Intelligence Explorer
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-brand-gold transition-colors">
                  ML Methodology & Peer Grouping
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-gold transition-colors">
                  About & Data Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Data Sources */}
          <div>
            <h4 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">Official Data Sources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand-gold transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Open Government Data (OGD)</span>
                  <ExternalLink className="w-3 h-3 text-brand-muted" />
                </a>
              </li>
              <li>
                <a
                  href="https://mplads.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand-gold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Ministry of Statistics (MoSPI)</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-brand-muted/80">
                  <Cpu className="w-3.5 h-3.5 text-brand-gold/70" />
                  <span>Isolation Forest + Cohort Benchmarking</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© {new Date().getFullYear()} NIRIKSHAN AI. Intelligence Behind Every Public Fund.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1">
              Engineered with precision for Public Accountability
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
