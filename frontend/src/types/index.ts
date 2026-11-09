export interface AnomalyRecordRaw {
  "Sr. No."?: number;
  "sr_no"?: number;
  "Work"?: string;
  "work"?: string;
  "State"?: string;
  "state"?: string;
  "Constituency"?: string;
  "constituency"?: string;
  "Work category"?: string;
  "work_category"?: string;
  "Work description"?: string | null;
  "work_description"?: string | null;
  "Recommended date"?: string;
  "recommended_date"?: string;
  "Sanction Date"?: string;
  "sanction_date"?: string;
  "Sanction Amount ( ₹ )"?: number;
  "sanction_amount"?: number;
  "Sanction Delay (Days)"?: number;
  "sanction_delay_days"?: number;
  "Work Status"?: string;
  "work_status"?: string;
  "Isolation Forest Score"?: number | null;
  "isolation_forest_score"?: number | null;
  "Anomaly Percentile"?: number | null;
  "anomaly_percentile"?: number | null;
  "State Peer Percentile"?: number | null;
  "state_peer_percentile"?: number | null;
  "State Peer Group Size"?: number | null;
  "state_peer_group_size"?: number | null;
  "Category Peer Percentile"?: number | null;
  "category_peer_percentile"?: number | null;
  "Category Peer Group Size"?: number | null;
  "category_peer_group_size"?: number | null;
  "Review Signals"?: string[] | string;
  "review_signals"?: string[] | string;
  "Review Explanation"?: string;
  "review_explanation"?: string;
  "Interpretation Notice"?: string;
  "interpretation_notice"?: string;
}

export interface AnomalyRecord {
  id: number;
  workName: string;
  state: string;
  constituency: string;
  category: string;
  description: string;
  recommendedDate: string;
  sanctionDate: string;
  sanctionAmount: number;
  sanctionDelayDays: number;
  workStatus: string;
  isolationScore: number | null;
  anomalyPercentile: number | null;
  statePeerPercentile: number | null;
  statePeerGroupSize: number | null;
  categoryPeerPercentile: number | null;
  categoryPeerGroupSize: number | null;
  reviewSignals: string[];
  reviewExplanation: string;
  interpretationNotice: string;
  raw: AnomalyRecordRaw;
}

export interface AnomalyApiResponse {
  status: string;
  total_records: number;
  limit: number;
  offset: number;
  data: AnomalyRecordRaw[];
  notice?: string;
}

export interface AnomalyFilters {
  state?: string;
  work_status?: string;
  category?: string;
  search?: string;
  signal?: string;
  limit?: number;
  offset?: number;
}

export interface HealthCheckResponse {
  status: string;
  application?: string;
  message?: string;
  version?: string;
}

export interface DashboardMetrics {
  // Complete sanctioned-work dataset population (A)
  allWorksCount: number;
  allWorksSanctionedAmountCr: number;
  allWorksAvgDelayDays: number;

  // Combined review/explanation dataset population (B)
  reviewRecordsCount: number;
  reviewRecordsSanctionedAmountCr: number;
  reviewRecordsAvgDelayDays: number;
  reviewRecordsMaxDelayDays: number;

  // Machine-learning candidates & signals
  isolationForestCandidatesCount: number;
  cohortDelayCandidatesCount: number;
  peerGroupReviewSignalsCount: number;

  // Compatibility fields
  totalWorksAnalyzed: number;
  totalCandidatesFlagged: number;
  totalSanctionedValue: number;
  avgSanctionDelayDays: number;
  maxSanctionDelayDays: number;
  isolationForestFlagsCount: number;
  cohortDelayFlagsCount: number;
  statesCount: number;

  // Distributions
  statusBreakdown: { name: string; count: number; percentage: number }[];
  stateBreakdown: { state: string; count: number; totalAmount?: number; avgDelay?: number }[];
  categoryBreakdown: { category: string; count: number }[];
  delayDistribution: { range: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
}
