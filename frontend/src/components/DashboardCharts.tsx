"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { DashboardMetrics } from "@/types";
import { Layers, Clock, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardChartsProps {
  metrics: DashboardMetrics;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const COLORS = ["#C99A55", "#E2B873", "#65B88A", "#E9A23B", "#E45D52", "#92968E"];

export default function DashboardCharts({ metrics }: DashboardChartsProps) {
  // Custom dark tooltip with smooth fade
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const firstItem = payload[0];
      return (
        <div className="rounded-lg bg-brand-surface/95 backdrop-blur-md p-3 border border-brand-border shadow-xl text-xs space-y-1 transition-all duration-200">
          <p className="font-semibold text-brand-text">{label || firstItem?.name}</p>
          <p className="font-mono text-brand-gold font-medium">
            {firstItem.name ? `${firstItem.name}: ` : "Count: "}
            {typeof firstItem.value === "number"
              ? firstItem.value.toLocaleString("en-IN")
              : firstItem.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const topStates = metrics.stateBreakdown.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Sanction Delay Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="rounded-2xl bg-brand-card p-6 border border-brand-border hover:border-brand-gold/30 shadow-card flex flex-col transition-colors duration-300"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
          <div>
            <h3 className="text-base font-semibold text-brand-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-warning" />
              Sanction Delay Distribution
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Time elapsed between MP recommendation and administrative sanction (Review records)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-surface text-brand-gold border border-brand-border">
            Review Avg: {metrics.reviewRecordsAvgDelayDays || 375.14}d
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.delayDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262C26" vertical={false} />
              <XAxis
                dataKey="range"
                stroke="#92968E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <YAxis
                stroke="#92968E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#C99A55"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1300}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto pt-3 border-t border-brand-border/60 text-[11px] text-brand-muted flex items-center justify-between">
          <span>Review Cohort Threshold: &gt; 365 Days</span>
          <span className="text-brand-warning font-mono">
            Max observed: {metrics.reviewRecordsMaxDelayDays || metrics.maxSanctionDelayDays} Days
          </span>
        </div>
      </motion.div>

      {/* Chart 2: State Distribution of Review Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="rounded-2xl bg-brand-card p-6 border border-brand-border hover:border-brand-gold/30 shadow-card flex flex-col transition-colors duration-300"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
          <div>
            <h3 className="text-base font-semibold text-brand-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-gold" />
              State Distribution of Review Candidates
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Review-record counts across top reporting states (from 3,487 review dataset)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-surface text-brand-goldLight border border-brand-border">
            {metrics.statesCount} States / UTs
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topStates}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262C26" horizontal={false} />
              <XAxis
                type="number"
                stroke="#92968E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <YAxis
                type="category"
                dataKey="state"
                stroke="#F5F3ED"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#E2B873"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                animationDuration={1300}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto pt-3 border-t border-brand-border/60 text-[11px] text-brand-muted flex items-center justify-between">
          <span>Review-record counts across jurisdictions</span>
          <span className="text-brand-gold font-mono">
            Top: UP ({metrics.stateBreakdown[0]?.count}), TN ({metrics.stateBreakdown[1]?.count}), Kerala ({metrics.stateBreakdown[2]?.count})
          </span>
        </div>
      </motion.div>

      {/* Chart 3: Work Execution Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="rounded-2xl bg-brand-card p-6 border border-brand-border hover:border-brand-gold/30 shadow-card flex flex-col transition-colors duration-300"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
          <div>
            <h3 className="text-base font-semibold text-brand-text flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-success" />
              Work Execution Status Distribution
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Status composition across 3,487 review candidate works
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-surface text-brand-muted border border-brand-border">
            Total: 3,487
          </span>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.statusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {metrics.statusBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-brand-border text-xs">
          {metrics.statusBreakdown.map((s, idx) => (
            <div key={s.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-brand-muted truncate" title={s.name}>{s.name}</span>
              <span className="font-mono text-brand-text ml-auto font-medium">
                {s.percentage}% <span className="text-[10px] text-brand-muted font-normal">({s.count.toLocaleString("en-IN")})</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chart 4: Isolation Forest Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="rounded-2xl bg-brand-card p-6 border border-brand-border hover:border-brand-gold/30 shadow-card flex flex-col transition-colors duration-300"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
          <div>
            <h3 className="text-base font-semibold text-brand-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-gold" />
              Isolation Forest Score Distribution
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Outlier score density across 3,487 review candidate works
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
            Configured Model Contamination: 5%
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C99A55" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#C99A55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262C26" vertical={false} />
              <XAxis
                dataKey="range"
                stroke="#92968E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <YAxis
                stroke="#92968E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#262C26" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#C99A55"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreColor)"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto pt-3 border-t border-brand-border/60 text-[11px] text-brand-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Unsupervised Isolation Forest algorithm output scores (decision boundary).</span>
          <span className="text-brand-goldLight font-mono">Scores are structural outlier metrics, not probabilities of fraud.</span>
        </div>
      </motion.div>

    </div>
  );
}
