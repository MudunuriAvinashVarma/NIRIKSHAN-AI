import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# 1. File paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

COHORT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "cohort_aware_delay_analysis.csv"
)

FEATURE_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "mplads_works_sanctioned_features.csv"
)

OUTPUT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "peer_group_anomaly_analysis.csv"
)

MIN_GROUP_SIZE = 30
PERCENTILE_THRESHOLD = 95

# --------------------------------------------------
# 2. Load datasets
# --------------------------------------------------

df = pd.read_csv(COHORT_FILE)
features = pd.read_csv(FEATURE_FILE)

if len(df) != len(features):
    raise ValueError("Dataset row counts do not match.")

# Verify row alignment
check_columns = [
    "Sanction Date",
    "Sanction Amount ( ₹ )",
    "Work Status",
    "Sanction Delay (Days)",
    "Log Sanction Amount"
]

if not df[check_columns].equals(features[check_columns]):
    raise ValueError("Dataset row order does not match.")

# Attach peer-group fields
df["State"] = features["State"]
df["Work category"] = features["Work category"]

print("Total records:", len(df))
print("Minimum peer-group size:", MIN_GROUP_SIZE)

# --------------------------------------------------
# 3. Recalculate recommendation year
# --------------------------------------------------

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"],
    errors="coerce"
)

df["Recommendation Year"] = (
    df["Recommended date"].dt.year
)

if df["Recommendation Year"].isna().any():
    raise ValueError("Missing recommendation-year values.")

delay_column = "Sanction Delay (Days)"

# --------------------------------------------------
# 4. Reusable peer-group percentile function
# --------------------------------------------------

def calculate_peer_percentile(data, group_columns):

    group_sizes = data.groupby(
        group_columns
    )[delay_column].transform("size")

    percentiles = data.groupby(
        group_columns
    )[delay_column].rank(pct=True) * 100

    # Exclude groups smaller than the minimum size
    percentiles = percentiles.where(
        group_sizes >= MIN_GROUP_SIZE
    )

    return percentiles, group_sizes


# --------------------------------------------------
# 5. State + Recommendation Year analysis
# --------------------------------------------------

state_groups = [
    "State",
    "Recommendation Year"
]

(
    df["State Peer Percentile"],
    df["State Peer Group Size"]
) = calculate_peer_percentile(df, state_groups)

df["State Peer Candidate"] = (
    df["State Peer Percentile"]
    >= PERCENTILE_THRESHOLD
)

# --------------------------------------------------
# 6. Work Category + Recommendation Year analysis
# --------------------------------------------------

category_groups = [
    "Work category",
    "Recommendation Year"
]

(
    df["Category Peer Percentile"],
    df["Category Peer Group Size"]
) = calculate_peer_percentile(df, category_groups)

df["Category Peer Candidate"] = (
    df["Category Peer Percentile"]
    >= PERCENTILE_THRESHOLD
)

# --------------------------------------------------
# 7. State peer-group summary
# --------------------------------------------------

state_summary = (
    df.dropna(subset=["State Peer Percentile"])
    .groupby("State")
    .agg(
        Eligible_Records=("State Peer Percentile", "count"),
        Peer_Candidates=("State Peer Candidate", "sum"),
        Median_Delay=(delay_column, "median")
    )
)

state_summary["Candidate_Rate_Percent"] = (
    state_summary["Peer_Candidates"]
    / state_summary["Eligible_Records"] * 100
)

state_summary = state_summary.sort_values(
    "Candidate_Rate_Percent",
    ascending=False
)

print("\n========== STATE PEER-GROUP ANALYSIS ==========")
print(state_summary.round(2).to_string())

# --------------------------------------------------
# 8. Category peer-group summary
# --------------------------------------------------

category_summary = (
    df.dropna(subset=["Category Peer Percentile"])
    .groupby("Work category")
    .agg(
        Eligible_Records=("Category Peer Percentile", "count"),
        Peer_Candidates=("Category Peer Candidate", "sum"),
        Median_Delay=(delay_column, "median")
    )
)

category_summary["Candidate_Rate_Percent"] = (
    category_summary["Peer_Candidates"]
    / category_summary["Eligible_Records"] * 100
)

category_summary = category_summary.sort_values(
    "Candidate_Rate_Percent",
    ascending=False
)

print("\n========== CATEGORY PEER-GROUP ANALYSIS ==========")
print(category_summary.round(2).to_string())

# --------------------------------------------------
# 9. Candidate comparison
# --------------------------------------------------

comparison = pd.crosstab(
    df["State Peer Candidate"],
    df["Category Peer Candidate"],
    margins=True
)

print("\n========== STATE vs CATEGORY PEER CANDIDATES ==========")
print(comparison)

# --------------------------------------------------
# 10. Coverage information
# --------------------------------------------------

print("\n========== PEER-GROUP COVERAGE ==========")

print(
    "Eligible state-peer records:",
    df["State Peer Percentile"].notna().sum()
)

print(
    "Eligible category-peer records:",
    df["Category Peer Percentile"].notna().sum()
)

print(
    "State peer candidates:",
    df["State Peer Candidate"].sum()
)

print(
    "Category peer candidates:",
    df["Category Peer Candidate"].sum()
)

# --------------------------------------------------
# 11. Save results
# --------------------------------------------------

df.to_csv(OUTPUT_FILE, index=False)

print("\nResults saved to:")
print(OUTPUT_FILE)

print("\nPeer-group analysis completed.")
