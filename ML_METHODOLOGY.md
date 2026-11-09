# NIRIKSHAN AI – ML Methodology

## 1. Problem Framing

We want to find records whose financial and execution patterns differ from
most of their peers. We have **no verified labels** (nobody has marked records
as "problematic"), so we use **unsupervised anomaly detection**.

Key principle: **an anomaly is a statistical statement, not an accusation.**
Possible innocent causes include region-specific constraints, one-off large
projects, reporting delays, and data entry differences.

## 2. Pipeline Overview

```
Cleaned data → Feature engineering → Standardise → PCA
                                         │            │
                                         ▼            ▼
                                 Isolation Forest     LOF
                                         └─────┬──────┘
                                               ▼
                                   Normalise + combine scores
                                               ▼
                                   Threshold → flag → explain
```

## 3. Preprocessing

1. **Type fixing**: numbers as numbers, dates as dates.
2. **Missing values**: record how many; for each feature choose to drop the
   row or fill with the median. Log the choice. Never fill silently.
3. **Units**: convert all money to one unit before computing anything.
4. **Ratios**: divide-by-zero becomes missing, not infinity.
5. **Skewed values**: money amounts are usually heavily skewed. Consider a
   log transform (`log1p`) before scaling. Decide after looking at the
   histograms.
6. **Scaling**: `StandardScaler` (mean 0, standard deviation 1). This step is
   essential, because LOF and PCA are distance/variance based and would
   otherwise be dominated by the feature with the largest numbers.

## 4. Algorithms (Beginner Explanations)

### 4.1 PCA (Principal Component Analysis)
- **Idea**: rotate the data to new axes (components) ordered by how much
  variation they capture.
- **Use here**: (a) project to 2 components for the scatter plot;
  (b) optionally reduce noise by keeping enough components to explain a
  chosen share of variance (e.g. 90–95%).
- **Check**: look at `explained_variance_ratio_`. If 2 components explain
  little variance, the 2-D plot is only a rough picture.
- **Limit**: components are mixtures of features, so they are harder to
  explain. We therefore explain flags using the original features, not PCs.

### 4.2 Isolation Forest
- **Idea**: build many random trees that split the data with random cuts.
  Unusual points get separated from the rest in fewer splits.
- **Strength**: fast; handles many features; good at *global* outliers.
- **Key parameters**: `n_estimators` (e.g. 100–300), `contamination`
  (expected share of outliers; a guess, not a fact), `random_state`.
- **Output**: `score_samples` (lower = more unusual). We flip and rescale it
  so higher = more unusual.

### 4.3 Local Outlier Factor (LOF)
- **Idea**: compare a point's local density with the density of its
  neighbours. A point in a sparse area surrounded by dense neighbours is
  unusual *locally*.
- **Strength**: catches outliers that are only odd relative to their own
  neighbourhood.
- **Key parameter**: `n_neighbors` (start around 20; must be smaller than the
  number of rows).
- **Note**: use `novelty=False` for scoring the same dataset; read
  `negative_outlier_factor_` (lower = more unusual), then flip and rescale.

### 4.4 Why combine both
Isolation Forest favours globally extreme points; LOF favours locally odd
points. Averaging normalised scores makes the result less dependent on one
method's blind spots. A record flagged by both is the strongest candidate
for review.

## 5. Score Combination

1. Convert each detector's output so higher = more unusual.
2. Min-max scale each to 0–1 (or use rank percentiles, which are more
   robust to outliers in the scores themselves).
3. `combined_score = (iforest_score + lof_score) / 2`.
4. Flag records above a threshold (default: top share matching
   `contamination`). The threshold is a tunable review budget, not a truth.

## 6. Explanations

For each flagged record, for each feature compute a robust z-score:

```
robust_z = (value - median) / MAD-based scale
```

List the top 3 features by absolute robust_z, with value and peer median.
This answers "why was this flagged?" in plain language.

## 7. Validation Without Labels

Because real labels do not exist, validate in three ways:

1. **Injected anomalies (synthetic data)**: plant known outliers, then check
   how many appear in the top-ranked records (precision/recall at top-k).
   This tests that the *pipeline works*, not that it is right on real data.
2. **Stability**: run with different random seeds; records that are always
   flagged are more reliable than ones that flip.
3. **Agreement**: measure overlap between Isolation Forest and LOF flags.
4. **Manual review (real data)**: inspect top flagged records against the
   source data and judge whether the pattern is genuinely unusual or just a
   data quirk.

## 8. Limitations (must be stated in the UI and any report)

- Results depend on data quality and on which features were chosen.
- `contamination` is an assumption.
- Different constituencies are not identical; global comparison can be
  unfair without peer grouping.
- Small datasets make LOF and tree methods unstable.
- Flags are leads for human review, never proof of anything.

## 9. Reproducibility

Every run stores: dataset ID, data origin, feature list, scaler and PCA
settings, model parameters, random seed, and library versions
(`requirements.txt`).

## 10. Ethical Use

- Use neutral language ("unusual pattern").
- Show the data origin on every result.
- Do not publish rankings of named individuals without human verification
  and context.
- Respect the licence and terms of the official data.

## 11. Research Extensions

- Peer-group-specific models.
- Time-aware features (year-on-year change).
- Alternative detectors behind a common interface in `ml/models.py`.
- Sensitivity analysis on `contamination` and `n_neighbors`.
- SHAP-style attribution for tree models.
## 12. Dataset-Specific Feature Selection – MPLADS Works Sanctioned

### 12.1 Verified Dataset

The initial dataset used for this project is:

- Dataset: MPLADS Works Sanctioned
- Source: Official MPLADS eSAKSHI Portal
- File: `mplads_works_sanctioned_raw.csv`
- Records: 39,000
- Source columns: 12
- Raw file location: `datasets/raw/`

### 12.2 Candidate Features

The following features are proposed for the initial anomaly detection model.

| Feature | Type | Initial treatment |
|---|---|---|
| Sanction Amount | Numerical | Apply log1p transformation and scaling |
| Sanction Delay (Days) | Numerical, derived | Calculate from recommended and sanction dates |
| State | Categorical | Retain for grouping and contextual analysis |
| Work category | Categorical | Retain for peer-group comparisons |
| Constituency | Categorical | Retain as contextual information |
| IDA | Categorical | Retain as contextual information |
| Work Status | Categorical | Retain for descriptive analysis; do not assign arbitrary numerical rankings |

### 12.3 Fields Excluded from the Initial Model

- Sr. No.: record identifier, not a meaningful predictive feature.
- MP name: personal identifier; not used as a direct anomaly predictor.
- Work: contains work references and descriptions; raw values are not directly suitable.
- Work description: 86 records have missing descriptions. Text analysis may be considered in a later version.
- Raw date columns: use derived date features only when their relevance is established.

### 12.4 Initial Model Strategy

The first baseline model will use two numerical features:

1. Log-transformed sanction amount.
2. Recommendation-to-sanction delay in days.

This provides a simple, interpretable starting point.

State and work category can subsequently support peer-group comparisons. Additional categorical features will only be introduced after evaluating their usefulness and the effects of high cardinality.

### 12.5 Important Dataset Limitations

The current Works Sanctioned dataset does not independently provide verified actual expenditure for each work or a reliable project completion duration.

Therefore:

- Actual fund utilisation percentage cannot be calculated from this dataset alone.
- Sanction-to-completion duration cannot currently be calculated reliably.
- Sanction amount must not be described as actual expenditure.
- Work Status must not automatically be interpreted as a chronological progress sequence.

The initial model should therefore be described as **MPLADS sanctioned-work pattern anomaly detection**, rather than comprehensive fund-utilisation anomaly detection.

Additional expenditure and completed-work datasets may be integrated in future versions.

### 12.6 Interpretation

An unusual sanction amount or delay is only an analytical review signal. Large projects, regional differences, administrative processes and data limitations may explain unusual observations.

No anomaly score should be interpreted as evidence of fraud, corruption or misconduct.
## 13. Final ML Architecture and Model Selection

### 13.1 Objective

Define which analytical methods will be retained in the NIRIKSHAN AI MVP and distinguish operational methods from experimental methods.

The system is designed to identify unusual sanctioned-work patterns for further review. It does not determine fraud, corruption, or wrongdoing.

### 13.2 Primary Anomaly Detection Model

**Isolation Forest**

Isolation Forest is selected as the primary anomaly-detection model.

Configuration:

- Algorithm: Isolation Forest
- Number of estimators: 200
- Random state: 42
- Initial contamination setting: 0.05
- Features:
  - Log Sanction Amount
  - Sanction Delay (Days)

The initial 5% contamination setting represents a configurable candidate-selection threshold, not an estimate of the true anomaly rate.

The model's anomaly scores and rankings must not be interpreted as probabilities.

### 13.3 Contextual Peer-group Analysis

Two separate peer-group analyses will provide contextual delay-review signals.

**A. State + Recommendation Year**

- Groups works by State and Recommendation Year.
- Calculates the relative sanction-delay percentile within each group.
- Uses a provisional minimum group size of 30.
- Selects records at or above the 95th percentile.

**B. Work Category + Recommendation Year**

- Groups works by Work Category and Recommendation Year.
- Calculates the relative sanction-delay percentile within each group.
- Uses a provisional minimum group size of 30.
- Selects records at or above the 95th percentile.

The minimum group size and percentile threshold are configurable analytical choices, not statistically proven optimal values.

### 13.4 Experimental and Supporting Methods

| Method | Decision | Purpose |
|---|---|---|
| Local Outlier Factor | Excluded from MVP ranking | Current experiments show severe duplicate-distance problems |
| PCA | Supporting analysis | Feature structure and visualization |
| Log-delay Isolation Forest | Experimental | Evaluate sensitivity to delay transformation |
| Cohort-aware delay analysis | Supporting analysis | Investigate recommendation-year effects |

LOF may be reconsidered if a more suitable feature representation and reliable distance structure are developed.

### 13.5 Candidate Signal Presentation

The MVP should present the following signals separately:

1. Global Isolation Forest candidate.
2. State peer-group delay candidate.
3. Work-category peer-group delay candidate.

A work may be selected by one, two, or all three methods.

The interface must preserve the distinction between global statistical unusualness and relative delay within a peer group.

The MVP should not combine these signals into an unvalidated composite risk score.

### 13.6 Explanation Requirements

Each candidate should eventually display:

- Sanction amount.
- Sanction delay in days.
- Global anomaly score and percentile.
- State peer-group delay percentile.
- Category peer-group delay percentile.
- Which analytical methods selected the record.
- Relevant peer-group size.
- A neutral explanation of why the record was selected.

Percentiles and scores must be clearly labelled. They are not probabilities of wrongdoing.

### 13.7 Model Limitations

The current dataset contains sanctioned-work records but does not provide verified actual expenditure for every work or reliable completion dates.

Consequently:

- Actual fund-utilisation percentage cannot currently be calculated.
- Sanction-to-completion duration cannot currently be calculated.
- Statistical candidate selection does not establish financial irregularity.
- Peer comparisons may still be affected by differences in project characteristics and administrative processes.
- No verified labels are available for supervised evaluation.

### 13.8 Final MVP Decision

The initial NIRIKSHAN AI MVP will use:

- Isolation Forest as the primary global anomaly-detection method.
- State-year peer analysis as a contextual delay signal.
- Work-category-year peer analysis as an additional contextual delay signal.
- PCA for supporting analytical visualization.

LOF and transformed-delay model variants will remain experimental.

The system will present explainable review signals rather than accusations or definitive risk conclusions.

### 13.9 Reproducibility

Primary model script: `backend/isolation_forest.py`

Peer-group analysis script: `backend/peer_group_anomaly_analysis.py`

Peer-group sensitivity script: `backend/test_peer_group_sensitivity.py`

Candidate overlap script: `backend/test_peer_candidate_overlap.py`

Supporting results are stored in `datasets/processed/`.
## 14. Anomaly Explanation and Review Signal Generation

### 14.1 Objective

A rule-based explanation layer was developed to make anomaly detection results understandable to users and reviewers.

The purpose is to explain which analytical methods selected a work for review and provide relevant statistical context.

The explanation layer does not independently determine whether a work is problematic. It translates existing model outputs and peer-group comparisons into readable descriptions.

### 14.2 Input Data

The explanation generator uses:

`datasets/processed/peer_group_anomaly_analysis.csv`

This dataset contains:
- Global Isolation Forest predictions and scores.
- Anomaly percentile ranks.
- State-Year peer-group percentiles and group sizes.
- Category-Year peer-group percentiles and group sizes.
- Original work information and derived features.

### 14.3 Review Signals

Three independent review signals are evaluated:

1. **Global Isolation Forest:** Identifies records selected by the global unsupervised anomaly detection model.
2. **State-Year Delay Comparison:** Identifies records whose sanction delay is at or above the 95th percentile within an eligible State + Recommendation Year group.
3. **Category-Year Delay Comparison:** Identifies records whose sanction delay is at or above the 95th percentile within an eligible Work Category + Recommendation Year group.

Peer-group comparisons use a provisional minimum group size of 30.

A work can trigger multiple signals simultaneously.

### 14.4 Explanation Generation

Explanations are generated using deterministic, rule-based Python logic.

For peer-group signals, the explanation includes:
- Within-group percentile rank.
- Number of eligible works in the comparison group.
- Relevant comparison dimensions.

For example:

"The sanction delay has a within-group percentile rank of 97.32 among 14136 eligible works in the same work category and recommendation year."

For Global Isolation Forest, the explanation identifies the model selection without claiming that a particular feature caused the result.

### 14.5 Initial Results

The explanation generator was executed against 39,000 records.

| Metric | Result |
|---|---:|
| Total records analysed | 39,000 |
| Unique records selected for review | 3,487 |
| Global Isolation Forest signals | 1,950 |
| State-Year Delay Comparison signals | 1,936 |
| Category-Year Delay Comparison signals | 1,966 |

Signal counts are not additive because a single record can trigger multiple review signals.

The resulting candidate explanations are saved to:

`datasets/processed/anomaly_explanations.csv`

Only records with at least one review signal are included in this output.

### 14.6 Interpretation and Limitations

- Explanations describe statistical review signals, not verified irregularities.
- Percentile ranks are relative positions within comparison groups, not probabilities.
- Isolation Forest anomaly scores and percentiles are not probabilities of wrongdoing.
- Multiple signals provide different analytical perspectives and should remain separately visible.
- No composite risk score is introduced because its weighting and predictive validity have not been established.
- The explanation generator does not establish causation or financial misconduct.

Every record includes the following interpretation notice:

"This is an analytical review signal, not evidence of financial irregularity or wrongdoing."

### 14.7 Reproducibility

The explanation generator is implemented in:

`backend/generate_anomaly_explanations.py`

It reads the peer-group analysis output and generates:

`datasets/processed/anomaly_explanations.csv`

The process is deterministic for unchanged input data and model outputs.
## 15. ML Output Validation

### 15.1 Objective

A validation script was developed to verify the structural and numerical integrity of the anomaly explanation output before backend integration.

### 15.2 Validation Script

Implementation:

`backend/validate_anomaly_output.py`

Input:

`datasets/processed/anomaly_explanations.csv`

### 15.3 Validation Results

The validation was executed against 3,487 candidate records.

| Validation Check | Result |
|---|---:|
| Required columns missing | 0 |
| Candidate records | 3,487 |
| Duplicate record identifiers | 0 |
| Missing important values | 0 |
| Empty explanations | 0 |
| Missing interpretation notices | 0 |
| Invalid numeric values | 0 |
| Infinite numeric values | 0 |
| Out-of-range percentile values | 0 |

### 15.4 Review Signal Consistency

| Review Signal | Records |
|---|---:|
| Global Isolation Forest | 1,950 |
| State-Year Delay Comparison | 1,936 |
| Category-Year Delay Comparison | 1,966 |

Records may trigger multiple signals; therefore, signal counts are not additive.

### 15.5 Conclusion

All implemented structural and numerical validation checks passed.

The anomaly explanation output is suitable for proceeding to API integration, subject to further testing of API behaviour and data handling.

These validation results establish data consistency only. They do not establish the predictive accuracy or real-world validity of anomaly candidates.