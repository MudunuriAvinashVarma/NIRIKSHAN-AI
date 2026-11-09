import { AnomalyApiResponse, AnomalyFilters, AnomalyRecord, AnomalyRecordRaw, HealthCheckResponse, DashboardMetrics } from "@/types";
import { SAMPLE_ANOMALY_DATA } from "./sample-data";
import { NATIONAL_METRICS } from "./national-stats";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Normalizes raw anomaly records from either FastAPI or static snapshots
 */
export function normalizeRecord(raw: AnomalyRecordRaw, indexFallback: number = 0): AnomalyRecord {
  const id = raw["Sr. No."] ?? raw.sr_no ?? indexFallback + 1;
  const workName = raw["Work"] ?? raw.work ?? `Work Item #${id}`;
  const state = raw["State"] ?? raw.state ?? "National";
  const constituency = raw["Constituency"] ?? raw.constituency ?? "N/A";
  const category = raw["Work category"] ?? raw.work_category ?? "Normal/Others";
  const description = raw["Work description"] ?? raw.work_description ?? "No description provided.";
  const recommendedDate = raw["Recommended date"] ?? raw.recommended_date ?? "N/A";
  const sanctionDate = raw["Sanction Date"] ?? raw.sanction_date ?? "N/A";
  const sanctionAmount = Number(raw["Sanction Amount ( ₹ )"] ?? raw.sanction_amount ?? 0);
  const sanctionDelayDays = Number(raw["Sanction Delay (Days)"] ?? raw.sanction_delay_days ?? 0);
  const workStatus = raw["Work Status"] ?? raw.work_status ?? "Pending";
  
  const rawSignals = raw["Review Signals"] ?? raw.review_signals ?? [];
  let reviewSignals: string[] = [];
  if (Array.isArray(rawSignals)) {
    reviewSignals = rawSignals;
  } else if (typeof rawSignals === "string") {
    try {
      reviewSignals = JSON.parse(rawSignals.replace(/'/g, '"'));
    } catch {
      reviewSignals = [rawSignals];
    }
  }

  const isolationScore = raw["Isolation Forest Score"] !== undefined && raw["Isolation Forest Score"] !== null
    ? Number(raw["Isolation Forest Score"])
    : (raw.isolation_forest_score !== undefined && raw.isolation_forest_score !== null ? Number(raw.isolation_forest_score) : null);

  const anomalyPercentile = raw["Anomaly Percentile"] !== undefined && raw["Anomaly Percentile"] !== null
    ? Number(raw["Anomaly Percentile"])
    : (raw.anomaly_percentile !== undefined && raw.anomaly_percentile !== null ? Number(raw.anomaly_percentile) : null);

  const statePeerPercentile = raw["State Peer Percentile"] !== undefined && raw["State Peer Percentile"] !== null
    ? Number(raw["State Peer Percentile"])
    : (raw.state_peer_percentile !== undefined && raw.state_peer_percentile !== null ? Number(raw.state_peer_percentile) : null);

  const statePeerGroupSize = raw["State Peer Group Size"] !== undefined && raw["State Peer Group Size"] !== null
    ? Number(raw["State Peer Group Size"])
    : (raw.state_peer_group_size !== undefined && raw.state_peer_group_size !== null ? Number(raw.state_peer_group_size) : null);

  const categoryPeerPercentile = raw["Category Peer Percentile"] !== undefined && raw["Category Peer Percentile"] !== null
    ? Number(raw["Category Peer Percentile"])
    : (raw.category_peer_percentile !== undefined && raw.category_peer_percentile !== null ? Number(raw.category_peer_percentile) : null);

  const categoryPeerGroupSize = raw["Category Peer Group Size"] !== undefined && raw["Category Peer Group Size"] !== null
    ? Number(raw["Category Peer Group Size"])
    : (raw.category_peer_group_size !== undefined && raw.category_peer_group_size !== null ? Number(raw.category_peer_group_size) : null);

  const reviewExplanation = raw["Review Explanation"] ?? raw.review_explanation ?? "Candidate flagged during peer cohort analysis.";
  const interpretationNotice = raw["Interpretation Notice"] ?? raw.interpretation_notice ?? 
    "This is an analytical review signal, not evidence of financial irregularity or wrongdoing.";

  return {
    id,
    workName,
    state,
    constituency,
    category,
    description,
    recommendedDate,
    sanctionDate,
    sanctionAmount,
    sanctionDelayDays,
    workStatus,
    isolationScore,
    anomalyPercentile,
    statePeerPercentile,
    statePeerGroupSize,
    categoryPeerPercentile,
    categoryPeerGroupSize,
    reviewSignals,
    reviewExplanation,
    interpretationNotice,
    raw,
  };
}

/**
 * Checks connectivity to the FastAPI backend
 */
export async function checkBackendHealth(): Promise<{ connected: boolean; data?: HealthCheckResponse; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: HealthCheckResponse = await response.json();
      return { connected: true, data };
    } else {
      return { connected: false, error: `Backend responded with HTTP ${response.status}` };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return { connected: false, error: message };
  }
}

/**
 * Fetches anomalies with filtering and pagination
 */
export async function getAnomalies(
  filters: AnomalyFilters = {}
): Promise<{ data: AnomalyRecord[]; total: number; isLive: boolean; error?: string }> {
  const { state, work_status, limit = 25, offset = 0, search, signal } = filters;

  const params = new URLSearchParams();
  if (state && state !== "ALL") params.append("state", state);
  if (work_status && work_status !== "ALL") params.append("work_status", work_status);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/api/v1/anomalies?${params.toString()}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json: AnomalyApiResponse = await res.json();
      let records = json.data.map((r, i) => normalizeRecord(r, offset + i));

      // Client-side text search & signal filter if requested
      if (search && search.trim() !== "") {
        const query = search.toLowerCase();
        records = records.filter(r => 
          r.workName.toLowerCase().includes(query) ||
          r.constituency.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
        );
      }

      if (signal && signal !== "ALL") {
        records = records.filter(r => r.reviewSignals.some(s => s.toLowerCase().includes(signal.toLowerCase())));
      }

      return {
        data: records,
        total: json.total_records,
        isLive: true,
      };
    }
  } catch {
    // Graceful fallback to verified authentic snapshot data
  }

  // Fallback to verified authentic dataset snapshot
  let fallbackList = SAMPLE_ANOMALY_DATA.map((r, i) => normalizeRecord(r, i));

  if (state && state !== "ALL") {
    fallbackList = fallbackList.filter(r => r.state.toLowerCase() === state.toLowerCase());
  }

  if (work_status && work_status !== "ALL") {
    fallbackList = fallbackList.filter(r => r.workStatus.toLowerCase() === work_status.toLowerCase());
  }

  if (search && search.trim() !== "") {
    const query = search.toLowerCase();
    fallbackList = fallbackList.filter(r => 
      r.workName.toLowerCase().includes(query) ||
      r.constituency.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }

  if (signal && signal !== "ALL") {
    fallbackList = fallbackList.filter(r => r.reviewSignals.some(s => s.toLowerCase().includes(signal.toLowerCase())));
  }

  const total = fallbackList.length;
  const paginated = fallbackList.slice(offset, offset + limit);

  return {
    data: paginated,
    total,
    isLive: false,
  };
}

/**
 * Returns overall national statistics
 */
export function getNationalMetrics(): DashboardMetrics {
  return NATIONAL_METRICS;
}

