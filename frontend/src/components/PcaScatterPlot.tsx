"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PCA_SAMPLED_POINTS, PCA_VARIANCE_EXPLAINED } from "@/lib/pca-sample";
import { Sparkles, Info } from "lucide-react";

interface TooltipPayloadItem {
  payload?: {
    x: number;
    y: number;
    isOutlier: boolean;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

export default function PcaScatterPlot() {
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;
      return (
        <div className="rounded-lg bg-brand-surface p-3 border border-brand-border shadow-xl text-xs space-y-1">
          <p className="font-semibold text-brand-text flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                data.isOutlier ? "bg-brand-critical" : "bg-brand-success"
              }`}
            />
            {data.isOutlier ? "Outlier Candidate" : "Normal Project"}
          </p>
          <p className="font-mono text-brand-muted text-[11px]">
            PC1: <span className="text-brand-text">{data.x}</span> | PC2:{" "}
            <span className="text-brand-text">{data.y}</span>
          </p>
          <p className="text-[10px] text-brand-muted">
            {data.isOutlier
              ? "Flagged at periphery of feature space"
              : "Clustered with mainstream MPLADS works"}
          </p>
        </div>
      );
    }
    return null;
  };

  const outliersCount = PCA_SAMPLED_POINTS.filter((p) => p.isOutlier).length;
  const inliersCount = PCA_SAMPLED_POINTS.length - outliersCount;

  return (
    <div className="p-6 rounded-2xl bg-brand-card border border-brand-border shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-2">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            2D PCA Feature Space & Outlier Projection
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Principal Component 1 vs Principal Component 2 (Variance Explained:{" "}
            <strong className="text-brand-gold font-mono">
              {((PCA_VARIANCE_EXPLAINED[0] + PCA_VARIANCE_EXPLAINED[1]) * 100).toFixed(1)}%
            </strong>
            )
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-borderLight border border-brand-muted/40" />
            <span className="text-brand-muted">Normal ({inliersCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-critical" />
            <span className="text-brand-critical font-medium">Outlier ({outliersCount})</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262C26" />
            <XAxis
              type="number"
              dataKey="x"
              name="PC1"
              stroke="#92968E"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#262C26" }}
              label={{
                value: `PC1 (Explained Var: ${(PCA_VARIANCE_EXPLAINED[0] * 100).toFixed(1)}%)`,
                position: "insideBottom",
                offset: -10,
                fill: "#92968E",
                fontSize: 10,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="PC2"
              stroke="#92968E"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#262C26" }}
              label={{
                value: `PC2 (Explained Var: ${(PCA_VARIANCE_EXPLAINED[1] * 100).toFixed(1)}%)`,
                angle: -90,
                position: "insideLeft",
                offset: 15,
                fill: "#92968E",
                fontSize: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Works" data={PCA_SAMPLED_POINTS}>
              {PCA_SAMPLED_POINTS.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOutlier ? "#E45D52" : "#384438"}
                  opacity={entry.isOutlier ? 0.95 : 0.65}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-brand-border/60 flex items-start gap-2 text-xs text-brand-muted">
        <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-brand-text">Projection Interpretation:</strong> Normal works coalesce tightly
          near the central origin. Anomalous works flagged by the Isolation Forest are systematically scattered
          into outer peripheral orbits along principal variance axes.
        </p>
      </div>
    </div>
  );
}

