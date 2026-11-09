# D2 – MPLADS Dataset Inspection

## 1. Dataset Information

- Dataset: MPLADS Works Sanctioned
- Source: Official MPLADS eSAKSHI Portal
- File: `mplads_works_sanctioned_raw.csv`
- Format: CSV
- Records inspected: 39,000
- Columns: 12
- Summary row excluded: Grand Total

## 2. Data Quality Findings

| Check | Result |
|---|---:|
| Total records | 39,000 |
| Total columns | 12 |
| Duplicate rows | 0 |
| Missing work descriptions | 86 |
| Missing values in other columns | 0 |
| Missing sanction delays | 0 |
| Negative sanction delays | 0 |

## 3. Work Status Distribution

| Work Status | Records |
|---|---:|
| Physical Inspection | 24,948 |
| Sanction | 4,388 |
| Vendor Identification | 3,937 |
| Work partially Completed | 3,289 |
| Work Completed | 2,241 |
| Time Estimation | 197 |

## 4. Work Category Distribution

| Work Category | Records |
|---|---:|
| Normal/Others | 38,126 |
| Repair and Renovation | 644 |
| Trust and Society | 227 |
| Bar and Associations | 3 |

## 5. Sanction Amount Statistics

| Metric | Amount |
|---|---:|
| Minimum | ₹10,000 |
| Average | ₹520,643.80 |
| Median | ₹300,000 |
| Maximum | ₹46,470,400 |

## 6. Sanction Delay Analysis

Sanction delay is calculated as:

`Sanction Date - Recommended date`

| Metric | Result |
|---|---:|
| Average delay | 127.27 days |
| Median delay | 91 days |
| Minimum delay | 0 days |
| Maximum delay | 793 days |
| Negative delays | 0 |
| Missing delays | 0 |

The longest observed sanction delay was 793 days.

## 7. Initial Observations

1. The dataset contains 39,000 work records.
2. Work descriptions are missing in 86 records.
3. No exact duplicate records were identified.
4. Most records belong to the Normal/Others category.
5. Physical Inspection is the most frequent work status.
6. Sanction delays vary considerably across records.
7. High sanctioned amounts and long delays should be investigated in context rather than automatically classified as anomalies.

## 8. Important Limitations

- These findings describe the downloaded Works Sanctioned dataset only.
- Sanction delay is not the same as project completion time.
- Work status labels require further interpretation.
- High-value works are not automatically suspicious.
- Anomaly scores will represent analytical review signals, not proof of fraud or corruption.
- The original raw CSV has not been modified.

## 9. D2 Progress

- [x] Official Works Sanctioned CSV downloaded.
- [x] Actual 12 column names verified.
- [x] Grand Total summary row excluded during analysis.
- [x] Missing values inspected.
- [x] Duplicate records inspected.
- [x] Work status distribution analysed.
- [x] Work category distribution analysed.
- [x] Sanction amount statistics calculated.
- [x] Sanction delays calculated.
- [x] Initial inspection findings documented.

## 10. Date Range Analysis

### Date Coverage

| Metric | Result |
|---|---|
| Earliest Recommended Date | 2024-07-08 |
| Latest Recommended Date | 2026-02-06 |
| Earliest Sanction Date | 2024-07-09 |
| Latest Sanction Date | 2026-11-07 |

### Sanction Year Distribution

| Calendar Year | Number of Works |
|---|---:|
| 2024 | 5,108 |
| 2025 | 30,192 |
| 2026 | 3,700 |
| **Total** | **39,000** |

Note: These are calendar years, not financial years.

### Work Status by Calendar Year

| Status | 2024 | 2025 | 2026 |
|---|---:|---:|---:|
| Physical Inspection | 3,953 | 19,657 | 1,338 |
| Sanction | 358 | 2,793 | 1,237 |
| Time Estimation | 6 | 150 | 41 |
| Vendor Identification | 354 | 3,036 | 547 |
| Work Completed | 261 | 1,857 | 123 |
| Work partially Completed | 176 | 2,699 | 414 |

### Initial Interpretation

1. Most records have sanction dates in calendar year 2025.
2. Physical Inspection is the most frequent work status across all three years.
3. Completion counts differ substantially between years.
4. Recent works may have had less time to progress towards completion.
5. Calendar-year comparisons must consider differences in observation periods.

### Analytical Considerations

- Do not interpret lower completion counts in recent years as evidence of poor performance.
- Do not assume calendar years represent financial years.
- Consider the effect of time since sanction when developing completion-related features.
- Verify the meaning of each work status before assigning numerical values or interpreting it as a project stage.

## 11. Status-wise Amount and Delay Analysis

The dataset was grouped by Work Status to compare sanctioned amounts and recommendation-to-sanction delays.

### Results

| Work Status | Number of Works | Average Amount (₹) | Median Amount (₹) | Average Delay (Days) | Median Delay (Days) |
|---|---:|---:|---:|---:|---:|
| Physical Inspection | 24,948 | 500,064.42 | 299,118 | 105.47 | 78 |
| Sanction | 4,388 | 469,175.28 | 300,000 | 205.31 | 138 |
| Time Estimation | 197 | 716,853.13 | 350,000 | 181.04 | 137 |
| Vendor Identification | 3,937 | 565,173.34 | 300,000 | 157.88 | 117 |
| Work Completed | 2,241 | 590,534.34 | 400,000 | 119.80 | 92 |
| Work partially Completed | 3,289 | 632,734.65 | 496,732 | 153.78 | 116 |

### Observations

1. Sanction has the highest average recommendation-to-sanction delay at approximately 205 days.
2. Time Estimation has the highest average sanctioned amount at approximately ₹7.17 lakh.
3. Physical Inspection represents approximately 64% of all records.
4. Work partially Completed has a higher median sanctioned amount than the other status categories.
5. Amount and delay distributions differ across work statuses.

### Modelling Considerations

- Work Status should initially be retained as a descriptive categorical field.
- Do not assign arbitrary numerical rankings to work statuses.
- Compare works with similar categories and characteristics where possible.
- Consider the small sample size of Time Estimation records.
- Status-wise differences are analytical observations, not evidence of wrongdoing.

## 12. Feature Engineering and Processed Dataset

### 12.1 Processing Script

- Script: `backend/prepare_features.py`
- Original dataset: `datasets/raw/mplads_works_sanctioned_raw.csv`
- Processed dataset: `datasets/processed/mplads_works_sanctioned_features.csv`

### 12.2 Processing Results

| Measurement | Result |
|---|---:|
| Original CSV rows | 39,001 |
| Summary rows removed | 1 |
| Actual work records | 39,000 |
| Original columns | 12 |
| Processed columns | 15 |
| Missing sanction amounts | 0 |
| Missing sanction delays | 0 |
| Negative sanction delays | 0 |
| Invalid or non-positive sanction amounts | 0 |

### 12.3 Engineered Features

Three additional columns were created:

1. Sanction Delay (Days): Difference between Sanction Date and Recommended date.
2. Log Sanction Amount: Natural logarithm of one plus the sanctioned amount.
3. Sanction Year: Calendar year extracted from Sanction Date.

### 12.4 Numerical Feature Statistics

| Feature | Mean | Median | Minimum | Maximum |
|---|---:|---:|---:|---:|
| Sanction Amount (₹) | 520,643.78 | 300,000 | 10,000 | 46,470,400 |
| Sanction Delay (Days) | 127.27 | 91 | 0 | 793 |
| Log Sanction Amount | 12.61 | 12.61 | 9.21 | 17.65 |

### 12.5 Processing Conclusion

Feature engineering completed successfully for all 39,000 work records.

The original raw CSV was preserved without modification. The processed dataset was saved separately in `datasets/processed/`.

These engineered features are candidates for the initial anomaly detection model. Further preprocessing and scaling will be performed before model training.
## 13. Isolation Forest Stability Analysis

### 13.1 Objective

The purpose of this experiment was to evaluate whether Isolation Forest produces consistent anomaly scores and flagged records across different random seeds.

### 13.2 Experimental Configuration

- Dataset: 39,000 MPLADS sanctioned-work records.
- Features: Log Sanction Amount and Sanction Delay (Days).
- Algorithm: Isolation Forest.
- Number of estimators: 200.
- Contamination: 5%.
- Random seeds: 42, 7, 21, 100 and 2026.
- Baseline model: Random seed 42.

All other model settings and input features were kept unchanged.

### 13.3 Flagged Record Overlap

| Comparison | Common Records | Jaccard Similarity |
|---|---:|---:|
| Seed 42 vs 7 | 1,768 | 0.8293 |
| Seed 42 vs 21 | 1,849 | 0.9015 |
| Seed 42 vs 100 | 1,869 | 0.9202 |
| Seed 42 vs 2026 | 1,839 | 0.8923 |

Each model identified 1,950 anomaly candidates, corresponding to the configured 5% contamination.

### 13.4 Anomaly Score Correlation

| Comparison | Score Correlation |
|---|---:|
| Seed 42 vs 7 | 0.9917 |
| Seed 42 vs 21 | 0.9944 |
| Seed 42 vs 100 | 0.9938 |
| Seed 42 vs 2026 | 0.9944 |

The high correlations indicate that overall anomaly score rankings are highly similar across the tested random seeds.

### 13.5 Top 100 Record Overlap

| Comparison | Common Records |
|---|---:|
| Seed 42 vs 7 | 84/100 |
| Seed 42 vs 21 | 80/100 |
| Seed 42 vs 100 | 78/100 |
| Seed 42 vs 2026 | 87/100 |

Some variation exists among the highest-ranked anomaly candidates.

### 13.6 Interpretation and Limitations

The experiment indicates reasonably high to high stability across the tested random seeds.

However, score correlation, flagged-record overlap and top-100 overlap measure different aspects of model stability.

The results do not establish that flagged records represent genuine irregularities. The model remains an unsupervised screening tool, and its results require contextual review.

The experiment also does not establish stability across different feature sets, contamination values or data samples.

**Conclusion:** The current Isolation Forest configuration is suitable as an initial baseline for further comparative evaluation, subject to additional validation.
## 14. Contamination Sensitivity Analysis

### 14.1 Objective

This experiment evaluates how changing the Isolation Forest contamination parameter affects the number and selection of anomaly candidates.

### 14.2 Experimental Configuration

- Dataset: 39,000 MPLADS sanctioned-work records.
- Features: Log Sanction Amount and Sanction Delay (Days).
- Algorithm: Isolation Forest.
- Number of estimators: 200.
- Random seed: 42.
- Contamination values: 3%, 5%, 7% and 10%.

All other model settings and input features were kept unchanged.

### 14.3 Number of Anomaly Candidates

| Contamination | Anomaly Candidates |
|---|---:|
| 3% | 1,170 |
| 5% | 1,950 |
| 7% | 2,730 |
| 10% | 3,899 |

The number of selected records increases with the contamination setting.

### 14.4 Overlap with the 5% Baseline

| Comparison | Common Records | Jaccard Similarity |
|---|---:|---:|
| 3% vs 5% | 1,170 | 0.6000 |
| 5% vs 5% | 1,950 | 1.0000 |
| 7% vs 5% | 1,950 | 0.7143 |
| 10% vs 5% | 1,950 | 0.5001 |

The results show nested candidate sets in this experiment: all records selected at 3% were also selected at 5%, and all records selected at 5% remained selected at 7% and 10%.

### 14.5 Anomaly Score Correlation

All comparisons with the 5% baseline produced a score correlation of 1.0000.

This is expected because the contamination parameter changes the decision threshold rather than the underlying anomaly score ranking when the random seed and other model settings remain unchanged.

### 14.6 Interpretation and Limitations

The experiment demonstrates that contamination controls the number of records selected for review.

The 5% setting is retained as an initial baseline for comparative experiments. It is not a verified estimate of the proportion of irregular works.

The contamination value should eventually be configurable according to review capacity and validation findings.

**Conclusion:** The Isolation Forest model produces consistent score rankings across the tested contamination settings, while the number of selected anomaly candidates changes according to the configured threshold.
## 15. LOF Duplicate-Distance Investigation

### Objective
Investigate extremely large Local Outlier Factor (LOF) scores observed when using the two numerical features Log Sanction Amount and Sanction Delay (Days).

### Initial findings
The baseline LOF experiment used RobustScaler and 20 nearest neighbours.

Distance diagnostics found:
- 25,491 records with at least one zero-distance neighbour.
- 17,706 records with five or more zero-distance neighbours.
- Maximum zero-distance neighbours: 20.

The baseline LOF scores reached approximately 3.87 billion.

### Experiment: Adding Work Status

A second experiment added Work Status using one-hot encoding alongside the two numerical features.

The transformed feature matrix contained 8 features.

Results:
- 22,575 records had at least one zero-distance neighbour.
- 13,282 records had five or more zero-distance neighbours.
- 1,944 anomaly candidates were identified.
- Maximum LOF score: approximately 6.53 billion.

Scikit-learn also issued a warning that duplicate values were leading to incorrect results.

### Experiment: Increasing neighbourhood size

A separate diagnostic examined 50 nearest neighbours.

Results:
- 22,575 records had at least one zero-distance neighbour.
- 13,282 records had five or more zero-distance neighbours.
- 6,257 records had 20 or more zero-distance neighbours.
- 2,281 records had 50 zero-distance neighbours.

Increasing the neighbourhood size did not eliminate the duplicate-distance issue.

### IDA peer-group investigation

Among 36,997 records belonging to 448 IDA groups containing at least 20 records:
- 20,340 records were involved in repeated combinations of IDA, Log Sanction Amount and Sanction Delay.
- This represented 54.98% of eligible records.

IDA grouping alone therefore does not resolve the issue.

### Modelling decision

The current LOF experiments are retained for research and comparison but are not approved for reliable anomaly ranking.

The extreme LOF scores are not interpreted as anomaly severity.

Isolation Forest remains the primary baseline model while further validation and feature engineering continue.

Work Status remains a descriptive categorical field. Its inclusion in an anomaly model requires additional justification because it represents an execution-stage category rather than a direct financial measurement.

### Limitation

The repeated feature combinations are not necessarily duplicate works. Different work identifiers can legitimately share identical amounts, delays and status categories.
## 16. Principal Component Analysis (PCA)

### Objective

Apply PCA to the two numerical features used by the baseline Isolation Forest model:

- Log Sanction Amount
- Sanction Delay (Days)

The objective is to explore the feature-space distribution and visualize Isolation Forest anomaly candidates.

### Preprocessing

- Loaded the processed MPLADS sanctioned-works dataset.
- Selected the two numerical features.
- Standardized both features using StandardScaler.
- Applied PCA with two components.

### Explained Variance

| Component | Explained Variance |
|---|---:|
| PC1 | 56.71% |
| PC2 | 43.29% |
| Total | 100.00% |

Both components retain all variance represented by the two input features.

Since two components were retained from two original features, this experiment does not reduce dimensionality.

### Component Loadings

| Feature | PC1 | PC2 |
|---|---:|---:|
| Log Sanction Amount | 0.707107 | 0.707107 |
| Sanction Delay (Days) | 0.707107 | -0.707107 |

PC1 combines both features in the same direction.

PC2 contrasts sanction amount against sanction delay.

### Visualization Observations

The PCA scatter plot uses:
- Blue points: Normal Isolation Forest records.
- Orange points: Isolation Forest anomaly candidates.

Observations:

1. Many anomaly candidates appear towards the outer and right-hand regions of the feature space.
2. Considerable overlap exists between normal records and anomaly candidates.
3. Visible diagonal bands suggest repeated or discrete combinations of the two numerical features.

### Interpretation

The visualization suggests that Isolation Forest candidates occupy some unusual regions of the feature space.

However, PCA does not independently establish that these records are genuine anomalies. The same two features were used to generate the Isolation Forest predictions and the PCA representation.

### Output Files

- Script: `backend/pca_analysis.py`
- PCA results: `datasets/processed/pca_results.csv`
- Visualization: `datasets/processed/pca_visualization.png`

### Limitations

- Only two numerical features were included.
- PCA is currently a two-dimensional transformation, not dimensionality reduction.
- No verified anomaly labels are available.
- Visual separation does not establish wrongdoing or operational problems.
- Further experiments with additional justified features may provide a more informative PCA representation.
## 17. Isolation Forest Feature Transformation Comparison

### Objective

Compare two Isolation Forest configurations to understand how transforming sanction delay affects anomaly detection results.

### Model A: Original Delay

Features:
- Log Sanction Amount
- Sanction Delay (Days)

Configuration:
- Algorithm: Isolation Forest
- Estimators: 200
- Contamination: 0.05
- Random state: 42

Results:
- Normal records: 37,050
- Anomaly candidates: 1,950
- Median sanction amount among candidates: ₹500,000
- Median sanction delay among candidates: 465 days

### Model B: Log-Transformed Delay

Features:
- Log Sanction Amount
- Log Sanction Delay

Transformation:
- Log Sanction Delay = log1p(Sanction Delay (Days))

Configuration:
- Algorithm: Isolation Forest
- Estimators: 200
- Contamination: 0.05
- Random state: 42

Results:
- Normal records: 37,085
- Anomaly candidates: 1,915
- Median sanction amount among candidates: ₹421,159
- Median sanction delay among candidates: 18 days

### Candidate Overlap Analysis

| Measurement | Result |
|---|---:|
| Common candidates | 847 |
| Original-only candidates | 1,103 |
| Transformed-only candidates | 1,068 |
| Jaccard similarity | 0.2806 |
| Score correlation | 0.8612 |

### Interpretation

The two configurations produce substantially different anomaly candidate sets.

The original-delay model identifies candidates with a median sanction delay of 465 days.

The log-transformed model identifies a different set, with a median delay of 18 days.

This demonstrates that anomaly detection results are sensitive to feature transformation.

The log transformation compresses larger delay values and changes the geometry of the feature space.

### Modelling Decision

The original-delay Isolation Forest is retained as the provisional primary baseline.

The log-transformed model is retained as a sensitivity experiment.

Neither configuration is considered more accurate because verified anomaly labels are unavailable.

### Limitations

- Candidate selection depends on feature representation.
- The 5% contamination setting is an initial review threshold, not an estimate of the true anomaly rate.
- Recommendation and sanction cohorts may influence observed delay patterns.
- Further cohort-aware evaluation is required before final model selection.
## 18. Recommendation and Sanction Cohort Analysis

### Objective

Investigate whether Isolation Forest anomaly candidate rates differ across recommendation and sanction years.

### Recommendation Year Summary

| Recommendation Year | Total | Flagged | Median Delay | Flag Rate |
|---|---:|---:|---:|---:|
| 2024 | 14,332 | 612 | 90 days | 4.27% |
| 2025 | 24,667 | 1,338 | 93 days | 5.42% |
| 2026 | 1 | 0 | 10 days | 0.00% |

### Sanction Year Summary

| Sanction Year | Total | Flagged | Median Delay | Flag Rate |
|---|---:|---:|---:|---:|
| 2024 | 5,108 | 58 | 39 days | 1.14% |
| 2025 | 30,192 | 526 | 93 days | 1.74% |
| 2026 | 3,700 | 1,366 | 383 days | 36.92% |

### Recommendation Year vs Sanction Year

| Recommendation Year | Sanction Year | Total | Flagged | Median Delay | Flag Rate |
|---|---:|---:|---:|---:|---:|
| 2024 | 2024 | 5,108 | 58 | 39 | 1.14% |
| 2024 | 2025 | 8,719 | 162 | 124 | 1.86% |
| 2024 | 2026 | 505 | 392 | 522 | 77.62% |
| 2025 | 2025 | 21,473 | 364 | 79 | 1.70% |
| 2025 | 2026 | 3,194 | 974 | 361.5 | 30.49% |
| 2026 | 2026 | 1 | 0 | 10 | 0.00% |

### Delay Profile by Isolation Forest Prediction

| Group | Records | Mean Delay | Median Delay | Minimum | Maximum |
|---|---:|---:|---:|---:|---:|
| Normal | 37,050 | 113.01 | 88 | 0 | 488 |
| Anomaly candidates | 1,950 | 398.12 | 465 | 0 | 793 |

### Interpretation

The 2026 sanction cohort has a substantially higher anomaly candidate rate than earlier sanction cohorts.

The 2026 cohort also has a much higher median sanction delay.

Within the 2026 sanction cohort:
- Works recommended in 2024 have a 77.62% candidate rate.
- Works recommended in 2025 have a 30.49% candidate rate.

These observations indicate a strong association between older recommendation cohorts, longer sanction delays and Isolation Forest flags.

### Modelling Implications

The overall Isolation Forest may be sensitive to cohort-related differences in sanction delay.

A separate cohort-aware comparison should be investigated to determine whether individual works are unusual relative to comparable recommendation cohorts.

The overall Isolation Forest baseline should be retained rather than artificially equalising year-wise flag rates.

### Limitations

- Cohort association does not establish causation.
- Different recommendation cohorts have different time-at-risk.
- The dataset does not establish why individual works experienced long sanction delays.
- Flagged records are statistical review candidates, not verified administrative irregularities.
## 19. Cohort-aware Delay Analysis

### 19.1 Objective

A cohort-aware experiment was conducted to examine whether comparing sanction delays within recommendation-year groups produces a different set of review candidates from the global Isolation Forest model.

The purpose was to investigate the influence of recommendation-year differences without modifying the original Isolation Forest model or its results.

### 19.2 Methodology

- Input dataset: 39,000 sanctioned works.
- Cohort variable: Recommendation Year (calendar year).
- Delay feature: Sanction Delay (Days).
- Within each recommendation-year group, records were ranked by sanction delay.
- Records at or above the 95th percentile were marked as cohort delay candidates.
- The experiment was conducted separately from the original Isolation Forest model.

The 95th-percentile threshold is an experimental review threshold, not a verified anomaly boundary.

### 19.3 Recommendation-year statistics

| Recommendation Year | Records | Median Delay (Days) | Mean Delay (Days) | Q1 | Q3 | IQR |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 14,332 | 90 | 121.76 | 46 | 161.25 | 115.25 |
| 2025 | 24,667 | 93 | 130.47 | 47 | 169 | 122 |
| 2026 | 1 | 10 | 10 | 10 | 10 | 0 |

The 2024 and 2025 cohorts show similar median sanction delays.

The 2026 cohort contains only one record and is insufficient for meaningful statistical comparison.

### 19.4 Comparison with Global Isolation Forest

| Result | Records |
|---|---:|
| Global Isolation Forest candidates | 1,950 |
| Cohort delay candidates | 1,965 |
| Candidates identified by both | 1,203 |
| Global IF only | 747 |
| Cohort delay only | 762 |

Jaccard similarity between the two candidate sets was approximately 0.4436 (44.36%).

This indicates that the two approaches identify substantially different candidate sets.

### 19.5 Interpretation

The global Isolation Forest considers both log-transformed sanction amount and raw sanction delay.

The cohort-aware experiment considers only relative sanction delay within recommendation-year groups.

The difference in candidate sets demonstrates that the choice of comparison population and feature design materially influences which records are selected for review.

The cohort-aware signal may provide additional context alongside the global Isolation Forest results.

### 19.6 Limitations

1. The cohort comparison uses calendar years, not financial years.
2. The dataset includes only sanctioned works, not all recommended works.
3. The experiment does not account for state, work category, IDA, or other peer characteristics.
4. The 2026 recommendation cohort contains only one record.
5. The 95th-percentile threshold is a configurable review threshold.
6. No verified anomaly labels are available to establish model accuracy.
7. A high relative delay is not evidence of wrongdoing.

### 19.7 Output

Experimental output:

`datasets/processed/cohort_aware_delay_analysis.csv`

The original Isolation Forest results remain unchanged:

`datasets/processed/isolation_forest_results.csv`

### 19.8 Conclusion

Cohort-aware delay analysis provides a complementary descriptive review signal.

It should not replace the original Isolation Forest model at this stage.

Further validation and peer-group analysis are required before considering it as part of a combined anomaly detection framework.
## 20. State-wise and Work-category Cohort Analysis

### 20.1 Objective

The cohort-aware delay candidates were analysed by state and work category to understand their distribution across different administrative and work classifications.

This is a descriptive analysis. State and work category were not used to calculate the original cohort delay percentile.

### 20.2 State-wise analysis

States with at least 100 records:

| State | Total Records | Cohort Candidates | Median Delay | Candidate Rate |
|---|---:|---:|---:|---:|
| Maharashtra | 1,278 | 280 | 259 | 21.91% |
| Kerala | 1,615 | 293 | 243 | 18.14% |
| Assam | 882 | 122 | 186 | 13.83% |
| Karnataka | 1,478 | 188 | 186 | 12.72% |
| Telangana | 1,809 | 156 | 113 | 8.62% |
| Tamil Nadu | 2,413 | 179 | 138 | 7.42% |
| Meghalaya | 218 | 12 | 131 | 5.50% |
| Gujarat | 3,135 | 154 | 100 | 4.91% |
| Madhya Pradesh | 3,118 | 143 | 78 | 4.59% |
| Delhi | 155 | 7 | 60 | 4.52% |
| Uttarakhand | 291 | 13 | 133 | 4.47% |
| West Bengal | 2,926 | 114 | 99 | 3.90% |
| Odisha | 2,019 | 69 | 97 | 3.42% |
| Haryana | 597 | 17 | 73 | 2.85% |
| Bihar | 1,914 | 46 | 110 | 2.40% |
| Himachal Pradesh | 639 | 12 | 67 | 1.88% |
| Jharkhand | 1,370 | 21 | 61 | 1.53% |
| Chhattisgarh | 983 | 12 | 63 | 1.22% |
| Uttar Pradesh | 7,546 | 83 | 82 | 1.10% |
| Rajasthan | 1,101 | 12 | 69 | 1.09% |
| Andhra Pradesh | 1,250 | 12 | 36 | 0.96% |
| Jammu and Kashmir | 349 | 1 | 75 | 0.29% |
| Punjab | 1,544 | 3 | 37 | 0.19% |
| Mizoram | 105 | 0 | 111 | 0.00% |

Maharashtra and Kerala have comparatively high cohort-candidate rates. Uttar Pradesh and Punjab have comparatively low rates.

These differences are descriptive and should not be interpreted as evidence of administrative performance or wrongdoing.

### 20.3 Work-category analysis

| Work Category | Total Records | Cohort Candidates | Median Delay | Candidate Rate |
|---|---:|---:|---:|---:|
| Bar and Associations | 3 | 2 | 641 | 66.67% |
| Trust and Society | 227 | 22 | 155 | 9.69% |
| Repair and Renovation | 644 | 33 | 98 | 5.12% |
| Normal/Others | 38,126 | 1,908 | 91 | 5.00% |

Bar and Associations has only three records. Its candidate rate is not suitable for meaningful comparison.

Trust and Society has a higher candidate rate than the larger remaining work categories.

### 20.4 Methodological clarification

The cohort delay percentile is calculated within recommendation-year groups across the complete dataset.

It is not calculated separately within each state or work category.

Therefore, the state-wise and category-wise candidate rates represent the distribution of globally calculated cohort candidates across these groups.

Differences may also reflect the distribution of recommendation years within each state or category.

A future experiment should consider peer comparisons within sufficiently large state-year or category-year groups.

### 20.5 Output files

The experiment generated:

- `datasets/processed/cohort_state_analysis.csv`
- `datasets/processed/cohort_state_analysis_min100.csv`
- `datasets/processed/cohort_category_analysis.csv`

### 20.6 Limitations

1. The minimum 100-record state filter is a descriptive reporting threshold, not a statistical guarantee.
2. Small groups may produce unstable percentages.
3. State and work category are not part of the current cohort percentile calculation.
4. The analysis does not establish why a work experienced a longer delay.
5. The results are not evidence of fraud, corruption, or poor governance.

### 20.7 Conclusion

State-wise and work-category analysis provides useful descriptive context for cohort-aware review candidates.

However, administrative peer-group comparisons are required before using these differences as independent review signals.
## 21. Peer-group Anomaly Analysis

### 21.1 Objective

A peer-group experiment was conducted to investigate whether comparing works against more similar records produces different anomaly candidates from global and recommendation-year-based analysis.

Two peer-group approaches were tested:

1. State + Recommendation Year.
2. Work Category + Recommendation Year.

The minimum peer-group size was set to 30 records.

### 21.2 Methodology

- Input dataset: 39,000 sanctioned works.
- Feature: Sanction Delay (Days).
- Grouping variable: Recommendation Year.
- Peer-group percentile threshold: 95th percentile.
- Minimum group size: 30 records.
- Groups below the minimum size were excluded from percentile calculations.

Two separate candidate signals were generated.

**State peer signal:** Compares sanction delays among works belonging to the same state and recommendation year.

**Category peer signal:** Compares sanction delays among works belonging to the same work category and recommendation year.

These signals were generated independently and did not modify the original Isolation Forest model.

### 21.3 State peer-group results

| State | Eligible Records | Candidates | Median Delay | Candidate Rate |
|---|---:|---:|---:|---:|
| Goa | 30 | 2 | 173 | 6.67% |
| Arunachal Pradesh | 47 | 3 | 75 | 6.38% |
| Himachal Pradesh | 639 | 36 | 67 | 5.63% |
| Uttarakhand | 291 | 16 | 133 | 5.50% |
| Kerala | 1,615 | 87 | 243 | 5.39% |
| Chhattisgarh | 983 | 52 | 63 | 5.29% |
| Haryana | 597 | 31 | 73 | 5.19% |
| Delhi | 135 | 7 | 50 | 5.19% |
| Jammu and Kashmir | 349 | 18 | 75 | 5.16% |
| Uttar Pradesh | 7,546 | 384 | 82 | 5.09% |
| Rajasthan | 1,101 | 56 | 69 | 5.09% |
| Maharashtra | 1,278 | 65 | 259 | 5.09% |
| Karnataka | 1,478 | 75 | 186 | 5.07% |
| Tamil Nadu | 2,413 | 122 | 138 | 5.06% |
| Odisha | 2,019 | 102 | 97 | 5.05% |
| Meghalaya | 218 | 11 | 131 | 5.05% |
| West Bengal | 2,925 | 147 | 99 | 5.03% |
| Gujarat | 3,135 | 157 | 100 | 5.01% |
| Telangana | 1,809 | 90 | 113 | 4.98% |
| Bihar | 1,914 | 93 | 110 | 4.86% |
| Assam | 882 | 42 | 186 | 4.76% |
| Andhra Pradesh | 1,250 | 59 | 36 | 4.72% |
| Madhya Pradesh | 3,118 | 145 | 78 | 4.65% |
| Jharkhand | 1,370 | 63 | 61 | 4.60% |
| Punjab | 1,544 | 69 | 37 | 4.47% |
| Mizoram | 101 | 4 | 112 | 3.96% |

Eligible state-peer records: 38,787.

State peer candidates: 1,936.

### 21.4 Category peer-group results

| Work Category | Eligible Records | Candidates | Median Delay | Candidate Rate |
|---|---:|---:|---:|---:|
| Trust and Society | 227 | 13 | 155 | 5.73% |
| Repair and Renovation | 644 | 34 | 98 | 5.28% |
| Normal/Others | 38,125 | 1,919 | 91 | 5.03% |

Eligible category-peer records: 38,996.

Bar and Associations was excluded because its groups did not meet the minimum group-size requirement.

### 21.5 State and Category Candidate Comparison

| Result | Records |
|---|---:|
| State peer candidates | 1,936 |
| Category peer candidates | 1,966 |
| Candidates identified by both | 1,123 |
| State peer only | 813 |
| Category peer only | 843 |

Jaccard similarity between the two candidate sets was approximately 0.4045 (40.45%).

This indicates that the grouping strategy influences which individual records are selected.

### 21.6 Interpretation

The state-based and category-based peer approaches identify different candidate sets.

The earlier global cohort analysis showed relatively high candidate rates for some states, including Maharashtra and Kerala.

After state-year peer comparison, their candidate rates were approximately 5.09% and 5.39%, respectively.

This illustrates why peer-group selection matters when interpreting relative delay.

Candidate rates near 5% are expected because the experiment uses a 95th-percentile threshold. They should not be interpreted as independent state or category performance measurements.

### 21.7 Limitations

1. The minimum group-size threshold of 30 is an experimental design choice.
2. Percentile estimates in groups close to 30 records may remain unstable.
3. State and category are tested separately, not jointly.
4. Some groups are excluded because they contain insufficient records.
5. The analysis considers sanction delay only.
6. No verified anomaly labels are available.
7. High relative delay is a review signal, not evidence of wrongdoing.

### 21.8 Output

Experimental output:

`datasets/processed/peer_group_anomaly_analysis.csv`

### 21.9 Conclusion

Peer-group analysis provides a more context-aware way to identify unusual sanction delays.

State-year and category-year comparisons produce different candidate sets, demonstrating that the choice of peer population is an important part of anomaly detection methodology.

Further experiments should investigate joint peer groups, group-size sensitivity, and integration with financial anomaly signals before selecting a final model.
## 22. Peer-group Size Sensitivity Analysis

### Objective

Test whether changing the minimum peer-group size materially affects eligible record coverage and the number of delay-based candidates.

### Experiment Setup

Four minimum group sizes were tested:

- 20 records
- 30 records
- 50 records
- 100 records

Two peer-group definitions were evaluated:

1. State + Recommendation Year
2. Work Category + Recommendation Year

Within each eligible group, records at or above the 95th percentile of sanction delay were selected as candidates.

### State + Recommendation Year Results

| Minimum Group Size | Eligible Records | Excluded Records | Candidates | Candidate Rate |
|---:|---:|---:|---:|---:|
| 20 | 38,903 | 97 | 1,945 | 5.00% |
| 30 | 38,787 | 213 | 1,936 | 4.99% |
| 50 | 38,680 | 320 | 1,929 | 4.99% |
| 100 | 38,594 | 406 | 1,925 | 4.99% |

### Work Category + Recommendation Year Results

| Minimum Group Size | Eligible Records | Excluded Records | Candidates | Candidate Rate |
|---:|---:|---:|---:|---:|
| 20 | 38,996 | 4 | 1,966 | 5.04% |
| 30 | 38,996 | 4 | 1,966 | 5.04% |
| 50 | 38,996 | 4 | 1,966 | 5.04% |
| 100 | 38,946 | 54 | 1,963 | 5.04% |

### Observations

1. State-based candidate counts changed only slightly across the tested thresholds.
2. Increasing the state peer-group minimum from 20 to 100 reduced eligible records by 309 and candidate counts by 20.
3. Category-based results remained almost unchanged.
4. The category analysis excluded only 54 records at the minimum size of 100.
5. Candidate rates remained close to 5%, as expected from the percentile-based selection rule.

### Interpretation

The experiment indicates that the overall number of selected candidates is relatively insensitive to the tested minimum group sizes.

A minimum peer-group size of 30 remains a provisional practical choice because it provides broad coverage while excluding very small groups.

However, similar candidate counts do not establish that the same individual records are selected under each threshold. Candidate membership overlap requires a separate comparison.

The 30-record threshold is a heuristic, not a statistically established optimum. The 95th-percentile candidates are analytical review signals, not verified anomalies or evidence of wrongdoing.

### Reproducibility

Script: `backend/test_peer_group_sensitivity.py`

Output: `datasets/processed/peer_group_sensitivity.csv`
## 23. Peer Candidate Membership Stability

### Objective

Evaluate whether changing the minimum peer-group size changes the individual records selected by the peer-group delay analysis.

The previous experiment showed similar candidate counts across different thresholds. This experiment examines whether the actual candidate records remain the same.

### Experiment Setup

Four minimum peer-group sizes were compared:

- 20 records
- 30 records
- 50 records
- 100 records

Two peer-group definitions were evaluated:

1. State + Recommendation Year
2. Work Category + Recommendation Year

Candidate membership was compared using Jaccard similarity:

Jaccard Similarity = Intersection of Candidate Sets / Union of Candidate Sets

A value of 100% indicates identical candidate sets.

### State + Recommendation Year Results

| Comparison | Jaccard Similarity |
|---|---:|
| 20 vs 30 | 99.54% |
| 20 vs 50 | 99.18% |
| 20 vs 100 | 98.97% |
| 30 vs 50 | 99.64% |
| 30 vs 100 | 99.43% |
| 50 vs 100 | 99.79% |

### Work Category + Recommendation Year Results

| Comparison | Jaccard Similarity |
|---|---:|
| 20 vs 30 | 100.00% |
| 20 vs 50 | 100.00% |
| 20 vs 100 | 99.85% |
| 30 vs 50 | 100.00% |
| 30 vs 100 | 99.85% |
| 50 vs 100 | 99.85% |

### Observations

1. State-based candidate sets have Jaccard similarities above 98.9% across all comparisons.
2. Category-based candidate sets have similarities between 99.85% and 100%.
3. Candidate membership is highly consistent across the tested minimum group sizes.
4. Increasing the minimum group size from 30 to 100 changes very few selected records.
5. The category-based candidate sets are particularly stable in this experiment.

### Interpretation

The results provide evidence that peer-group candidate membership is not materially sensitive to the tested minimum group-size thresholds.

A minimum group size of 30 remains a reasonable provisional configuration because it provides broad record coverage while excluding very small peer groups.

However, this experiment evaluates only sensitivity to group-size thresholds. It does not validate the candidates against verified real-world outcomes.

The selected records remain statistical review signals, not proof of wrongdoing.

### Reproducibility

Script: `backend/test_peer_candidate_overlap.py`

Output: `datasets/processed/peer_candidate_overlap.csv`