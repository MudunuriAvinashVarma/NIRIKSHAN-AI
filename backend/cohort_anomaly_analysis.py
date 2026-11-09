
import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# 1. File paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "mplads_works_sanctioned_features.csv"
)

RESULTS_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "isolation_forest_results.csv"
)

OUTPUT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "cohort_aware_delay_analysis.csv"
)

# --------------------------------------------------
# 2. Load both datasets
# --------------------------------------------------

features = pd.read_csv(PROCESSED_FILE)
results = pd.read_csv(RESULTS_FILE)

if len(features) != len(results):
    raise ValueError("Dataset row counts do not match.")

# Verify row alignment before combining
check_columns = [
    "Sanction Date",
    "Sanction Amount ( ₹ )",
    "Work Status",
    "Sanction Delay (Days)",
    "Log Sanction Amount"
]

if not features[check_columns].equals(results[check_columns]):
    raise ValueError("Dataset row order does not match.")

df = results.copy()

# Attach recommendation date from verified feature dataset
df["Recommended date"] = features["Recommended date"]

print("Total records:", len(df))
print("Recommendation dates attached successfully.")

# --------------------------------------------------
# 3. Prepare recommendation-year cohorts
# --------------------------------------------------

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"],
    errors="coerce"
)

df["Recommendation Year"] = (
    df["Recommended date"].dt.year
)

if df["Recommendation Year"].isna().any():
    raise ValueError("Some recommendation dates could not be parsed.")

# --------------------------------------------------
# 4. Calculate within-cohort delay percentiles
# --------------------------------------------------

delay_column = "Sanction Delay (Days)"

df["Cohort Delay Percentile"] = (
    df.groupby("Recommendation Year")[delay_column]
    .rank(pct=True) * 100
)

# --------------------------------------------------
# 5. Calculate cohort statistics
# --------------------------------------------------

cohort_stats = (
    df.groupby("Recommendation Year")[delay_column]
    .agg(
        Record_Count="count",
        Median_Delay="median",
        Mean_Delay="mean",
        Q1=lambda x: x.quantile(0.25),
        Q3=lambda x: x.quantile(0.75)
    )
)

cohort_stats["IQR"] = (
    cohort_stats["Q3"] - cohort_stats["Q1"]
)

print("\n========== RECOMMENDATION COHORT STATISTICS ==========")
print(cohort_stats.round(2))

# --------------------------------------------------
# 6. Create separate cohort review signal
# --------------------------------------------------

df["Cohort Delay Review Signal"] = np.where(
    df["Cohort Delay Percentile"] >= 95,
    "High relative delay",
    "Not in top 5% of cohort delays"
)

# --------------------------------------------------
# 7. Compare global IF flags with cohort signals
# --------------------------------------------------

df["Global IF Candidate"] = (
    df["Isolation Forest Prediction"] == -1
)

df["Cohort Delay Candidate"] = (
    df["Cohort Delay Percentile"] >= 95
)

comparison = pd.crosstab(
    df["Global IF Candidate"],
    df["Cohort Delay Candidate"],
    margins=True
)

print("\n========== GLOBAL IF vs COHORT DELAY ==========")
print(comparison)

# --------------------------------------------------
# 8. Save separate experimental results
# --------------------------------------------------

df.to_csv(OUTPUT_FILE, index=False)

print("\nResults saved to:")
print(OUTPUT_FILE)

print("\nCohort-aware analysis completed.")