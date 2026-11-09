import { DashboardMetrics } from "@/types";

export const NATIONAL_METRICS: DashboardMetrics = {
  // Complete sanctioned-work dataset population (A)
  allWorksCount: 39000,
  allWorksSanctionedAmountCr: 2030.51,
  allWorksAvgDelayDays: 127.27,

  // Combined review/explanation dataset population (B)
  reviewRecordsCount: 3487,
  reviewRecordsSanctionedAmountCr: 413.33,
  reviewRecordsAvgDelayDays: 375.14,
  reviewRecordsMaxDelayDays: 793,

  // Machine-learning candidates & signals
  isolationForestCandidatesCount: 1950,
  cohortDelayCandidatesCount: 1965,
  peerGroupReviewSignalsCount: 2779,

  // Compatibility & aggregate metrics
  totalWorksAnalyzed: 39000,
  totalCandidatesFlagged: 3487,
  totalSanctionedValue: 20305100000, // ₹2,030.51 Crore in INR
  avgSanctionDelayDays: 127.27,
  maxSanctionDelayDays: 793,
  isolationForestFlagsCount: 1950,
  cohortDelayFlagsCount: 1965,
  statesCount: 32,

  // Work execution status breakdown across the 3,487 review candidates
  statusBreakdown: [
    {
      name: "Physical Inspection",
      count: 1365,
      percentage: 39,
    },
    {
      name: "Sanction",
      count: 969,
      percentage: 28,
    },
    {
      name: "Vendor Identification",
      count: 550,
      percentage: 16,
    },
    {
      name: "Work Partially Completed",
      count: 439,
      percentage: 13,
    },
    {
      name: "Work Completed",
      count: 134,
      percentage: 4,
    },
    {
      name: "Time Estimation",
      count: 30,
      percentage: 1,
    },
  ],

  // State-wise distribution of review candidates (Total: 3,487 records across 32 States/UTs)
  stateBreakdown: [
    {
      state: "Uttar Pradesh",
      count: 499,
      totalAmount: 810685406,
      avgDelay: 267,
    },
    {
      state: "Tamil Nadu",
      count: 360,
      totalAmount: 629010561,
      avgDelay: 327,
    },
    {
      state: "Kerala",
      count: 336,
      totalAmount: 255694794,
      avgDelay: 465,
    },
    {
      state: "Maharashtra",
      count: 320,
      totalAmount: 404324546,
      avgDelay: 473,
    },
    {
      state: "West Bengal",
      count: 229,
      totalAmount: 566587171,
      avgDelay: 357,
    },
    {
      state: "Telangana",
      count: 227,
      totalAmount: 125193406,
      avgDelay: 428,
    },
    {
      state: "Madhya Pradesh",
      count: 212,
      totalAmount: 89775951,
      avgDelay: 390,
    },
    {
      state: "Karnataka",
      count: 208,
      totalAmount: 161029187,
      avgDelay: 465,
    },
    {
      state: "Gujarat",
      count: 206,
      totalAmount: 105703829,
      avgDelay: 456,
    },
    {
      state: "Assam",
      count: 130,
      totalAmount: 76566000,
      avgDelay: 459,
    },
    {
      state: "Odisha",
      count: 115,
      totalAmount: 52665000,
      avgDelay: 435,
    },
    {
      state: "Bihar",
      count: 112,
      totalAmount: 141218458,
      avgDelay: 354,
    },
    {
      state: "Andhra Pradesh",
      count: 81,
      totalAmount: 156422994,
      avgDelay: 253,
    },
    {
      state: "Punjab",
      count: 70,
      totalAmount: 31754721,
      avgDelay: 187,
    },
    {
      state: "Jharkhand",
      count: 64,
      totalAmount: 23019638,
      avgDelay: 305,
    },
    {
      state: "Rajasthan",
      count: 60,
      totalAmount: 66040854,
      avgDelay: 258,
    },
    {
      state: "Chhattisgarh",
      count: 52,
      totalAmount: 36470914,
      avgDelay: 300,
    },
    {
      state: "Himachal Pradesh",
      count: 41,
      totalAmount: 9333577,
      avgDelay: 331,
    },
    {
      state: "Haryana",
      count: 34,
      totalAmount: 29886945,
      avgDelay: 389,
    },
    {
      state: "Jammu And Kashmir",
      count: 21,
      totalAmount: 52259600,
      avgDelay: 245,
    },
    {
      state: "Uttarakhand",
      count: 21,
      totalAmount: 12653052,
      avgDelay: 390,
    },
    {
      state: "Meghalaya",
      count: 15,
      totalAmount: 24700000,
      avgDelay: 406,
    },
    {
      state: "Goa",
      count: 13,
      totalAmount: 15792363,
      avgDelay: 423,
    },
    {
      state: "Manipur",
      count: 11,
      totalAmount: 55161644,
      avgDelay: 40,
    },
    {
      state: "Delhi",
      count: 11,
      totalAmount: 12118406,
      avgDelay: 344,
    },
    {
      state: "Tripura",
      count: 10,
      totalAmount: 62437113,
      avgDelay: 194,
    },
    {
      state: "Nagaland",
      count: 8,
      totalAmount: 78812380,
      avgDelay: 45,
    },
    {
      state: "Puducherry",
      count: 8,
      totalAmount: 20311017,
      avgDelay: 428,
    },
    {
      state: "Mizoram",
      count: 4,
      totalAmount: 1000000,
      avgDelay: 187,
    },
    {
      state: "Andaman And Nicobar Islands",
      count: 4,
      totalAmount: 14936421,
      avgDelay: 172,
    },
    {
      state: "Arunachal Pradesh",
      count: 3,
      totalAmount: 3700000,
      avgDelay: 223,
    },
    {
      state: "Sikkim",
      count: 2,
      totalAmount: 8000000,
      avgDelay: 150,
    },
  ],

  categoryBreakdown: [
    {
      category: "Normal/Others",
      count: 3381,
    },
    {
      category: "Repair and Renovation",
      count: 54,
    },
    {
      category: "Trust and Society",
      count: 50,
    },
    {
      category: "Bar and Associations",
      count: 2,
    },
  ],

  // Delay distribution among the 3,487 review candidates
  delayDistribution: [
    {
      range: "0-90 days",
      count: 235,
    },
    {
      range: "91-180 days",
      count: 210,
    },
    {
      range: "181-365 days",
      count: 997,
    },
    {
      range: "366-500 days",
      count: 1316,
    },
    {
      range: "> 500 days",
      count: 729,
    },
  ],

  // Isolation Forest Score Distribution (Total: 3,487 records)
  scoreDistribution: [
    {
      range: "< 0.50",
      count: 396,
    },
    {
      range: "0.50 - 0.60",
      count: 1424,
    },
    {
      range: "0.60 - 0.70",
      count: 1551,
    },
    {
      range: "0.70 - 0.80",
      count: 116,
    },
    {
      range: "> 0.80",
      count: 0,
    },
  ],
};
