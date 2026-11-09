"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { AnomalyRecord } from "@/types";
import { getAnomalies } from "@/lib/api";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Download,
  Clock,
  Layers,
  Eye,
} from "lucide-react";
import SignalBadge from "@/components/SignalBadge";
import WorkDetailModal from "@/components/WorkDetailModal";
import FadeIn from "@/components/animations/FadeIn";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";

export default function AnomaliesPage() {
  const [records, setRecords] = useState<AnomalyRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AnomalyRecord | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [signalFilter, setSignalFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"delay" | "amount" | "score" | "percentile">("delay");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const res = await getAnomalies({
        state: stateFilter,
        work_status: statusFilter,
        limit: pageSize,
        offset,
        search: searchQuery,
        signal: signalFilter,
      });

      setRecords(res.data);
      setTotalCount(res.total);
      setIsLiveApi(res.isLive);
    } catch {
      // handled inside API
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, stateFilter, statusFilter, signalFilter, searchQuery]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Client side quick search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecords();
  };

  // Sorted records
  const sortedRecords = useMemo(() => {
    const list = [...records];
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === "delay") {
        valA = a.sanctionDelayDays;
        valB = b.sanctionDelayDays;
      } else if (sortBy === "amount") {
        valA = a.sanctionAmount;
        valB = b.sanctionAmount;
      } else if (sortBy === "score") {
        valA = a.isolationScore ?? 0;
        valB = b.isolationScore ?? 0;
      } else if (sortBy === "percentile") {
        valA = a.anomalyPercentile ?? 0;
        valB = b.anomalyPercentile ?? 0;
      }
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
    return list;
  }, [records, sortBy, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} Lakh`;
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Work",
      "State",
      "Constituency",
      "Category",
      "Sanction Amount (INR)",
      "Delay (Days)",
      "Status",
      "Isolation Score",
      "Percentile",
      "Review Signals",
    ];
    const rows = sortedRecords.map((r) => [
      r.id,
      `"${r.workName.replace(/"/g, '""')}"`,
      `"${r.state}"`,
      `"${r.constituency}"`,
      `"${r.category}"`,
      r.sanctionAmount,
      r.sanctionDelayDays,
      `"${r.workStatus}"`,
      r.isolationScore ?? "",
      r.anomalyPercentile ?? "",
      `"${r.reviewSignals.join("; ")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nirikshan_anomalies_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner with FadeIn */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30">
                ANOMALY INVESTIGATION MATRIX
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                  isLiveApi
                    ? "bg-brand-success/10 text-brand-success border-brand-success/30"
                    : "bg-brand-warning/10 text-brand-warning border-brand-warning/30"
                }`}
              >
                {isLiveApi ? "Connected to FastAPI Live" : "Verified Snapshot Mode"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Anomaly Intelligence & Candidate Review
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Searchable repository of 3,487 MPLADS sanctioned works flagged by statistical algorithms for audit review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-card hover:bg-brand-cardHover border border-brand-border text-xs font-medium text-brand-text transition-colors shadow-sm"
              title="Download visible candidates as CSV"
            >
              <Download className="w-3.5 h-3.5 text-brand-gold" />
              <span>Export CSV</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchRecords}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-card hover:bg-brand-cardHover border border-brand-border text-xs font-medium text-brand-text transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>
      </FadeIn>

      {/* Filter and Search Control Bar with Smooth Elevation */}
      <FadeIn direction="up" delay={0.1}>
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-card space-y-4 hover:border-brand-gold/30 transition-all duration-300">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project name, constituency, work description, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder-brand-muted/70 text-xs focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-semibold text-xs transition-colors shrink-0 shadow-sm hover:shadow-goldGlow"
            >
              Search Candidates
            </motion.button>
          </form>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
            {/* State Filter */}
            <div>
              <label className="block text-[11px] font-mono text-brand-muted mb-1 uppercase">State Cohort</label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="ALL">All States (National)</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Punjab">Punjab</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            {/* Work Status Filter */}
            <div>
              <label className="block text-[11px] font-mono text-brand-muted mb-1 uppercase">Recorded Work Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="ALL">All Statuses</option>
                <option value="Sanction">Sanction</option>
                <option value="Physical Inspection">Physical Inspection</option>
                <option value="Completed">Completed</option>
                <option value="Work in Progress">Work in Progress</option>
              </select>
            </div>

            {/* Review Signal Filter */}
            <div>
              <label className="block text-[11px] font-mono text-brand-muted mb-1 uppercase">Review Signal Type</label>
              <select
                value={signalFilter}
                onChange={(e) => {
                  setSignalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="ALL">All Trigger Signals</option>
                <option value="Isolation Forest">Global Isolation Forest</option>
                <option value="State-Year Delay">State-Year Delay Outlier</option>
                <option value="Category-Year Delay">Category-Year Delay Outlier</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-mono text-brand-muted mb-1 uppercase">Sort Priority</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "delay" | "amount" | "score" | "percentile")}
                  className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-gold transition-colors"
                >
                  <option value="delay">Sanction Delay</option>
                  <option value="amount">Sanction Amount</option>
                  <option value="score">Isolation Score</option>
                  <option value="percentile">Percentile Rank</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-gold text-xs font-mono hover:border-brand-gold/40 transition-colors"
                  title={`Order: ${sortOrder.toUpperCase()}`}
                >
                  {sortOrder === "desc" ? "DESC" : "ASC"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Filter tags & Reset */}
          {(stateFilter !== "ALL" || statusFilter !== "ALL" || signalFilter !== "ALL" || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60 text-xs">
              <span className="text-brand-muted text-[11px]">Active Filters:</span>
              {stateFilter !== "ALL" && (
                <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-gold">
                  State: {stateFilter}
                </span>
              )}
              {statusFilter !== "ALL" && (
                <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-gold">
                  Status: {statusFilter}
                </span>
              )}
              {signalFilter !== "ALL" && (
                <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-gold">
                  Signal: {signalFilter}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-gold">
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              <button
                onClick={() => {
                  setStateFilter("ALL");
                  setStatusFilter("ALL");
                  setSignalFilter("ALL");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-xs text-brand-warning hover:underline ml-2"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Main Results Table with Staggered Row Entrance & Refined Hover */}
      <FadeIn direction="up" delay={0.15}>
        <div className="rounded-2xl bg-brand-card border border-brand-border shadow-card overflow-hidden">
          
          {/* Table summary bar */}
          <div className="p-4 bg-brand-surface border-b border-brand-border flex items-center justify-between text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-gold" />
              <span>
                Showing <strong className="text-brand-text font-mono">{sortedRecords.length}</strong> candidates of{" "}
                <strong className="text-brand-text font-mono">{totalCount.toLocaleString("en-IN")}</strong> total flagged works
              </span>
            </div>
            <span className="font-mono text-[11px] hidden sm:inline">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
              <p className="text-sm font-medium text-brand-text">Evaluating Anomaly Matrix...</p>
              <p className="text-xs text-brand-muted">Loading candidate peer percentiles and explanation signals</p>
            </div>
          ) : sortedRecords.length === 0 ? (
            /* Empty state */
            <div className="py-24 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-brand-warning mx-auto" />
              <p className="text-base font-semibold text-brand-text">No Matching Candidates Found</p>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                No works matched the selected criteria. Try resetting your search filters or selecting &quot;All States&quot;.
              </p>
              <button
                onClick={() => {
                  setStateFilter("ALL");
                  setStatusFilter("ALL");
                  setSignalFilter("ALL");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-gold hover:border-brand-gold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Data Table with Smooth Row Transitions */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-surface/50 text-[11px] font-mono text-brand-muted uppercase">
                    <th className="py-3.5 px-4 font-semibold">Ref #</th>
                    <th className="py-3.5 px-4 font-semibold">Work / Scheme Name</th>
                    <th className="py-3.5 px-4 font-semibold">Constituency & State</th>
                    <th className="py-3.5 px-4 font-semibold">Sanction Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Sanction Delay</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Review Signals</th>
                    <th className="py-3.5 px-4 font-semibold">Percentile</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  <AnimatePresence mode="popLayout">
                    {sortedRecords.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.3) }}
                        className="hover:bg-brand-surface/80 transition-all duration-200 group cursor-pointer border-l-2 border-l-transparent hover:border-l-brand-gold"
                        onClick={() => setSelectedRecord(item)}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono text-brand-muted">
                          #{item.id}
                        </td>

                        {/* Work Name & Category */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-brand-text line-clamp-1 group-hover:text-brand-gold transition-colors">
                            {item.workName}
                          </p>
                          <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">
                            {item.category}
                          </p>
                        </td>

                        {/* Geolocation */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-medium text-brand-text">{item.constituency}</p>
                          <p className="text-[11px] text-brand-muted">{item.state}</p>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-medium text-brand-text whitespace-nowrap">
                          {formatCurrency(item.sanctionAmount)}
                        </td>

                        {/* Delay */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-medium px-2 py-0.5 rounded transition-transform group-hover:scale-105 ${
                              item.sanctionDelayDays > 365
                                ? "bg-brand-warning/15 text-brand-warning border border-brand-warning/30"
                                : "bg-brand-surface text-brand-muted border border-brand-border"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {item.sanctionDelayDays}d
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border">
                            {item.workStatus}
                          </span>
                        </td>

                        {/* Signals */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.reviewSignals.slice(0, 2).map((sig, sidx) => (
                              <SignalBadge key={sidx} signal={sig} size="sm" />
                            ))}
                            {item.reviewSignals.length > 2 && (
                              <span className="text-[10px] text-brand-muted px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border">
                                +{item.reviewSignals.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Anomaly Percentile */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-brand-gold whitespace-nowrap">
                          {item.anomalyPercentile !== null ? `${item.anomalyPercentile.toFixed(1)}%` : "N/A"}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(item);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-card border border-brand-border text-brand-gold hover:border-brand-gold/40 transition-colors text-xs font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar with Smooth Buttons */}
          <div className="p-4 bg-brand-surface border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded bg-brand-card border border-brand-border text-brand-text text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded-lg bg-brand-card border border-brand-border text-brand-text hover:bg-brand-cardHover disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <span className="font-mono text-xs px-2">
                Page {currentPage} of {totalPages}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || loading}
                className="p-1.5 rounded-lg bg-brand-card border border-brand-border text-brand-text hover:bg-brand-cardHover disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

        </div>
      </FadeIn>

      {/* Slide-over or Modal Work Investigation Dossier */}
      {selectedRecord && (
        <WorkDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      </div>
    </ProtectedRoute>
  );
}
